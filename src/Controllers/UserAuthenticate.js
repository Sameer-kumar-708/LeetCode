// const userMiddleware = require("../Middleware/UserMiddleware");
const redisClient = require("../models/Redis");
const model = require("../models/user");
const validate = require("../utils/Validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

//resister

const register = async (req, res) => {
  try {
    validate(req.body); // Assuming this function exists and works properly

    const { firstName, emailId, password, role } = req.body;

    req.body.password = await bcrypt.hash(password, 10);
    req.body.role = "user";

    // const userData = {
    //   firstName,
    //   emailId,
    //   password: hashedPass,
    //   role,
    // };

    const insert = await model.create(req.body);

    const token = jwt.sign(
      { _id: insert._id, emailId, role: insert.role },
      process.env.RANDOM_JWT,
      { expiresIn: 3600 }
    );
    res.cookie("token", token, { maxAge: 60 * 60 * 1000 });

    res.status(201).send("User registered successfully");
  } catch (err) {
    res.status(400).send(`Error occurred: ${err.message}`);
  }
};

//login

const login = async (req, res) => {
  try {
    const { emailId, password } = req.body;

    if (!emailId) {
      throw new Error("Invalid cradential");
    }

    if (!password) {
      throw new Error("Invalid cradential");
    }
    const User = await model.findOne({ emailId });

    const isAllowed = bcrypt.compare(password, User.password);

    if (!isAllowed) {
      throw new Error("User not found");
    }

    const token = jwt.sign(
      { _id: User._id, emailId: emailId, role: User.role },
      process.env.RANDOM_JWT,
      {
        expiresIn: 3600,
      }
    );
    res.cookie("token", token, { maxAge: 60 * 60 * 1000 });

    res.status(201).send("Login Succesfully");
  } catch (err) {
    res.status(400).send("Error occured", err.message);
  }
};

//logout

const logout = async (req, res) => {
  try {
    const { token } = req.cookies;
    const payload = jwt.decode(token);

    await redisClient.set(`token:${token}`, "Blocked");
    await redisClient.expireAt(`token:${token}`, payload.exp);

    res.cookie("token", null, new Date(Date.now()));

    res.send("logout Succesfully");
  } catch (err) {
    return res.status(400).send(`Error occurred: ${err.message}`);
  }
};

//adminResister

const adminResister = async (req, res) => {
  try {
    validate(req.body); // Assuming this function exists and works properly

    const { firstName, emailId, password } = req.body;

    const hashedPass = await bcrypt.hash(password, 10);
    req.body.role = "admin";

    const userData = {
      firstName,
      emailId,
      password: hashedPass,
      role: "admin",
    };

    const insert = await model.create(userData);

    const token = jwt.sign(
      { _id: insert._id, emailId, role: insert.role },
      process.env.RANDOM_JWT,
      { expiresIn: 3600 }
    );
    res.cookie("token", token, { maxAge: 60 * 60 * 1000 });

    res.status(201).send("User registered successfully");
  } catch (err) {
    res.status(400).send(`Error occurred: ${err.message}`);
  }
};

//getProfile

// const getProfile = async (req, res) => {
//   try {
//     const token = req.cookies.token;

//     if (!token) {
//       return res.status(401).send("Unauthorized: No token provided");
//     }

//     const payload = jwt.verify(token, process.env.RANDOM_JWT);

//     const data = await model.findOne(payload._id);
//     if (!data) {
//       return res.status(404).send("User not found");
//     }
//     res.status(200).json(data);
//     console.log(data);
//   } catch (err) {
//     return res.status(400).send(`Error occurred: ${err.message}`);
//   }
// };

module.exports = { register, login, logout, adminResister };
