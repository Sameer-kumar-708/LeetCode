const express = require("express");
const userMiddleware = require("../Middleware/UserMiddleware");
const { submitCode, runCode } = require("../Controllers/userSubmittion");
const submitRouter = express.Router();

submitRouter.post("/submit/:id", userMiddleware, submitCode);
submitRouter.post("/run/:id", userMiddleware, runCode);

module.exports = submitRouter;
