const router = require("express").Router();

const organizerController = require(
    "../controllers/organizer.controller"
);

const auth = require(
    "../middlewares/auth.middleware"
);

const role = require(
    "../middlewares/role.middleware"
);

router.get(
    "/dashboard",
    auth,
    role("organizer"),
    organizerController.getDashboard
);

module.exports = router;