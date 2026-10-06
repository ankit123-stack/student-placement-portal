const express = require("express");

const {
    createOrUpdateProfile,
    getStudentProfile,
} = require("../controllers/studentProfileController");

const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const User = require("../models/user");
const cloudinary = require("../config/cloudinary");

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
// UPLOAD STUDENT RESUME TO CLOUDINARY
// ==========================================
router.post(
    "/resume",
    protect,
    upload.single("resume"),

    async (req, res) => {
        try {

            // ==========================================
            // CHECK FILE
            // ==========================================
            if (!req.file) {
                return res.status(400).json({
                    message: "Please upload a PDF resume",
                });
            }


            // ==========================================
            // UPLOAD PDF TO CLOUDINARY
            // ==========================================
            const cloudinaryResult = await new Promise(
                (resolve, reject) => {

                    const uploadStream =
                        cloudinary.uploader.upload_stream(
                            {
                                resource_type: "raw",

                                folder:
                                    "student-placement-resumes",

                                public_id:
                                    `${req.user.id}-${Date.now()}.pdf`,
                            },

                            (error, result) => {

                                if (error) {
                                    reject(error);
                                } else {
                                    resolve(result);
                                }

                            }
                        );


                    // Send the file from memory to Cloudinary
                    uploadStream.end(req.file.buffer);
                }
            );


            // ==========================================
            // CLOUDINARY URL
            // ==========================================
            const resumeUrl =
                cloudinaryResult.secure_url;


            // ==========================================
            // SAVE CLOUDINARY URL IN USER
            // ==========================================
            const updatedUser =
                await User.findByIdAndUpdate(
                    req.user.id,

                    {
                        resume: resumeUrl,
                    },

                    {
                        new: true,
                    }
                );


            // ==========================================
            // CHECK USER
            // ==========================================
            if (!updatedUser) {
                return res.status(404).json({
                    message: "User not found",
                });
            }


            // ==========================================
            // SUCCESS RESPONSE
            // ==========================================
            res.status(200).json({

                message:
                    "Resume uploaded successfully",

                file:
                    cloudinaryResult.public_id,

                resumeUrl:
                    resumeUrl,

                resume:
                    resumeUrl,

            });

        } catch (error) {

            console.error(
                "Resume upload error:",
                error
            );

            res.status(500).json({

                message:
                    "Resume upload failed",

                error:
                    error.message,

            });
        }
    }
);


module.exports = router;