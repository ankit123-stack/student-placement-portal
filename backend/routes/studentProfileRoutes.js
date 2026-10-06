const express = require("express");

const {
    createOrUpdateProfile,
    getStudentProfile,
} = require("../controllers/studentProfileController");

const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const User = require("../models/user");

const router = express.Router();

// =========================================================
// CREATE / UPDATE STUDENT PROFILE
// =========================================================
router.post(
    "/profile",
    protect,
    createOrUpdateProfile
);

// =========================================================
// GET STUDENT PROFILE
// =========================================================
router.get(
    "/profile",
    protect,
    getStudentProfile
);

// =========================================================
// UPLOAD RESUME TO CLOUDINARY
// Uses an UNSIGNED Cloudinary Upload Preset.
// No API key or API secret is required.
// =========================================================
router.post(
    "/resume",
    protect,
    upload.single("resume"),

    async (req, res) => {
        try {
            // -------------------------------------------------
            // Check uploaded file
            // -------------------------------------------------
            if (!req.file) {
                return res.status(400).json({
                    message: "Please upload a PDF resume",
                });
            }

            // -------------------------------------------------
            // Cloudinary configuration
            // -------------------------------------------------
            const cloudName =
                process.env.CLOUDINARY_CLOUD_NAME;

            const uploadPreset =
                process.env.CLOUDINARY_UPLOAD_PRESET;

            if (!cloudName || !uploadPreset) {
                console.error(
                    "Cloudinary unsigned upload configuration is missing"
                );

                return res.status(500).json({
                    message:
                        "Cloudinary configuration is missing",
                });
            }

            // -------------------------------------------------
            // Cloudinary unsigned upload endpoint
            // -------------------------------------------------
            const uploadUrl =
                `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`;

            // -------------------------------------------------
            // Create multipart form data
            // -------------------------------------------------
            const formData = new FormData();

            const fileBlob = new Blob(
                [req.file.buffer],
                {
                    type: "application/pdf",
                }
            );

            formData.append(
                "file",
                fileBlob,
                req.file.originalname
            );

            // IMPORTANT:
            // Only the unsigned upload preset is required.
            // We do NOT send API key, API secret,
            // Authorization header, or public_id.
            formData.append(
                "upload_preset",
                uploadPreset
            );

            // -------------------------------------------------
            // Upload to Cloudinary
            // -------------------------------------------------
            const cloudinaryResponse =
                await fetch(
                    uploadUrl,
                    {
                        method: "POST",
                        body: formData,
                    }
                );

            const responseText =
                await cloudinaryResponse.text();

            let cloudinaryResult;

            try {
                cloudinaryResult =
                    JSON.parse(responseText);
            } catch {
                cloudinaryResult = {
                    rawResponse:
                        responseText,
                };
            }

            // -------------------------------------------------
            // Handle Cloudinary error
            // -------------------------------------------------
            if (!cloudinaryResponse.ok) {
                console.error(
                    "Cloudinary unsigned upload failed:",
                    {
                        status:
                            cloudinaryResponse.status,

                        response:
                            cloudinaryResult,
                    }
                );

                return res.status(500).json({
                    message:
                        "Resume upload failed",

                    cloudinaryStatus:
                        cloudinaryResponse.status,

                    error:
                        cloudinaryResult?.error?.message ||
                        cloudinaryResult?.message ||
                        "Cloudinary upload failed",
                });
            }

            // -------------------------------------------------
            // Get Cloudinary secure URL
            // -------------------------------------------------
            const resumeUrl =
                cloudinaryResult.secure_url;

            if (!resumeUrl) {
                console.error(
                    "Cloudinary upload succeeded but no secure URL was returned:",
                    cloudinaryResult
                );

                return res.status(500).json({
                    message:
                        "Cloudinary upload completed but resume URL was not returned",
                });
            }

            // -------------------------------------------------
            // Save Cloudinary URL in MongoDB
            // -------------------------------------------------
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

            if (!updatedUser) {
                return res.status(404).json({
                    message:
                        "User not found",
                });
            }

            // -------------------------------------------------
            // Success logs
            // -------------------------------------------------
            console.log(
                "Resume uploaded successfully to Cloudinary"
            );

            console.log(
                "Cloudinary public ID:",
                cloudinaryResult.public_id
            );

            console.log(
                "Cloudinary resume URL:",
                resumeUrl
            );

            // -------------------------------------------------
            // Success response
            // -------------------------------------------------
            return res.status(200).json({
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

            return res.status(500).json({
                message:
                    "Resume upload failed",

                error:
                    error.message ||
                    "Unknown error",
            });
        }
    }
);

module.exports = router;