const jwt = require("jsonwebtoken");
require("dotenv").config();
const model = require("../models/user");
const redisClient = require("../models/Redis");

const userMiddleware = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Verify token
    let payload;
    try {
      payload = jwt.verify(token, process.env.RANDOM_JWT);
    } catch (err) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    const { _id, role } = payload;

    // Check Redis for blocked token
    try {
      const isBlocked = await redisClient.exists(`token:${token}`);
      if (isBlocked) {
        return res.status(401).json({ error: "Session expired" });
      }
    } catch (redisErr) {
      console.error("Redis error:", redisErr);
      // You might want to proceed or fail based on your requirements
      // For strict security, you might want to return an error here
    }

    // Fetch user
    const user = await model.findById(_id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Middleware error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = userMiddleware;
