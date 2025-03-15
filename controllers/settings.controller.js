// controllers/settings.controller.js
const db = require("../config/database");

/**
 * Get user study preferences
 */
exports.getStudyPreferences = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    // Check if preferences exist
    const prefs = await db.query(
      "SELECT * FROM user_preferences WHERE user_id = ?",
      [userId]
    );

    if (prefs.length === 0) {
      // Return default preferences
      return res.status(200).json({
        success: true,
        data: {
          newCardsPerDay: 10,
          reviewsPerDay: 50,
          studyOrder: "random",
          theme: "light",
        },
      });
    }

    res.status(200).json({
      success: true,
      data: prefs[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user study preferences
 */
exports.updateStudyPreferences = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { newCardsPerDay, reviewsPerDay, studyOrder, theme } = req.body;

    // Validate input
    if (newCardsPerDay < 0 || reviewsPerDay < 0) {
      return res.status(400).json({
        success: false,
        message: "Values cannot be negative",
      });
    }

    // Check if preferences record exists
    const prefs = await db.query(
      "SELECT * FROM user_preferences WHERE user_id = ?",
      [userId]
    );

    if (prefs.length === 0) {
      // Create preferences record
      await db.query(
        `INSERT INTO user_preferences 
         (user_id, new_cards_per_day, reviews_per_day, study_order, theme) 
         VALUES (?, ?, ?, ?, ?)`,
        [userId, newCardsPerDay, reviewsPerDay, studyOrder, theme]
      );
    } else {
      // Update preferences
      await db.query(
        `UPDATE user_preferences 
         SET new_cards_per_day = ?, 
             reviews_per_day = ?, 
             study_order = ?,
             theme = ?
         WHERE user_id = ?`,
        [newCardsPerDay, reviewsPerDay, studyOrder, theme, userId]
      );
    }

    res.status(200).json({
      success: true,
      message: "Study preferences updated successfully",
      data: {
        newCardsPerDay,
        reviewsPerDay,
        studyOrder,
        theme,
      },
    });
  } catch (error) {
    next(error);
  }
};
