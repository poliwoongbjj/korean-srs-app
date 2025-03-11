// services/auth.service.js - Authentication service

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/database");

class AuthService {
  /**
   * Register a new user
   *
   * @param {Object} userData - User data (username, email, password)
   * @returns {Promise<Object>} - Newly created user
   */
  async register(userData) {
    const { username, email, password } = userData;

    try {
      // Check if user already exists
      const existingUsers = await db.query(
        "SELECT * FROM users WHERE username = ? OR email = ?",
        [username, email]
      );

      if (existingUsers.length > 0) {
        const existingUser = existingUsers[0];
        if (existingUser.username === username) {
          throw new Error("Username already taken");
        }
        if (existingUser.email === email) {
          throw new Error("Email already registered");
        }
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Insert new user
      const result = await db.query(
        "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
        [username, email, hashedPassword]
      );

      // Get the created user (without password)
      const users = await db.query(
        "SELECT id, username, email, created_at FROM users WHERE id = ?",
        [result.insertId]
      );

      // Create a default deck for the user
      await db.query(
        "INSERT INTO decks (user_id, name, description) VALUES (?, ?, ?)",
        [result.insertId, "Default Deck", "Your default Korean learning deck"]
      );

      return users[0];
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  }

  /**
   * Login a user
   *
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} - User data and token
   */
  async login(email, password) {
    try {
      // Find user by email
      const users = await db.query("SELECT * FROM users WHERE email = ?", [
        email,
      ]);

      if (users.length === 0) {
        throw new Error("Invalid credentials");
      }

      const user = users[0];

      // Check password
      const isMatch = await bcrypt.compare(password, user.password_hash);

      if (!isMatch) {
        throw new Error("Invalid credentials");
      }

      // Create JWT token
      const token = this.generateToken(user.id);

      // Return user data without password
      const { password_hash, ...userData } = user;

      return {
        user: userData,
        token,
      };
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  /**
   * Generate JWT token for authentication
   *
   * @param {number} userId - User ID
   * @returns {string} - JWT token
   */
  generateToken(userId) {
    const payload = {
      userId,
    };

    return jwt.sign(payload, process.env.JWT_SECRET || "your-secret-key", {
      expiresIn: "7d",
    });
  }

  /**
   * Get user by ID
   *
   * @param {number} userId - User ID
   * @returns {Promise<Object>} - User data
   */
  async getUserById(userId) {
    try {
      const users = await db.query(
        "SELECT id, username, email, created_at FROM users WHERE id = ?",
        [userId]
      );

      if (users.length === 0) {
        throw new Error("User not found");
      }

      return users[0];
    } catch (error) {
      console.error("Get user error:", error);
      throw error;
    }
  }
}

module.exports = new AuthService();
