const router = require("express").Router();

const c = require("../controllers/tournament.controller");

const auth = require("../middlewares/auth.middleware");
const role = require("../middlewares/role.middleware");

router.get(
    "/",
    c.getTournaments
);

router.post(
    "/",
    auth,
    role("organizer", "admin"),
    c.createTournament
);

router.put(
    "/:id",
    auth,
    role("organizer", "admin"),
    c.updateTournament
);

router.delete(
    "/:id",
    auth,
    role("organizer", "admin"),
    c.deleteTournament
);

router.post(
    "/:id/join",
    auth,
    c.joinTournament
);

module.exports = router;