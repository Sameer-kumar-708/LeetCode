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

    // console.log(req.body);
    req.body.password = await bcrypt.hash(password, 10);
    req.body.role = "user";

    const insert = await model.create(req.body);

    const token = jwt.sign(
      { _id: insert._id, emailId, role: insert.role },
      process.env.RANDOM_JWT,
      { expiresIn: 3600 }
    );
    const reply = {
      firstName: user.firstName,
      emailId: user.emailId,
      _id: user._id,
    };
    res.cookie("token", token, { maxAge: 60 * 60 * 1000 });

    res.status(201).json({
      user: reply,
      message: "Resgister succesfull..",
    });
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
    // const User = await user.findOne({ emailId });
    const User = await model.findOne({ emailId });

    // console.log(User);

    const isAllowed = bcrypt.compare(password, User.password);

    console.log(isAllowed);

    if (!isAllowed) {
      throw new Error("User not found");
    }

    const reply = {
      firstName: User.firstName,
      emailId: User.emailId,
      _id: User._id,
    };

    const token = jwt.sign(
      { _id: User._id, emailId: emailId, role: User.role },
      process.env.RANDOM_JWT,
      {
        expiresIn: 3600,
      }
    );
    res.cookie("token", token, { maxAge: 60 * 60 * 1000 });

    res.status(201).json({
      user: reply,
      message: "Login succesfull..",
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
