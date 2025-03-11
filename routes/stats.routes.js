// routes/stats.routes.js - Stats routes

const express = require("express");
const router = express.Router();
const statsController = require("../controllers/stats.controller");
const { protect } = require("../middleware/auth.middleware");

// All stats routes require authentication
router.use(protect);

// Stats routes
router.get("/", statsController.getUserStats);
router.get("/history", statsController.getReviewHistory);
router.get("/categories", statsController.getCategoryPerformance);

module.exports = router;
