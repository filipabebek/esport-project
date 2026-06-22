const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: String,
    email: { type: String, unique: true },
    password: String,
    role: {
      type: String,
      enum: ["player", "organizer", "admin"],
      default: "player",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);