// services/categories.service.js - Categories API service

import api from "./api";

/**
 * Service for interacting with the categories API
 */
class CategoriesService {
  /**
   * Get all categories
   *
   * @returns {Promise<Object>} - Response with categories data
   */
  async getAllCategories() {
    const response = await api.get("/categories");
    return response.data;
  }

  /**
   * Get a category by ID
   *
   * @param {number} id - Category ID
   * @returns {Promise<Object>} - Response with category data
   */
  async getCategoryById(id) {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  }

  /**
   * Create a new category
   *
   * @param {Object} categoryData - Category data
   * @returns {Promise<Object>} - Response with created category
   */
  async createCategory(categoryData) {
    const response = await api.post("/categories", categoryData);
    return response.data;
  }

  /**
   * Update a category
   *
   * @param {number} id - Category ID
   * @param {Object} categoryData - Updated category data
   * @returns {Promise<Object>} - Response with updated category
   */
  async updateCategory(id, categoryData) {
    const response = await api.put(`/categories/${id}`, categoryData);
    return response.data;
  }

  /**
   * Delete a category
   *
   * @param {number} id - Category ID
   * @returns {Promise<Object>} - Response with success message
   */
  async deleteCategory(id) {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  }
}

export default new CategoriesService();
