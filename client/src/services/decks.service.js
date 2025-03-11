// services/decks.service.js - Decks API service

import api from "./api";

/**
 * Service for interacting with the decks API
 */
class DecksService {
  /**
   * Get all decks
   *
   * @returns {Promise<Object>} - Response with decks data
   */
  async getAllDecks() {
    const response = await api.get("/decks");
    return response.data;
  }

  /**
   * Get a deck by ID
   *
   * @param {number} id - Deck ID
   * @returns {Promise<Object>} - Response with deck data
   */
  async getDeckById(id) {
    const response = await api.get(`/decks/${id}`);
    return response.data;
  }

  /**
   * Create a new deck
   *
   * @param {Object} deckData - Deck data
   * @returns {Promise<Object>} - Response with created deck
   */
  async createDeck(deckData) {
    const response = await api.post("/decks", deckData);
    return response.data;
  }

  /**
   * Update a deck
   *
   * @param {number} id - Deck ID
   * @param {Object} deckData - Updated deck data
   * @returns {Promise<Object>} - Response with updated deck
   */
  async updateDeck(id, deckData) {
    const response = await api.put(`/decks/${id}`, deckData);
    return response.data;
  }

  /**
   * Delete a deck
   *
   * @param {number} id - Deck ID
   * @returns {Promise<Object>} - Response with success message
   */
  async deleteDeck(id) {
    const response = await api.delete(`/decks/${id}`);
    return response.data;
  }

  /**
   * Add a card to a deck
   *
   * @param {number} deckId - Deck ID
   * @param {number} cardId - Card ID
   * @returns {Promise<Object>} - Response with success message
   */
  async addCardToDeck(deckId, cardId) {
    const response = await api.post(`/decks/${deckId}/cards`, { cardId });
    return response.data;
  }

  /**
   * Remove a card from a deck
   *
   * @param {number} deckId - Deck ID
   * @param {number} cardId - Card ID
   * @returns {Promise<Object>} - Response with success message
   */
  async removeCardFromDeck(deckId, cardId) {
    const response = await api.delete(`/decks/${deckId}/cards/${cardId}`);
    return response.data;
  }
}

export default new DecksService();
