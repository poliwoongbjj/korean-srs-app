// services/cards.service.js - Cards API service

import api from "./api";

/**
 * Service for interacting with the cards API
 */
class CardsService {
  /**
   * Get all cards with optional filtering
   *
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - Response with cards data
   */
  async getAllCards(params = {}) {
    const response = await api.get("/cards", { params });
    return response.data;
  }

  /**
   * Get a card by ID
   *
   * @param {number} id - Card ID
   * @returns {Promise<Object>} - Response with card data
   */
  async getCardById(id) {
    const response = await api.get(`/cards/${id}`);
    return response.data;
  }

  /**
   * Create a new card
   *
   * @param {Object} cardData - Card data
   * @returns {Promise<Object>} - Response with created card
   */
  async createCard(cardData) {
    const response = await api.post("/cards", cardData);
    return response.data;
  }

  /**
   * Update a card
   *
   * @param {number} id - Card ID
   * @param {Object} cardData - Updated card data
   * @returns {Promise<Object>} - Response with updated card
   */
  async updateCard(id, cardData) {
    const response = await api.put(`/cards/${id}`, cardData);
    return response.data;
  }

  /**
   * Delete a card
   *
   * @param {number} id - Card ID
   * @returns {Promise<Object>} - Response with success message
   */
  async deleteCard(id) {
    const response = await api.delete(`/cards/${id}`);
    return response.data;
  }

  /**
   * Get cards due for review
   *
   * @param {Object} params - Query parameters (limit, deckId)
   * @returns {Promise<Object>} - Response with due cards
   */
  async getDueCards(params = {}) {
    const response = await api.get("/cards/study/due", { params });
    return response.data;
  }

  /**
   * Get new cards to learn
   *
   * @param {Object} params - Query parameters (limit, deckId)
   * @returns {Promise<Object>} - Response with new cards
   */
  async getNewCards(params = {}) {
    const response = await api.get("/cards/study/new", { params });
    return response.data;
  }

  /**
   * Review a card (update SRS data)
   *
   * @param {number} id - Card ID
   * @param {Object} reviewData - Review data (rating, timeTakenMs)
   * @returns {Promise<Object>} - Response with updated SRS data
   */
  async reviewCard(id, reviewData) {
    const response = await api.post(`/cards/${id}/review`, reviewData);
    return response.data;
  }

  /**
   * Get card learning progress
   *
   * @param {number} id - Card ID
   * @returns {Promise<Object>} - Response with card progress data
   */
  async getCardProgress(id) {
    const response = await api.get(`/cards/${id}/progress`);
    return response.data;
  }

  /**
   * Get all categories
   *
   * @returns {Promise<Object>} - Response with categories data
   */
  async getCategories() {
    const response = await api.get("/categories");
    return response.data;
  }
}

export default new CardsService();
