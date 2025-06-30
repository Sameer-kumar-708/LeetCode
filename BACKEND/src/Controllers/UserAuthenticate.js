// const userMiddleware = require("../Middleware/UserMiddleware");
const redisClient = require("../models/Redis");
const submission = require("../models/submission");
const model = require("../models/user");
const user = require("../models/user");
const validate = require("../utils/Validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

//resister

const register = async (req, res) => {
  try {
    validate(req.body);

    const { firstName, emailId, password } = req.body;

    // Hash password and assign role
    req.body.password = await bcrypt.hash(password, 10);
    req.body.role = "user";

    // Create user
    const insert = await model.create(req.body);

    // Generate JWT token
    const token = jwt.sign(
      { _id: insert._id, emailId: insert.emailId, role: insert.role },
      process.env.RANDOM_JWT,
      { expiresIn: 3600 }
    );

    // Build response user data
    const reply = {
      firstName: insert.firstName,
      emailId: insert.emailId,
      _id: insert._id,
      role: insert.role,
    };

    // Set cookie
    res.cookie("token", token, { maxAge: 60 * 60 * 1000 });

    // Send response
    res.status(201).json({
      user: reply,
      message: "Register successful.",
    });
  } catch (err) {
    res.status(400).send(`Error occurred: ${err.message}`);
  }
};

//login

const login = async (req, res) => {
  try {
    const { emailId, password } = req.body;

    if (!emailId || !password) {
      throw new Error("Invalid credentials");
    }

    // Find user by email
    const User = await model.findOne({ emailId });
    if (!User) {
      throw new Error("User not found");
    }

    // Check password
    const isAllowed = await bcrypt.compare(password, User.password);
    if (!isAllowed) {
      throw new Error("Invalid password");
    }

    // Prepare response
    const reply = {
      firstName: User.firstName,
      emailId: User.emailId,
      _id: User._id,
      role: User.role,
    };

    // Generate token
    const token = jwt.sign(
      { _id: User._id, emailId: User.emailId, role: User.role },
      process.env.RANDOM_JWT,
      {
        expiresIn: 3600,
      }
    );

    // Set token as cookie
    res.cookie("token", token, { maxAge: 60 * 60 * 1000 });

    // Send response
    res.status(200).json({
      user: reply,
      message: "Login successful.",
    });
  } catch (err) {
    res.status(400).send(`Error occurred: ${err.message}`);
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
    ``;
  } catch (err) {
    return res.status(400).send(`Error occurred: ${err.message}`);
  }
};

//adminResister

const adminResister = async (req, res) => {
  try {
    validate(req.body);

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

const deleteProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    await user.findByIdAndDelete({ userId });

    await submission.deleteMany({ userId });

    res.status(200).send("Profile deleted succesfully");
  } catch (err) {
    res.status(400).send(`Error occurred: ${err.message}`);
  }
};

module.exports = { register, login, logout, adminResister, deleteProfile };
