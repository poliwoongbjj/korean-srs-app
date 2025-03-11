// routes/cards.routes.js - Card routes

const express = require("express");
const router = express.Router();
const cardsController = require("../controllers/cards.controller");
const { protect } = require("../middleware/auth.middleware");

// Public routes (for browsing cards)
router.get("/", cardsController.getAllCards);
router.get("/:id", cardsController.getCardById);

// Protected routes (require authentication)
router.post("/", protect, cardsController.createCard);
router.put("/:id", protect, cardsController.updateCard);
router.delete("/:id", protect, cardsController.deleteCard);

// SRS-specific routes
router.get("/study/due", protect, cardsController.getDueCards);
router.get("/study/new", protect, cardsController.getNewCards);
router.post("/:id/review", protect, cardsController.reviewCard);
router.get("/:id/progress", protect, cardsController.getCardProgress);

module.exports = router;
