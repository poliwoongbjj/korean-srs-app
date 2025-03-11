// pages/DashboardPage.jsx - Dashboard page

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@contexts/AuthContext";
import cardsService from "@services/cards.service";
import "./DashboardPage.css";

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [stats, setStats] = useState({
    dueCards: 0,
    newCards: 0,
    totalCards: 0,
    streak: 0,
    reviewsToday: 0,
  });
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: "/dashboard" } });
    }
  }, [isAuthenticated, navigate]);

  // Load dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Get user stats from API
        const statsResponse = await fetch("/api/stats");
        const statsData = await statsResponse.json();

        // Get due cards count
        const dueResponse = await cardsService.getDueCards();
        const dueCount = dueResponse.count;

        // Get new cards count
        const newResponse = await cardsService.getNewCards();
        const newCount = newResponse.count;

        // Get total cards count
        const allCardsResponse = await cardsService.getAllCards({ limit: 1 });
        const totalCount = allCardsResponse.total;

        // Update stats
        setStats({
          dueCards: dueCount,
          newCards: newCount,
          totalCards: totalCount,
          streak: statsData.data.streak_days || 0,
          reviewsToday: statsData.data.reviews_today || 0,
        });

        // Get decks
        const decksResponse = await fetch("/api/decks");
        const decksData = await decksResponse.json();
        setDecks(decksData.data);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated]);

  // Start study session
  const startStudy = (deckId = null) => {
    if (deckId) {
      navigate(`/study/${deckId}`);
    } else {
      navigate("/study");
    }
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
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
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Welcome, {user?.username}!</h1>
        {stats.streak > 0 && (
          <div className="streak-badge">
            <span className="streak-icon">🔥</span>
            <span className="streak-value">{stats.streak} day streak</span>
          </div>
        )}
      </div>

      <div className="dashboard-content">
        <div className="stats-overview">
          <div className="stat-card">
            <div className="stat-value">{stats.dueCards}</div>
            <div className="stat-label">Due Today</div>
            {stats.dueCards > 0 && (
              <button className="primary-btn" onClick={() => startStudy()}>
                Review Now
              </button>
            )}
          </div>

          <div className="stat-card">
            <div className="stat-value">{stats.newCards}</div>
            <div className="stat-label">New Cards</div>
            {stats.newCards > 0 && (
              <button className="secondary-btn" onClick={() => startStudy()}>
                Learn New
              </button>
            )}
          </div>

          <div className="stat-card">
            <div className="stat-value">{stats.totalCards}</div>
            <div className="stat-label">Total Cards</div>
            <Link to="/cards" className="text-link">
              Browse All
            </Link>
          </div>

          <div className="stat-card">
            <div className="stat-value">{stats.reviewsToday}</div>
            <div className="stat-label">Reviews Today</div>
          </div>
        </div>

        <div className="decks-section">
          <div className="section-header">
            <h2>Your Decks</h2>
            <Link to="/decks/new" className="add-link">
              <i className="fa fa-plus"></i> Add Deck
            </Link>
          </div>

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
                    <span className="deck-stat-value">
                      {deck.due_cards || 0}
                    </span>
                    <span className="deck-stat-label">Due</span>
                  </div>
                </div>
                <div className="deck-actions">
                  <button
                    className="primary-btn"
                    onClick={() => startStudy(deck.id)}
                    disabled={deck.due_cards === 0}
                  >
                    Study
                  </button>
                  <Link to={`/decks/${deck.id}`} className="text-link">
                    <i className="fa fa-cog"></i> Manage
                  </Link>
                </div>
              </div>
            ))}

            {decks.length === 0 && (
              <div className="empty-decks">
                <p>You haven't created any decks yet.</p>
                <Link to="/decks/new" className="primary-btn">
                  Create Your First Deck
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="quick-actions">
          <div className="section-header">
            <h2>Quick Actions</h2>
          </div>

          <div className="actions-grid">
            <Link to="/cards/new" className="action-card">
              <div className="action-icon">
                <i className="fa fa-plus-circle"></i>
              </div>
              <div className="action-text">
                <h3>Add New Card</h3>
                <p>Create a new Korean vocabulary card</p>
              </div>
            </Link>

            <Link to="/import" className="action-card">
              <div className="action-icon">
                <i className="fa fa-upload"></i>
              </div>
              <div className="action-text">
                <h3>Import Cards</h3>
                <p>Import cards from CSV or Anki file</p>
              </div>
            </Link>

            <Link to="/stats" className="action-card">
              <div className="action-icon">
                <i className="fa fa-chart-bar"></i>
              </div>
              <div className="action-text">
                <h3>Detailed Stats</h3>
                <p>View your learning progress</p>
              </div>
            </Link>

            <Link to="/settings" className="action-card">
              <div className="action-icon">
                <i className="fa fa-cog"></i>
              </div>
              <div className="action-text">
                <h3>Settings</h3>
                <p>Customize your learning experience</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
