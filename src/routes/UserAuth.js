const express = require("express");
const authRouter = express.Router();
const {
  register,
  login,
  logout,
  adminResister,
  getProfile,
} = require("../Controllers/UserAuthenticate");
const userMiddleware = require("../Middleware/UserMiddleware");
const adminMiddleware = require("../Middleware/adminMiddleware");

// Register
authRouter.post("/register", register);
// Login
authRouter.post("/login", login);
// Logout
authRouter.post("/logout", userMiddleware, logout);

//adminResister
authRouter.post("/admin/resister", adminMiddleware, adminResister);

// Get profile
// authRouter.get("/getProfile", getProfile);

module.exports = authRouter;
