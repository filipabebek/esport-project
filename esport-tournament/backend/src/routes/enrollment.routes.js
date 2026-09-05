const router = require("express").Router();
const c = require("../controllers/enrollment.controller");
const auth = require("../middlewares/auth.middleware");
const role = require("../middlewares/role.middleware");

router.post("/tournaments/:tournamentId", auth, role("player"), c.applyToTournament);
router.get("/tournaments/:tournamentId", auth, role("organizer", "admin"), c.getTournamentEnrollments);

router.put("/:id/approve", auth, role("organizer", "admin"), c.approveEnrollment);
router.put("/:id/reject", auth, role("organizer", "admin"), c.rejectEnrollment);

module.exports = router;