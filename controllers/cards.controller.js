// controllers/cards.controller.js - Cards controller

const db = require("../config/database");
const srsService = require("../services/srs.service");

/**
 * Get all cards
 */
exports.getAllCards = async (req, res, next) => {
  try {
    const { category, search, limit = 50, offset = 0 } = req.query;

    let query = "SELECT * FROM cards";
    const params = [];

    // Apply filters
    if (category || search) {
      query += " WHERE";

      if (category) {
        query += " category_id = ?";
        params.push(category);
      }

      if (search) {
        if (category) query += " AND";
        query +=
          " (korean_text LIKE ? OR english_text LIKE ? OR romanization LIKE ?)";
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }
    }

    // Pagination
    query += " ORDER BY id LIMIT ? OFFSET ?";
    params.push(parseInt(limit), parseInt(offset));

    const cards = await db.query(query, params);
    const totalRows = await db.query("SELECT COUNT(*) as count FROM cards");
    const totalCount = totalRows[0].count;

    res.status(200).json({
      success: true,
      count: cards.length,
      total: totalCount,
      data: cards,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single card by ID
 */
exports.getCardById = async (req, res, next) => {
  try {
    const cardId = req.params.id;

    const cards = await db.query("SELECT * FROM cards WHERE id = ?", [cardId]);

    if (cards.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Card not found",
      });
    }

    res.status(200).json({
      success: true,
      data: cards[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new card
 */
exports.createCard = async (req, res, next) => {
  try {
    const {
      category_id,
      korean_text,
      english_text,
      romanization,
      example_sentence,
      pronunciation_notes,
      image_url,
      audio_url,
    } = req.body;

    // Validate required fields
    if (!korean_text || !english_text) {
      return res.status(400).json({
        success: false,
        message: "Korean text and English text are required",
      });
    }

    // Insert card - Convert any undefined values to null
    const result = await db.query(
      `INSERT INTO cards (
        category_id, korean_text, english_text, romanization,
        example_sentence, pronunciation_notes, image_url, audio_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        category_id || null,
        korean_text,
        english_text,
        romanization || null,
        example_sentence || null,
        pronunciation_notes || null,
        image_url || null,
        audio_url || null,
      ]
    );

    // Get the created card
    const cards = await db.query("SELECT * FROM cards WHERE id = ?", [
      result.insertId,
    ]);

    res.status(201).json({
      success: true,
      message: "Card created successfully",
      data: cards[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a card
 */
exports.updateCard = async (req, res, next) => {
  try {
    const cardId = req.params.id;

    const {
      category_id,
      korean_text,
      english_text,
      romanization,
      example_sentence,
      pronunciation_notes,
      image_url,
      audio_url,
    } = req.body;

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

    // Update card
    await db.query(
      `UPDATE cards 
       SET category_id = ?, 
           korean_text = ?, 
           english_text = ?, 
           romanization = ?,
           example_sentence = ?, 
           pronunciation_notes = ?, 
           image_url = ?, 
           audio_url = ?
       WHERE id = ?`,
      [
        category_id || null,
        korean_text,
        english_text,
        romanization || null,
        example_sentence || null,
        pronunciation_notes || null,
        image_url || null,
        audio_url || null,
        cardId,
      ]
    );

    // Get the updated card
    const updatedCards = await db.query("SELECT * FROM cards WHERE id = ?", [
      cardId,
    ]);

    res.status(200).json({
      success: true,
      message: "Card updated successfully",
      data: updatedCards[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a card
 */
exports.deleteCard = async (req, res, next) => {
  try {
    const cardId = req.params.id;

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

    // Delete card
    await db.query("DELETE FROM cards WHERE id = ?", [cardId]);

    res.status(200).json({
      success: true,
      message: "Card deleted successfully",
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get cards due for review
 */
exports.getDueCards = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { limit = 20, deckId } = req.query;

    const dueCards = await srsService.getDueCards(
      userId,
      parseInt(limit),
      deckId
    );

    res.status(200).json({
      success: true,
      count: dueCards.length,
      data: dueCards,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get new cards to learn
 */
exports.getNewCards = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { limit = 10, deckId } = req.query;

    const newCards = await srsService.getNewCards(
      userId,
      parseInt(limit),
      deckId
    );

    res.status(200).json({
      success: true,
      count: newCards.length,
      data: newCards,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Review a card (update SRS data)
 */
exports.reviewCard = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const cardId = req.params.id;
    const { rating, timeTakenMs } = req.body;

    // Validate rating
    if (!rating || rating < 1 || rating > 4) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 4",
      });
    }

    // Update card progress
    const updatedStats = await srsService.updateCardProgress(
      userId,
      cardId,
      parseInt(rating),
      timeTakenMs
    );

    res.status(200).json({
      success: true,
      message: "Card review recorded successfully",
      data: updatedStats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get card learning progress for a user
 */
exports.getCardProgress = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const cardId = req.params.id;

    const progress = await db.query(
      "SELECT * FROM user_cards WHERE user_id = ? AND card_id = ?",
      [userId, cardId]
    );

    if (progress.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No progress data found for this card",
      });
    }

    res.status(200).json({
      success: true,
      data: progress[0],
    });
  } catch (error) {
    next(error);
  }
};
