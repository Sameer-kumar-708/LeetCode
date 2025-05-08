const express = require("express");
const adminMiddleware = require("../Middleware/adminMiddleware");
const problemRouter = express.Router();

//createProblem

problemRouter.post("/create", adminMiddleware, createProblem);

//fetchProblem
problemRouter.get("/:id", getProblemById);
problemRouter.get("/", getProblem);
//updateProblem
problemRouter.patch("/:id", updateProblem);
//deleteProblem
problemRouter.delete("/:id", deleteProblem);
//solvedProblem
problemRouter.get("/user", solvedProblem);
