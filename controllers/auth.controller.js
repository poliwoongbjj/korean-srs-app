// controllers/auth.controller.js - Authentication controller

const authService = require("../services/auth.service");
const db = require("../config/database");
const bcrypt = require("bcryptjs");

/**
 * Register a new user
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide username, email and password",
      });
    }

    // Password validation
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // Register user
    const user = await authService.register({ username, email, password });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: user,
    });
  } catch (error) {
    // Handle specific errors
    if (error.message.includes("already")) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    next(error);
  }
};

/**
 * Login a user
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Login user
    const { user, token } = await authService.login(email, password);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    // Handle authentication errors
    if (error.message === "Invalid credentials") {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    next(error);
  }
};

/**
 * Get current user profile
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
exports.getProfile = async (req, res, next) => {
  try {
    // User ID should be available from auth middleware
    const userId = req.user.userId;

    const user = await authService.getUserById(userId);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { username, email } = req.body;

    // Validate input
    if (!username || !email) {
      return res.status(400).json({
        success: false,
        message: "Username and email are required",
      });
    }

    // Check if username or email already exists (except for current user)
    const existingUsers = await db.query(
      "SELECT * FROM users WHERE (username = ? OR email = ?) AND id != ?",
      [username, email, userId]
    );

    if (existingUsers.length > 0) {
      const existingUser = existingUsers[0];
      if (existingUser.username === username) {
        return res.status(409).json({
          success: false,
          message: "Username already taken",
        });
      }
      if (existingUser.email === email) {
        return res.status(409).json({
          success: false,
          message: "Email already registered",
        });
      }
    }

    // Update user
    await db.query("UPDATE users SET username = ?, email = ? WHERE id = ?", [
      username,
      email,
      userId,
    ]);

    // Get updated user
    const updatedUsers = await db.query(
      "SELECT id, username, email, created_at FROM users WHERE id = ?",
      [userId]
    );

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUsers[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user password
 */
exports.updatePassword = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    // Get user with password
    const users = await db.query("SELECT * FROM users WHERE id = ?", [userId]);

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user = users[0];

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await db.query("UPDATE users SET password_hash = ? WHERE id = ?", [
      hashedPassword,
      userId,
    ]);

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Error updating password:", error);
    next(error);
  }
};
