const mongoose = require("mongoose");
const { Schema } = mongoose;

const problemSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    discription: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      required: true,
      enum: ["easy", "hard", "medium"],
    },
    tags: {
      type: String,
      required: true,
      enum: ["array", "linkedlist", "graph", "dp"],
    },
    visibleTestCase: [
      {
        input: {
          type: String,
          required: true,
        },
        output: {
          type: String,
          required: true,
        },
        explaination: {
          type: String,
          required: true,
        },
      },
    ],
    hiddenTestCase: [
      {
        input: {
          type: String,
          required: true,
        },
        output: {
          type: String,
          required: true,
        },
      },
    ],

    startCode: [
      {
        language: {
          type: String,
          required: true,
        },
        initialCode: {
          type: String,
          required: true,
        },
      },
    ],

    referanceSolution: [
      {
        language: {
          type: String,
          required: true,
        },
        completeCode: {
          type: String,
          required: true,
        },
      },
    ],

    problemCreator: {
      type: UserSchema.Types.ObjectId,
      required: true,
    },
  },
  { timestamps: true }
);

const problem = mongoose.model("problem", problemSchema);
module.exports = problem;
