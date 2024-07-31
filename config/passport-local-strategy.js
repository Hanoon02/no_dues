const passport = require("passport");
const { google } = require("googleapis");
const LocalStrategy = require("passport-local").Strategy;
const Admin = require("../models/admin");
const getProffName = require("../data/getProffName");
const getStaffName = require("../data/isStaff")

const User = require("../models/user");
const { EMAIL_ID, SUPER_ADMIN_EMAIL,MAIN_EXCEL_ID,BANK_EXCEL_ID } = require("../config/config");
const { ADMIN_BLOCK, STUDENT_BLOCK } = require("../controllers/home_controller");
const { head } = require("request-promise");


function add(temp, x) {
  if (x != true) {
    temp.array.push("No");
  } else {
    temp.array.push("Yes");
  }
}
function add2(temp, x) {
  if (x == null) {
    temp.array.push("null");
  } else {
    temp.array.push(x);
  }
}

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
    },
    (email, password, done) => {
      User.findOne({ email: email }, (err, user) => {
        if (err) {
          console.log("Error in finding user in passport");
          return done(err);
        }
        if (!user || user.password != password) {
          console.log("Invalid username/password");
          return done(null, false);
        }
        return done(null, user);
      });
    }
  )
);

//serialize the user to decide which key is to be kept in the cookies
passport.serializeUser((user, done) => {
  done(null, user.id);
});

//deserializing the user from the key in the cookies
passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    if (err) {
      console.log("Error in finding user in passport");
      return done(err);
    }
    return done(null,user);   
  });
});

//check if the incoming user is authenticated
passport.checkAuthentication = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.redirect("/user/signin");
};

//check if it's admin
passport.checkAdminAuthentication = (req, res, next) => {
  
  if (req.isAuthenticated()) {
    if (
      req.user.email == `${SUPER_ADMIN_EMAIL}` ||
      Admin.checkAdmin(req.user.email)
    ) {
      return next();
    } else if (getProffName.isProff(req.user.email)) {
      // return res.redirect('/proff_home');
    } else {
      return res.redirect("/");
    }
  }

  req.flash("error", "Invalid Access");
  return res.redirect("/user/signin");
};

//check if it's a normal User
passport.checkUserAuthentication = (req, res, next) => {
  portalType = req.session.portalType;
  if (req.isAuthenticated()) {
    if(portalType == "Student"){
      if (req.user.email == `${SUPER_ADMIN_EMAIL}`) {
        return res.redirect("/super_admin");
      } else if (Admin.checkAdmin(req.user.email)) {
        return res.redirect("/admin_home");
      } else if (getProffName.isProff(req.user.email)) {
        return res.redirect("/proff_home");
      } else {
        return next();
      }
    }
    else if(portalType == "Staff"){
      if (req.user.email == `${SUPER_ADMIN_EMAIL}`) {
        return res.redirect("/staff/super_admin");
      } else if (Admin.checkAdmin(req.user.email)) {
        return res.redirect("/staff/admin_home");
      } else if (getProffName.isProff(req.user.email)) {
        return res.redirect("/staff/proff_home");
      } else {
        return res.redirect("/staff");
    }
  }

  req.flash("error", "Invalid Access");
  return res.redirect("/user/signin");
}
};

//check if it's Proffesor
passport.checkProffAuthentication = (req, res, next) => {
  
  if (req.isAuthenticated()) {
    if (Admin.checkAdmin(req.user.email)) {
      return res.redirect("/admin_home");
    } else if (
      req.user.email == `${SUPER_ADMIN_EMAIL}` ||
      getProffName.isProff(req.user.email)
    ) {
      return next();
    } else {
      return res.redirect("/");
    }
  }
  req.flash("error", "Invalid Access");
  return res.redirect("/user/signin");
};

//check if superAdmin
passport.checkSuperAdminAuthentication = async (req, res, next) => {
  if (req.isAuthenticated() && req.user.email == `${SUPER_ADMIN_EMAIL}`) {
    return next();
  }
  req.flash("error", "Invalid Access");
  return res.redirect("/user/signin");
};

passport.setAuthenticatedUser = (req, res, next) => {
  if (req.isAuthenticated()) {
    res.locals.user = req.user;
  }
  next();
};

function adminsLeft(student) {
  var admins_temp = Admin.admins;

  admins_list = [];

  for (var i in admins_temp) {
    if(["adminECE","adminSSH","adminCSE","adminMaths","adminCB","adminHCD"].includes(admins_temp[i])){
      //skipping admin CSE, admin ECE etc.
      continue;
    }

    admins_list.push(admins_temp[i]);
  }
  admins_list.push(`admin${student.department}`);


  var check = true;

  for (var i in admins_list) {
    if (!student[admins_list[i]]) {
      check = false;
    } else {
      check &= student[admins_list[i]];
    }
  }

  for (var j in student["ipList"]) {
    if (!(student["ipList"][j]['ip'] == true)) {
      check = false;
      break;
    }
  }

  for (var j in student["btpList"]) {
    if (!(student["btpList"][j]['btp'] == true)) {
      check = false;
      break;
    }
  }

  return Boolean(check);
}

passport.checkSheetAuthentication = async (req, res, next) => {
  const spreadsheetId = MAIN_EXCEL_ID;
  const auth = new google.auth.GoogleAuth({
    keyFile: "credentials.json",
    scopes: "https://www.googleapis.com/auth/spreadsheets",
  });
  const client = await auth.getClient();
  const googleSheets = google.sheets({ version: "v4", auth: client });
  const metadata = await googleSheets.spreadsheets.get({
    auth: auth,
    spreadsheetId: spreadsheetId,
  });

  await googleSheets.spreadsheets.values.clear({
    auth: auth,
    spreadsheetId: spreadsheetId,
    range: "Sheet1",
  });
  values = [];
  let headings = [
    "Name",
    "Roll no.",
    "Email",
    "Mobile No.",
    "Degree",
    "Department",
    "Batch",
    "Leaving Reason"
  ];  

  for(var i in Admin.admins){
    if(Admin.admins[i]=='academics' || (["adminECE","adminSSH","adminCSE","adminMaths","adminCB","adminHCD"].includes(Admin.admins[i]))){
      continue;
    }
    let name=Admin.getOriginalAdmin(Admin.admins[i]);
   
    headings.push(name);
    headings.push(name+' Fine');
    headings.push(name + " Applying Date");
  }
 
  headings.push('Academics');
  headings.push('Academics Fine');
  headings.push("Academics Applying Date");
  headings.push("Admin Department");
  headings.push("Admin Department Fine");
  headings.push("Admin Department Applying Date");

  headings.push(
    "IP",
    "BTP",
    "Overall",
    "NoDues Given",
    "Total Fine",
    "Donation Department",
    "Donation Amount",
    "Bank Name",
    "Branch Name",
    "Account Holder Name",
    "Account No",
    "IFSC Code",
    "Cancelled Cheque Link"
  );
  values.push(headings);
  
  var docs = await User.find({});
  for (var i in docs) {

    if (docs[i]['nodues'] && docs[i]["noduesApprovedAt"]) {
      let d1=new Date(docs[i]["noduesApprovedAt"]);
      let d2= new Date();
      d2.setFullYear(d2.getFullYear()-1);
      
      if( d1.getTime()<d2.getTime()){
        continue;
      }
    }


    if (!docs[i]["type"]) {
      var temp = { array: [] };
      add2(temp, docs[i]["name"]);
      add2(temp, docs[i]["roll"]);
      add2(temp, docs[i]["email"]);
      add2(temp, docs[i]["mobile"]);
      add2(temp, docs[i]["degree"]);
      add2(temp, docs[i]["department"]);
      add2(temp, docs[i]["batch"]);
      add2(temp, docs[i]["personalDetails"]);

      for (var j in Admin.admins){
        if(["adminECE","adminSSH","adminCSE","adminMaths","adminCB","adminHCD","academics"].includes(Admin.admins[j])){
          continue;
        }
        add(temp, docs[i][Admin.admins[j]]);
        add2(temp, docs[i][Admin.admins[j]+'Fine']);
        add2(temp, docs[i][Admin.admins[j] + "AppliedAt"]);
      }
      add(temp, docs[i][`academics`]);
      add2(temp, docs[i]["academicsFine"]);
      add2(temp, docs[i]["academicsAppliedAt"]);

      add(temp, docs[i][`admin${docs[i]['department']}`]);
      add2(temp, docs[i][`admin${docs[i]['department']}`+ "Fine"]);
      add2(temp, docs[i][`admin${docs[i]["department"]}` + "AppliedAt"]);
      
      var checkIp = true;
      for (var j in docs[i]["ipList"]) {
        if (!(docs[i]["ipList"][j]['ip'] == true)) {
          checkIp = false;
          break;
        }
      }
      add(temp, checkIp);
      var checkBtp = true;
      for (var j in docs[i]["btpList"]) {
        if (!(docs[i]["btpList"][j]['btp'] == true)) {
          checkBtp = false;
          break;
        }
      }
      add(temp, checkBtp);
      add(temp, adminsLeft(docs[i]));
      add(temp, docs[i]["nodues"]);
      add2(temp, docs[i]["totalFine"]);
      add2(temp, docs[i]["donationAdmin"]);
      add2(temp, docs[i]["donationAmount"]);
      add2(temp, docs[i]["bankName"]);
      add2(temp, docs[i]["bankBranch"]);
      add2(temp, docs[i]["bankAccountHolder"]);
      add2(temp, docs[i]["bankAccountNo"]);
      add2(temp, docs[i]["bankIfscCode"]);
      add2(temp, docs[i]["cancelledCheque"]);

      values.push(temp.array);
    }
  }
  await googleSheets.spreadsheets.values.append({
    auth: auth,
    spreadsheetId: spreadsheetId,
    range: "Sheet1",
    valueInputOption: "USER_ENTERED",
    resource: {
      values: values,
    },
  });
  next();
};

passport.checkBankAuthentication = async (req, res, next) => {
  //Account Details
  const spreadsheetId = BANK_EXCEL_ID;
  const auth = new google.auth.GoogleAuth({
    keyFile: "credentials.json",
    scopes: "https://www.googleapis.com/auth/spreadsheets",
  });
  const client = await auth.getClient();
  const googleSheets = google.sheets({ version: "v4", auth: client });
  const metadata = await googleSheets.spreadsheets.get({
    auth: auth,
    spreadsheetId: spreadsheetId,
  });

  await googleSheets.spreadsheets.values.clear({
    auth: auth,
    spreadsheetId: spreadsheetId,
    range: "Sheet1",
  });
  values = [];
  values.push([
    "Name",
    "Roll no.",
    "Email",
    "Bank Name",
    "Branch Name",
    "Account Holder Name",
    "Account No",
    "IFSC Code",
  ]);
  var docs = await User.find({});
  for (var i in docs) {
    if (!docs[i]["type"]) {
      var temp = { array: [] };
      add(temp, docs[i]["name"]);
      add(temp, docs[i]["roll"]);
      add(temp, docs[i]["email"]);
      add(temp, docs[i]["bankName"]);
      add(temp, docs[i]["bankBranch"]);
      add(temp, docs[i]["bankAccountHolder"]);
      add(temp, docs[i]["bankAccountNo"]);
      add(temp, docs[i]["bankIfscCode"]);
      values.push(temp.array);
    }
  }
  await googleSheets.spreadsheets.values.append({
    auth: auth,
    spreadsheetId: spreadsheetId,
    range: "Sheet1",
    valueInputOption: "USER_ENTERED",
    resource: {
      values: values,
    },
  });
  next();
};

module.exports = passport;
