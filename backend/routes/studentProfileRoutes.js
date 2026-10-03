const express = require("express");

const {
    createOrUpdateProfile,
    getStudentProfile,
} = require("../controllers/studentProfileController");

const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const User = require("../models/user");

const router = express.Router();


// ==========================================
// CREATE OR UPDATE STUDENT PROFILE
// ==========================================
router.post(
    "/profile",
    protect,
    createOrUpdateProfile
);


// ==========================================
// GET STUDENT PROFILE
// ==========================================
router.get(
    "/profile",
    protect,
    getStudentProfile
);


// ==========================================
// UPLOAD STUDENT RESUME
// ==========================================
router.post(
    "/resume",
    protect,
    upload.single("resume"),

    async (req, res) => {
        try {

            // Check if file was uploaded
            if (!req.file) {
                return res.status(400).json({
                    message: "Please upload a PDF resume",
                });
            }


            // Create resume path
            const resumePath = `/uploads/${req.file.filename}`;


            // Find logged-in student and save resume
            const updatedUser = await User.findByIdAndUpdate(
                req.user.id,

                {
                    resume: resumePath,
                },

                {
                    new: true,
                }
            );


            // Check if user exists
            if (!updatedUser) {
                return res.status(404).json({
                    message: "User not found",
                });
            }


            // Send successful response
            res.status(200).json({

                message: "Resume uploaded successfully",

                file: req.file.filename,

                resumeUrl: resumePath,

            });

        } catch (error) {

            console.error(
                "Resume upload error:",
                error
            );

            res.status(500).json({

                message: "Resume upload failed",

                error: error.message,

            });
        }
    }
);


module.exports = router;