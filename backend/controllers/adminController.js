const User = require("../models/user");
const StudentProfile = require("../models/StudentProfile");
const Job = require("../models/Job");
const Application = require("../models/Application");

// =========================================================
// GET ALL STUDENTS
// =========================================================
const getAllStudents = async (req, res) => {
    try {
        const students = await User.find(
            { role: "student" },
            {
                name: 1,
                email: 1,
                role: 1,
                resume: 1,
                createdAt: 1,
            }
        ).sort({
            createdAt: -1,
        });

        const studentData = await Promise.all(
            students.map(async (student) => {
                // =================================================
                // Get student profile
                // =================================================
                const profile =
                    await StudentProfile.findOne({
                        user: student._id,
                    });

                // =================================================
                // Check whether student has ANY selected
                // application
                // =================================================
                const selectedApplication =
                    await Application.findOne({
                        student: student._id,
                        status: "Selected",
                    });

                // =================================================
                // Placement status
                //
                // IMPORTANT:
                // Application status is the source of truth.
                //
                // Selected application exists
                //      -> Placed
                //
                // No Selected application
                //      -> Not Placed
                // =================================================
                const placementStatus =
                    selectedApplication
                        ? "Placed"
                        : "Not Placed";

                // =================================================
                // Return student information
                // =================================================
                return {
                    _id: student._id,

                    name: student.name,

                    email: student.email,

                    role: student.role,

                    phone:
                        profile?.phone || "",

                    college:
                        profile?.college || "",

                    course:
                        profile?.course || "",

                    branch:
                        profile?.branch || "",

                    graduationYear:
                        profile?.graduationYear || "",

                    cgpa:
                        profile?.cgpa ?? "",

                    skills:
                        profile?.skills || [],

                    placementStatus,

                    resume:
                        profile?.resume ||
                        student.resume ||
                        "",

                    createdAt:
                        student.createdAt,
                };
            })
        );

        return res.status(200).json({
            message:
                "Students fetched successfully",

            students: studentData,
        });

    } catch (error) {
        console.error(
            "Get students error:",
            error
        );

        return res.status(500).json({
            message:
                "Failed to fetch students",

            error: error.message,
        });
    }
};

// =========================================================
// GET ADMIN DASHBOARD
// =========================================================
const getAdminDashboard = async (req, res) => {
    try {
        // =====================================================
        // Total students
        // =====================================================
        const totalStudents =
            await User.countDocuments({
                role: "student",
            });

        // =====================================================
        // Total jobs
        // =====================================================
        const totalJobs =
            await Job.countDocuments();

        // =====================================================
        // Active jobs
        // =====================================================
        const activeJobs =
            await Job.countDocuments({
                status: "Open",
            });

        // =====================================================
        // Total applications
        // =====================================================
        const totalApplications =
            await Application.countDocuments();

        // =====================================================
        // Application status counts
        // =====================================================
        const appliedApplications =
            await Application.countDocuments({
                status: "Applied",
            });

        const shortlistedApplications =
            await Application.countDocuments({
                status: "Shortlisted",
            });

        const rejectedApplications =
            await Application.countDocuments({
                status: "Rejected",
            });

        const selectedApplications =
            await Application.countDocuments({
                status: "Selected",
            });

        // =====================================================
        // Response
        // =====================================================
        return res.status(200).json({
            message:
                "Dashboard data fetched successfully",

            stats: {
                totalStudents,

                totalJobs,

                activeJobs,

                totalApplications,

                appliedApplications,

                shortlistedApplications,

                rejectedApplications,

                selectedApplications,
            },
        });

    } catch (error) {
        console.error(
            "Admin dashboard error:",
            error
        );

        return res.status(500).json({
            message:
                "Failed to load dashboard",

            error: error.message,
        });
    }
};

// =========================================================
// GET ALL APPLICATIONS - ADMIN
// =========================================================
const getAdminApplications = async (req, res) => {
    try {
        const applications =
            await Application.find()

                // =============================================
                // Student information
                // =============================================
                .populate(
                    "student",
                    "name email"
                )

                // =============================================
                // Job information
                // =============================================
                .populate(
                    "job",
                    "company jobTitle title location salary applicationDeadline status"
                )

                // =============================================
                // Newest applications first
                // =============================================
                .sort({
                    createdAt: -1,
                });

        return res.status(200).json({
            message:
                "Applications fetched successfully",

            applications,
        });

    } catch (error) {
        console.error(
            "Get admin applications error:",
            error
        );

        return res.status(500).json({
            message:
                "Failed to fetch applications",

            error: error.message,
        });
    }
};

// =========================================================
// EXPORT
// =========================================================
module.exports = {
    getAllStudents,
    getAdminDashboard,
    getAdminApplications,
};