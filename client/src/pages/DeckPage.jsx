// pages/DeckPage.jsx - View and manage a deck

import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import decksService from "@/services/decks.service";
import cardsService from "@/services/cards.service";
import "./DeckPage.css";

const DeckPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [deck, setDeck] = useState(null);
  const [cards, setCards] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [availableCards, setAvailableCards] = useState([]);
  const [selectedCardId, setSelectedCardId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Load deck data
  useEffect(() => {
    const fetchDeckData = async () => {
      try {
        setLoading(true);

        const response = await decksService.getDeckById(id);
        setDeck(response.data.deck);
        setCards(response.data.cards);
        setStats(response.data.stats);
      } catch (err) {
        console.error("Error loading deck:", err);
        setError("Failed to load deck. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchDeckData();
  }, [id]);

  // Get available cards when add card modal is opened
  useEffect(() => {
    const fetchAvailableCards = async () => {
      if (showAddCardModal) {
        try {
          // Get all cards
          const response = await cardsService.getAllCards({ limit: 100 });

          // Filter out cards already in deck
          const deckCardIds = cards.map((card) => card.id);
          const filteredCards = response.data.filter(
            (card) => !deckCardIds.includes(card.id)
          );

          setAvailableCards(filteredCards);
        } catch (err) {
          console.error("Error loading available cards:", err);
        }
      }
    };

    fetchAvailableCards();
  }, [showAddCardModal, cards]);

  // Handle adding card to deck
  const handleAddCardToDeck = async () => {
    if (!selectedCardId) return;

    try {
      await decksService.addCardToDeck(id, selectedCardId);

      // Refresh deck cards
      const response = await decksService.getDeckById(id);
      setCards(response.data.cards);
      setStats(response.data.stats);

      // Close modal and reset selection
      setShowAddCardModal(false);
      setSelectedCardId("");
      setSearchTerm("");
    } catch (err) {
      console.error("Error adding card to deck:", err);
      setError("Failed to add card to deck. Please try again.");
    }
  };

  // Handle removing card from deck
  const handleRemoveCardFromDeck = async (cardId) => {
    if (
      window.confirm("Are you sure you want to remove this card from the deck?")
    ) {
      try {
        await decksService.removeCardFromDeck(id, cardId);

        // Update cards list
        setCards(cards.filter((card) => card.id !== cardId));

        // Update stats
        setStats((prev) => ({
          ...prev,
          totalCards: prev.totalCards - 1,
        }));
      } catch (err) {
        console.error("Error removing card from deck:", err);
        setError("Failed to remove card from deck. Please try again.");
      }
    }
  };

  // Handle delete deck
  const handleDeleteDeck = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete this deck? This action cannot be undone."
      )
    ) {
      try {
        await decksService.deleteDeck(id);
        navigate("/dashboard");
      } catch (err) {
        console.error("Error deleting deck:", err);
        setError("Failed to delete deck. Please try again.");
      }
    }
  };

  // Start studying the deck
  const startStudy = () => {
    navigate(`/study/${id}`);
  };

  // Filter available cards by search term
  const filteredAvailableCards = availableCards.filter((card) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      card.korean_text.toLowerCase().includes(searchLower) ||
      card.english_text.toLowerCase().includes(searchLower) ||
      (card.romanization &&
        card.romanization.toLowerCase().includes(searchLower))
    );
  });

  if (loading) {
    return (
      <div className="deck-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading deck...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="deck-page">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <button
            className="primary-btn"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
          <Link to="/dashboard" className="secondary-btn">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!deck) {
    return (
      <div className="deck-page">
        <div className="error-container">
          <h2>Deck Not Found</h2>
          <p>
            The deck you're looking for doesn't exist or you don't have access
            to it.
          </p>
          <Link to="/dashboard" className="primary-btn">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="deck-page">
      <div className="deck-header">
        <div className="deck-info">
          <h1>{deck.name}</h1>
          <p className="deck-description">{deck.description}</p>
        </div>

        <div className="deck-actions">
          <button
            className="primary-btn"
            onClick={startStudy}
            disabled={cards.length === 0}
          >
            Study Deck
          </button>
          <button
            className="edit-btn"
            onClick={() => navigate(`/decks/${id}/edit`)}
          >
            <i className="fa fa-edit"></i> Edit Deck
          </button>
          <button className="delete-btn" onClick={handleDeleteDeck}>
            <i className="fa fa-trash"></i> Delete Deck
          </button>
        </div>
      </div>

      <div className="deck-stats">
        <div className="stat-item">
          <span className="stat-value">{stats?.totalCards || 0}</span>
          <span className="stat-label">Total Cards</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{stats?.studiedCards || 0}</span>
          <span className="stat-label">Studied</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{stats?.dueCards || 0}</span>
          <span className="stat-label">Due Today</span>
        </div>
      </div>

      <div className="deck-cards-header">
        <h2>Cards in Deck</h2>
        <button
          className="add-card-btn"
          onClick={() => setShowAddCardModal(true)}
        >
          <i className="fa fa-plus"></i> Add Cards
        </button>
      </div>

      {cards.length === 0 ? (
        <div className="empty-cards">
          <p>This deck doesn't have any cards yet.</p>
          <button
            className="primary-btn"
            onClick={() => setShowAddCardModal(true)}
          >
            Add Cards to Deck
          </button>
        </div>
      ) : (
        <div className="deck-cards">
          {cards.map((card) => (
            <div key={card.id} className="deck-card-item">
              <div className="card-content">
                <h3 className="korean-text">{card.korean_text}</h3>
                <p className="english-text">{card.english_text}</p>
                {card.romanization && (
                  <p className="romanization">{card.romanization}</p>
                )}
              </div>
              <div className="card-actions">
                <button
                  className="remove-btn"
                  onClick={() => handleRemoveCardFromDeck(card.id)}
                  title="Remove from deck"
                >
                  <i className="fa fa-times"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Card Modal */}
      {showAddCardModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2>Add Cards to Deck</h2>
              <button
                className="close-btn"
                onClick={() => setShowAddCardModal(false)}
              >
                <i className="fa fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Search cards..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>

              <div className="card-selector">
                <label htmlFor="card-select">Select a card:</label>
                <select
                  id="card-select"
                  value={selectedCardId}
                  onChange={(e) => setSelectedCardId(e.target.value)}
                  className="card-select"
                >
                  <option value="">Choose a card</option>

                  <optgroup label="Recognition Cards (Korean → English)">
                    {filteredAvailableCards
                      .filter(
                        (card) =>
                          !card.card_type || card.card_type === "recognition"
                      )
                      .map((card) => (
                        <option key={card.id} value={card.id}>
                          {card.korean_text} - {card.english_text}
                        </option>
                      ))}
                  </optgroup>

                  <optgroup label="Production Cards (English → Korean)">
                    {filteredAvailableCards
                      .filter((card) => card.card_type === "production")
                      .map((card) => (
                        <option key={card.id} value={card.id}>
                          {card.english_text} - {card.korean_text}
                        </option>
                      ))}
                  </optgroup>

                  <optgroup label="Spelling Cards">
                    {filteredAvailableCards
                      .filter((card) => card.card_type === "spelling")
                      .map((card) => (
                        <option key={card.id} value={card.id}>
                          {card.english_text} (Spelling)
                        </option>
                      ))}
                  </optgroup>
                </select>
              </div>

              {filteredAvailableCards.length === 0 && (
                <div className="no-cards-message">
                  {searchTerm ? (
                    <p>
                      No matching cards found. Try a different search or{" "}
                      <Link to="/cards/new">create a new card</Link>.
                    </p>
                  ) : (
                    <p>
                      No available cards to add.{" "}
                      <Link to="/cards/new">Create new cards</Link> first.
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                className="secondary-btn"
                onClick={() => setShowAddCardModal(false)}
              >
                Cancel
              </button>
              <button
                className="primary-btn"
                onClick={handleAddCardToDeck}
                disabled={!selectedCardId}
              >
                Add to Deck
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeckPage;
