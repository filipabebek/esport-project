const Tournament = require("../models/tournament.model");
const Participation = require("../models/participation.model");

exports.getDashboard = async (req, res) => {
    try {
        const organizerId = req.user.id;

        const tournaments = await Tournament.find({
            organizer: organizerId,
        }).sort({ createdAt: -1 });

        const tournamentIds = tournaments.map(
            (tournament) => tournament._id
        );

        const totalParticipants =
            await Participation.countDocuments({
                tournament: { $in: tournamentIds },
            });

        const activeTournaments =
            tournaments.filter(
                (tournament) =>
                    tournament.status === "LIVE" ||
                    tournament.status === "UPCOMING"
            ).length;

        const completedTournaments =
            tournaments.filter(
                (tournament) =>
                    tournament.status === "ENDED"
            ).length;

        const statusCounts = {
            upcoming: tournaments.filter(
                (tournament) =>
                    tournament.status === "UPCOMING"
            ).length,

            live: tournaments.filter(
                (tournament) =>
                    tournament.status === "LIVE"
            ).length,

            ended: tournaments.filter(
                (tournament) =>
                    tournament.status === "ENDED"
            ).length,
        };

        const upcomingTournaments =
            tournaments
                .filter(
                    (tournament) =>
                        tournament.status === "UPCOMING"
                )
                .sort(
                    (a, b) =>
                        new Date(a.date) - new Date(b.date)
                );

        const nextTournament =
            upcomingTournaments[0] || null;

        const participations =
            await Participation.find({
                tournament: {
                    $in: tournamentIds,
                },
            })
                .populate("user", "username email")
                .populate("tournament", "name date status")
                .sort({ createdAt: -1 });

        const recentRegistrations =
            participations
                .slice(0, 5)
                .map((participation) => ({
                    _id: participation._id,
                    username:
                        participation.user?.username ||
                        "Unknown player",
                    tournamentName:
                        participation.tournament?.name ||
                        "Unknown tournament",
                    date: participation.createdAt,
                }));

        const finishedParticipations =
            participations.filter(
                (participation) =>
                    participation.status === "finished" &&
                    participation.placement === 1 &&
                    participation.tournament
            );

        const recentResults =
            finishedParticipations
                .slice(0, 5)
                .map((participation) => ({
                    tournamentId:
                        participation.tournament._id,

                    tournamentName:
                        participation.tournament.name,

                    winner:
                        participation.user?.username ||
                        "Unknown player",

                    date:
                        participation.tournament.date,
                }));

        const tournamentData =
            tournaments
                .slice(0, 5)
                .map((tournament) => ({
                    _id: tournament._id,
                    name: tournament.name,
                    game: tournament.game,
                    region: tournament.region,
                    date: tournament.date,
                    prize: tournament.prize,
                    maxPlayers: tournament.maxPlayers,
                    players: tournament.players,
                    participants:
                        tournament.participants,
                    status: tournament.status,
                }));

        res.json({
            organizerStats: {
                totalTournaments: tournaments.length,
                activeTournaments,
                totalParticipants,
                completedTournaments,
            },

            statusCounts,
            nextTournament,
            tournaments: tournamentData,
            recentRegistrations,
            recentResults,
        });
    } catch (err) {
        console.error(
            "Error fetching organizer dashboard:",
            err
        );

        res.status(500).json({
            message:
                "Error fetching organizer dashboard",
        });
    }
};