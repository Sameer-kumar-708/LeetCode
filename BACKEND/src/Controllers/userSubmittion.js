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
    let { code, language } = req.body;

    if (!userId || !code || !language || !problemId) {
      return res.status(400).json({ error: "Some field is missing" });
    }

    if (language === "cpp") language = "c++";

    const problemResult = await Problem.findById(problemId);

    const submittedResult = await submission.create({
      userId,
      problemId,
      language,
      code,
      status: "pending",
      testCasesTotal: problemResult.hiddenTestCases.length,
    });

    const languageId = getLanguageById(language);

    const submissions = problemResult.hiddenTestCases.map((testcase) => ({
      source_code: code,
      language_id: languageId,
      stdin: testcase.input,
      expected_output: testcase.output,
    }));

    const submitResult = await submitBatch(submissions);
    const resultToken = submitResult.map((value) => value.token);
    const testResult = await submitToken(resultToken);

    let memory = 0;
    let runtime = 0;
    let status = "accepted";
    let testCasesPassed = 0;
    let errorMessage = null;

    for (const test of testResult) {
      if (test.status_id == 3) {
        testCasesPassed++;
        runtime += parseInt(test.time);
        memory = Math.max(memory, test.memory);
      } else {
        status = test.status_id == 4 ? "error" : "wrong";
        errorMessage = test.stderr;
      }
    }

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

    res.status(201).json({
      accepted: status === "accepted",
      status,
      totalTestCases: submittedResult.testCasesTotal,
      passedTestCases: testCasesPassed,
      runtime,
      memory,
      errorMessage,
    });
  } catch (err) {
    res.status(500).json({
      message: "Internal server error",
      error: err.message || err.toString(),
    });
  }
};

const runCode = async (req, res) => {
  //
  try {
    const userId = req.user._id;
    const problemId = req.params.id;

    let { code, language } = req.body;

    if (!userId || !code || !problemId || !language)
      return res.status(400).send("Some field missing");

    //    Fetch the problem from database
    const problem = await Problem.findById(problemId);
    //    testcases(Hidden)
    if (language === "cpp") language = "c++";

    //    Judge0 code ko submit karna hai

    const languageId = getLanguageById(language);

    const submissions = problem.visibleTestCases.map((testcase) => ({
      source_code: code,
      language_id: languageId,
      stdin: testcase.input,
      expected_output: testcase.output,
    }));

    const submitResult = await submitBatch(submissions);

    const resultToken = submitResult.map((value) => value.token);

    const testResult = await submitToken(resultToken);

    let testCasesPassed = 0;
    let runtime = 0;
    let memory = 0;
    let status = true;
    let errorMessage = null;

    for (const test of testResult) {
      if (test.status_id == 3) {
        testCasesPassed++;
        runtime = runtime + parseFloat(test.time);
        memory = Math.max(memory, test.memory);
      } else {
        if (test.status_id == 4) {
          status = false;
          errorMessage = test.stderr;
        } else {
          status = false;
          errorMessage = test.stderr;
        }
      }
    }

    res.status(201).json({
      success: status,
      testCases: testResult,
      runtime,
      memory,
    });
  } catch (err) {
    res.status(500).send("Internal Server Error " + err);
  }
};

module.exports = { submitCode, runCode };
