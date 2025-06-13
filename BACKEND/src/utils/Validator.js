const validator = require("validator");

const validate = (data) => {
  const mandatoryFields = ["firstName", "emailId", "password"];

  const isAllowed = mandatoryFields.every((key) =>
    Object.keys(data).includes(key)
  );
  if (!isAllowed) {
    throw new Error("Some mandatory fields are missing");
  }

  if (!validator.isEmail(data.emailId)) {
    throw new Error("Invalid email");
  }

  // if (!validator.isStrongPassword(data.password)) {
  //   throw new Error("weak password");
  // }
};

module.exports = validate;
