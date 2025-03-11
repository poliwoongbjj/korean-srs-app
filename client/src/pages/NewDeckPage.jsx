// pages/NewDeckPage.jsx - Create new deck page

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import decksService from "@/services/decks.service";
import "./DeckForm.css";

const NewDeckPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});

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

        const response = await decksService.createDeck(formData);

        // Navigate to the new deck page
        navigate(`/decks/${response.data.id}`);
      } catch (err) {
        console.error("Error creating deck:", err);
        setError(
          err.response?.data?.message ||
            "Failed to create deck. Please try again."
        );
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <div className="deck-form-page">
      <div className="deck-form-container">
        <h1>Create New Deck</h1>

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
              onClick={() => navigate("/dashboard")}
              disabled={submitting}
            >
              Cancel
            </button>
            <button type="submit" className="primary-btn" disabled={submitting}>
              {submitting ? "Creating..." : "Create Deck"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewDeckPage;
