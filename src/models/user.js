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
    age: {
      type: String,
      emun: ["User", "admin"],
      default: "User",
    },
    problemSolved: {
      type: [String],
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
