const {
  getLanguageById,
  submitBatch,
  submitToken,
} = require("../utils/languageId");

const problem = require("../models/problem");
const user = require("../models/user");
const submission = require("../models/submission");
const solutionVideo = require("../models/SolutionVideo");

const createProblem = async (req, res) => {
  try {
    // Validate all required fields
    const requiredFields = [
      "title",
      "description",
      "difficulty",
      "tags",
      "visibleTestCases",
      "hiddenTestCases",
      "startCode",
      "referenceSolution",
    ];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({ error: `${field} is required` });
      }
    }

    // Validate test cases
    for (const { language, completeCode } of req.body.referenceSolution) {
      const languageId = getLanguageById(language);
      if (!languageId) {
        return res.status(400).json({ error: `Invalid language: ${language}` });
      }

      const submissions = req.body.visibleTestCases.map((testcase) => ({
        source_code: completeCode,
        language_id: languageId,
        stdin: testcase.input,
        expected_output: testcase.output,
      }));

      const submitResult = await submitBatch(submissions);
      const resultToken = submitResult.map((value) => value.token);
      const testResult = await submitToken(resultToken);

      const failedTests = testResult.filter((test) => test.status_id != 3);
      if (failedTests.length > 0) {
        return res.status(400).json({
          error: "Some test cases failed",
          failedTests,
        });
      }
    }

    // Create problem
    const userProblem = await problem.create({
      title: req.body.title,
      description: req.body.description,
      difficulty: req.body.difficulty,
      tags: req.body.tags,
      visibleTestCases: req.body.visibleTestCases,
      hiddenTestCases: req.body.hiddenTestCases,
      startCode: req.body.startCode,
      referenceSolution: req.body.referenceSolution,
      problemCreator: req.user._id,
    });

    res.status(201).json({
      message: "Problem saved successfully",
      problemId: userProblem._id,
    });
  } catch (err) {
    console.error("Error creating problem:", err);
    res.status(500).json({
      error: "Problem creation failed",
      details: err.message,
    });
  }
};

const updateProblem = async (req, res) => {
  const { id } = req.params;
  const {
    title,
    description,
    difficulty,
    tags,
    visibleTestCases,
    hiddenTestCases,
    startCode,
    referenceSolution,
    problemCreator,
  } = req.body;
  try {
    if (!id) {
      return res.status(400).send("Missing Id field");
    }

    const DsaProblem = await problem.findById(id);

    if (!DsaProblem) {
      return res.status(404).send("Id not found");
    }

    for (const { language, completeCode } of referenceSolution) {
      const languageId = getLanguageById(language);

      const submissions = visibleTestCases.map((testcase) => ({
        source_code: completeCode,
        language_id: languageId,
        stdin: testcase.input,
        expected_output: testcase.output,
      }));

      // console.log(submissions);
      const submitResult = await submitBatch(submissions);
      // console.log(submitResult);

      const resultToken = submitResult.map((value) => value.token);

      const testResult = await submitToken(resultToken);

      //  console.log(testResult);

      for (const test of testResult) {
        if (test.status_id != 3) {
          return res.status(400).send("Error Occured");
        }
      }
    }

    const newProblem = await problem.findByIdAndUpdate(
      id,
      { ...req.body },
      { runValidators: true, new: true }
    );

    res.status(200).send(newProblem);

    // res.status(200).send(newProblem.toObject());
  } catch (err) {
    res.status(400).send("Error: " + err.message);
  }
};

const deleteProblem = async (req, res) => {
  const { id } = req.params;

  try {
    if (!id) {
      return res.status(400).send("Missing Id field");
    }

    const deleteProblembyId = await problem.findByIdAndDelete(id);
    if (!deleteProblembyId) {
      return res.status(404).send("Problem is missing");
    }

    res.status(200).send("Succesfull Deleteted");
  } catch (err) {
    res.status(500).send("Error: " + err);
  }
};

const getProblemById = async (req, res) => {
  const { id } = req.params;

  try {
    if (!id) {
      return res.status(400).send("Missing Id field");
    }

    const getProblem = await problem
      .findById(id)
      .select(
        "_id title description difficulty tags visibleTestCases startCode referenceSolution"
      );

    if (!getProblem) {
      return res.status(404).send("Problem is missing");
    }

    const videos = await solutionVideo.findOne({ problemId: id });

    const responseData = {
      ...getProblem.toObject(),
      secureUrl: videos?.secureUrl || null,
      thumbnailUrl: videos?.thumbnailUrl || null,
      duration: videos?.duration || null,
    };

    return res.status(200).send(responseData);
  } catch (err) {
    res.status(500).send("Error: " + err);
  }
};

const getAllProblem = async (req, res) => {
  try {
    const getProblem = await problem
      .find({})
      .select("_id title difficulty tags");

    if (getProblem.length == 0)
      return res.status(404).send("Problem is Missing");

    res.status(200).send(getProblem);
  } catch (err) {
    res.status(500).send("Error: " + err);
  }
};

const solvedProblem = async (req, res) => {
  try {
    const userId = req.user._id;

    const problemSolved = await user.findById(userId).populate({
      path: "problemSolved",
      select: "_id title difficulty tags",
    });
    console.log(problemSolved);
    // res.status(200).send(problemSolved);
    res.status(200).send(problemSolved.problemSolved || []);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error occurred");
  }
};

const submitProblem = async (req, res) => {
  try {
    const userId = req.user._id;
    const problemId = req.params.id;

    const ans = await submission.find({ userId, problemId });
    if (ans.length == 0) {
      res.status(200).send("No submition is present");
    }

    res.status(200).send(ans);
  } catch (err) {
    res.status(500).send("Server error occurred");
  }
};

module.exports = {
  createProblem,
  updateProblem,
  deleteProblem,
  getProblemById,
  getAllProblem,
  solvedProblem,
  submitProblem,
};
