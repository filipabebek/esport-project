const mongoose = require("mongoose");

const tournamentSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, },
        game: { type: String, required: true, },
        description: { type: String, required: true, },
        maxPlayers: { type: Number, required: true, },
        prize: { type: String, default: "0", },
        date: { type: String, required: true, },
        region: { type: String, default: "Global", },
        players: { type: Number, default: 0, },

        participants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],

        status: { type: String, enum: ["LIVE", "UPCOMING", "ENDED"], default: "UPCOMING", },

        organizer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Tournament", tournamentSchema);