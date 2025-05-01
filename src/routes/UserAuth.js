const express = require("express");
const authRouter = express.Router();
const {
  register,
  login,
  logout,
  getProfile,
} = require("../Controllers/UserAuthenticate");

// Register
authRouter.post("/register", register);
// Login
authRouter.post("/login", login);
// Logout
authRouter.post("/logout", logout);
// Get profile
authRouter.get("/getProfile", getProfile);

module.exports = authRouter;
