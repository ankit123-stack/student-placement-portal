const StudentProfile = require("../models/StudentProfile");
const Application = require("../models/Application");
const User = require("../models/user");


// ==========================================
// Create or Update Student Profile
// ==========================================
const createOrUpdateProfile = async (req, res) => {
    try {
        const {
            phone,
            college,
            course,
            branch,
            graduationYear,
            cgpa,
            skills,
            resume,
            placementStatus,
        } = req.body;

        // ==========================================
        // Check authenticated user
        // ==========================================
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                message:
                    "Unauthorized. User information not found.",
            });
        }

        const userId = req.user.id;

        // ==========================================
        // Check whether student has a Selected
        // application
        // ==========================================
        const selectedApplication =
            await Application.findOne({
                student: userId,
                status: "Selected",
            });

        // ==========================================
        // Convert skills into an array
        // ==========================================
        let formattedSkills = [];

        if (Array.isArray(skills)) {
            formattedSkills = skills;
        } else if (typeof skills === "string") {
            formattedSkills = skills
                .split(",")
                .map((skill) => skill.trim())
                .filter(Boolean);
        }

        // ==========================================
        // Check if profile already exists
        // ==========================================
        let profile = await StudentProfile.findOne({
            user: userId,
        });

        // ==========================================
        // Determine Placement Status
        //
        // Application status is the source of truth.
        //
        // Selected application exists
        //      -> Placed
        //
        // No Selected application
        //      -> Not Placed
        // ==========================================
        let finalPlacementStatus;

        if (selectedApplication) {
            finalPlacementStatus = "Placed";
        } else {
            finalPlacementStatus = "Not Placed";
        }

        // ==========================================
        // Update Existing Profile
        // ==========================================
        if (profile) {
            profile.phone = phone || "";
            profile.college = college || "";
            profile.course = course || "";
            profile.branch = branch || "";

            // Convert numeric fields safely
            if (
                graduationYear !== undefined &&
                graduationYear !== ""
            ) {
                profile.graduationYear =
                    Number(graduationYear);
            }

            if (
                cgpa !== undefined &&
                cgpa !== ""
            ) {
                profile.cgpa = Number(cgpa);
            }

            profile.skills = formattedSkills;

            // ======================================
            // Keep existing resume if no new resume
            // was provided
            // ======================================
            if (resume !== undefined) {
                profile.resume = resume || "";
            }

            // ======================================
            // IMPORTANT:
            // Do NOT trust placementStatus sent
            // from frontend.
            //
            // Calculate it from applications.
            // ======================================
            profile.placementStatus =
                finalPlacementStatus;

            await profile.save();

            return res.status(200).json({
                message:
                    "Student profile updated successfully",

                profile,
            });
        }

        // ==========================================
        // Create New Profile
        // ==========================================
        profile = await StudentProfile.create({
            user: userId,

            phone: phone || "",

            college: college || "",

            course: course || "",

            branch: branch || "",

            graduationYear:
                graduationYear !== undefined &&
                    graduationYear !== ""
                    ? Number(graduationYear)
                    : undefined,

            cgpa:
                cgpa !== undefined &&
                    cgpa !== ""
                    ? Number(cgpa)
                    : undefined,

            skills: formattedSkills,

            resume: resume || "",

            placementStatus:
                finalPlacementStatus,
        });

        return res.status(201).json({
            message:
                "Student profile created successfully",

            profile,
        });

    } catch (error) {
        console.error(
            "Student profile error:",
            error
        );

        // ==========================================
        // Mongoose Validation Error
        // ==========================================
        if (error.name === "ValidationError") {
            return res.status(400).json({
                message:
                    "Student profile validation failed",

                error:
                    error.message,
            });
        }

        // ==========================================
        // MongoDB Cast Error
        // ==========================================
        if (error.name === "CastError") {
            return res.status(400).json({
                message:
                    "Invalid student profile data",

                error:
                    error.message,
            });
        }

        // ==========================================
        // Server Error
        // ==========================================
        return res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
};


// ==========================================
// Get Student Profile
// ==========================================
const getStudentProfile = async (req, res) => {
    try {
        // ==========================================
        // Check authenticated user
        // ==========================================
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                message:
                    "Unauthorized. User information not found.",
            });
        }

        const userId = req.user.id;

        // ==========================================
        // Find Student Profile
        // ==========================================
        const profile =
            await StudentProfile.findOne({
                user: userId,
            }).populate(
                "user",
                "name email role"
            );

        if (!profile) {
            return res.status(404).json({
                message:
                    "Student profile not found",
            });
        }

        // ==========================================
        // Get logged-in User
        //
        // Resume upload route saves the resume
        // inside User.resume.
        // ==========================================
        const user =
            await User.findById(userId);

        // ==========================================
        // Synchronize Resume
        //
        // Resume upload currently saves:
        //
        // User.resume
        //
        // But StudentProfile.resume is used by
        // the student profile API/frontend.
        //
        // If StudentProfile.resume is empty,
        // copy the resume from User.resume.
        // ==========================================
        if (
            (!profile.resume ||
                profile.resume.trim() === "") &&
            user &&
            user.resume
        ) {
            profile.resume = user.resume;

            await profile.save();
        }

        // ==========================================
        // Check whether student has a Selected
        // application
        // ==========================================
        const selectedApplication =
            await Application.findOne({
                student: userId,
                status: "Selected",
            });

        // ==========================================
        // Calculate correct placement status
        //
        // Selected exists
        //      -> Placed
        //
        // No Selected exists
        //      -> Not Placed
        // ==========================================
        const correctPlacementStatus =
            selectedApplication
                ? "Placed"
                : "Not Placed";

        // ==========================================
        // Synchronize database value
        // ==========================================
        if (
            profile.placementStatus !==
            correctPlacementStatus
        ) {
            profile.placementStatus =
                correctPlacementStatus;

            await profile.save();
        }

        // ==========================================
        // Return Profile
        // ==========================================
        return res.status(200).json({
            message:
                "Student profile fetched successfully",

            profile,
        });

    } catch (error) {
        console.error(
            "Get student profile error:",
            error
        );

        // ==========================================
        // Mongoose Validation Error
        // ==========================================
        if (error.name === "ValidationError") {
            return res.status(400).json({
                message:
                    "Student profile validation failed",

                error:
                    error.message,
            });
        }

        // ==========================================
        // Server Error
        // ==========================================
        return res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
};


// ==========================================
// Exports
// ==========================================
module.exports = {
    createOrUpdateProfile,
    getStudentProfile,
};