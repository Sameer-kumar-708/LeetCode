const express = require("express");
const authRouter = express.Router();
const user = require("../models/user");
const {
  register,
  login,
  logout,
  adminResister,
  // getProfile,
  deleteProfile,
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

//deleteProfile

authRouter.delete("/profile", userMiddleware, deleteProfile);

//check

authRouter.get("/check", (req, res) => {
  const reply = {
    firstName: req.user.firstName,
    emailId: req.user.emailId,
    _id: req.user._id,
  };
  res.status(200).json({
    user: reply,
    message: "valid user",
  });
});

// Get profile
// authRouter.get("/getProfile", getProfile);

module.exports = authRouter;
