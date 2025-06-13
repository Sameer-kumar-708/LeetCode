const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 20,
    },
    lastName: {
      type: String,
      // required: true,
      minlength: 3,
      maxlength: 20,
    },
    emailId: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
    },
    role: {
      type: String,
      // required: true,
      emun: ["user", "admin"],
      default: "user",
    },
    problemSolved: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "problem",
        },
      ],
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const model = mongoose.model("User", UserSchema);
module.exports = model;
