const router = require("express").Router();
const c = require("../controllers/user.controller");

const auth = require("../middlewares/auth.middleware");
const role = require("../middlewares/role.middleware");

router.get("/", auth, role("admin"), c.getAllUsers);
router.get("/me/profile-data", auth, c.getMyProfileData);

router.put("/:id", auth, role("admin"), c.updateUser);
router.delete("/:id", auth, role("admin"), c.deleteUser);

module.exports = router;