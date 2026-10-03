const mongoose = require("mongoose");

const studentProfileSchema = new mongoose.Schema(
    {
        // =========================================================
        // User Reference
        // =========================================================
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },

        // =========================================================
        // Personal Information
        // =========================================================
        phone: {
            type: String,
            trim: true,
            default: "",
        },

        // =========================================================
        // Academic Information
        // =========================================================
        college: {
            type: String,
            trim: true,
            default: "",
        },

        course: {
            type: String,
            trim: true,
            default: "",
        },

        branch: {
            type: String,
            trim: true,
            default: "",
        },

        graduationYear: {
            type: Number,
        },

        cgpa: {
            type: Number,
        },

        // =========================================================
        // Skills
        // =========================================================
        skills: {
            type: [String],
            default: [],
        },

        // =========================================================
        // Resume
        // =========================================================
        resume: {
            type: String,
            default: "",
        },

        // =========================================================
        // Placement Status
        // =========================================================
        placementStatus: {
            type: String,
            enum: [
                "Not Placed",
                "Placed",
                "Looking for Opportunity",
            ],
            default: "Not Placed",
        },
    },

    // =========================================================
    // Timestamps
    // =========================================================
    {
        timestamps: true,
    }
);


// =========================================================
// Prevent model recompilation error
// =========================================================
const StudentProfile =
    mongoose.models.StudentProfile ||
    mongoose.model(
        "StudentProfile",
        studentProfileSchema
    );


// =========================================================
// Export
// =========================================================
module.exports = StudentProfile;