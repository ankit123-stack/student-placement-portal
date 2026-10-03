const Job = require("../models/Job");

// =========================================================
// HELPER: Automatically determine deadline status
// =========================================================
const getAutomaticStatus = (applicationDeadline) => {
    if (!applicationDeadline) {
        return "Closed";
    }

    const deadline = new Date(applicationDeadline);
    const now = new Date();

    // Keep the job open until the end of the deadline date.
    deadline.setHours(23, 59, 59, 999);

    return deadline >= now ? "Open" : "Closed";
};


// =========================================================
// CREATE JOB
// =========================================================
const createJob = async (req, res) => {
    try {
        const {
            company,
            title,
            jobTitle,
            description,
            location,
            salary,
            eligibility,
            skills,
            applicationDeadline,
        } = req.body;

        const finalJobTitle = title || jobTitle;

        if (
            !company ||
            !finalJobTitle ||
            !description ||
            !location ||
            !salary ||
            !applicationDeadline
        ) {
            return res.status(400).json({
                message: "All required fields must be provided",
            });
        }

        const job = await Job.create({
            company,
            jobTitle: finalJobTitle,
            description,
            location,
            salary,
            eligibility: eligibility || "",
            skills: skills || [],
            applicationDeadline,
            createdBy: req.user.id,

            status: getAutomaticStatus(
                applicationDeadline
            ),
        });

        res.status(201).json({
            message: "Job created successfully",
            job,
        });
    } catch (error) {
        console.error("Create Job Error:", error);

        res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
};


// =========================================================
// GET ALL JOBS
// =========================================================
const getAllJobs = async (req, res) => {
    try {
        const jobs = await Job.find()
            .populate("createdBy", "name email")
            .sort({ createdAt: -1 });

        // Only automatically close jobs when their deadline
        // has actually passed.
        for (const job of jobs) {
            const automaticStatus = getAutomaticStatus(
                job.applicationDeadline
            );

            // Never reopen a job that an admin manually closed.
            // Only force Closed when the deadline has passed.
            if (
                automaticStatus === "Closed" &&
                job.status !== "Closed"
            ) {
                job.status = "Closed";
                await job.save();
            }
        }

        res.status(200).json({
            message: "Jobs fetched successfully",
            jobs,
        });
    } catch (error) {
        console.error("Get Jobs Error:", error);

        res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
};


// =========================================================
// GET SINGLE JOB
// =========================================================
const getJobById = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id)
            .populate("createdBy", "name email");

        if (!job) {
            return res.status(404).json({
                message: "Job not found",
            });
        }

        const automaticStatus = getAutomaticStatus(
            job.applicationDeadline
        );

        // Only automatically close when deadline has passed.
        // Do not reopen a manually closed job.
        if (
            automaticStatus === "Closed" &&
            job.status !== "Closed"
        ) {
            job.status = "Closed";
            await job.save();
        }

        res.status(200).json({
            message: "Job fetched successfully",
            job,
        });
    } catch (error) {
        console.error("Get Job Error:", error);

        res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
};


// =========================================================
// UPDATE JOB - ADMIN ONLY
// =========================================================
const updateJob = async (req, res) => {
    try {
        const {
            company,
            title,
            jobTitle,
            description,
            location,
            salary,
            eligibility,
            skills,
            applicationDeadline,
        } = req.body;

        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({
                message: "Job not found",
            });
        }

        if (company !== undefined) {
            job.company = company;
        }

        if (title !== undefined) {
            job.jobTitle = title;
        } else if (jobTitle !== undefined) {
            job.jobTitle = jobTitle;
        }

        if (description !== undefined) {
            job.description = description;
        }

        if (location !== undefined) {
            job.location = location;
        }

        if (salary !== undefined) {
            job.salary = salary;
        }

        if (eligibility !== undefined) {
            job.eligibility = eligibility;
        }

        if (skills !== undefined) {
            job.skills = skills;
        }

        if (applicationDeadline !== undefined) {
            job.applicationDeadline =
                applicationDeadline;

            // If deadline is changed, automatically determine
            // whether the job should be open or closed.
            job.status = getAutomaticStatus(
                job.applicationDeadline
            );
        }

        await job.save();

        res.status(200).json({
            message: "Job updated successfully",
            job,
        });
    } catch (error) {
        console.error("Update Job Error:", error);

        res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
};


// =========================================================
// DELETE JOB - ADMIN ONLY
// =========================================================
const deleteJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({
                message: "Job not found",
            });
        }

        await Job.findByIdAndDelete(
            req.params.id
        );

        res.status(200).json({
            message: "Job deleted successfully",
        });
    } catch (error) {
        console.error("Delete Job Error:", error);

        res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
};


// =========================================================
// UPDATE JOB STATUS - ADMIN ONLY
// =========================================================
const updateJobStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const allowedStatuses = [
            "Open",
            "Closed",
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid job status",
            });
        }

        const job = await Job.findById(
            req.params.id
        );

        if (!job) {
            return res.status(404).json({
                message: "Job not found",
            });
        }

        job.status = status;

        await job.save();

        res.status(200).json({
            message: "Job status updated successfully",
            job,
        });
    } catch (error) {
        console.error(
            "Update Job Status Error:",
            error
        );

        res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
};


// =========================================================
// EXPORTS
// =========================================================
module.exports = {
    createJob,
    getAllJobs,
    getJobById,
    updateJob,
    deleteJob,
    updateJobStatus,
};