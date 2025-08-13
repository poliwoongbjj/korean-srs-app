// components/common/AudioUploader.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AudioUploader.css";

const AudioUploader = ({ onUploadSuccess, onUploadError }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Clean up preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Handle file selection change
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (!selectedFile) {
      return;
    }


    // Check if file is an audio file
    if (!selectedFile.type.startsWith("audio/")) {
      onUploadError("Selected file is not an audio file");
      return;
    }

    // Create a preview URL for the selected file
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const newPreviewUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(newPreviewUrl);
    setFile(selectedFile);

    // Reset progress
    setProgress(0);
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!file) {
      onUploadError("No file selected");
      return;
    }

    // Create FormData object
    const formData = new FormData();
    formData.append("audio", file);


    setLoading(true);
    setProgress(0);

    try {
      // Create config with upload progress tracking
      const config = {
        headers: {
          "Content-Type": "multipart/form-data", // Important!
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percentCompleted);
        },
      };


      const response = await axios.post(
        "/api/upload/audio",
        formData,
        config
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Upload failed");
      }

      // Get the file data from the response
      const audioData = response.data.data;

      // Convert the path to use the audio API endpoint
      const filename = audioData.filename;
      const apiPath = `/api/audio/${filename}`;

      // Create a modified data object with the API path
      const modifiedData = {
        ...audioData,
        path: apiPath,
        apiPath: apiPath,
      };

      // Test if the audio is accessible via the API path
      const testAudio = new Audio(apiPath);


      testAudio.onerror = (err) => {
        console.error("Test audio loading error:", err);
        // Continue with success callback even if test playback fails
        // since the file was uploaded successfully
      };

      setLoading(false);

      // Clean up preview URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }

      setFile(null);
      onUploadSuccess(modifiedData);
    } catch (error) {
      console.error("Upload failed:", error.response || error);

      // More detailed error logging
      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data);
      }

      setLoading(false);
      onUploadError(
        error.response?.data?.message || error.message || "Upload failed"
      );
    }
  };

  // Cancel upload and reset state
  const handleCancel = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setFile(null);
    setProgress(0);
  };

  return (
    <div className="audio-uploader">
      {/* File input */}
      <div className="file-input-container">
        <input
          type="file"
          accept="audio/*"
          onChange={handleFileChange}
          className="file-input"
          id="audio-file-input"
          disabled={loading}
        />
        <label
          htmlFor="audio-file-input"
          className={`file-input-label ${loading ? "disabled" : ""}`}
        >
          {file ? file.name : "Choose audio file"}
        </label>
      </div>

      {/* Audio preview */}
      {previewUrl && (
        <div className="audio-preview">
          <audio controls src={previewUrl} className="preview-audio"></audio>
        </div>
      )}

      {/* Upload controls */}
      {file && (
        <div className="upload-controls">
          {loading ? (
            <div className="progress-container">
              <div className="progress-bar-container">
                <div
                  className="progress-bar"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <span className="progress-text">{progress}%</span>
            </div>
          ) : (
            <div className="button-container">
              <button
                type="button"
                className="cancel-btn"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button
                type="button"
                className="upload-btn"
                onClick={handleUpload}
              >
                Upload
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AudioUploader;
