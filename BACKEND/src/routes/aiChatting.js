const express = require("express");
const aiRouter = express.Router();
const userMiddleware = require("../Middleware/UserMiddleware");
// const solveDoubt = require('../controllers/solveDoubt');
const solveDoubt = require("../Controllers/solveDoubt");

aiRouter.post("/chat", userMiddleware, solveDoubt);

module.exports = aiRouter;
