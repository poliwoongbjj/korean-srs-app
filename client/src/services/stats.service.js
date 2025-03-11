// services/stats.service.js - Stats API service

import api from "./api";

/**
 * Service for interacting with the stats API
 */
class StatsService {
  /**
   * Get user statistics
   *
   * @returns {Promise<Object>} - Response with user stats
   */
  async getUserStats() {
    const response = await api.get("/stats");
    return response.data;
  }

  /**
   * Get review history
   *
   * @param {Object} params - Query parameters (days, limit, offset)
   * @returns {Promise<Object>} - Response with review history
   */
  async getReviewHistory(params = {}) {
    const response = await api.get("/stats/history", { params });
    return response.data;
  }

  /**
   * Get performance by category
   *
   * @returns {Promise<Object>} - Response with category performance
   */
  async getCategoryPerformance() {
    const response = await api.get("/stats/categories");
    return response.data;
  }
}

export default new StatsService();
