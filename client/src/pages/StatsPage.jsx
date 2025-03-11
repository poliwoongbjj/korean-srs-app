// pages/StatsPage.jsx - Statistics page

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import statsService from "@/services/stats.service";
import "./StatsPage.css";

const StatsPage = () => {
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [categoryStats, setCategoryStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  // Load stats data
  useEffect(() => {
    const fetchStatsData = async () => {
      try {
        setLoading(true);

        // Get user stats
        const statsResponse = await statsService.getUserStats();
        setStats(statsResponse.data);

        // Get review history
        const historyResponse = await statsService.getReviewHistory({
          days: 30,
          limit: 100,
        });
        setHistory(historyResponse.data);

        // Get category performance
        const categoryResponse = await statsService.getCategoryPerformance();
        setCategoryStats(categoryResponse.data);
      } catch (err) {
        console.error("Error loading stats:", err);
        setError("Failed to load statistics. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchStatsData();
  }, []);

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get rating label
  const getRatingLabel = (rating) => {
    switch (rating) {
      case 1:
        return "Again";
      case 2:
        return "Hard";
      case 3:
        return "Good";
      case 4:
        return "Easy";
      default:
        return "Unknown";
    }
  };

  // Get rating color class
  const getRatingColorClass = (rating) => {
    switch (rating) {
      case 1:
        return "rating-again";
      case 2:
        return "rating-hard";
      case 3:
        return "rating-good";
      case 4:
        return "rating-easy";
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <div className="stats-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="stats-page">
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
    <div className="stats-page">
      <div className="stats-header">
        <h1>Learning Statistics</h1>
      </div>

      <div className="stats-tabs">
        <button
          className={activeTab === "overview" ? "active" : ""}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          className={activeTab === "history" ? "active" : ""}
          onClick={() => setActiveTab("history")}
        >
          Review History
        </button>
        <button
          className={activeTab === "categories" ? "active" : ""}
          onClick={() => setActiveTab("categories")}
        >
          Categories
        </button>
      </div>

      {activeTab === "overview" && (
        <div className="stats-section">
          <div className="overview-stats">
            <div className="stat-card">
              <div className="stat-value">{stats?.cards_studied || 0}</div>
              <div className="stat-label">Cards Studied</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats?.total_reviews || 0}</div>
              <div className="stat-label">Total Reviews</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats?.streak_days || 0}</div>
              <div className="stat-label">Day Streak</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats?.reviews_today || 0}</div>
              <div className="stat-label">Reviews Today</div>
            </div>
          </div>

          <div className="weekly-chart">
            <h3>Weekly Activity</h3>
            <div className="chart-placeholder">
              {stats?.weekly_stats?.length > 0 ? (
                <div className="bar-chart">
                  {stats.weekly_stats.map((day, index) => (
                    <div key={index} className="chart-bar-container">
                      <div
                        className="chart-bar"
                        style={{
                          height: `${Math.min(100, day.reviews_count * 5)}%`,
                          backgroundColor:
                            day.avg_rating >= 3 ? "#51cf66" : "#ff922b",
                        }}
                      ></div>
                      <div className="chart-label">
                        {formatDate(day.date).split(" ")[1]}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-data-message">
                  No review data available for the past week.
                </div>
              )}
            </div>
          </div>

          <div className="review-schedule">
            <h3>Upcoming Reviews</h3>
            <div className="schedule-placeholder">
              <div className="forecast-message">
                <p>
                  You have <strong>{stats?.due_cards || 0}</strong> cards due
                  for review today.
                </p>
                <Link to="/study" className="primary-btn">
                  Start Reviewing
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "history" && (
        <div className="stats-section">
          <h3>Recent Reviews</h3>

          {history.length === 0 ? (
            <div className="empty-history">
              <p>
                No review history available. Start studying to see your progress
                here!
              </p>
              <Link to="/study" className="primary-btn">
                Start Studying
              </Link>
            </div>
          ) : (
            <div className="history-table-container">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Card</th>
                    <th>Rating</th>
                    <th>Time Taken</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item) => (
                    <tr key={item.id}>
                      <td>{formatDate(item.review_time)}</td>
                      <td>
                        <div className="review-card">
                          <div className="korean-text">{item.korean_text}</div>
                          <div className="english-text">
                            {item.english_text}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`rating-badge ${getRatingColorClass(
                            item.rating
                          )}`}
                        >
                          {getRatingLabel(item.rating)}
                        </span>
                      </td>
                      <td>
                        {item.time_taken_ms
                          ? `${(item.time_taken_ms / 1000).toFixed(1)}s`
                          : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "categories" && (
        <div className="stats-section">
          <h3>Category Performance</h3>

          {categoryStats.length === 0 ? (
            <div className="empty-categories">
              <p>No category data available yet.</p>
            </div>
          ) : (
            <div className="categories-grid">
              {categoryStats.map((category) => (
                <div key={category.category_id} className="category-card">
                  <h4>{category.category_name || "Uncategorized"}</h4>
                  <div className="category-stats">
                    <div className="category-stat">
                      <div className="stat-value">{category.total_cards}</div>
                      <div className="stat-label">Total Cards</div>
                    </div>
                    <div className="category-stat">
                      <div className="stat-value">{category.studied_cards}</div>
                      <div className="stat-label">Studied</div>
                    </div>
                    <div className="category-stat">
                      <div className="stat-value">{category.due_cards}</div>
                      <div className="stat-label">Due</div>
                    </div>
                  </div>
                  <div className="mastery-bar">
                    <div
                      className="mastery-progress"
                      style={{
                        width: `${
                          category.studied_cards
                            ? (category.studied_cards / category.total_cards) *
                              100
                            : 0
                        }%`,
                        backgroundColor:
                          category.avg_ease > 2.5
                            ? "#51cf66"
                            : category.avg_ease > 2.0
                            ? "#94d82d"
                            : category.avg_ease > 1.5
                            ? "#ffd43b"
                            : "#ff922b",
                      }}
                    ></div>
                  </div>
                  <div className="mastery-label">
                    Mastery:{" "}
                    {category.studied_cards
                      ? Math.round(
                          (category.studied_cards / category.total_cards) * 100
                        )
                      : 0}
                    %
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StatsPage;
