// services/srs.service.js - Spaced Repetition Service

const db = require("../config/database");

/**
 * Handles the spaced repetition algorithm similar to Anki's SuperMemo 2 algorithm
 */
class SpacedRepetitionService {
  constructor() {
    // Rating constants
    this.RATING = {
      AGAIN: 1, // Failed, short interval
      HARD: 2, // Difficult, but succeeded
      GOOD: 3, // Successful recall
      EASY: 4, // Very easy recall
    };

    // Default values
    this.MIN_EASE = 1.3; // Minimum ease factor
    this.MAX_INTERVAL = 365 * 10; // Maximum interval (10 years in days)
    this.NEW_INTERVAL = 1; // First successful interval (in days)
  }

  /**
   * Calculate next review interval based on current card stats and user rating
   *
   * @param {Object} cardStats - Current card statistics
   * @param {number} rating - User rating (1-4)
   * @returns {Object} - New card statistics
   */
  calculateNextReview(cardStats, rating) {
    let { ease_factor, review_interval, repetitions } = cardStats;
    let newEase = ease_factor;
    let newInterval = review_interval;
    let newRepetitions = repetitions;

    // Convert to numbers to be safe
    ease_factor = parseFloat(ease_factor);
    review_interval = parseInt(review_interval, 10);
    repetitions = parseInt(repetitions, 10);

    switch (rating) {
      case this.RATING.AGAIN: // Failed - reset
        newEase = Math.max(ease_factor - 0.2, this.MIN_EASE);
        newInterval = 1; // Reset to 1 day
        newRepetitions = 0;
        break;

      case this.RATING.HARD:
        newEase = Math.max(ease_factor - 0.15, this.MIN_EASE);
        // If first time, set to NEW_INTERVAL, otherwise use current interval * 1.2
        newInterval =
          repetitions === 0
            ? this.NEW_INTERVAL
            : Math.max(1, Math.round(review_interval * 1.2));
        newRepetitions = repetitions + 1;
        break;

      case this.RATING.GOOD:
        newEase = Math.max(ease_factor, this.MIN_EASE);
        // If first time, set to NEW_INTERVAL
        if (repetitions === 0) {
          newInterval = this.NEW_INTERVAL;
        } else if (repetitions === 1) {
          newInterval = 6; // Second successful review (6 days)
        } else {
          newInterval = Math.round(review_interval * ease_factor);
        }
        newRepetitions = repetitions + 1;
        break;

      case this.RATING.EASY:
        newEase = Math.max(ease_factor + 0.15, this.MIN_EASE);
        // If first time, jump to a longer interval
        if (repetitions === 0) {
          newInterval = 4; // Easy first review
        } else if (repetitions === 1) {
          newInterval = 10; // Easy second review
        } else {
          newInterval = Math.round(review_interval * ease_factor * 1.3);
        }
        newRepetitions = repetitions + 1;
        break;

      default:
        throw new Error("Invalid rating value");
    }

    // Cap the maximum interval
    newInterval = Math.min(newInterval, this.MAX_INTERVAL);

    // Calculate next review date
    const now = new Date();
    const nextReview = new Date();
    nextReview.setDate(now.getDate() + newInterval);

    return {
      ease_factor: newEase,
      review_interval: newInterval,
      repetitions: newRepetitions,
      last_review: now,
      next_review: nextReview,
    };
  }

  /**
   * Update a card's SRS data in the database after a review
   *
   * @param {number} userId - User ID
   * @param {number} cardId - Card ID
   * @param {number} rating - User rating (1-4)
   * @param {number} timeTakenMs - Time taken for review in milliseconds
   * @returns {Promise<Object>} - Updated card statistics
   */
  async updateCardProgress(userId, cardId, rating, timeTakenMs = 0) {
    try {
      // Get current card stats
      const userCardRows = await db.query(
        "SELECT * FROM user_cards WHERE user_id = ? AND card_id = ?",
        [userId, cardId]
      );

      let userCard;

      // If card doesn't exist for this user, create it
      if (userCardRows.length === 0) {
        await db.query(
          "INSERT INTO user_cards (user_id, card_id, ease_factor, review_interval, repetitions) VALUES (?, ?, 2.5, 0, 0)",
          [userId, cardId]
        );

        userCard = {
          user_id: userId,
          card_id: cardId,
          ease_factor: 2.5,
          review_interval: 0,
          repetitions: 0,
          last_review: new Date(),
          next_review: new Date(),
        };
      } else {
        userCard = userCardRows[0];
      }

      // Calculate new SRS data
      const newStats = this.calculateNextReview(userCard, rating);

      // Update card stats in database
      await db.query(
        `UPDATE user_cards 
   SET ease_factor = ?, 
       review_interval = ?, 
       repetitions = ?, 
       last_review = ?, 
       next_review = ?,
       updated_at = CURRENT_TIMESTAMP
   WHERE user_id = ? AND card_id = ?`,
        [
          newStats.ease_factor || null,
          newStats.review_interval || null,
          newStats.repetitions || null,
          newStats.last_review || null,
          newStats.next_review || null,
          userId,
          cardId,
        ]
      );

      // Record review history
      await db.query(
        "INSERT INTO review_history (user_id, card_id, rating, time_taken_ms) VALUES (?, ?, ?, ?)",
        [userId, cardId, rating, timeTakenMs]
      );

      // Update user stats
      await this.updateUserStats(userId);

      return {
        ...newStats,
        user_id: userId,
        card_id: cardId,
      };
    } catch (error) {
      console.error("Error updating card progress:", error);
      throw error;
    }
  }

  /**
   * Get cards due for review for a specific user
   *
   * @param {number} userId - User ID
   * @param {number} limit - Maximum number of cards to return
   * @param {number} deckId - Optional deck ID to filter by
   * @returns {Promise<Array>} - Array of due cards
   */
  async getDueCards(userId, limit = 20, deckId = null, orderBy = "random") {
    try {
      let query = `
        SELECT c.*, uc.ease_factor, uc.review_interval, uc.repetitions, uc.next_review
        FROM cards c
        JOIN user_cards uc ON c.id = uc.card_id
        WHERE uc.user_id = ? AND uc.next_review <= NOW()
      `;

      const params = [userId];

      // If deck ID is provided, filter by deck
      if (deckId) {
        query += ` AND c.id IN (SELECT card_id FROM deck_cards WHERE deck_id = ?)`;
        params.push(deckId);
      }

      // Order based on preference
      if (orderBy === "added") {
        query += ` ORDER BY CASE 
                  WHEN dc.deck_id IS NOT NULL THEN dc.added_at 
                  ELSE uc.created_at 
                END ASC, uc.repetitions ASC`;
      } else {
        // Default to the existing ordering
        // Order by cards that have been reviewed the least first, then by due date
        query += ` ORDER BY uc.repetitions ASC, uc.next_review ASC`;
      }

      // Use the new queryWithLimit function
      return await db.queryWithLimit(query, params, limit);
    } catch (error) {
      console.error("Error getting due cards:", error);
      throw error;
    }
  }

  /**
   * Get new cards to learn for a specific user
   *
   * @param {number} userId - User ID
   * @param {number} limit - Maximum number of cards to return
   * @param {number} deckId - Optional deck ID to filter by
   * @returns {Promise<Array>} - Array of new cards
   */
  async getNewCards(userId, limit = 10, deckId = null, orderBy = "random") {
    try {
      let query = `
        SELECT c.*
        FROM cards c
        LEFT JOIN deck_cards dc ON c.id = dc.card_id AND dc.deck_id = ?
        WHERE c.id NOT IN (
          SELECT card_id FROM user_cards WHERE user_id = ?
        )
      `;

      const params = [deckId || 0, userId];

      // If deck ID is provided, filter by deck
      if (deckId) {
        query += ` AND c.id IN (SELECT card_id FROM deck_cards WHERE deck_id = ?)`;
        params.push(deckId);
      }

      // Order based on preference
      if (orderBy === "added") {
        query += ` ORDER BY CASE WHEN dc.deck_id IS NOT NULL THEN dc.added_at ELSE c.created_at END ASC`;
      } else {
        // Random order
        query += ` ORDER BY RAND()`;
      }

      // Use the new queryWithLimit function
      return await db.queryWithLimit(query, params, limit);
    } catch (error) {
      console.error("Error getting new cards:", error);
      throw error;
    }
  }
  /**
   * Update user statistics after reviews
   *
   * @param {number} userId - User ID
   * @returns {Promise<void>}
   */
  async updateUserStats(userId) {
    try {
      // Check if user has stats record
      const userStatsRows = await db.query(
        "SELECT * FROM user_stats WHERE user_id = ?",
        [userId]
      );

      const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

      if (userStatsRows.length === 0) {
        // Create new stats record
        await db.query(
          "INSERT INTO user_stats (user_id, cards_studied, total_reviews, streak_days, last_study_date) VALUES (?, 1, 1, 1, ?)",
          [userId, today]
        );
      } else {
        const userStats = userStatsRows[0];

        // Get count of unique cards studied
        const cardsStudiedResult = await db.query(
          "SELECT COUNT(DISTINCT card_id) as count FROM user_cards WHERE user_id = ?",
          [userId]
        );
        const cardsStudied = cardsStudiedResult[0].count;

        // Get total reviews count
        const totalReviewsResult = await db.query(
          "SELECT COUNT(*) as count FROM review_history WHERE user_id = ?",
          [userId]
        );
        const totalReviews = totalReviewsResult[0].count;

        // Calculate streak
        let streak = userStats.streak_days;
        const lastStudyDate = userStats.last_study_date
          ? new Date(userStats.last_study_date)
          : null;

        if (lastStudyDate) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayString = yesterday.toISOString().split("T")[0];

          if (lastStudyDate.toISOString().split("T")[0] === yesterdayString) {
            // Studied yesterday, increment streak
            streak++;
          } else if (lastStudyDate.toISOString().split("T")[0] === today) {
            // Already studied today, keep streak the same
          } else {
            // Streak broken
            streak = 1;
          }
        } else {
          // First time studying
          streak = 1;
        }

        // Update stats
        await db.query(
          `UPDATE user_stats 
           SET cards_studied = ?, 
               total_reviews = ?, 
               streak_days = ?,
               last_study_date = ?
           WHERE user_id = ?`,
          [cardsStudied, totalReviews, streak, today, userId]
        );
      }
    } catch (error) {
      console.error("Error updating user stats:", error);
      throw error;
    }
  }
}

module.exports = new SpacedRepetitionService();
