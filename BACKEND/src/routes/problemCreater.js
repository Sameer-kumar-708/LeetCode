const express = require("express");
const adminMiddleware = require("../Middleware/adminMiddleware");
const userMiddleware = require("../Middleware/UserMiddleware");
const problemRouter = express.Router();
const {
  createProblem,
  updateProblem,
  deleteProblem,
  getProblemById,
  getAllProblem,
  solvedProblem,
  submitProblem,
} = require("../Controllers/UserProblem");

//createProblem
problemRouter.post("/create", adminMiddleware, createProblem);

//updateProblem
problemRouter.put("/update/:id", adminMiddleware, updateProblem);

//deleteProblem
problemRouter.delete("/delete/:id", adminMiddleware, deleteProblem);

//solvedProblem
problemRouter.get("/getProblemById/:id", userMiddleware, getProblemById);
problemRouter.get("/getAllProblem", getAllProblem);
problemRouter.get("/solvedProblem", userMiddleware, solvedProblem);
problemRouter.get("/submitProblem/:id", userMiddleware, submitProblem);

module.exports = problemRouter;
