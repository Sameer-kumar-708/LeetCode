const jwt = require("jsonwebtoken");
require("dotenv").config();
const model = require("../models/user");
const redisClient = require("../models/Redis");

const adminMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token; // Optional chaining in case cookies are undefined
    if (!token) {
      return res.status(401).send("No token found.");
    }

    let payload;
    try {
      payload = jwt.verify(token, process.env.RANDOM_JWT); // Assign to outer payload
    } catch (err) {
      return res.status(401).send("Invalid or expired token");
    }

    const { _id, role } = payload; // Now payload is accessible

    if (!_id) {
      return res.status(401).send("Invalid Token");
    }

    if (role !== "admin") {
      // Use role instead of payload.role (already destructured)
      return res.status(403).send("Access denied. Admin privileges required.");
    }

    const user = await model.findById(_id);
    if (!user) {
      return res.status(404).send("User does not exist");
    }

    const isBlocked = await redisClient.exists(`token:${token}`);
    if (isBlocked === 1) {
      return res.status(401).send("Invalid token");
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(500).send(`Internal server error: ${err.message}`);
  }
};

module.exports = adminMiddleware;
