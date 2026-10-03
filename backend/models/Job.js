const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
    {
        company: {
            type: String,
            required: true,
            trim: true,
        },

        jobTitle: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            required: true,
            trim: true,
        },

        location: {
            type: String,
            required: true,
            trim: true,
        },

        salary: {
            type: String,
            required: true,
            trim: true,
        },

        // Optional field
        // The current frontend does not ask the admin
        // to enter eligibility.
        eligibility: {
            type: String,
            default: "",
            trim: true,
        },

        skills: {
            type: [String],
            default: [],
        },

        applicationDeadline: {
            type: Date,
            required: true,
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        status: {
            type: String,
            enum: ["Open", "Closed"],
            default: "Open",
        },
    },
    {
        timestamps: true,
    }
);

const Job =
    mongoose.models.Job ||
    mongoose.model("Job", jobSchema);

module.exports = Job;