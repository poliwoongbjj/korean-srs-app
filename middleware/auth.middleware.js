// middleware/auth.middleware.js - JWT authentication middleware

const jwt = require("jsonwebtoken");
const authService = require("../services/auth.service");

/**
 * Middleware to protect routes with JWT authentication
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      // Get token from header (Bearer token)
      token = req.headers.authorization.split(" ")[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, no token provided",
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "your-secret-key"
      );

      // Add user ID to request
      req.user = decoded;

      // Check if user exists
      await authService.getUserById(decoded.userId);

      // Continue to route handler
      next();
    } catch (error) {
      console.error("Token verification error:", error);

      return res.status(401).json({
        success: false,
        message: "Not authorized, invalid token",
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  protect,
};
