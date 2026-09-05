const Participation = require("../models/participation.model");

exports.getMyTournaments = async (req, res) => {
    try {
        const participations = await Participation.find({
            user: req.user.id
        })
            .populate({
                path: "tournament",
                select: "name game description date region prize status maxPlayers players participants",
                populate: {
                    path: "game",
                    select: "name description image"
                }
            })
            .sort({ createdAt: -1 });

        const data = participations
            .filter(participation => participation.tournament)
            .map(participation => ({
                participationId: participation._id,
                status: participation.status,
                placement: participation.placement,
                joinedAt: participation.createdAt,
                tournament: participation.tournament
            }));

        res.json(data);
    } catch (err) {
        console.error("Failed to fetch player tournaments:", err);

        res.status(500).json({
            message: "Failed to fetch player tournaments"
        });
    }
};