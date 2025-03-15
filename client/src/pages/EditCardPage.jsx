// pages/EditCardPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import cardsService from "@/services/cards.service";
import categoriesService from "@/services/categories.service";
import "./CardForm.css"; // Reusing your existing CSS

const EditCardPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    category_id: "",
    korean_text: "",
    english_text: "",
    romanization: "",
    example_sentence: "",
    pronunciation_notes: "",
    image_url: "",
    audio_url: "",
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  // Load card data and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch card data
        const cardResponse = await cardsService.getCardById(id);
        setFormData(cardResponse.data);

        // Fetch categories
        const categoriesResponse = await categoriesService.getAllCategories();
        setCategories(categoriesResponse.data);
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Failed to load card data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear validation error when user types
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: "",
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!formData.korean_text.trim()) {
      errors.korean_text = "Korean text is required";
    }

    if (!formData.english_text.trim()) {
      errors.english_text = "English text is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        setSubmitting(true);

        // Convert empty strings to null for optional fields
        const cardData = {
          ...formData,
          category_id: formData.category_id || null,
          romanization: formData.romanization || null,
          example_sentence: formData.example_sentence || null,
          pronunciation_notes: formData.pronunciation_notes || null,
          image_url: formData.image_url || null,
          audio_url: formData.audio_url || null,
        };

        await cardsService.updateCard(id, cardData);

        // Navigate to cards page after successful update
        navigate("/cards");
      } catch (err) {
        console.error("Error updating card:", err);
        setError(
          err.response?.data?.message ||
            "Failed to update card. Please try again."
        );
      } finally {
        setSubmitting(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="card-form-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading card data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card-form-page">
      <div className="card-form-container">
        <h1>Edit Card</h1>

        {error && <div className="form-error">{error}</div>}

        <form className="card-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="category_id">Category</label>
            <select
              id="category_id"
              name="category_id"
              value={formData.category_id || ""}
              onChange={handleChange}
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="korean_text">Korean Text*</label>
              <input
                type="text"
                id="korean_text"
                name="korean_text"
                value={formData.korean_text}
                onChange={handleChange}
                className={formErrors.korean_text ? "error" : ""}
              />
              {formErrors.korean_text && (
                <div className="error-message">{formErrors.korean_text}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="english_text">English Text*</label>
              <input
                type="text"
                id="english_text"
                name="english_text"
                value={formData.english_text}
                onChange={handleChange}
                className={formErrors.english_text ? "error" : ""}
              />
              {formErrors.english_text && (
                <div className="error-message">{formErrors.english_text}</div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="romanization">Romanization</label>
            <input
              type="text"
              id="romanization"
              name="romanization"
              value={formData.romanization || ""}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="example_sentence">Example Sentence</label>
            <textarea
              id="example_sentence"
              name="example_sentence"
              value={formData.example_sentence || ""}
              onChange={handleChange}
              rows="3"
            ></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="pronunciation_notes">Pronunciation Notes</label>
            <textarea
              id="pronunciation_notes"
              name="pronunciation_notes"
              value={formData.pronunciation_notes || ""}
              onChange={handleChange}
              rows="2"
            ></textarea>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="image_url">Image URL</label>
              <input
                type="text"
                id="image_url"
                name="image_url"
                value={formData.image_url || ""}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="audio_url">Audio URL</label>
              <input
                type="text"
                id="audio_url"
                name="audio_url"
                value={formData.audio_url || ""}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="secondary-btn"
              onClick={() => navigate("/cards")}
              disabled={submitting}
            >
              Cancel
            </button>
            <button type="submit" className="primary-btn" disabled={submitting}>
              {submitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCardPage;
