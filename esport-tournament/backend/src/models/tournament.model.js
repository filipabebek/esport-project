const mongoose = require ("mongoose");

const tournamentSchema = new mongoose.Schema(
    {
        name: String,
        game: String,
        description: String,
        maxPlayers: Number,
        status: {
            type: String,
            enum: ["open", "ongoing", "finished"],
            default: "open",
        },
        organizer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    { timestamps:  true }
);

module.exports = mongoose.model("Tournament", tournamentSchema);