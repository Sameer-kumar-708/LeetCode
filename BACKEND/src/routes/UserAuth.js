const express = require("express");
const authRouter = express.Router();
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

authRouter.delete("/deleteprofile", userMiddleware, deleteProfile);

//check

// authRouter.get("/check", userMiddleware, (req, res) => {
//   const reply = {
//     firstName: req.user.firstName,
//     emailId: req.user.emailId,
//     _id: req.user._id,
//     role: req.user.role,
//   };

//   res.status(200).json({
//     user: reply,
//     message: "Valid User",
//   });
// });
module.exports = authRouter;
