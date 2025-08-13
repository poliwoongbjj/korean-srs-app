// src/pages/DashboardPage.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/services/api";
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

        // Let's get user stats first as a simple check
        try {
          const statsResponse = await api.get("/stats");

          // Get other data...
          // If you don't have these endpoints implemented yet, comment them out

          // Get due cards count
          const dueResponse = await api.get("/cards/study/due");
          const dueCount = dueResponse.data.count;

          // Get new cards count
          const newResponse = await api.get("/cards/study/new");
          const newCount = newResponse.data.count;

          // Get total cards count
          const allCardsResponse = await api.get("/cards");
          const totalCount = allCardsResponse.data.total;

          // Update stats
          setStats({
            dueCards: dueCount,
            newCards: newCount,
            totalCards: totalCount,
            streak: statsResponse.data.data.streak_days || 0,
            reviewsToday: statsResponse.data.data.reviews_today || 0,
          });

          // Get decks
          const decksResponse = await api.get("/decks");
          setDecks(decksResponse.data.data);

          // For now, just set some placeholder data
          setStats({
            dueCards: 0,
            newCards: 0,
            totalCards: 0,
            streak: 0,
            reviewsToday: 0,
          });

          setDecks([]);
        } catch (statsError) {
          console.error("Error fetching stats:", statsError);
          throw new Error(`Stats API error: ${statsError.message}`);
        }
      } catch (err) {
        console.error("Error loading dashboard data:", err);
        setError(`Failed to load dashboard data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated]);

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
          <div>
            <h3>Debug Information</h3>
            <p>Make sure your backend server is running</p>
            <p>Check that the following endpoints are implemented:</p>
            <ul>
              <li>/api/stats</li>
              <li>/api/cards/study/due</li>
              <li>/api/cards/study/new</li>
              <li>/api/cards</li>
              <li>/api/decks</li>
            </ul>
          </div>
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
        <h1>Welcome, {user?.username || "User"}!</h1>
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
              <button
                className="primary-btn"
                onClick={() => navigate("/study")}
              >
                Review Now
              </button>
            )}
          </div>

          <div className="stat-card">
            <div className="stat-value">{stats.newCards}</div>
            <div className="stat-label">New Cards</div>
            {stats.newCards > 0 && (
              <button
                className="secondary-btn"
                onClick={() => navigate("/study")}
              >
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
                    onClick={() => navigate(`/study/${deck.id}`)}
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
      </div>
    </div>
  );
};

export default DashboardPage;
