// controllers/reviews.controller.js - Reviews controller

const db = require("../config/database");
const srsService = require("../services/srs.service");

/**
 * Get cards for a study session
 */
exports.getStudySession = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { deckId, newLimit = 5, dueLimit = 15 } = req.query;

    // First, get due cards
    const dueCards = await srsService.getDueCards(
      userId,
      parseInt(dueLimit),
      deckId ? parseInt(deckId) : null
    );

    // If we have enough due cards, return them
    if (dueCards.length >= parseInt(dueLimit)) {
      return res.status(200).json({
        success: true,
        count: dueCards.length,
        data: {
          cards: dueCards,
          newCount: 0,
          dueCount: dueCards.length,
        },
      });
    }

    // Otherwise, get some new cards to study
    const newCardsNeeded = Math.min(
      parseInt(newLimit),
      parseInt(dueLimit) - dueCards.length
    );

    const newCards = await srsService.getNewCards(
      userId,
      newCardsNeeded,
      deckId ? parseInt(deckId) : null
    );

    // Combine due and new cards
    const sessionCards = [...dueCards, ...newCards];

    // Add metadata to each card
    const cardsWithMeta = sessionCards.map((card, index) => ({
      ...card,
      currentIndex: index + 1,
      totalCards: sessionCards.length,
    }));

    res.status(200).json({
      success: true,
      count: cardsWithMeta.length,
      data: {
        cards: cardsWithMeta,
        newCount: newCards.length,
        dueCount: dueCards.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Review a card from the study session
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
 * Get study statistics for the current session
 */
exports.getSessionStats = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { sessionId } = req.params;

    // Get today's stats
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    const todayStatsQuery = `
      SELECT 
        COUNT(*) as total_reviews,
        AVG(rating) as avg_rating,
        SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as again_count,
        SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as hard_count,
        SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as good_count,
        SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as easy_count
      FROM review_history
      WHERE user_id = ? AND DATE(review_time) = ?
    `;

    const todayStats = await db.query(todayStatsQuery, [userId, today]);

    // Get current streak
    const userStats = await db.query(
      "SELECT streak_days FROM user_stats WHERE user_id = ?",
      [userId]
    );

    const streak = userStats.length > 0 ? userStats[0].streak_days : 0;

    res.status(200).json({
      success: true,
      data: {
        today: todayStats[0],
        streak,
      },
    });
  } catch (error) {
    next(error);
  }
};
