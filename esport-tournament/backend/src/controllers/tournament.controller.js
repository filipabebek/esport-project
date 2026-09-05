const Tournament = require("../models/tournament.model");
const Participation = require("../models/participation.model");
const Enrollment = require("../models/enrollment.model");

exports.createTournament = async (req, res) => {
  try {
    const tournament = await Tournament.create({
      ...req.body,
      organizer: req.user.id
    });

    res.status(201).json(tournament);
  } catch (err) {
    console.error("Create tournament error:", err);

    res.status(500).json({
      message: err.message
    });
  }
};

exports.getTournaments = async (req, res) => {
  try {
    const tournaments = await Tournament.find().populate("organizer", "username").populate("game", "name description image");

    res.json(tournaments);
  } catch (err) {
    console.error("Get tournaments error:", err);

    res.status(500).json({
      message: err.message
    });
  }
};

exports.getTournamentById = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id).populate("organizer", "username").populate("game", "name description image");

    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
    }

    res.json(tournament);
  } catch (err) {
    console.error("Get tournament error:", err);

    res.status(500).json({
      message: err.message
    });
  }
};

exports.getTournamentParticipants = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
    }

    const participants = await Participation.find({
      tournament: req.params.id
    })
      .populate("user", "username")
      .sort({ createdAt: 1 });

    res.json(participants);
  } catch (err) {
    console.error("Failed to load participants:", err);

    res.status(500).json({ message: "Failed to load participants" });
  }
};

exports.updateTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
    }

    if (req.user.role !== "admin" && tournament.organizer.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only edit your own tournaments" });
    }

    const allowedFields = [
      "name",
      "game",
      "description",
      "maxPlayers",
      "prize",
      "date",
      "region",
      "status"
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        tournament[field] = req.body[field];
      }
    });

    await tournament.save();

    await tournament.populate("game", "name description image");
    await tournament.populate("organizer", "username");

    res.json({ message: "Tournament updated successfully", tournament });
  } catch (err) {
    console.error("Update tournament error:", err);

    res.status(500).json({ message: err.message });
  }
};

exports.deleteTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
    }

    if (req.user.role !== "admin" && tournament.organizer.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only delete your own tournaments" });
    }

    await Participation.deleteMany({
      tournament: tournament._id
    });

    await Enrollment.deleteMany({
      tournament: tournament._id
    });

    await Tournament.findByIdAndDelete(req.params.id);

    res.json({ message: "Tournament deleted successfully" });
  } catch (err) {
    console.error("Delete tournament error:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.leaveTournament = async (req, res) => {
  try {
    const tournamentId = req.params.id;
    const userId = req.user.id;

    if (req.user.role !== "player") {
      return res.status(403).json({ message: "Only players can leave tournaments" });
    }

    const tournament = await Tournament.findById(tournamentId);

    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
    }

    if (tournament.status === "ENDED") {
      return res.status(400).json({ message: "You cannot leave an ended tournament" });
    }

    const participation = await Participation.findOne({
      user: userId,
      tournament: tournamentId
    });

    if (!participation) {
      return res.status(400).json({ message: "You are not registered for this tournament" });
    }

    await Participation.findByIdAndDelete(participation._id);

    await Enrollment.deleteOne({
      user: userId,
      tournament: tournamentId
    });

    tournament.participants = tournament.participants.filter(
      id => id.toString() !== userId
    );

    tournament.players = await Participation.countDocuments({
      tournament: tournamentId
    });
    await tournament.save();

    res.json({ message: "You left the tournament successfully" });
  } catch (err) {
    console.error("Failed to leave tournament:", err);

    res.status(500).json({ message: "Failed to leave tournament" });
  }
};

exports.removeParticipant = async (req, res) => {
  try {
    const tournamentId = req.params.id;
    const userId = req.params.userId;

    const tournament = await Tournament.findById(tournamentId);

    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
    }

    const isOwner =
      req.user.role === "organizer" &&
      tournament.organizer.toString() === req.user.id;

    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ message: "You can only manage participants of your own tournaments" });
    }

    const participation = await Participation.findOne({
      user: userId,
      tournament: tournamentId
    });

    if (!participation) {
      return res.status(404).json({ message: "Participant not found" });
    }

    await Participation.findByIdAndDelete(participation._id);

    await Enrollment.deleteOne({
      user: userId,
      tournament: tournamentId
    });

    tournament.participants = tournament.participants.filter(
      id => id.toString() !== userId
    );

    tournament.players = await Participation.countDocuments({
      tournament: tournamentId
    });

    await tournament.save();

    res.json({ message: "Participant removed successfully" });
  } catch (err) {
    console.error("Failed to remove participant:", err);

    res.status(500).json({ message: err.message });
  }
};