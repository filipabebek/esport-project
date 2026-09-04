const Tournament = require("../models/tournament.model");

exports.createTournament = async (req, res) => {
  try {
    const tournament = await Tournament.create({
      ...req.body,
      organizer: req.user.id,
    });

    res.status(201).json(tournament);

  } catch (err) {
    console.error("Create tournament error:", err);

    res.status(500).json({
      message: err.message,
    });
  }
};

exports.getTournaments = async (req, res) => {
  try {
    const tournaments = await Tournament
      .find()
      .populate("organizer", "username");

    res.json(tournaments);

  } catch (err) {
    console.error("Get tournaments error:", err);

    res.status(500).json({
      message: err.message,
    });
  }
};

exports.updateTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({
        message: "Tournament not found",
      });
    }

    if (
      req.user.role !== "admin" &&
      tournament.organizer.toString() !== req.user.id
    ) {
      return res.status(403).json({
        message: "You can only edit your own tournaments",
      });
    }

    const updatedTournament = await Tournament.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.json(updatedTournament);

  } catch (err) {
    console.error("Update tournament error:", err);

    res.status(500).json({
      message: err.message,
    });
  }
};

exports.deleteTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({
        message: "Tournament not found",
      });
    }

    if (
      req.user.role !== "admin" &&
      tournament.organizer.toString() !== req.user.id
    ) {
      return res.status(403).json({
        message: "You can only delete your own tournaments",
      });
    }

    await Tournament.findByIdAndDelete(req.params.id);

    res.json({
      message: "Tournament deleted successfully",
    });

  } catch (err) {
    console.error("Delete tournament error:", err);

    res.status(500).json({
      message: err.message,
    });
  }
};

exports.joinTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({
        message: "Tournament not found",
      });
    }

    if (tournament.status === "ENDED") {
      return res.status(400).json({
        message: "Tournament has ended",
      });
    }

    if (tournament.players >= tournament.maxPlayers) {
      return res.status(400).json({
        message: "Tournament is full",
      });
    }

    const alreadyJoined = tournament.participants.some(
      participant => participant.toString() === req.user.id
    );

    if (alreadyJoined) {
      return res.status(400).json({
        message: "You already joined this tournament",
      });
    }

    tournament.participants.push(req.user.id);
    tournament.players += 1;

    await tournament.save();

    res.json({
      message: "Successfully joined tournament",
      tournament,
    });

  } catch (err) {
    console.error("Join tournament error:", err);

    res.status(500).json({
      message: err.message,
    });
  }
};