// routes/categories.routes.js - Categories routes

const express = require("express");
const router = express.Router();
const categoriesController = require("../controllers/categories.controller");
const { protect } = require("../middleware/auth.middleware");

// Public routes
router.get("/", categoriesController.getAllCategories);
router.get("/:id", categoriesController.getCategoryById);

// Protected routes (require admin privilege)
router.post("/", protect, categoriesController.createCategory);
router.put("/:id", protect, categoriesController.updateCategory);
router.delete("/:id", protect, categoriesController.deleteCategory);

module.exports = router;
