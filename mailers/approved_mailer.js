const nodemailer = require("../config/nodemailer");
const User = require("../models/user");
const Admin = require("../models/admin");
const StaffAdmin = require("../models/staffAdmin");
const axios = require("axios");
const { CURRENT_URL, NODEMAILER_EMAIL_ID } = require("../config/config");

function fetchName(email) {
  var index = email.indexOf("@");
  var name = email.substring(0, index - 5);
  return name[0].toUpperCase() + name.substring(1);
}

exports.approvedDues = async (admin, email) => {
  Admin.db.findOne({ admin: admin }, function (err, adminObj) {
    if (err) {
      console.log("Can't find admin");
    }

    let displayAddress = adminObj["displayAddress"];
    if (displayAddress == "") {
      displayAddress = "NA";
    }

    let htmlString = `
            <div>
                <p>Hi ${fetchName(email)}!</p>
                <br>
                <p>Congratulations! Your No-Dues has been approved for the ${
                  adminObj["originalAdminName"]
                } department.</p>
                <br>
                <p>Thanks!</p>
                <p>${adminObj["displayName"]}</p>
                <p>[${displayAddress}]</p>

                
            </div>`;

    let sub = `No Dues Approved for ${adminObj["originalAdminName"]} Department`;

    nodemailer.transporter.sendMail(
      {
        from: `${NODEMAILER_EMAIL_ID}`,
        to: email,
        subject: sub,
        html: htmlString,
      },
      (err, info) => {
        if (err) {
          console.log("Error in sending mail", err);
          return;
        }
        return;
      }
    );

    return adminObj;
  });
};


exports.approvedDuesForStaff = async (admin, email) => {
  StaffAdmin.db.findOne({ admin: admin }, function (err, adminObj) {
    if (err) {
      console.log("Can't find admin");
    }

    let displayAddress = adminObj["displayAddress"];
    if (displayAddress == "") {
      displayAddress = "NA";
    }

    let htmlString = `
            <div>
                <p>Hi ${fetchName(email)}!</p>
                <br>
                <p>Congratulations! Your No-Dues has been approved for the ${
                  adminObj["originalAdminName"]
                } department.</p>
                <br>
                <p>Thanks!</p>
                <p>${adminObj["displayName"]}</p>
                <p>[${displayAddress}]</p>

                
            </div>`;

    let sub = `No Dues Approved for ${adminObj["originalAdminName"]} Department`;

    nodemailer.transporter.sendMail(
      {
        from: `${NODEMAILER_EMAIL_ID}`,
        to: email,
        subject: sub,
        html: htmlString,
      },
      (err, info) => {
        if (err) {
          console.log("Error in sending mail", err);
          return;
        }
        return;
      }
    );

    return adminObj;
  });
};


exports.startStaffDuesRequest = async (email) => {
    let htmlString = `
            <div>
                <p>Hi Admin!</p>
                <br>
                <p> The following staff - ${fetchName(email)}(${email}) has requested for their NoDues, kindly approve it in the portal</p>
                <br>
                <p>Thanks!</p>
            </div>`;

    let sub = `No Dues Request for ${fetchName(email)}`;

    nodemailer.transporter.sendMail(
      {
        from: `${NODEMAILER_EMAIL_ID}`,
        to: email,
        subject: sub,
        html: htmlString,
      },
      (err, info) => {
        if (err) {
          console.log("Error in sending mail", err);
          return;
        }
        return;
      }
    );
}


exports.completeStaffDuesRequest = async (email) => {
  let htmlString = `
          <div>
              <p>Hi ${fetchName(email)}!</p>
              <br>
              <p> The admin has approved your NoDues request, kindly check the portal</p>
              <br>
              <p>Thanks!</p>
          </div>`;

  let sub = `No Dues Request Accepted`;

  nodemailer.transporter.sendMail(
    {
      from: `${NODEMAILER_EMAIL_ID}`,
      to: email,
      subject: sub,
      html: htmlString,
    },
    (err, info) => {
      if (err) {
        console.log("Error in sending mail", err);
        return;
      }
      return;
    }
  );
}

exports.cancelStaffDuesRequest = async (email) => {
  let htmlString = `
          <div>
              <p>Hi ${fetchName(email)}!</p>
              <br>
              <p> The admin has cancel your NoDues request, kindly re apply or check with admin</p>
              <br>
              <p>Thanks!</p>
          </div>`;

  let sub = `No Dues Request Rejected`;

  nodemailer.transporter.sendMail(
    {
      from: `${NODEMAILER_EMAIL_ID}`,
      to: email,
      subject: sub,
      html: htmlString,
    },
    (err, info) => {
      if (err) {
        console.log("Error in sending mail", err);
        return;
      }
      return;
    }
  );
}