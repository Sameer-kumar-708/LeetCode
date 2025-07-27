const express = require("express");
const adminMiddleware = require("../Middleware/adminMiddleware");
const videoRouter = express.Router();
const {
  generateUploadSignature,
  saveVideoMetadata,
  deleteVideo,
} = require("../Controllers/videoSection");

videoRouter.get("/create/:problemId", adminMiddleware, generateUploadSignature);
videoRouter.post("/save", adminMiddleware, saveVideoMetadata);
videoRouter.delete("/delete/:videoId", adminMiddleware, deleteVideo);

module.exports = videoRouter;
