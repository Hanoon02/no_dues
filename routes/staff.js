const express = require("express");
const staffController = require("../controllers/staff_controller");
const router = express.Router();

router.get("/", staffController.home);
router.get("/getAdmins", staffController.getAdmins);
router.get("/request/:obj", staffController.request);
router.get("/getAdmin/:admin", staffController.getAdminDetails);
router.get("/admin_home", staffController.adminHome)
router.get("/super_admin", staffController.superAdminHome)
router.get("/getRequestedDuesStaff", staffController.getRequestedDuesStaff)
router.get("/getStudents/:adminName/:status",staffController.getStaffAdmin);
router.get("/approveDues/:dues",staffController.approveStaffDues);
router.get("/showSheet",staffController.showSheet);
router.get("/requestForDues/:user",staffController.startStaffNoDuesRequest);
router.get("/completeRequestForDues/:user/:departments",staffController.completeStaffNoDuesRequest);
router.get("/cancelRequestForDues/:user",staffController.cancelStaffNoDuesRequest);
module.exports = router;