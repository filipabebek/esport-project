const Tournament = require("../models/tournament.model");

exports.createTournament = async (req, res) => {
  const t = await Tournament.create({
    ...req.body,
    organizer: req.user.id,
  });

  res.json(t);
};

exports.getTournaments = async (req, res) => {
  const data = await Tournament.find().populate("organizer", "username");
  res.json(data);
};

exports.deleteTournament = async (req, res) => {
  await Tournament.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
};