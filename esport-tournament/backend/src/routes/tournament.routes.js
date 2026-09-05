const router = require("express").Router();

const c = require("../controllers/tournament.controller");

const auth = require("../middlewares/auth.middleware");
const role = require("../middlewares/role.middleware");

router.get("/", c.getTournaments);
router.post("/", auth, role("organizer", "admin"), c.createTournament);
router.put("/:id", auth, role("organizer", "admin"), c.updateTournament);
router.delete("/:id", auth, role("organizer", "admin"), c.deleteTournament);

router.delete("/:id/leave", auth, c.leaveTournament);

router.get("/:id/participants", auth, c.getTournamentParticipants);
router.delete("/:id/participants/:userId", auth, role("organizer", "admin"), c.removeParticipant);
router.get("/:id", c.getTournamentById);

module.exports = router;