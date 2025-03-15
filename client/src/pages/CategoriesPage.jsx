// pages/CategoriesPage.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import categoriesService from "@/services/categories.service";
import "./CategoriesPage.css";

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: "", description: "" });
  const [editCategory, setEditCategory] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoriesService.getAllCategories();
      setCategories(response.data);
    } catch (err) {
      console.error("Error loading categories:", err);
      setError("Failed to load categories. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      await categoriesService.createCategory(newCategory);
      setNewCategory({ name: "", description: "" });
      setShowAddModal(false);
      fetchCategories();
    } catch (err) {
      console.error("Error creating category:", err);
      setError("Failed to create category. Please try again.");
    }
  };

  const handleEditCategory = async (e) => {
    e.preventDefault();
    try {
      await categoriesService.updateCategory(editCategory.id, editCategory);
      setEditCategory(null);
      fetchCategories();
    } catch (err) {
      console.error("Error updating category:", err);
      setError("Failed to update category. Please try again.");
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await categoriesService.deleteCategory(id);
        fetchCategories();
      } catch (err) {
        console.error("Error deleting category:", err);
        setError("Failed to delete category. Please try again.");
      }
    }
  };

  if (loading && categories.length === 0) {
    return (
      <div className="categories-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="categories-page">
      <div className="categories-header">
        <h1>Categories</h1>
        <button
          className="add-category-btn"
          onClick={() => setShowAddModal(true)}
        >
          <i className="fa fa-plus"></i> Add Category
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="categories-grid">
        {categories.map((category) => (
          <div key={category.id} className="category-card">
            <h3>{category.name}</h3>
            <p>{category.description}</p>
            <div className="category-actions">
              <button
                className="edit-btn"
                onClick={() => setEditCategory(category)}
              >
                <i className="fa fa-edit"></i> Edit
              </button>
              <button
                className="delete-btn"
                onClick={() => handleDeleteCategory(category.id)}
              >
                <i className="fa fa-trash"></i> Delete
              </button>
              <Link to={`/categories/${category.id}`} className="view-btn">
                <i className="fa fa-eye"></i> View Cards
              </Link>
            </div>
          </div>
        ))}

        {categories.length === 0 && !loading && (
          <div className="empty-categories">
            <p>
              No categories found. Create your first category to get started.
            </p>
            <button
              className="primary-btn"
              onClick={() => setShowAddModal(true)}
            >
              Create Category
            </button>
          </div>
        )}
      </div>

      {/* Add Category Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2>Add New Category</h2>
              <button
                className="close-btn"
                onClick={() => setShowAddModal(false)}
              >
                <i className="fa fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleAddCategory}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="name">Category Name *</label>
                  <input
                    type="text"
                    id="name"
                    value={newCategory.name}
                    onChange={(e) =>
                      setNewCategory({ ...newCategory, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    value={newCategory.description}
                    onChange={(e) =>
                      setNewCategory({
                        ...newCategory,
                        description: e.target.value,
                      })
                    }
                    rows="3"
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="primary-btn">
                  Add Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {editCategory && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2>Edit Category</h2>
              <button
                className="close-btn"
                onClick={() => setEditCategory(null)}
              >
                <i className="fa fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleEditCategory}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="edit-name">Category Name *</label>
                  <input
                    type="text"
                    id="edit-name"
                    value={editCategory.name}
                    onChange={(e) =>
                      setEditCategory({ ...editCategory, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-description">Description</label>
                  <textarea
                    id="edit-description"
                    value={editCategory.description}
                    onChange={(e) =>
                      setEditCategory({
                        ...editCategory,
                        description: e.target.value,
                      })
                    }
                    rows="3"
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setEditCategory(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="primary-btn">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;
