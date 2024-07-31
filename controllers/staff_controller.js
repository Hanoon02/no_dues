const { CURRENT_URL } = require("../config/config")
const StaffAdmin = require("../models/staffAdmin");
const User = require("../models/user")
const approved_mailer = require("../mailers/approved_mailer");
var XMLHttpRequest = require("xhr2");
var xhr = new XMLHttpRequest();
const axios = require("axios");

module.exports.home = (req, res) => {
  var obj = [];
  obj.push(req.user);
  return res.render("staff", {
    title: "Staff Home",
    user: JSON.stringify(obj),
    name: req.user.name,
    image: req.user.image,
    url: JSON.stringify(CURRENT_URL),
    layout: "staff",
    });
  };

module.exports.getFilteredAdmins = (req, res) => {
  all_admins = StaffAdmin.admins;
  const userPlainObject = req.user.toObject();
  const keysWithApplied = Object.keys(userPlainObject).filter(key => key.endsWith("Applied"));
  const modifiedKeys = keysWithApplied.map(key => key.replace("Applied", ""));
  return res.status(200).json(modifiedKeys);
};

module.exports.getAdmins = (req, res) => {
  return res.status(200).json(StaffAdmin.admins);
};


module.exports.getStaffs = (req, res) => {
  let studentList = [];
  let status=req.params.status;
  User.find({}, (err, users) => {
    if (err) {
      console.log("Error in loading all the users");
      return;
    }

    for (var i in users) {
      
      if (users[i]["type"] == 'Staff' && checkSuperAdmin(users[i],status,'nodues')) {
        if (status == "accepted" && users[i]['nodues'] && users[i]["noduesApprovedAt"]) {
          let d1=new Date(users[i]["noduesApprovedAt"]);
          let d2= new Date();
          d2.setFullYear(d2.getFullYear()-1);
          
          if( d1.getTime()<d2.getTime()){
            continue;
          }

        }
        studentList.push(users[i]);
      }
    }
    return res.status(200).json(studentList);
  });
};

function checkSuperAdmin(student, curr_status,superAdminName) {
  if (curr_status == "pending") {
    return student[superAdminName] == null;
  } else if (curr_status == "accepted") {
    return student[superAdminName] == true;
  } else {
    return student[superAdminName] == false;
  }
}

module.exports.getAdminDetails = (req, res) => {
  StaffAdmin.db.find({ admin: req.params.admin }, function (err, adminObj) {
    if (err) {
      console.log("Can't find admin");
    }
    return res.status(200).json(adminObj);
  });
};

module.exports.request = async(req, res) => {
  try {
    var obj = JSON.parse(req.params.obj)[0];
    var studentEmail = obj.studentEmail;
    var adminName = obj.adminName;
    var adminMail = StaffAdmin.fetchEmailFromAdmin(adminName);
    var hostelTaken = null;
    var updateObject = {};
    updateObject[adminName + "Applied"] = true;
    var today = new Date();
    var date =
      today.getFullYear() +
      "-" +
      (today.getMonth() + 1) +
      "-" +
      today.getDate();
    var time =
      today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    var dateTime = date + " " + time;
    updateObject[adminName + "AppliedAt"] = dateTime;
    updateObject["hostelTaken"] = hostelTaken;
    await User.findOneAndUpdate(
      { email: studentEmail },
      updateObject,
      (err, user) => {
        if (err) {
          console.log("Error in updating request status: ", err);
          // return res.redirect("/staff");
        }
        if(!user){
          console.log("User not defined");
          // return res.redirect("/staff");
        }
        user.save();
      }
    );
    approved_mailer.remindAdmin(studentEmail, adminMail);
    // return res.redirect("/staff");
  } catch (err) {
    console.log(err);
    req.flash("error", "Something Went Wrong. Please Try Again or Later!");
    // return res.redirect("/staff");
  }
};

module.exports.adminHome = (req, res) => {
  var studentList = [];
  User.find({}, (err, users) => {
    if (err || !users) {
      console.log("Error in loading all the users");
      return;
    }
    for (var i in users) {
      if (users[i] && !users[i]["type"]) {
        studentList.push(users[i]);
      }
    }
    let admin = StaffAdmin.findAdmin('iap@iiitd.ac.in');
    let originalName = StaffAdmin.getOriginalAdmin(admin);

    // if (admin.substring(0, 9) == "academics") {
    //   admin = "academics";
    // }
    return res.render("staff_admin_home", {
      title: "Admin - Home",
      originalName: originalName,
      adminName: JSON.stringify(admin),
      url: JSON.stringify(CURRENT_URL),
      layout: "staff_admin_home",
    });
  });
};

module.exports.superAdminHome = (req, res) => {
  var admins_list = StaffAdmin.admins;
  return res.render("super_admin_staff", {
    title: "Super-Admin-Staff",
    adminList: JSON.stringify(admins_list),
    adminName: "staff_nodues",
    id: req.user._id,
    url: JSON.stringify(CURRENT_URL),
    layout: "super_admin_staff",
  });
};



module.exports.getRequestedDuesStaff = (req, res) => {
  let staffList = []
  User.find({}, (err, users) => {
    if (err) {
      console.log("Error in loading all the users");
      return;
    }
    for (var i in users) {
      if (
        users[i]["type"] == 'Staff' &&
        users[i]["staffRequestNoDues"] == 'Active')
      {
        staffList.push(users[i]);
      }
    }
    return res.status(200).json(staffList);
  });
};

module.exports.getStaffAdmin = (req, res) => {
  let studentList = [];
  let adminName = req.params.adminName;
  let status=req.params.status;
  User.find({}, (err, users) => {
    if (err) {
      console.log("Error in loading all the users");
      return;
    }
    for (var i in users) {
      if (
        users[i]["type"] == 'staff' &&
        users[i][`${adminName}Applied`] == true)
      {
        if(check(users[i],status,adminName)){
          if (status == "accepted" && users[i]['nodues'] && users[i]["noduesApprovedAt"]) {
            let d1= new Date(users[i]["noduesApprovedAt"]);
            let d2= new Date();
            d2.setFullYear(d2.getFullYear()-1);
            
            if( d1.getTime()<d2.getTime()){
              continue;
            }

          }
          studentList.push(users[i]);
        }
      }
    }

    return res.status(200).json(studentList);
  });
};

function check(student, curr_status,adminName) {
  
  if (curr_status == "pending") {
    return student[adminName + "Applied"] && student[adminName] == null;
  } else if (curr_status == "accepted") {
    return student[adminName] == true;
  } else {
    return student[adminName] == false;
  }
}


module.exports.approveStaffDues = (req, res) => {
  try {
    var obj = JSON.parse(req.params.dues);
    User.findOne({ email: obj[0].email }, async (err, user) => {
      if (err) {
        console.log(err);
        return;
      }
      try {
        var id = user._id;
        var updateObject = {};
        var today = new Date();
        var date =
          today.getFullYear() +
          "-" +
          (today.getMonth() + 1) +
          "-" +
          today.getDate();
        var time =
          today.getHours() +
          ":" +
          today.getMinutes() +
          ":" +
          today.getSeconds();
        var dateTime = date + " " + time;
        user[obj[0].admin] = true;
        user[obj[0].admin + "ApprovedAt"] = dateTime;
        user["totalFine"] =
          Number(user["totalFine"]) - Number(user[obj[0].admin + "Fine"]);
        user[obj[0].admin + "Fine"] = 0;

        await user.save();

        if (obj[0].admin == "academics") {
          obj[0].admin += user.degree[0];
        }
        approved_mailer.approvedDuesForStaff(obj[0].admin, obj[0].email);
        res.status = 200;
        return res.end();
      } catch (e) {
        console.log(e);
        req.flash("error", "Something Went Wrong. Please Try Again or Later!");
        res.status = 500;
        return res.end();
      }
    });
  } catch (err) {
    console.log(err);
    req.flash("error", "Something Went Wrong. Please Try Again or Later!");
    res.status = 500;
    return res.end();
  }
};


module.exports.showSheet = (req, res) => {
  return res.redirect(
    "https://docs.google.com/spreadsheets/d/11pmiaT8BWiDANpNXrY_MHs3DAXfWm5qx73u5FrxUFJg/edit?usp=sharing"
  );
}

module.exports.startStaffNoDuesRequest = (req, res) =>{
  try {
    email = req.params.user
    User.findOne({ email: email }, async (err, user) => {
      if (err) {
        console.log(err);
        return;
      }
      try {
        user['staffRequestNoDues'] = 'Active'
        await user.save();
        approved_mailer.startStaffDuesRequest(email);
        res.status = 200;
        return res.end();
      } catch (e) {
        console.log(e);
        req.flash("error", "Something Went Wrong. Please Try Again or Later!");
        res.status = 500;
        return res.end();
      }});
  } catch (err) {
    console.log(err);
    req.flash("error", "Something Went Wrong. Please Try Again or Later!");
    res.status = 500;
    return res.end();
  }
}

async function sendRequests(listOfObjs) {
  for (var obj of listOfObjs) {
      await fetch(`${CURRENT_URL}/staff/request/${JSON.stringify(obj)}`);
  }
}

module.exports.completeStaffNoDuesRequest = (req, res) =>{
  try {
    email = req.params.user
    depts = req.params.departments
    deptList = depts.split(',');
    User.findOne({ email: email }, async (err, user) => {
      if (err) {
        console.log(err);
        return;
      }
      try {
        var listOfObjs = [];
        for (var dept_name of deptList) {
          var obj = [];
          obj.push({
            studentEmail: email,
            adminName: dept_name,
          });
          listOfObjs.push(obj);
        }
        sendRequests(listOfObjs); 
        user['staffRequestNoDues'] = 'Complete'
        await user.save();
        res.status = 200;
        approved_mailer.completeStaffDuesRequest(email);
        return res.end();
      } catch (e) {
        console.log(e);
        req.flash("error", "Something Went Wrong. Please Try Again or Later!");
        res.status = 500;
        return res.end();
      }});
  } catch (err) {
    console.log(err);
    req.flash("error", "Something Went Wrong. Please Try Again or Later!");
    res.status = 500;
    return res.end();
  }
}

module.exports.cancelStaffNoDuesRequest = (req, res) =>{
  try {
    email = req.params.user
    User.findOne({ email: email }, async (err, user) => {
      if (err) {
        console.log(err);
        return;
      }
      try {
        user['staffRequestNoDues'] = 'None'
        await user.save();
        res.status = 200;
        approved_mailer.cancelStaffDuesRequest(email);
        return res.end(); 
      } catch (e) {
        console.log(e);
        req.flash("error", "Something Went Wrong. Please Try Again or Later!");
        res.status = 500;
        return res.end();
      }});
  } catch (err) {
    console.log(err);
    req.flash("error", "Something Went Wrong. Please Try Again or Later!");
    res.status = 500;
    return res.end();
  }
}