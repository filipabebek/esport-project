const router = require("express").Router();
const c = require("../controllers/tournament.controller");
const auth = require("../middlewares/auth.middleware");
const role = require("../middlewares/role.middleware");

router.get("/", c.getTournaments);

router.post("/", auth, role("organizer", "admin"), c.createTournament);

router.delete("/:id", auth, role("admin"), c.deleteTournament);

module.exports = router;