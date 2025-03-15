// routes/settings.routes.js
const express = require("express");
const router = express.Router();
const settingsController = require("../controllers/settings.controller");
const { protect } = require("../middleware/auth.middleware");

// All routes require authentication
router.use(protect);

router.get("/study", settingsController.getStudyPreferences);
router.put("/study", settingsController.updateStudyPreferences);

module.exports = router;
