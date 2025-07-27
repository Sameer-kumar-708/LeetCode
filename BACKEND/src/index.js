const express = require("express");
const app = express();
require("dotenv").config();
const mongoose = require("mongoose");
const authRouter = require("./routes/UserAuth");
const cookieParser = require("cookie-parser");
const redisClient = require("./models/Redis");
const problemRouter = require("./routes/problemCreater");
// const submitRouter = require("./Controllers/userSubmittion");
const submitRouter = require("./routes/Submit");
const aiRouter = require("./routes/aiChatting");
const videoRouter = require("./routes/videoCreater");
const cors = require("cors");

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use(cookieParser());
app.use(express.json());

app.use("/auth", authRouter);
app.use("/problem", problemRouter);
app.use("/submittion", submitRouter);
app.use("/ai", aiRouter);
app.use("/video", videoRouter);

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
