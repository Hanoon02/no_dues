const { CURRENT_URL } = require("../config/config")
const StaffAdmin = require("../models/staffAdmin");
const User = require("../models/user")
const approved_mailer = require("../mailers/approved_mailer");

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

module.exports.getAdmins = (req, res) => {
  return res.status(200).json(StaffAdmin.admins);
};


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
    var hostelTaken = obj.hostelTaken;
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
      { email: obj["studentEmail"] },
      updateObject,
      (err, user) => {
        if (err) {
          console.log("Error in updating request status: ", err);
          return res.redirect("/");
        }
        if(!user){
          console.log("User not defined");
          return res.redirect("/");
        }
        user.save();
      }
    );
    return res.redirect("/");
  } catch (err) {
    console.log(err);
    req.flash("error", "Something Went Wrong. Please Try Again or Later!");
    return res.redirect("/");
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
        users[i]["type"] == 'staff' &&
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
        approved_mailer.startStaffDuesRequest('', email);
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

module.exports.completeStaffNoDuesRequest = (req, res) =>{
  try {
    email = req.params.user
    User.findOne({ email: email }, async (err, user) => {
      if (err) {
        console.log(err);
        return;
      }
      try {
        user['staffRequestNoDues'] = 'Complete'
        await user.save();
        res.status = 200;
        approved_mailer.completeStaffDuesRequest('', email);
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