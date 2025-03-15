// pages/EditDeckPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import decksService from "@/services/decks.service";
import "./DeckForm.css"; // Reusing your existing CSS

const EditDeckPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  // Load deck data
  useEffect(() => {
    const fetchDeck = async () => {
      try {
        setLoading(true);
        const response = await decksService.getDeckById(id);
        setFormData({
          name: response.data.deck.name,
          description: response.data.deck.description || "",
        });
      } catch (err) {
        console.error("Error loading deck:", err);
        setError("Failed to load deck data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchDeck();
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

    if (!formData.name.trim()) {
      errors.name = "Deck name is required";
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
        await decksService.updateDeck(id, formData);
        navigate(`/decks/${id}`);
      } catch (err) {
        console.error("Error updating deck:", err);
        setError(
          err.response?.data?.message ||
            "Failed to update deck. Please try again."
        );
      } finally {
        setSubmitting(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="deck-form-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading deck data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="deck-form-page">
      <div className="deck-form-container">
        <h1>Edit Deck</h1>

        {error && <div className="form-error">{error}</div>}

        <form className="deck-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Deck Name*</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={formErrors.name ? "error" : ""}
              placeholder="e.g., Korean Basics, Travel Phrases, etc."
            />
            {formErrors.name && (
              <div className="error-message">{formErrors.name}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              placeholder="Optional description of this deck's content"
            ></textarea>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="secondary-btn"
              onClick={() => navigate(`/decks/${id}`)}
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

export default EditDeckPage;
