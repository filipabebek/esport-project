const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const tournamentRoutes = require("./routes/tournament.routes");
const organizerRoutes = require("./routes/organizer.routes");
const participationRoutes = require("./routes/participation.routes");
const gameRoutes = require("./routes/game.routes");
const enrollmentRoutes = require("./routes/enrollment.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tournaments", tournamentRoutes);
app.use("/api/organizer", organizerRoutes);
app.use("/api/participations", participationRoutes);
app.use("/api/games", gameRoutes);
app.use("/api/enrollments", enrollmentRoutes)

module.exports = app;