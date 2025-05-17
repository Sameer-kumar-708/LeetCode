const {
  getLanguageById,
  submitBatch,
  submitToken,
} = require("../utils/languageId");

const problem = require("../models/problem");

const createProblem = async (req, res) => {
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
    for (const { language, completeCode } of referenceSolution) {
      const languageId = getLanguageById(language);

      // console.log("ref",referenceSolution);
      // console.log("visble",visibleTestCases);

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

    // // We can store it in our DB

    const userProblem = await problem.create({
      ...req.body,
      problemCreator: req.user._id,
    });

    res.status(201).send("Problem Saved Successfully");
  } catch (err) {
    res.status(400).send("Error: " + err);
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

  if (!id) {
    return res.status(400).send("Missing Id field");
  }

  const DsaProblem = await problem.findById(id);

  if (!DsaProblem) {
    return res.status(404).send("Id not found");
  }
  try {
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

    const newProblem = problem.findByIdAndUpdate(
      id,
      { ...req.body },
      { runValidators: true, new: true }
    );

    res.status(200).send(newProblem);
  } catch (err) {
    res.status(400).send("Error: " + err);
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

    const getProblem = await problem.findById(id);

    if (!getProblem) {
      return res.status(404).send("Problem is missing");
    }

    res.status(200).send(getProblem);
  } catch (err) {
    res.status(500).send("Error: " + err);
  }
};

const getAllProblem = async (req, res) => {
  try {
    const allProblem = await problem.find({});

    if (!allProblem) {
      return res.status(404).send("Problem is missing");
    }
    res.status(200).send(allProblem);
  } catch (err) {
    res.status(500).send("Error: " + err);
  }
};

// const solvedProblem = async;

module.exports = {
  createProblem,
  updateProblem,
  deleteProblem,
  getProblemById,
  getAllProblem,
};
