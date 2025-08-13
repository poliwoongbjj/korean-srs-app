const fs = require("fs");
const path = require("path");

class AudioService {
  constructor() {
    this.uploadDir = path.join(__dirname, "../public/uploads");

    // Create directory if it doesn't exist
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
      console.log(`Created uploads directory: ${this.uploadDir}`);
    }
  }

  /**
   * Get the path to an audio file
   * @param {string} filename - The name of the audio file
   * @returns {string} - The full path to the audio file
   */
  getAudioPath(filename) {
    return path.join(this.uploadDir, filename);
  }

  /**
   * Check if an audio file exists
   * @param {string} filename - The name of the audio file
   * @returns {boolean} - Whether the file exists
   */
  audioExists(filename) {
    const filePath = this.getAudioPath(filename);
    return fs.existsSync(filePath);
  }

  /**
   * Get all audio files
   * @returns {Array} - List of audio files
   */
  getAudioFiles() {
    if (!fs.existsSync(this.uploadDir)) {
      return [];
    }

    return fs
      .readdirSync(this.uploadDir)
      .filter((file) => {
        const ext = path.extname(file).toLowerCase();
        return [".mp3", ".wav", ".ogg", ".m4a"].includes(ext);
      })
      .map((file) => ({
        name: file,
        path: `/uploads/${file}`,
        fullPath: this.getAudioPath(file),
        size: fs.statSync(this.getAudioPath(file)).size,
      }));
  }
}

module.exports = new AudioService();
