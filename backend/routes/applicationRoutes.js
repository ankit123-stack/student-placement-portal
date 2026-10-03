const express = require("express");

const {
    applyForJob,
    getMyApplications,
    getAllApplications,
    getApplicationDetails,
    updateApplicationStatus,
} = require("../controllers/applicationController");

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const router = express.Router();


// =========================================================
// STUDENT ROUTES
// =========================================================

// Apply for a job
// POST /api/applications/:jobId
router.post(
    "/:jobId",
    protect,
    applyForJob
);


// Get logged-in student's applications
// GET /api/applications/my
router.get(
    "/my",
    protect,
    getMyApplications
);


// =========================================================
// ADMIN ROUTES
// =========================================================

// Get all applications
// GET /api/applications/all
router.get(
    "/all",
    protect,
    adminOnly,
    getAllApplications
);


// Get single application details
// GET /api/applications/:id
router.get(
    "/:id",
    protect,
    adminOnly,
    getApplicationDetails
);


// Update application status
// PUT /api/applications/:id/status
router.put(
    "/:id/status",
    protect,
    adminOnly,
    updateApplicationStatus
);


module.exports = router;
