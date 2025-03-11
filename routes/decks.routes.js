// routes/decks.routes.js - Deck routes

const express = require("express");
const router = express.Router();
const decksController = require("../controllers/decks.controller");
const { protect } = require("../middleware/auth.middleware");

// All deck routes require authentication
router.use(protect);

// Deck CRUD operations
router.get("/", decksController.getAllDecks);
router.get("/:id", decksController.getDeckById);
router.post("/", decksController.createDeck);
router.put("/:id", decksController.updateDeck);
router.delete("/:id", decksController.deleteDeck);

// Deck-card relationships
router.post("/:id/cards", decksController.addCardToDeck);
router.delete("/:deckId/cards/:cardId", decksController.removeCardFromDeck);

module.exports = router;
