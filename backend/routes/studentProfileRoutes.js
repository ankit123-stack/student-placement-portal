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
// =========================================================

router.post(
    "/resume",
    protect,
    upload.single("resume"),

    async (req, res) => {
        try {

            // -------------------------------------------------
            // Check file
            // -------------------------------------------------

            if (!req.file) {
                return res.status(400).json({
                    message: "Please upload a PDF resume",
                });
            }


            // -------------------------------------------------
            // Check Cloudinary environment variables
            // -------------------------------------------------

            const cloudName =
                process.env.CLOUDINARY_CLOUD_NAME;

            const apiKey =
                process.env.CLOUDINARY_API_KEY;

            const apiSecret =
                process.env.CLOUDINARY_API_SECRET;


            if (
                !cloudName ||
                !apiKey ||
                !apiSecret
            ) {
                console.error(
                    "Cloudinary environment variables are missing"
                );

                return res.status(500).json({
                    message:
                        "Cloudinary configuration is missing",
                });
            }


            // -------------------------------------------------
            // Create Cloudinary upload URL
            // -------------------------------------------------

            const uploadUrl =
                `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`;


            // -------------------------------------------------
            // Generate unique public ID
            // -------------------------------------------------

            const publicId =
                `${req.user.id}-${Date.now()}.pdf`;


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


            formData.append(
                "folder",
                "student-placement-resumes"
            );


            formData.append(
                "public_id",
                publicId
            );


            // -------------------------------------------------
            // Basic Authentication
            // -------------------------------------------------

            const credentials =
                Buffer
                    .from(`${apiKey}:${apiSecret}`)
                    .toString("base64");


            // -------------------------------------------------
            // Upload directly to Cloudinary
            // -------------------------------------------------

            const cloudinaryResponse =
                await fetch(
                    uploadUrl,
                    {
                        method: "POST",

                        headers: {
                            Authorization:
                                `Basic ${credentials}`,
                        },

                        body: formData,
                    }
                );


            // -------------------------------------------------
            // Read Cloudinary response
            // -------------------------------------------------

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
            // Cloudinary upload failed
            // -------------------------------------------------

            if (!cloudinaryResponse.ok) {

                console.error(
                    "Cloudinary upload failed:",
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
            // Get secure Cloudinary URL
            // -------------------------------------------------

            const resumeUrl =
                cloudinaryResult.secure_url;


            if (!resumeUrl) {

                console.error(
                    "Cloudinary upload succeeded but no secure URL was returned",
                    cloudinaryResult
                );

                return res.status(500).json({
                    message:
                        "Cloudinary upload completed but resume URL was not returned",
                });
            }


            // -------------------------------------------------
            // Save resume URL in User collection
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
            // Success
            // -------------------------------------------------

            console.log(
                "Resume uploaded successfully to Cloudinary"
            );

            console.log(
                "Cloudinary public ID:",
                cloudinaryResult.public_id
            );


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