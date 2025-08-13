// routes/audio.routes.js
const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const audioService = require("../services/audio.service");

// Get all audio files
router.get("/", (req, res) => {
  try {
    const files = audioService.getAudioFiles();
    res.status(200).json({
      success: true,
      data: files,
    });
  } catch (error) {
    console.error("Error getting audio files:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get audio files",
      error: error.message,
    });
  }
});

// Get a specific audio file by filename
router.get("/:filename", (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = audioService.getAudioPath(filename);

    console.log(`Serving audio file: ${filePath}`);

    // Check if file exists
    if (!audioService.audioExists(filename)) {
      console.error(`File not found: ${filePath}`);
      return res.status(404).json({
        success: false,
        message: "Audio file not found",
      });
    }

    // Get file extension
    const ext = path.extname(filename).toLowerCase();

    // Set appropriate content type based on file extension
    let contentType = "audio/mpeg"; // Default to MP3
    if (ext === ".wav") contentType = "audio/wav";
    if (ext === ".ogg") contentType = "audio/ogg";
    if (ext === ".m4a") contentType = "audio/mp4";

    // Set content type and serve file
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=86400"); // Cache for 1 day

    // Stream the file instead of loading it all in memory
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    // Handle errors in the stream
    fileStream.on("error", (err) => {
      console.error(`Error streaming file: ${err}`);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: "Error streaming audio file",
          error: err.message,
        });
      }
    });
  } catch (error) {
    console.error("Error serving audio file:", error);
    res.status(500).json({
      success: false,
      message: "Failed to serve audio file",
      error: error.message,
    });
  }
});

module.exports = router;
