const Problem = require("../models/problem");
const submission = require("../models/submission");
const {
  getLanguageById,
  submitBatch,
  submitToken,
} = require("../utils/languageId");

const submitCode = async (req, res) => {
  try {
    const userId = req.user._id;
    const problemId = req.params.id;
    const { code, language } = req.body;

    if (!userId || !code || !language || !problemId) {
      return res.status(400).send("Some field is missing");
    }

    const problemResult = await Problem.findById(problemId);

    const submittedResult = await submission.create({
      userId,
      problemId,
      language,
      code,
      status: "pending",
      testCasesTotal: problemResult.hiddenTestCases.length,
    });

    // console.log(submittedResult);

    const languageId = getLanguageById(language);

    const submissions = problemResult.hiddenTestCases.map((testcase) => ({
      source_code: code,
      language_id: languageId,
      stdin: testcase.input,
      expected_output: testcase.output,
    }));

    //batch submittion
    const submitResult = await submitBatch(submissions);

    const resultToken = submitResult.map((value) => value.token);

    const testResult = await submitToken(resultToken);

    // submittedResult ko update
    let memory = 0;
    let runtime = 0;
    let status = "accepted";
    let testCasesPassed = 0;
    let errorMessage = null;

    for (const test of testResult) {
      if (test.status_id == 3) {
        testCasesPassed++;
        runtime = runtime + parseInt(test.time);
        memory = Math.max(memory, test.memory);
      } else {
        if (test.status_id == 4) {
          status = "error";
          errorMessage = test.stderr;
        } else {
          status = "wrong";
          errorMessage = test.stderr;
        }
      }
    }

    //store data in db

    submittedResult.status = status;
    submittedResult.testCasesPassed = testCasesPassed;
    submittedResult.errorMessage = errorMessage;
    submittedResult.runtime = runtime;
    submittedResult.memory = memory;

    await submittedResult.save();

    if (!req.user.problemSolved.includes(problemId)) {
      req.user.problemSolved.push(problemId);
      await req.user.save();
    }

    res.status(201).send(submittedResult);
  } catch (err) {
    res.status(500).json({
      message: "Internal server error",
      error: err.message || err.toString(),
    });
  }
};
const runCode = async (req, res) => {
  try {
    const userId = req.user._id;
    const problemId = req.params.id;
    const { code, language } = req.body;

    if (!userId || !code || !language || !problemId) {
      return res.status(400).send("Some field is missing");
    }

    const problemResult = await Problem.findById(problemId);

    // console.log(submittedResult);

    const languageId = getLanguageById(language);

    const submissions = problemResult.visibleTestCases.map((testcase) => ({
      source_code: code,
      language_id: languageId,
      stdin: testcase.input,
      expected_output: testcase.output,
    }));

    //batch submittion
    const submitResult = await submitBatch(submissions);

    const resultToken = submitResult.map((value) => value.token);

    const testResult = await submitToken(resultToken);

    res.status(201).send(testResult);
  } catch (err) {
    res.status(500).json({
      message: "Internal server error",
      error: err.message || err.toString(),
    });
  }
};

module.exports = { submitCode, runCode };

// language_id: 54,
//   stdin: '2 3',
//   expected_output: '5',
//   stdout: '5',
//   status_id: 3,
//   created_at: '2025-05-21T14:00:01.931Z',
//   finished_at: '2025-05-21T14:00:02.419Z',
//   time: '0.001',
//   memory: 1056,
//   stderr: null,
//   token: 'a9111127-a6b3-4bdf-8395-3bcceaa69145',
