const express = require("express");

const {
    getAllStudents,
    getAdminDashboard,
    getAdminApplications,
} = require("../controllers/adminController");

const {
    getApplicationDetails,
} = require("../controllers/applicationController");

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const router = express.Router();


// ==========================================
// ADMIN DASHBOARD
// ==========================================

router.get(
    "/dashboard",
    protect,
    adminOnly,
    getAdminDashboard
);


// ==========================================
// ADMIN APPLICATIONS
// ==========================================

router.get(
    "/applications",
    protect,
    adminOnly,
    getAdminApplications
);


// ==========================================
// ADMIN APPLICATION DETAILS
// ==========================================

router.get(
    "/applications/:id",
    protect,
    adminOnly,
    getApplicationDetails
);


// ==========================================
// ADMIN STUDENTS
// ==========================================

router.get(
    "/students",
    protect,
    adminOnly,
    getAllStudents
);


module.exports = router;