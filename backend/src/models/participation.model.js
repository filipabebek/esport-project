const mongoose = require("mongoose");

const participationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        tournament: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tournament",
            required: true,
        },

        placement: {
            type: Number,
            default: null,
        },

        status: {
            type: String,
            enum: ["registered", "playing", "finished"],
            default: "registered",
        },
    },
    {
        timestamps: true,
    }
);

participationSchema.index(
    { user: 1, tournament: 1 },
    { unique: true }
);

module.exports = mongoose.model(
    "Participation",
    participationSchema
);