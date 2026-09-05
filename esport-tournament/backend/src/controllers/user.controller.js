const User = require("../models/user.model");
const Participation = require("../models/participation.model");
const Tournament = require("../models/tournament.model");
const Enrollment = require("../models/enrollment.model");

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyProfileData = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const participations = await Participation.find({
      user: userId
    })
      .populate({
        path: "tournament",
        select: "name game region date status prize",
        populate: {
          path: "game",
          select: "name description image"
        }
      })
      .sort({ updatedAt: -1 });

    const validParticipations = participations.filter(
      participation => participation.tournament
    );

    const tournaments = validParticipations.length;

    const finishedParticipations = validParticipations.filter(
      participation => participation.status === "finished"
    );

    const wins = finishedParticipations.filter(
      participation => participation.placement === 1
    ).length;

    const winRate =
      finishedParticipations.length > 0
        ? Math.round(
          (wins / finishedParticipations.length) * 100
        )
        : 0;

    const gameCounts = {};

    validParticipations.forEach(participation => {
      const game = participation.tournament.game?.name;

      if (!game) return;

      if (!gameCounts[game]) {
        gameCounts[game] = 0;
      }

      gameCounts[game]++;
    });

    const favoriteGames = Object.entries(gameCounts)
      .map(([game, tournamentCount]) => ({
        game,
        tournamentCount
      }))
      .sort(
        (a, b) =>
          b.tournamentCount - a.tournamentCount
      );

    const recentTournaments = validParticipations
      .slice(0, 5)
      .map(participation => ({
        participationId: participation._id,
        tournamentId: participation.tournament._id,
        name: participation.tournament.name,
        game: participation.tournament.game?.name || "Unknown game",
        region: participation.tournament.region,
        date: participation.tournament.date,
        tournamentStatus: participation.tournament.status,
        participationStatus: participation.status,
        placement: participation.placement,
        prize: participation.tournament.prize
      }));

    const ranking = await Participation.aggregate([
      {
        $match: {
          status: "finished",
          placement: 1
        }
      },
      {
        $group: {
          _id: "$user",
          wins: {
            $sum: 1
          }
        }
      },
      {
        $sort: {
          wins: -1
        }
      }
    ]);

    const rankIndex = ranking.findIndex(
      player =>
        player._id.toString() === userId.toString()
    );

    const globalRank =
      rankIndex !== -1
        ? rankIndex + 1
        : null;

    const achievements = [
      {
        name: "First Competition",
        description: "Participate in your first tournament",
        unlocked: tournaments >= 1,
        icon: "mdi-gamepad-variant"
      },
      {
        name: "Tournament Winner",
        description: "Win your first tournament",
        unlocked: wins >= 1,
        icon: "mdi-trophy"
      },
      {
        name: "Experienced Player",
        description: "Participate in 10 tournaments",
        unlocked: tournaments >= 10,
        icon: "mdi-star-outline"
      },
      {
        name: "Top 10 Player",
        description: "Reach the global top 10",
        unlocked:
          globalRank !== null &&
          globalRank <= 10,
        icon: "mdi-medal-outline"
      }
    ];

    let organizerStats = null;
    let organizedTournaments = [];
    let adminStats = null;

    if (user.role === "organizer") {
      organizedTournaments = await Tournament.find({
        organizer: userId
      })
        .populate("organizer", "username email")
        .populate("game", "name description image")
        .sort({ createdAt: -1 });

      const tournamentIds = organizedTournaments.map(
        tournament => tournament._id
      );

      const totalParticipants =
        await Participation.countDocuments({
          tournament: {
            $in: tournamentIds
          }
        });

      const activeTournaments =
        organizedTournaments.filter(
          tournament =>
            tournament.status === "LIVE" ||
            tournament.status === "UPCOMING"
        ).length;

      organizerStats = {
        organizedTournaments:
          organizedTournaments.length,
        activeTournaments,
        totalParticipants
      };
    }

    if (user.role === "admin") {
      const [
        totalUsers,
        players,
        organizers,
        admins,
        totalTournaments,
        activeTournaments
      ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: "player" }),
        User.countDocuments({ role: "organizer" }),
        User.countDocuments({ role: "admin" }),
        Tournament.countDocuments(),
        Tournament.countDocuments({
          status: {
            $in: ["LIVE", "UPCOMING"]
          }
        })
      ]);

      adminStats = {
        totalUsers,
        players,
        organizers,
        admins,
        tournaments: totalTournaments,
        activeTournaments
      };
    }

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        joinedAt: user.createdAt || null,
        status: "Active"
      },

      stats: {
        tournaments,
        wins,
        winRate,
        globalRank
      },

      recentTournaments,
      favoriteGames,
      achievements,
      organizerStats,
      organizedTournaments,
      adminStats
    });

  } catch (err) {
    console.error("Error fetching profile data:", err);

    res.status(500).json({ message: "Error fetching profile data" });
  }
};

exports.getMyStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const participations = await Participation.find({
      user: userId,
      status: "finished",
    });

    const tournaments = participations.length;

    const wins = participations.filter(
      (participation) => participation.placement === 1
    ).length;

    const winRate =
      tournaments > 0
        ? Math.round((wins / tournaments) * 100)
        : 0;

    res.json({
      tournaments,
      wins,
      winRate,
    });

  } catch (err) {
    console.error("Error fetching statistics:", err);

    res.status(500).json({ message: "Error fetching player statistics", });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { username, email, role } = req.body;

    if (role && !["player", "organizer", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (
      String(req.user.id) === String(user._id) &&
      role &&
      role !== user.role
    ) {
      return res.status(400).json({ message: "You cannot change your own role" });
    }

    if (username !== undefined) user.username = username;
    if (email !== undefined) user.email = email;
    if (role !== undefined) user.role = role;

    await user.save();

    res.json({
      message: "User updated successfully",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error("Update user error:", err);

    res.status(500).json({ message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    if (String(req.user.id) === String(req.params.id)) {
      return res.status(400).json({
        message: "You cannot delete your own account"
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "organizer") {
      const tournamentCount = await Tournament.countDocuments({
        organizer: user._id
      });

      if (tournamentCount > 0) {
        return res.status(400).json({ message: "This organizer still has tournaments. Delete their tournaments first." });
      }
    }

    await Participation.deleteMany({
      user: user._id
    });

    await Enrollment.deleteMany({
      user: user._id
    });

    await User.findByIdAndDelete(user._id);

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Delete user error:", err);

    res.status(500).json({ message: err.message });
  }
};