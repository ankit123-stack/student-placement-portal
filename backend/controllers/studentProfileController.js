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
        let profile =
            await StudentProfile.findOne({
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

            // ======================================
            // Convert numeric fields safely
            // ======================================
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

            // ======================================
            // Skills
            // ======================================
            profile.skills = formattedSkills;

            // ======================================
            // Resume
            //
            // Only update when a resume was actually
            // supplied by the request.
            // ======================================
            if (resume !== undefined) {
                profile.resume = resume || "";
            }

            // ======================================
            // Placement status comes from application
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
        profile =
            await StudentProfile.create({
                user: userId,

                phone:
                    phone || "",

                college:
                    college || "",

                course:
                    course || "",

                branch:
                    branch || "",

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

                skills:
                    formattedSkills,

                resume:
                    resume || "",

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
            message:
                "Server error",

            error:
                error.message,
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
        // Resume upload route saves the latest
        // Cloudinary URL inside User.resume.
        // ==========================================
        const user =
            await User.findById(userId);

        // ==========================================
        // IMPORTANT RESUME SYNCHRONIZATION
        //
        // User.resume is now the source of truth
        // for the uploaded resume.
        //
        // Previously this only synchronized when
        // StudentProfile.resume was empty.
        //
        // That caused the old /uploads/ URL to remain
        // even after a new Cloudinary resume was
        // successfully uploaded.
        //
        // Now we synchronize whenever the values
        // are different.
        // ==========================================
        if (
            user &&
            user.resume &&
            profile.resume !== user.resume
        ) {
            profile.resume =
                user.resume;

            await profile.save();

            console.log(
                "StudentProfile resume synchronized with User.resume"
            );
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
        // Synchronize placement status
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
            message:
                "Server error",

            error:
                error.message,
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