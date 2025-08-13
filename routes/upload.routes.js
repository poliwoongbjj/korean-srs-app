const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");
const uploadService = require("../services/upload.service");
const fs = require("fs");
const path = require("path");

// Upload audio file
router.post(
  "/audio",
  protect,
  (req, res, next) => {
    // Debug middleware
    console.log("Upload route accessed with path:", req.path);
    console.log("Full URL:", req.originalUrl);
    next();
  },
  uploadService.upload.single("audio"),
  (req, res) => {
    try {
      console.log("Upload request received");
      console.log("Request file:", req.file);
      console.log("Request body:", req.body);

      if (!req.file) {
        console.error("No file in the request");
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
      }

      console.log("File uploaded successfully:", {
        filename: req.file.filename,
        path: req.file.path,
        destination: req.file.destination,
        size: req.file.size,
        mimetype: req.file.mimetype,
      });

      // Check file existence and permissions
      const fullPath = req.file.path;
      try {
        const fileExists = fs.existsSync(fullPath);
        console.log(`File exists at ${fullPath}: ${fileExists}`);

        if (fileExists) {
          try {
            fs.accessSync(fullPath, fs.constants.R_OK);
            console.log(`File ${fullPath} is readable`);
          } catch (accessErr) {
            console.error(`File ${fullPath} permission error:`, accessErr);
          }
        }
      } catch (fsErr) {
        console.error(`Error checking file:`, fsErr);
      }

      // Generate a web-accessible path
      // Make the path relative to public directory
      const publicPath = `/uploads/${req.file.filename}`;

      console.log("Returning success response with path:", publicPath);

      res.status(200).json({
        success: true,
        data: {
          filename: req.file.filename,
          path: publicPath,
          mimetype: req.file.mimetype,
          size: req.file.size,
        },
      });
    } catch (error) {
      console.error("File upload error:", error);
      res.status(500).json({
        success: false,
        message: "File upload failed",
        error: error.message,
      });
    }
  }
);

module.exports = router;
