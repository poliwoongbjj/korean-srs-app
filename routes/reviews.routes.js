// routes/reviews.routes.js - Review routes

const express = require("express");
const router = express.Router();
const reviewsController = require("../controllers/reviews.controller");
const { protect } = require("../middleware/auth.middleware");

// All review routes require authentication
router.use(protect);

// Study session routes
router.get("/session", reviewsController.getStudySession);
router.post("/cards/:id", reviewsController.reviewCard);
router.get("/session/stats", reviewsController.getSessionStats);

module.exports = router;
