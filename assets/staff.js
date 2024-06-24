var user = JSON.parse(document.getElementById("user").innerHTML);
const CURRENT_URL = JSON.parse(
  document.getElementById("CURRENT_URL").innerHTML
);
let admins_list=[];

var request = new XMLHttpRequest();
request.open("GET", `${CURRENT_URL}/staff/getFilteredAdmins`, false);
request.send(null);
if (request.status === 200) {
  admins_temp = JSON.parse(request.responseText);
  for(var i in admins_temp){
    admins_list.push(admins_temp[i]);
  } 
  admins_list.push(`admin${user[0].department}`)
}
    
var container = document.getElementsByClassName('requests-list')[0];
var request_button_container = document.getElementById('request-dues-container');

// function duesRequestButton(){
//   if(user[0]['staffRequestNoDues']==='None'){
//       request_button_container.innerHTML += `
//       <div class='details-heading row mx-0 mb-2'>
//         <h4 class='custom-title'>Request for your dues</h4>
//         <button type="button" class='mt-4 submit-btn' onClick="handleDuesRequest()">
//           Request
//         </button>
//       </div>
//     `
//   }
// }
// duesRequestButton()

function updateStatusMessage(user, admin) {
  var status = document.getElementsByClassName(admin + "Status")[0];

  //Rejected
  if (user[0][admin + "Message"] && !user[0][admin]) {

    let displayFine = "NA";
    if (user[0][admin + "Fine"]) {
      displayFine = user[0][admin + "Fine"];
    }

    document.getElementsByClassName(admin + "Message")[0].innerHTML = user[0][admin + "Message"];
    document.getElementsByClassName(admin + "Fine")[0].innerHTML = displayFine;
    status.classList.remove("request");
    status.classList.remove("accepted");
    status.classList.add("rejected");
    status.classList.remove("pending");
    status.innerHTML = "Rejected";
  }
  //Pending
  else if (user[0][admin + "Applied"] && !user[0][admin]) {    
    status.classList.remove("request");
    status.classList.remove("accepted");
    status.classList.remove("rejected");
    status.classList.add("pending");
    status.innerHTML = "Pending";
  } 
  
  //Accepted
  else if (user[0][admin + "Applied"] && user[0][admin] == true) {
    status.classList.remove("request");
    status.classList.add("accepted");
    status.classList.remove("rejected");
    status.classList.remove("pending");
  
    document.getElementsByClassName(admin + "Message")[0].innerHTML = "Dues for this department has been approved";
    document.getElementsByClassName(admin + "Fine")[0].innerHTML = "NA";
    status.innerHTML = "Accepted";
  }
}

if(user[0]['staffRequestNoDues']==='Complete'){
  admins_list.map(createRequest);
  for (var i in admins_list) {
    updateStatusMessage(user, admins_list[i]);
  }
}
else if(user[0]['staffRequestNoDues']==='Active'){
  container.innerHTML+=`
  <div class="centered">
    <p> The admins have been notified of your request for dues, kindly wait for them to approve</p>
    <div>
  `
}
else{
  container.innerHTML+=`
    <div class="centered">
      <p class='pt-2 text-center'> You have not initiated your No Dues process, kindly click the below button to start the process</p>
      <button type="button" id='initatebtn' class="btn btn-outline-primary" onClick="handleDuesRequest()">
        Initiate No Dues Process
      </button>
    <div>
  `
}

function handleDuesRequest(){
  var request = new XMLHttpRequest();
  request.open("GET", `${CURRENT_URL}/staff/requestForDues/${user[0].email}`, false);
  request.send(null);
  console.log(request.responseText)
  window.location.reload();
}

function createRequest(admin) {
    let adminName = admin;
    if (adminName == "academics" || adminName == "adminundefined") {
        return
    }
    let details = {};
    var request = new XMLHttpRequest();
    request.open("GET", `${CURRENT_URL}/staff/getAdmin/${adminName}`, false);
    request.send(null);
    if (request.status === 200) {
      details = JSON.parse(request.responseText)[0];
      let originalName = details["originalAdminName"];
      let displayName = details["displayName"];
      let displayAddress = details["displayAddress"];
      if (displayAddress == "") {
        displayAddress = "NA";
      }
      let displayMessage ="There are no comments from the admin of this department.";
  
      if(user[0][adminName+'Messgae']){
        displayMessage=user[0][adminName+'Message'];    
      }
  
      let displayFine ="NA";
   
      if (user[0][adminName + "Fine"]) {
        displayFine = user[0][adminName + "Fine"];
      }
      
      
      container.innerHTML += `
      <div class="accordion-item container">
        <button class="row" type="button" aria-expanded="false">
  
              <div class="accordion-title col-8">${originalName}</div>
  
              <div class="col-3 text-center"> 
                <div class="status-button btn request ${admin + 'Status'} " onclick="requestFunction(event)">Request </div> 
              </div>
              
              <div class="col-1 text-center">     
                <i class="bi bi-caret-down-fill down" aria-hidden="true"></i>
                <i class="bi bi-caret-up-fill up" aria-hidden="true"></i>
              </div>      
            
        </button>
        <div class="accordion-content row">
  
            <div class="accordion-body">
              ${customInfo(admin)}        
              ${undertaking()}        
              <p>Admin :  ${displayName} [${displayAddress}]</p>
              <p>Message: <span class="${admin+'Message'}"> ${displayMessage}</span></p>
              <p>Fine: <span class="${admin+'Fine'}">${displayFine}</span></p>
            </div>
            
        </div>
      </div>`;
    }
  }
  
  //Custom requirement of each admin
  function customInfo(admin) {
    // if (user[0][admin + "Applied"]) {
    //   return "";
    // }
    if (admin == "hostel") {
      return `<br>
              Did you ever take hostel?
              <br>
              <input type="radio" id="taken" name="hostelTaken" value=true>
              <label for="taken">Yes</label><br>
              <input type="radio" id="notTaken" name="hostelTaken" value=false>
              <label for="notTaken">No </label><hr>`;
    } else {
      return "";
    }
  }
  
  function undertaking() {
      return `<br>
              Have you returned all the equipment and items?
              <br>
              <input type="radio" id="returned" name="itemsTaken" value=true>
              <label for="returned">Yes</label><br>
              <input type="radio" id="notReturned" name="itemsTaken" value=false>
              <label for="notReturned">No </label><hr>`;
  }
  function toggleaccordion() {
    const items = document.querySelectorAll(".accordion button");
    const itemToggle = this.getAttribute("aria-expanded");
    for (i = 0; i < items.length; i++) {
      items[i].setAttribute("aria-expanded", "false");
    }
    if (itemToggle == "false") {
      this.setAttribute("aria-expanded", "true");
    }
  }
 
 function applyToggle(){
   const items = document.querySelectorAll(".accordion button");
   items.forEach((item) => item.addEventListener("click", toggleaccordion));
 }

 applyToggle();



var downloadbtn = document.getElementById("downloadbtn");
 downloadbtn.addEventListener("click", () => {
   var obj = {};
   obj.student = user[0];
 
   var c = 0;
   for (var i in admins_list) {
     if (user[0][admins_list[i]] == false) {
       c = c + 1;
     }
   }
 
   window.location.href = `${CURRENT_URL}/download/${user[0]._id}`;
 });

// PROFILE
var profilebtn = document.getElementById("profile");
profilebtn.addEventListener("click", () => {
  var obj = {};
  obj.user = JSON.stringify(user);
  window.location.href = `${CURRENT_URL}/profile`;
});

function getAdminName(s) {
  if (s.substring(0, 9) == "Academics") {
    return "academics";
  }
  var arr = s.split(" ");
  var newName = arr[0].toLowerCase();
  for (var i = 1; i < arr.length; i++) {
    if (arr[i] == "&" || arr[i] == "&amp;") {
      arr[i] = "and";
    }
    newName = newName + arr[i][0].toUpperCase() + arr[i].substring(1);
  }
  return newName;
}

//Sending Request
function requestFunction(event) {
    var list = event.target.classList;
    if (list.contains("request") == false) {
      return;
    }
    var adminName = getAdminName(event.target.parentElement.previousElementSibling.innerHTML);
    if (user[0][adminName + "Applied"]) {
      alert("You have already requested!");
      return;
    }
    let hostelTaken = undefined;
    if (adminName == "hostel") {
      var ele = document.getElementsByName("hostelTaken");
      for (i = 0; i < ele.length; i++) {
        if ((ele[i].type = "radio")) {
          if (ele[i].checked) {
            hostelTaken = ele[i].value;
            break;
          }
        }
      }
      if (hostelTaken == undefined) {
        alert("Please tell your hostel status! ");
        return;
      }
    }
    var obj = [];
    obj.push({
      studentEmail: user[0].email,
      adminName: adminName,
      hostelTaken: hostelTaken,
    });
    console.log(obj)
    window.location.href = `${CURRENT_URL}/staff/request/${JSON.stringify(obj)}`;
  }
  