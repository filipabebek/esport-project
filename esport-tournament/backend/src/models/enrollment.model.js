const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        tournament: { type: mongoose.Schema.Types.ObjectId, ref: "Tournament" },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        },
    },
    { timestamps: true}
);

module.exports = mongoose.model("Enrollment", enrollmentSchema);