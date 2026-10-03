const mongoose = require("mongoose");


// =========================================================
// APPLICATION STATUS VALUES
// =========================================================

const APPLICATION_STATUSES = [
    "Applied",
    "Shortlisted",
    "Rejected",
    "Selected",
];


// =========================================================
// APPLICATION SCHEMA
// =========================================================

const applicationSchema = new mongoose.Schema(
    {
        // -------------------------------------------------
        // Student who applied
        // -------------------------------------------------
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },


        // -------------------------------------------------
        // Job applied for
        // -------------------------------------------------
        job: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Job",
            required: true,
        },


        // -------------------------------------------------
        // Current application status
        // -------------------------------------------------
        status: {
            type: String,
            enum: APPLICATION_STATUSES,
            default: "Applied",
        },


        // -------------------------------------------------
        // Status history
        // -------------------------------------------------
        statusHistory: [
            {
                status: {
                    type: String,
                    enum: APPLICATION_STATUSES,
                    required: true,
                },

                changedAt: {
                    type: Date,
                    default: Date.now,
                },

                changedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                    default: null,
                },
            },
        ],


        // -------------------------------------------------
        // Application creation date
        // -------------------------------------------------
        appliedAt: {
            type: Date,
            default: Date.now,
        },
    },


    // -----------------------------------------------------
    // Automatically adds createdAt and updatedAt
    // -----------------------------------------------------
    {
        timestamps: true,
    }
);


// =========================================================
// PREVENT DUPLICATE APPLICATIONS
// =========================================================

applicationSchema.index(
    {
        student: 1,
        job: 1,
    },
    {
        unique: true,
    }
);


// =========================================================
// INITIAL STATUS HISTORY
// =========================================================
//
// IMPORTANT:
// This middleware uses the modern async-style middleware
// format and does NOT use "next".
//
// When a brand-new application is created without history,
// it automatically gets:
//
// Applied
//
// Existing applications are NOT modified here.
// =========================================================

applicationSchema.pre("save", function () {

    if (
        this.isNew &&
        (!this.statusHistory ||
            this.statusHistory.length === 0)
    ) {
        this.statusHistory = [
            {
                status: this.status || "Applied",

                changedAt:
                    this.appliedAt || new Date(),

                changedBy:
                    this.student || null,
            },
        ];
    }
});


// =========================================================
// MODEL
// =========================================================

const Application =
    mongoose.models.Application ||
    mongoose.model(
        "Application",
        applicationSchema
    );


module.exports = Application;
