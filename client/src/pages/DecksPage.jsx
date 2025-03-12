// pages/DecksPage.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import decksService from "@/services/decks.service";
import "./DecksPage.css";

const DecksPage = () => {
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDecks = async () => {
      try {
        setLoading(true);
        const response = await decksService.getAllDecks();
        setDecks(response.data);
      } catch (err) {
        console.error("Error loading decks:", err);
        setError("Failed to load decks. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchDecks();
  }, []);

  if (loading) {
    return (
      <div className="decks-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading decks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="decks-page">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <button
            className="primary-btn"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="decks-page">
      <div className="decks-header">
        <h1>Your Decks</h1>
        <Link to="/decks/new" className="add-deck-btn">
          <i className="fa fa-plus"></i> Add New Deck
        </Link>
      </div>

      {decks.length === 0 ? (
        <div className="empty-decks">
          <p>You haven't created any decks yet.</p>
          <Link to="/decks/new" className="primary-btn">
            Create Your First Deck
          </Link>
        </div>
      ) : (
        <div className="decks-grid">
          {decks.map((deck) => (
            <div key={deck.id} className="deck-card">
              <h3>{deck.name}</h3>
              <p>{deck.description}</p>
              <div className="deck-stats">
                <div className="deck-stat">
                  <span className="deck-stat-value">
                    {deck.total_cards || 0}
                  </span>
                  <span className="deck-stat-label">Cards</span>
                </div>
                <div className="deck-stat">
                  <span className="deck-stat-value">{deck.due_cards || 0}</span>
                  <span className="deck-stat-label">Due</span>
                </div>
              </div>
              <div className="deck-actions">
                <Link to={`/study/${deck.id}`} className="study-btn">
                  Study
                </Link>
                <Link to={`/decks/${deck.id}`} className="manage-btn">
                  Manage
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DecksPage;
