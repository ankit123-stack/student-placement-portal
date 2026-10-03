const mongoose = require("mongoose");

const Application = require("../models/Application");
const Job = require("../models/Job");
const StudentProfile = require("../models/StudentProfile");
const Notification = require("../models/Notification");

// =========================================================
// Helper: Check whether a job is still open
// =========================================================
const isJobOpen = (job) => {
    if (!job || !job.applicationDeadline) {
        return false;
    }

    const deadline = new Date(job.applicationDeadline);

    if (Number.isNaN(deadline.getTime())) {
        return false;
    }

    const now = new Date();

    // Job remains open until the end of deadline date
    deadline.setHours(23, 59, 59, 999);

    return deadline >= now;
};


// =========================================================
// Helper: Populate application response
// =========================================================
const populateApplicationResponse = async (application) => {
    await application.populate([
        {
            path: "student",
            select: "name email",
        },
        {
            path: "job",
            select:
                "company jobTitle description location salary eligibility skills applicationDeadline status",
        },
        {
            path: "statusHistory.changedBy",
            select: "name email role",
        },
    ]);

    // =====================================================
    // Get Student Profile
    // =====================================================
    const studentId =
        application.student?._id ||
        application.student;

    let studentProfile = null;

    if (studentId) {
        studentProfile =
            await StudentProfile.findOne({
                user: studentId,
            }).lean();
    }

    // =====================================================
    // Convert Application To Object
    // =====================================================
    const applicationObject =
        application.toObject();

    // =====================================================
    // Add Student Profile Information
    // =====================================================
    if (applicationObject.student) {
        applicationObject.student = {
            ...applicationObject.student,

            phone:
                studentProfile?.phone || "",

            college:
                studentProfile?.college || "",

            course:
                studentProfile?.course || "",

            branch:
                studentProfile?.branch || "",

            graduationYear:
                studentProfile?.graduationYear || "",

            cgpa:
                studentProfile?.cgpa ?? "",

            skills:
                studentProfile?.skills || [],

            resume:
                studentProfile?.resume || "",

            placementStatus:
                studentProfile?.placementStatus ||
                "Not Placed",
        };
    }

    // =====================================================
    // Expose Complete Student Profile Separately
    // =====================================================
    applicationObject.studentProfile =
        studentProfile || null;

    return applicationObject;
};


// =========================================================
// Apply for a Job - Student
// =========================================================
const applyForJob = async (req, res) => {
    try {
        const { jobId } = req.params;

        // =====================================================
        // Validate Job ID exists
        // =====================================================
        if (!jobId) {
            return res.status(400).json({
                message: "Job ID is required",
            });
        }

        // =====================================================
        // Validate MongoDB ObjectId
        // =====================================================
        if (!mongoose.isValidObjectId(jobId)) {
            return res.status(400).json({
                message: "Invalid job ID",
            });
        }

        // =====================================================
        // Check authenticated user
        // =====================================================
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                message:
                    "Unauthorized. User information not found.",
            });
        }

        // =====================================================
        // Find Job
        // =====================================================
        const job = await Job.findById(jobId);

        if (!job) {
            return res.status(404).json({
                message: "Job not found",
            });
        }

        // =====================================================
        // Check Job Deadline
        // =====================================================
        if (!isJobOpen(job)) {
            if (job.status !== "Closed") {
                job.status = "Closed";
                await job.save();
            }

            return res.status(400).json({
                message:
                    "This job is closed or the application deadline has passed",
            });
        }

        // =====================================================
        // Check Job Status
        // =====================================================
        if (job.status !== "Open") {
            return res.status(400).json({
                message: "This job is currently closed",
            });
        }

        // =====================================================
        // Prevent Duplicate Applications
        // =====================================================
        const existingApplication =
            await Application.findOne({
                student: req.user.id,
                job: jobId,
            });

        if (existingApplication) {
            return res.status(400).json({
                message:
                    "You have already applied for this job",
            });
        }

        // =====================================================
        // Create Application
        // =====================================================
        const application = await Application.create({
            student: req.user.id,
            job: jobId,
            status: "Applied",

            // Initial history entry
            statusHistory: [
                {
                    status: "Applied",
                    changedAt: new Date(),
                    changedBy: req.user.id,
                },
            ],
        });

        // =====================================================
        // Populate Job Details
        // =====================================================
        await application.populate(
            "job",
            "company jobTitle description location salary eligibility skills applicationDeadline status"
        );

        // =====================================================
        // Success Response
        // =====================================================
        return res.status(201).json({
            message:
                "Application submitted successfully",

            application,
        });

    } catch (error) {
        console.error(
            "Apply for job error:",
            error
        );

        // =====================================================
        // Handle MongoDB CastError
        // =====================================================
        if (error.name === "CastError") {
            return res.status(400).json({
                message: "Invalid job ID",
            });
        }

        // =====================================================
        // Handle Duplicate Application
        // =====================================================
        if (error.code === 11000) {
            return res.status(400).json({
                message:
                    "You have already applied for this job",
            });
        }

        // =====================================================
        // Server Error
        // =====================================================
        return res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
};


// =========================================================
// Get My Applications - Student
// =========================================================
const getMyApplications = async (req, res) => {
    try {
        // =====================================================
        // Check authenticated user
        // =====================================================
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                message:
                    "Unauthorized. User information not found.",
            });
        }

        // =====================================================
        // Find Student Applications
        // =====================================================
        const applications =
            await Application.find({
                student: req.user.id,
            })
                .populate(
                    "student",
                    "name email"
                )
                .populate(
                    "job",
                    "company jobTitle description location salary eligibility skills applicationDeadline status"
                )
                .populate(
                    "statusHistory.changedBy",
                    "name email role"
                )
                .sort({
                    createdAt: -1,
                });

        // =====================================================
        // Find Student Profile
        // =====================================================
        const studentProfile =
            await StudentProfile.findOne({
                user: req.user.id,
            }).lean();

        // =====================================================
        // Add Profile Information To Applications
        // =====================================================
        const formattedApplications =
            applications.map(
                (application) => {
                    const applicationObject =
                        application.toObject();

                    if (
                        applicationObject.student
                    ) {
                        applicationObject.student = {
                            ...applicationObject.student,

                            phone:
                                studentProfile?.phone || "",

                            college:
                                studentProfile?.college || "",

                            course:
                                studentProfile?.course || "",

                            branch:
                                studentProfile?.branch || "",

                            graduationYear:
                                studentProfile?.graduationYear || "",

                            cgpa:
                                studentProfile?.cgpa ?? "",

                            skills:
                                studentProfile?.skills || [],

                            resume:
                                studentProfile?.resume || "",

                            placementStatus:
                                studentProfile?.placementStatus ||
                                "Not Placed",
                        };
                    }

                    applicationObject.studentProfile =
                        studentProfile || null;

                    return applicationObject;
                }
            );

        // =====================================================
        // Success Response
        // =====================================================
        return res.status(200).json({
            message:
                "Applications fetched successfully",

            applications:
                formattedApplications,
        });

    } catch (error) {
        console.error(
            "Get my applications error:",
            error
        );

        return res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
};


// =========================================================
// Get All Applications - Admin
// =========================================================
const getAllApplications = async (req, res) => {
    try {
        // =====================================================
        // Get all applications
        // =====================================================
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
                    "company jobTitle description location salary eligibility skills applicationDeadline status"
                )

                // =============================================
                // Status history user information
                // =============================================
                .populate(
                    "statusHistory.changedBy",
                    "name email role"
                )

                // =============================================
                // Newest applications first
                // =============================================
                .sort({
                    createdAt: -1,
                });

        // =====================================================
        // Add Student Profile Information
        // =====================================================
        const formattedApplications =
            await Promise.all(
                applications.map(
                    async (application) => {
                        return await populateApplicationResponse(
                            application
                        );
                    }
                )
            );

        // =====================================================
        // Success Response
        // =====================================================
        return res.status(200).json({
            message:
                "All applications fetched successfully",

            applications:
                formattedApplications,
        });

    } catch (error) {
        console.error(
            "Get all applications error:",
            error
        );

        return res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
};


// =========================================================
// Get Application Details - Admin
// =========================================================
const getApplicationDetails = async (req, res) => {
    try {
        const { id } = req.params;

        // =====================================================
        // Validate Application ID exists
        // =====================================================
        if (!id) {
            return res.status(400).json({
                message:
                    "Application ID is required",
            });
        }

        // =====================================================
        // Validate MongoDB Application ID
        // =====================================================
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message:
                    "Invalid application ID",
            });
        }

        // =====================================================
        // Find Application
        // =====================================================
        const application =
            await Application.findById(id)

                // =============================================
                // Student basic information
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
                    "company jobTitle description location salary eligibility skills applicationDeadline status"
                )

                // =============================================
                // Status history user information
                // =============================================
                .populate(
                    "statusHistory.changedBy",
                    "name email role"
                );

        // =====================================================
        // Application Not Found
        // =====================================================
        if (!application) {
            return res.status(404).json({
                message:
                    "Application not found",
            });
        }

        // =====================================================
        // Get Student ID
        // =====================================================
        const studentId =
            application.student?._id ||
            application.student;

        // =====================================================
        // Find Student Profile
        // =====================================================
        let studentProfile = null;

        if (studentId) {
            studentProfile =
                await StudentProfile.findOne({
                    user: studentId,
                }).lean();
        }

        // =====================================================
        // Handle Old Applications
        // =====================================================
        let statusHistory =
            Array.isArray(application.statusHistory)
                ? application.statusHistory
                : [];

        if (statusHistory.length === 0) {
            statusHistory = [
                {
                    status:
                        application.status ||
                        "Applied",

                    changedAt:
                        application.appliedAt ||
                        application.createdAt ||
                        new Date(),

                    changedBy: null,

                    legacy: true,
                },
            ];
        }

        // =====================================================
        // Convert application to normal object
        // =====================================================
        const applicationObject =
            application.toObject();

        // =====================================================
        // Add Student Profile Information
        // =====================================================
        if (applicationObject.student) {
            applicationObject.student = {
                ...applicationObject.student,

                phone:
                    studentProfile?.phone || "",

                college:
                    studentProfile?.college || "",

                course:
                    studentProfile?.course || "",

                branch:
                    studentProfile?.branch || "",

                graduationYear:
                    studentProfile?.graduationYear || "",

                cgpa:
                    studentProfile?.cgpa ?? "",

                skills:
                    studentProfile?.skills || [],

                resume:
                    studentProfile?.resume || "",

                placementStatus:
                    studentProfile?.placementStatus ||
                    "Not Placed",
            };
        }

        // =====================================================
        // Also expose complete studentProfile separately
        // =====================================================
        applicationObject.studentProfile =
            studentProfile || null;

        // =====================================================
        // Success Response
        // =====================================================
        return res.status(200).json({
            message:
                "Application details fetched successfully",

            application: {
                ...applicationObject,
                statusHistory,
            },
        });

    } catch (error) {
        console.error(
            "Get application details error:",
            error
        );

        // =====================================================
        // Handle MongoDB CastError
        // =====================================================
        if (error.name === "CastError") {
            return res.status(400).json({
                message:
                    "Invalid application ID",
            });
        }

        // =====================================================
        // Server Error
        // =====================================================
        return res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
};


// =========================================================
// Update Application Status - Admin
// =========================================================
const updateApplicationStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const { id } = req.params;

        // =====================================================
        // Validate Application ID exists
        // =====================================================
        if (!id) {
            return res.status(400).json({
                message:
                    "Application ID is required",
            });
        }

        // =====================================================
        // Validate MongoDB Application ID
        // =====================================================
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message:
                    "Invalid application ID",
            });
        }

        // =====================================================
        // Validate Status exists
        // =====================================================
        if (!status) {
            return res.status(400).json({
                message:
                    "Application status is required",
            });
        }

        // =====================================================
        // Allowed Application Statuses
        // =====================================================
        const allowedStatuses = [
            "Applied",
            "Shortlisted",
            "Rejected",
            "Selected",
        ];

        // =====================================================
        // Validate Application Status
        // =====================================================
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message:
                    "Invalid application status. Allowed values: Applied, Shortlisted, Rejected, Selected",
            });
        }

        // =====================================================
        // Find Application
        // =====================================================
        const application =
            await Application.findById(id);

        // =====================================================
        // Application Not Found
        // =====================================================
        if (!application) {
            return res.status(404).json({
                message:
                    "Application not found",
            });
        }

        // =====================================================
        // Save Previous Status
        // =====================================================
        const previousStatus =
            application.status;

        // =====================================================
        // Get Student ID
        // =====================================================
        const studentId =
            application.student;

        // =====================================================
        // Validate Student ID
        // =====================================================
        if (!studentId) {
            return res.status(400).json({
                message:
                    "Application does not have a valid student reference",
            });
        }

        // =====================================================
        // SAME STATUS CHECK
        //
        // IMPORTANT:
        // If admin selects the same status again,
        // do NOT add another history entry.
        //
        // Example:
        // Current status = Shortlisted
        // Admin selects = Shortlisted
        //
        // Result:
        // No new history entry
        // No new notification
        // No database save
        // =====================================================
        if (previousStatus === status) {
            const formattedApplication =
                await populateApplicationResponse(
                    application
                );

            return res.status(200).json({
                message:
                    "Application status is already set to this value",

                application:
                    formattedApplication,

                previousStatus,

                newStatus: status,
            });
        }

        // =====================================================
        // ADDITIONAL HISTORY DUPLICATE PROTECTION
        //
        // This protects against duplicate consecutive
        // history entries even if the current status and
        // history somehow become inconsistent.
        //
        // Example:
        // Current status = Shortlisted
        // Last history = Selected
        //
        // If admin selects Selected, this prevents another
        // Selected history entry.
        // =====================================================
        if (
            Array.isArray(application.statusHistory) &&
            application.statusHistory.length > 0
        ) {
            const lastHistoryEntry =
                application.statusHistory[
                application.statusHistory.length - 1
                ];

            if (
                lastHistoryEntry &&
                lastHistoryEntry.status === status
            ) {
                const formattedApplication =
                    await populateApplicationResponse(
                        application
                    );

                return res.status(200).json({
                    message:
                        "Application history already contains this status as the latest entry",

                    application:
                        formattedApplication,

                    previousStatus,

                    newStatus: status,
                });
            }
        }

        // =====================================================
        // UPDATE APPLICATION STATUS
        // =====================================================
        application.status = status;

        // =====================================================
        // Make sure statusHistory exists
        // =====================================================
        if (!Array.isArray(application.statusHistory)) {
            application.statusHistory = [];
        }

        // =====================================================
        // Add Status History Entry
        // =====================================================
        application.statusHistory.push({
            status,
            changedAt: new Date(),

            changedBy:
                req.user && req.user.id
                    ? req.user.id
                    : null,
        });

        // =====================================================
        // Save Application
        // =====================================================
        await application.save();

        // =====================================================
        // Find Student Profile
        // =====================================================
        const studentProfile =
            await StudentProfile.findOne({
                user: studentId,
            });

        // =====================================================
        // Student Profile Not Found
        // =====================================================
        if (!studentProfile) {
            console.error(
                "Student profile not found for user:",
                studentId.toString()
            );

            // The application status was already updated.
            // Return the updated application instead of
            // reporting the entire operation as failed.
            const formattedApplication =
                await populateApplicationResponse(
                    application
                );

            return res.status(200).json({
                message:
                    "Application updated, but student profile was not found",

                application:
                    formattedApplication,

                previousStatus,

                newStatus: status,
            });
        }

        // =====================================================
        // UPDATE PLACEMENT STATUS
        // =====================================================

        // =====================================================
        // CASE 1:
        // Application becomes Selected
        // =====================================================
        if (status === "Selected") {

            studentProfile.placementStatus =
                "Placed";

            await studentProfile.save();
        }

        // =====================================================
        // CASE 2:
        // Application is NOT Selected
        // =====================================================
        else {

            // =================================================
            // Check if another application is Selected
            // =================================================
            const anotherSelectedApplication =
                await Application.findOne({
                    student: studentId,

                    status: "Selected",

                    _id: {
                        $ne: application._id,
                    },
                });

            // =================================================
            // Another Selected application exists
            // =================================================
            if (anotherSelectedApplication) {

                studentProfile.placementStatus =
                    "Placed";
            }

            // =================================================
            // No Selected application exists
            // =================================================
            else {

                studentProfile.placementStatus =
                    "Not Placed";
            }

            await studentProfile.save();
        }

        // =====================================================
        // Populate Response Data
        // =====================================================
        const formattedApplication =
            await populateApplicationResponse(
                application
            );

        // =====================================================
        // CREATE STUDENT NOTIFICATION
        //
        // IMPORTANT:
        // We DO NOT create a notification for "Applied".
        //
        // Notifications are created only when admin changes
        // the application to:
        // Shortlisted
        // Selected
        // Rejected
        // =====================================================

        let notificationTitle = "";
        let notificationMessage = "";
        let notificationType = "";

        const jobTitle =
            formattedApplication.job?.jobTitle ||
            formattedApplication.job?.title ||
            "the position";

        const company =
            formattedApplication.job?.company ||
            "the company";

        // =====================================================
        // Shortlisted Notification
        // =====================================================
        if (status === "Shortlisted") {

            notificationTitle =
                "Application Shortlisted";

            notificationMessage =
                `Your application for ${jobTitle} at ${company} has been shortlisted.`;

            notificationType =
                "shortlisted";
        }

        // =====================================================
        // Selected Notification
        // =====================================================
        else if (status === "Selected") {

            notificationTitle =
                "Application Selected";

            notificationMessage =
                `Congratulations! Your application for ${jobTitle} at ${company} has been selected.`;

            notificationType =
                "selected";
        }

        // =====================================================
        // Rejected Notification
        // =====================================================
        else if (status === "Rejected") {

            notificationTitle =
                "Application Update";

            notificationMessage =
                `Your application for ${jobTitle} at ${company} has been rejected.`;

            notificationType =
                "rejected";
        }

        // =====================================================
        // Save Notification
        //
        // IMPORTANT:
        // If status === "Applied", nothing is created.
        // =====================================================
        if (
            notificationTitle &&
            notificationMessage &&
            notificationType
        ) {
            await Notification.create({
                user: studentId,

                title:
                    notificationTitle,

                message:
                    notificationMessage,

                type:
                    notificationType,

                application:
                    application._id,

                isRead:
                    false,
            });
        }

        // =====================================================
        // Get Updated Student Profile
        // =====================================================
        const updatedStudentProfile =
            await StudentProfile.findOne({
                user: studentId,
            }).lean();

        // =====================================================
        // Add Latest Profile Information
        // =====================================================
        if (
            formattedApplication.student
        ) {
            formattedApplication.student = {
                ...formattedApplication.student,

                phone:
                    updatedStudentProfile?.phone || "",

                college:
                    updatedStudentProfile?.college || "",

                course:
                    updatedStudentProfile?.course || "",

                branch:
                    updatedStudentProfile?.branch || "",

                graduationYear:
                    updatedStudentProfile?.graduationYear || "",

                cgpa:
                    updatedStudentProfile?.cgpa ?? "",

                skills:
                    updatedStudentProfile?.skills || [],

                resume:
                    updatedStudentProfile?.resume || "",

                placementStatus:
                    updatedStudentProfile?.placementStatus ||
                    "Not Placed",
            };
        }

        formattedApplication.studentProfile =
            updatedStudentProfile || null;

        // =====================================================
        // Success Response
        // =====================================================
        return res.status(200).json({

            message:
                "Application status updated successfully",

            application:
                formattedApplication,

            previousStatus,

            newStatus: status,

            placementStatus:
                updatedStudentProfile?.placementStatus ||
                studentProfile.placementStatus ||
                "Not Placed",
        });

    } catch (error) {

        console.error(
            "Update application status error:",
            error
        );

        // =====================================================
        // Handle Mongoose Validation Error
        // =====================================================
        if (error.name === "ValidationError") {

            return res.status(400).json({
                message:
                    "Validation error",

                error:
                    error.message,
            });
        }

        // =====================================================
        // Handle MongoDB CastError
        // =====================================================
        if (error.name === "CastError") {

            return res.status(400).json({
                message:
                    "Invalid application ID",
            });
        }

        // =====================================================
        // Handle Duplicate Key Error
        // =====================================================
        if (error.code === 11000) {

            return res.status(400).json({
                message:
                    "Duplicate application data",
            });
        }

        // =====================================================
        // Server Error
        // =====================================================
        return res.status(500).json({
            message:
                "Server error",

            error:
                error.message,
        });
    }
};


// =========================================================
// Exports
// =========================================================
module.exports = {
    applyForJob,
    getMyApplications,
    getAllApplications,
    getApplicationDetails,
    updateApplicationStatus,
};

