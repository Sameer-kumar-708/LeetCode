const jwt = require("jsonwebtoken");
require("dotenv").config();
const model = require("../models/user");
const redisClient = require("../models/Redis");

const userMiddleware = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).send("No token found.");
    }

    const payload = jwt.verify(token, process.env.RANDOM_JWT);
    const { _id } = payload;
    // console.log(_id);

    if (!_id) {
      throw new Error("Invalid Token");
    }
    if (payload.role != "user") throw new Error("Not valid user");

    const user = await model.findById(_id);
    if (!user) {
      throw new Error("User does not exist");
    }

    const isBlocked = await redisClient.exists(`token:${token}`);
    if (isBlocked === 1) {
      throw new Error("Invalid token");
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).send(`Unauthorized: ${err.message}`);
  }
};

module.exports = userMiddleware;
