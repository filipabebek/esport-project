const Enrollment = require("../models/enrollment.model");
const Participation = require("../models/participation.model");
const Tournament = require("../models/tournament.model");

exports.applyToTournament = async (req, res) => {
    try {
        const userId = req.user.id;
        const tournamentId = req.params.tournamentId;

        if (req.user.role !== "player") {
            return res.status(403).json({
                message: "Only players can apply to tournaments"
            });
        }

        const tournament = await Tournament.findById(tournamentId);

        if (!tournament) {
            return res.status(404).json({
                message: "Tournament not found"
            });
        }

        if (tournament.status === "ENDED") {
            return res.status(400).json({
                message: "You cannot apply to an ended tournament"
            });
        }

        const existingParticipation = await Participation.findOne({
            user: userId,
            tournament: tournamentId
        });

        if (existingParticipation) {
            return res.status(400).json({
                message: "You are already participating in this tournament"
            });
        }

        const existingEnrollment = await Enrollment.findOne({
            user: userId,
            tournament: tournamentId
        });

        if (existingEnrollment) {
            if (existingEnrollment.status === "pending") {
                return res.status(400).json({
                    message: "Your application is already pending"
                });
            }

            if (existingEnrollment.status === "approved") {
                return res.status(400).json({
                    message: "Your application has already been approved"
                });
            }

            if (existingEnrollment.status === "rejected") {
                existingEnrollment.status = "pending";
                await existingEnrollment.save();

                return res.json({
                    message: "Application submitted again"
                });
            }
        }

        await Enrollment.create({
            user: userId,
            tournament: tournamentId
        });

        res.status(201).json({
            message: "Application submitted successfully"
        });
    } catch (err) {
        console.error("Apply tournament error:", err);

        res.status(500).json({
            message: err.message
        });
    }
};

exports.getTournamentEnrollments = async (req, res) => {
    try {
        const tournament = await Tournament.findById(req.params.tournamentId);

        if (!tournament) {
            return res.status(404).json({
                message: "Tournament not found"
            });
        }

        const isOwner =
            req.user.role === "organizer" &&
            tournament.organizer.toString() === req.user.id;

        if (!isOwner && req.user.role !== "admin") {
            return res.status(403).json({
                message: "You cannot manage applications for this tournament"
            });
        }

        const enrollments = await Enrollment.find({
            tournament: req.params.tournamentId
        })
            .populate("user", "username email")
            .sort({ createdAt: -1 });

        res.json(enrollments);
    } catch (err) {
        console.error("Get enrollments error:", err);

        res.status(500).json({
            message: err.message
        });
    }
};

exports.approveEnrollment = async (req, res) => {
    try {
        const enrollment = await Enrollment.findById(req.params.id);

        if (!enrollment) {
            return res.status(404).json({
                message: "Application not found"
            });
        }

        const tournament = await Tournament.findById(enrollment.tournament);

        if (!tournament) {
            return res.status(404).json({
                message: "Tournament not found"
            });
        }

        const isOwner =
            req.user.role === "organizer" &&
            tournament.organizer.toString() === req.user.id;

        if (!isOwner && req.user.role !== "admin") {
            return res.status(403).json({
                message: "You cannot approve this application"
            });
        }

        const currentPlayers = await Participation.countDocuments({
            tournament: tournament._id
        });

        if (currentPlayers >= tournament.maxPlayers) {
            return res.status(400).json({
                message: "Tournament is full"
            });
        }

        const existingParticipation = await Participation.findOne({
            user: enrollment.user,
            tournament: tournament._id
        });

        if (!existingParticipation) {
            await Participation.create({
                user: enrollment.user,
                tournament: tournament._id,
                status: tournament.status === "LIVE" ? "playing" : "registered"
            });
        }

        enrollment.status = "approved";
        await enrollment.save();

        if (
            !tournament.participants.some(
                id => id.toString() === enrollment.user.toString()
            )
        ) {
            tournament.participants.push(enrollment.user);
        }

        tournament.players = await Participation.countDocuments({
            tournament: tournament._id
        });

        await tournament.save();

        res.json({
            message: "Application approved successfully"
        });
    } catch (err) {
        console.error("Approve enrollment error:", err);

        res.status(500).json({
            message: err.message
        });
    }
};

exports.rejectEnrollment = async (req, res) => {
    try {
        const enrollment = await Enrollment.findById(req.params.id);

        if (!enrollment) {
            return res.status(404).json({
                message: "Application not found"
            });
        }

        const tournament = await Tournament.findById(enrollment.tournament);

        if (!tournament) {
            return res.status(404).json({
                message: "Tournament not found"
            });
        }

        const isOwner =
            req.user.role === "organizer" &&
            tournament.organizer.toString() === req.user.id;

        if (!isOwner && req.user.role !== "admin") {
            return res.status(403).json({
                message: "You cannot reject this application"
            });
        }

        enrollment.status = "rejected";
        await enrollment.save();

        res.json({
            message: "Application rejected"
        });
    } catch (err) {
        console.error("Reject enrollment error:", err);

        res.status(500).json({
            message: err.message
        });
    }
};