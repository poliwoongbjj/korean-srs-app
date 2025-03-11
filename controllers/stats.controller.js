const db = require("../config/database");

/**
 * Get user stats
 */
exports.getUserStats = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    // Get user stats
    let userStats = await db.query(
      "SELECT * FROM user_stats WHERE user_id = ?",
      [userId]
    );

    // If user has no stats entry yet, create one with defaults
    if (userStats.length === 0) {
      try {
        await db.query(
          "INSERT INTO user_stats (user_id, cards_studied, total_reviews, streak_days) VALUES (?, 0, 0, 0)",
          [userId]
        );

        userStats = [
          {
            user_id: userId,
            cards_studied: 0,
            total_reviews: 0,
            streak_days: 0,
            last_study_date: null,
          },
        ];
      } catch (insertError) {
        console.error("Error creating user stats:", insertError);
      }
    }

    // Get reviews today
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const reviewsTodayResult = await db.query(
      `SELECT COUNT(*) as count 
       FROM review_history 
       WHERE user_id = ? AND DATE(review_time) = ?`,
      [userId, today]
    );
    const reviewsToday = reviewsTodayResult[0].count;

    // Get due cards count
    const dueCardsResult = await db.query(
      `SELECT COUNT(*) as count 
       FROM user_cards 
       WHERE user_id = ? AND next_review <= NOW()`,
      [userId]
    );
    const dueCards = dueCardsResult[0].count;

    // Get total cards for user (cards they've seen)
    const totalCardsResult = await db.query(
      `SELECT COUNT(*) as count 
       FROM user_cards 
       WHERE user_id = ?`,
      [userId]
    );
    const totalUserCards = totalCardsResult[0].count;

    // Get total cards in system
    const allCardsResult = await db.query(
      "SELECT COUNT(*) as count FROM cards"
    );
    const totalSystemCards = allCardsResult[0].count;

    // Calculate how many new cards are available
    const newCardsResult = await db.query(
      `SELECT COUNT(*) as count 
       FROM cards 
       WHERE id NOT IN (
         SELECT card_id FROM user_cards WHERE user_id = ?
       )`,
      [userId]
    );
    const newCards = newCardsResult[0].count;

    // Get average performance
    const avgPerformanceResult = await db.query(
      `SELECT AVG(rating) as avg_rating 
       FROM review_history 
       WHERE user_id = ?`,
      [userId]
    );
    const avgRating = avgPerformanceResult[0].avg_rating || 0;

    // Weekly review stats
    const weeklyStatsQuery = `
      SELECT 
        DATE(review_time) as date,
        COUNT(*) as reviews_count,
        AVG(rating) as avg_rating
      FROM review_history
      WHERE user_id = ? 
      AND review_time >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DATE(review_time)
      ORDER BY date
    `;

    const weeklyStats = await db.query(weeklyStatsQuery, [userId]);

    res.status(200).json({
      success: true,
      data: {
        ...userStats[0],
        reviews_today: reviewsToday,
        due_cards: dueCards,
        new_cards: newCards,
        total_cards: totalSystemCards,
        cards_studied: totalUserCards,
        avg_rating: parseFloat(avgRating).toFixed(2),
        weekly_stats: weeklyStats,
      },
    });
  } catch (error) {
    console.error("Error getting user stats:", error);
    next(error);
  }
};

/**
 * Get review history
 */
exports.getReviewHistory = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { days = 30, limit = 100, offset = 0 } = req.query;

    // Query recent review history with card details
    const historyQuery = `
      SELECT 
        rh.id,
        rh.card_id,
        rh.rating,
        rh.review_time,
        rh.time_taken_ms,
        c.korean_text,
        c.english_text
      FROM review_history rh
      JOIN cards c ON rh.card_id = c.id
      WHERE rh.user_id = ? 
      AND rh.review_time >= DATE_SUB(NOW(), INTERVAL ? DAY)
      ORDER BY rh.review_time DESC
      LIMIT ? OFFSET ?
    `;

    const history = await db.query(historyQuery, [
      userId,
      parseInt(days),
      parseInt(limit),
      parseInt(offset),
    ]);

    // Get total count
    const totalCountResult = await db.query(
      `SELECT COUNT(*) as count 
       FROM review_history 
       WHERE user_id = ? 
       AND review_time >= DATE_SUB(NOW(), INTERVAL ? DAY)`,
      [userId, parseInt(days)]
    );
    const totalCount = totalCountResult[0].count;

    res.status(200).json({
      success: true,
      count: history.length,
      total: totalCount,
      data: history,
    });
  } catch (error) {
    console.error("Error getting review history:", error);
    next(error);
  }
};

/**
 * Get performance by card category
 */
exports.getCategoryPerformance = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    // Query to get performance by category
    const categoryQuery = `
      SELECT 
        c.category_id,
        cat.name as category_name,
        COUNT(DISTINCT c.id) as total_cards,
        COUNT(DISTINCT uc.card_id) as studied_cards,
        AVG(uc.ease_factor) as avg_ease,
        SUM(CASE WHEN uc.next_review <= NOW() THEN 1 ELSE 0 END) as due_cards
      FROM cards c
      LEFT JOIN categories cat ON c.category_id = cat.id
      LEFT JOIN user_cards uc ON c.id = uc.card_id AND uc.user_id = ?
      GROUP BY c.category_id, cat.name
      ORDER BY cat.name
    `;

    const categoryStats = await db.query(categoryQuery, [userId]);

    res.status(200).json({
      success: true,
      count: categoryStats.length,
      data: categoryStats,
    });
  } catch (error) {
    console.error("Error getting category performance:", error);
    next(error);
  }
};
