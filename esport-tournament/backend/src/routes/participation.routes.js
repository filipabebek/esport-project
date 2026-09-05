const router = require("express").Router();

const participationController = require("../controllers/participation.controller");
const auth = require("../middlewares/auth.middleware");
const role = require("../middlewares/role.middleware");

router.get("/me", auth, role("player"), participationController.getMyTournaments);

module.exports = router;