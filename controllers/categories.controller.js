// controllers/categories.controller.js - Categories controller

const db = require("../config/database");

/**
 * Get all categories
 */
exports.getAllCategories = async (req, res, next) => {
  try {
    const categories = await db.query("SELECT * FROM categories ORDER BY name");

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    console.error("Error getting categories:", error);
    next(error);
  }
};

/**
 * Get a single category by ID
 */
exports.getCategoryById = async (req, res, next) => {
  try {
    const categoryId = req.params.id;

    const categories = await db.query("SELECT * FROM categories WHERE id = ?", [
      categoryId,
    ]);

    if (categories.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Get cards in this category
    const cards = await db.query("SELECT * FROM cards WHERE category_id = ?", [
      categoryId,
    ]);

    res.status(200).json({
      success: true,
      data: {
        category: categories[0],
        cards,
      },
    });
  } catch (error) {
    console.error("Error getting category by ID:", error);
    next(error);
  }
};

/**
 * Create a new category
 */
exports.createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    // Insert category
    const result = await db.query(
      "INSERT INTO categories (name, description) VALUES (?, ?)",
      [name, description || null]
    );

    // Get the created category
    const categories = await db.query("SELECT * FROM categories WHERE id = ?", [
      result.insertId,
    ]);

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: categories[0],
    });
  } catch (error) {
    console.error("Error creating category:", error);
    next(error);
  }
};

/**
 * Update a category
 */
exports.updateCategory = async (req, res, next) => {
  try {
    const categoryId = req.params.id;
    const { name, description } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    // Check if category exists
    const existingCategories = await db.query(
      "SELECT * FROM categories WHERE id = ?",
      [categoryId]
    );

    if (existingCategories.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Update category
    await db.query(
      "UPDATE categories SET name = ?, description = ? WHERE id = ?",
      [name, description || null, categoryId]
    );

    // Get the updated category
    const updatedCategories = await db.query(
      "SELECT * FROM categories WHERE id = ?",
      [categoryId]
    );

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: updatedCategories[0],
    });
  } catch (error) {
    console.error("Error updating category:", error);
    next(error);
  }
};

/**
 * Delete a category
 */
exports.deleteCategory = async (req, res, next) => {
  try {
    const categoryId = req.params.id;

    // Check if category exists
    const existingCategories = await db.query(
      "SELECT * FROM categories WHERE id = ?",
      [categoryId]
    );

    if (existingCategories.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Check if there are cards using this category
    const cardsUsingCategory = await db.query(
      "SELECT COUNT(*) as count FROM cards WHERE category_id = ?",
      [categoryId]
    );

    if (cardsUsingCategory[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. It's being used by ${cardsUsingCategory[0].count} cards. Update these cards first.`,
      });
    }

    // Delete category
    await db.query("DELETE FROM categories WHERE id = ?", [categoryId]);

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
      data: {},
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    next(error);
  }
};
