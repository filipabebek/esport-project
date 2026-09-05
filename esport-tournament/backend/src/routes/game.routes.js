const router = require("express").Router();
const c = require("../controllers/game.controller");
const auth = require("../middlewares/auth.middleware");
const role = require("../middlewares/role.middleware");

router.get("/", c.getGames);
router.get("/:id", c.getGameById);

router.post("/", auth, role("admin"), c.createGame);
router.put("/:id", auth, role("admin"), c.updateGame);
router.delete("/:id", auth, role("admin"), c.deleteGame);

module.exports = router;