const Game = require("../models/game.model");
const Tournament = require("../models/tournament.model");

exports.getGames = async (req, res) => {
    try {
        const games = await Game.find().sort({ name: 1 });
        res.json(games);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getGameById = async (req, res) => {
    try {
        const game = await Game.findById(req.params.id);

        if (!game) {
            return res.status(404).json({ message: "Game not found" });
        }

        res.json(game);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createGame = async (req, res) => {
    try {
        const game = await Game.create(req.body);

        res.status(201).json({ message: "Game created successfully", game });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateGame = async (req, res) => {
    try {
        const game = await Game.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!game) {
            return res.status(404).json({ message: "Game not found" });
        }

        res.json({ message: "Game updated successfully", game });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteGame = async (req, res) => {
    try {
        const game = await Game.findById(req.params.id);

        if (!game) {
            return res.status(404).json({ message: "Game not found" });
        }

        const tournamentCount = await Tournament.countDocuments({ game: game._id });

        if (tournamentCount > 0) {
            return res.status(400).json({ message: "This game is used by existing tournaments" });
        }

        await Game.findByIdAndDelete(req.params.id);

        res.json({ message: "Game deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};