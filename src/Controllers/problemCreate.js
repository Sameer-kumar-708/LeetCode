const { getlanguageById, submitBatch } = require("../utils/languageId");

const createProblem = async (req, res) => {
  try {
    const {
      title,
      description, // fixed typo
      difficulty,
      tags,
      visibleTestCase,
      hiddenTestCase,
      startCode,
      referanceSolution,
      problemCreator,
    } = req.body;

    for (const { language, completeCode } of referanceSolution) {
      const langId = getlanguageById(language);

      const submission = visibleTestCase.map((input, output) => ({
        source_code: completeCode,
        language_id: langId,
        stdin: input,
        expected_output: output,
      }));

      const submitResult = await submitBatch(submission);

      // You can log or process submitResult here
    }

    res.status(201).json({ message: "Problem created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};
