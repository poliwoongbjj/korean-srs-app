// controllers/decks.controller.js - Decks controller

const db = require("../config/database");

/**
 * Get all decks for current user
 */
exports.getAllDecks = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    // Get decks with card counts
    const query = `
      SELECT d.*, 
             COUNT(DISTINCT dc.card_id) as total_cards,
             SUM(
               CASE WHEN uc.next_review <= NOW() THEN 1 ELSE 0 END
             ) as due_cards
      FROM decks d
      LEFT JOIN deck_cards dc ON d.id = dc.deck_id
      LEFT JOIN user_cards uc ON dc.card_id = uc.card_id AND uc.user_id = ?
      WHERE d.user_id = ?
      GROUP BY d.id
      ORDER BY d.created_at DESC
    `;

    const decks = await db.query(query, [userId, userId]);

    res.status(200).json({
      success: true,
      count: decks.length,
      data: decks,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single deck by ID
 */
exports.getDeckById = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const deckId = req.params.id;

    // Get deck details
    const decks = await db.query(
      "SELECT * FROM decks WHERE id = ? AND user_id = ?",
      [deckId, userId]
    );

    if (decks.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Deck not found",
      });
    }

    // Get cards in deck
    const cardsQuery = `
      SELECT c.*, 
             CASE WHEN uc.user_id IS NOT NULL THEN 1 ELSE 0 END as is_studied,
             CASE WHEN uc.next_review <= NOW() THEN 1 ELSE 0 END as is_due
      FROM deck_cards dc
      JOIN cards c ON dc.card_id = c.id
      LEFT JOIN user_cards uc ON c.id = uc.card_id AND uc.user_id = ?
      WHERE dc.deck_id = ?
      ORDER BY c.korean_text
    `;

    const cards = await db.query(cardsQuery, [userId, deckId]);

    // Count stats
    const stats = {
      totalCards: cards.length,
      studiedCards: cards.filter((card) => card.is_studied === 1).length,
      dueCards: cards.filter((card) => card.is_due === 1).length,
    };

    res.status(200).json({
      success: true,
      data: {
        deck: decks[0],
        cards,
        stats,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new deck
 */
exports.createDeck = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { name, description } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Deck name is required",
      });
    }

    // Insert deck
    const result = await db.query(
      "INSERT INTO decks (user_id, name, description) VALUES (?, ?, ?)",
      [userId, name, description || null]
    );

    // Get the created deck
    const decks = await db.query("SELECT * FROM decks WHERE id = ?", [
      result.insertId,
    ]);

    res.status(201).json({
      success: true,
      message: "Deck created successfully",
      data: decks[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a deck
 */
exports.updateDeck = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const deckId = req.params.id;
    const { name, description } = req.body;

    // Check if deck exists and belongs to user
    const existingDecks = await db.query(
      "SELECT * FROM decks WHERE id = ? AND user_id = ?",
      [deckId, userId]
    );

    if (existingDecks.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Deck not found",
      });
    }

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Deck name is required",
      });
    }

    // Update deck
    await db.query(
      `UPDATE decks 
       SET name = ?, 
           description = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [name, description || null, deckId]
    );

    // Get the updated deck
    const updatedDecks = await db.query("SELECT * FROM decks WHERE id = ?", [
      deckId,
    ]);

    res.status(200).json({
      success: true,
      message: "Deck updated successfully",
      data: updatedDecks[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a deck
 */
exports.deleteDeck = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const deckId = req.params.id;

    // Check if deck exists and belongs to user
    const existingDecks = await db.query(
      "SELECT * FROM decks WHERE id = ? AND user_id = ?",
      [deckId, userId]
    );

    if (existingDecks.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Deck not found",
      });
    }

    // Delete deck (cascade will delete deck_cards entries)
    await db.query("DELETE FROM decks WHERE id = ?", [deckId]);

    res.status(200).json({
      success: true,
      message: "Deck deleted successfully",
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add a card to a deck
 */
exports.addCardToDeck = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const deckId = req.params.id;
    const { cardId } = req.body;

    // Check if deck exists and belongs to user
    const existingDecks = await db.query(
      "SELECT * FROM decks WHERE id = ? AND user_id = ?",
      [deckId, userId]
    );

    if (existingDecks.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Deck not found",
      });
    }

    // Check if card exists
    const existingCards = await db.query("SELECT * FROM cards WHERE id = ?", [
      cardId,
    ]);

    if (existingCards.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Card not found",
      });
    }

    // Check if card is already in deck
    const existingDeckCards = await db.query(
      "SELECT * FROM deck_cards WHERE deck_id = ? AND card_id = ?",
      [deckId, cardId]
    );

    if (existingDeckCards.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Card is already in this deck",
      });
    }

    // Add card to deck
    await db.query("INSERT INTO deck_cards (deck_id, card_id) VALUES (?, ?)", [
      deckId,
      cardId,
    ]);

    res.status(200).json({
      success: true,
      message: "Card added to deck successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove a card from a deck
 */
exports.removeCardFromDeck = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const deckId = req.params.deckId;
    const cardId = req.params.cardId;

    // Check if deck exists and belongs to user
    const existingDecks = await db.query(
      "SELECT * FROM decks WHERE id = ? AND user_id = ?",
      [deckId, userId]
    );

    if (existingDecks.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Deck not found",
      });
    }

    // Remove card from deck
    await db.query("DELETE FROM deck_cards WHERE deck_id = ? AND card_id = ?", [
      deckId,
      cardId,
    ]);

    res.status(200).json({
      success: true,
      message: "Card removed from deck successfully",
    });
  } catch (error) {
    next(error);
  }
};
