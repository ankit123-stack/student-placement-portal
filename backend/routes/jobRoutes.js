const express = require("express");

const {
    createJob,
    getAllJobs,
    getJobById,
    updateJob,
    deleteJob,
    updateJobStatus,
} = require("../controllers/jobController");

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const router = express.Router();


// Create Job - Admin Only
router.post(
    "/",
    protect,
    adminOnly,
    createJob
);


// Get All Jobs - Logged-in Users
router.get(
    "/",
    protect,
    getAllJobs
);


// Get Single Job - Logged-in Users
router.get(
    "/:id",
    protect,
    getJobById
);


// Update Job - Admin Only
router.put(
    "/:id",
    protect,
    adminOnly,
    updateJob
);


// Delete Job - Admin Only
router.delete(
    "/:id",
    protect,
    adminOnly,
    deleteJob
);


// Update Job Status - Admin Only
router.put(
    "/:id/status",
    protect,
    adminOnly,
    updateJobStatus
);


module.exports = router;