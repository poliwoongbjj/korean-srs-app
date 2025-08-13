// services/upload.service.js
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const multer = require("multer");

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "../public/uploads");
if (!fs.existsSync(uploadsDir)) {
  console.log(`Creating uploads directory: ${uploadsDir}`);
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log(`Setting destination to: ${uploadsDir}`);
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with original extension
    const originalName = file.originalname;
    const fileExt = path.extname(originalName) || ".mp3"; // Default to .mp3 if no extension
    const baseName = path
      .basename(originalName, fileExt)
      .replace(/[^a-z0-9]/gi, "-") // Replace non-alphanumeric with dash
      .toLowerCase();

    // Use original name + random string for better identification
    const randomStr = crypto.randomBytes(8).toString("hex");
    const filename = `${baseName}-${randomStr}${fileExt}`;

    console.log(`Generated filename: ${filename}`);
    cb(null, filename);
  },
});

// Create file filter
const fileFilter = (req, file, cb) => {
  console.log(`Checking file type: ${file.mimetype}`);

  // Accept only audio files
  if (
    file.mimetype.startsWith("audio/") ||
    file.originalname.match(/\.(mp3|wav|ogg|m4a)$/i)
  ) {
    console.log("File type accepted");
    cb(null, true);
  } else {
    console.log("File type rejected");
    cb(
      new Error("Unsupported file type. Only audio files are allowed."),
      false
    );
  }
};

// Create multer instance
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
  fileFilter: fileFilter,
});

module.exports = {
  upload,
  getFileUrl: (filename) => `/api/audio/${filename}`,
};
