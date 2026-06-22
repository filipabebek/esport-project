const router = require("express").Router();
const c = require("../controllers/user.controller");

const auth = require("../middlewares/auth.middleware");
const role = require("../middlewares/role.middleware");

// GET ALL USERS (admin only)
router.get("/", auth, role("admin"), c.getAllUsers);

// GET USER PROFILE
router.get("/me", auth, c.getMyProfile);

// UPDATE USER
router.put("/:id", auth, c.updateUser);

// DELETE USER (admin)
router.delete("/:id", auth, role("admin"), c.deleteUser);

module.exports = router;