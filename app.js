var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");
var helmet = require("helmet");
var dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Routes imports
var authRoutes = require("./routes/auth.routes");
var cardsRoutes = require("./routes/cards.routes");
var decksRoutes = require("./routes/decks.routes");
var reviewsRoutes = require("./routes/reviews.routes");
var statsRoutes = require("./routes/stats.routes");

var app = express();

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/cards", cardsRoutes);
app.use("/api/decks", decksRoutes);
app.use("/api/reviews", reviewsRoutes);
app.use("/api/stats", statsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err : {},
  });
});

module.exports = app;
