const express = require("express");
const app = express();
require("dotenv").config();
const mongoose = require("mongoose");
const authRouter = require("./routes/UserAuth");
const cookieParser = require("cookie-parser");
const redisClient = require("./models/Redis");

app.use(cookieParser());
app.use(express.json());

app.use("/auth", authRouter);

const dbConnect = async () => {
  try {
    await redisClient.connect();
    console.log("Redis connected");

    await mongoose.connect(process.env.URL);
    console.log("DB connected");

    app.listen(process.env.PORT, () => {
      console.log(`Server started on http://localhost:${process.env.PORT}`);
    });
  } catch (err) {
    console.error("Error connecting to database:", err);
  }
};
dbConnect();
