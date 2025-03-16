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

    // Order by ID
    query += " ORDER BY id";

    // Use the new queryWithLimit function for pagination
    const cards = await db.queryWithLimit(query, params, limit, offset);

    // Get total count without limit
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
 * Get cards due for review
 */
exports.getDueCards = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { limit = 20, deckId, categoryId } = req.query;

    // Use SRS service to get due cards
    const dueCards = await srsService.getDueCards(
      userId,
      parseInt(limit),
      deckId ? parseInt(deckId) : null,
      req.query.orderBy || "random",
      categoryId ? parseInt(categoryId) : null
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
    const { limit = 10, deckId, categoryId } = req.query;

    // Use SRS service to get new cards
    const newCards = await srsService.getNewCards(
      userId,
      parseInt(limit),
      deckId ? parseInt(deckId) : null,
      req.query.orderBy || "random",
      categoryId ? parseInt(categoryId) : null
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

    // Transaction to create all three card types
    const connection = await db.pool.getConnection();
    try {
      await connection.beginTransaction();

      // 1. Create the primary Korean → English card
      const result1 = await connection.query(
        `INSERT INTO cards (
          category_id, korean_text, english_text, romanization,
          example_sentence, pronunciation_notes, image_url, audio_url,
          card_type
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          category_id || null,
          korean_text,
          english_text,
          romanization || null,
          example_sentence || null,
          pronunciation_notes || null,
          image_url || null,
          audio_url || null,
          "recognition", // Indicate this is a recognition card (see Korean, guess English)
        ]
      );

      const primaryCardId = result1[0].insertId;

      // 2. Create the reverse English → Korean card
      const result2 = await connection.query(
        `INSERT INTO cards (
          category_id, korean_text, english_text, romanization,
          example_sentence, pronunciation_notes, image_url, audio_url,
          card_type, related_card_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          category_id || null,
          korean_text,
          english_text,
          romanization || null,
          example_sentence || null,
          pronunciation_notes || null,
          image_url || null,
          audio_url || null,
          "production", // Indicate this is a production card (see English, guess Korean)
          primaryCardId, // Link to the primary card
        ]
      );

      // 3. Create the spelling card (English → Korean with audio)
      const result3 = await connection.query(
        `INSERT INTO cards (
          category_id, korean_text, english_text, romanization,
          example_sentence, pronunciation_notes, image_url, audio_url,
          card_type, related_card_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          category_id || null,
          korean_text,
          english_text,
          romanization || null,
          example_sentence || null,
          pronunciation_notes || null,
          image_url || null,
          audio_url || null,
          "spelling", // Indicate this is a spelling card
          primaryCardId, // Link to the primary card
        ]
      );

      await connection.commit();

      // Get all three created cards
      const cards = await db.query(
        "SELECT * FROM cards WHERE id IN (?, ?, ?)",
        [primaryCardId, result2[0].insertId, result3[0].insertId]
      );

      res.status(201).json({
        success: true,
        message: "Three card types created successfully",
        data: cards,
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
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
    const existingCards = await db.query(
      "SELECT * FROM cards WHERE id = ? OR related_card_id = ?",
      [cardId, cardId]
    );

    if (existingCards.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Card not found",
      });
    }

    // Find the primary card (the one without related_card_id or with the lowest ID)
    const primaryCard =
      existingCards.find((card) => !card.related_card_id) ||
      existingCards.reduce((prev, curr) => (prev.id < curr.id ? prev : curr));

    // Get all related cards (including primary)
    const allCardIds = [
      primaryCard.id,
      ...existingCards
        .filter((card) => card.id !== primaryCard.id)
        .map((card) => card.id),
    ];

    // Update all cards
    await Promise.all(
      allCardIds.map((id) =>
        db.query(
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
            id,
          ]
        )
      )
    );

    // Get the updated cards
    const updatedCards = await db.query("SELECT * FROM cards WHERE id IN (?)", [
      allCardIds,
    ]);

    res.status(200).json({
      success: true,
      message: "All related cards updated successfully",
      data: updatedCards,
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

    // Find the primary card and all related cards
    const relatedCards = await db.query(
      "SELECT * FROM cards WHERE id = ? OR related_card_id = ?",
      [cardId, cardId]
    );

    if (relatedCards.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Card not found",
      });
    }

    // Get all card IDs to delete
    const cardIds = relatedCards.map((card) => card.id);

    // Delete all related cards
    await db.query("DELETE FROM cards WHERE id IN (?)", [cardIds]);

    res.status(200).json({
      success: true,
      message: `Successfully deleted ${cardIds.length} related cards`,
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
