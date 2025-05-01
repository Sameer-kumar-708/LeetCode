const express = require("express");
const app = express();
require("dotenv").config();
const mongoose = require("mongoose");
const authRouter = require("./routes/UserAuth");
const cookieParser = require("cookie-parser");

app.use(cookieParser());
app.use(express.json());

// All routes are prefixed with "/auth" to avoid repetition
app.use("/auth", authRouter);

mongoose
  .connect(process.env.URL)
  .then(() => {
    console.log(`db connected`);
    app.listen(process.env.PORT, () => {
      console.log(`server started on http://localhost:${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error("Error connecting to database:", err);
  });
