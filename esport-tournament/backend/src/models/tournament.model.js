const mongoose = require("mongoose");

const tournamentSchema = new mongoose.Schema(
    {
        name: String,
        game: String,
        description: String,
        maxPlayers: Number,
        prize: String,
        date: String,
        region: String,
        players: {
            type: Number,
            default: 0
        },
        status: {
            type: String,
            enum: ["LIVE", "UPCOMING", "ENDED"],
            default: "UPCOMING",
        },
        organizer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Tournament", tournamentSchema);