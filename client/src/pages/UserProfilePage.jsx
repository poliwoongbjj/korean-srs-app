// pages/UserProfilePage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import statsService from "@/services/stats.service";
import settingsService from "@/services/settings.service";
import "./UserProfilePage.css";

const UserProfilePage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Profile form data
  const [profileData, setProfileData] = useState({
    username: "",
    email: "",
  });

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: "/profile" } });
    } else {
      setProfileData({
        username: user?.username || "",
        email: user?.email || "",
      });
    }
  }, [isAuthenticated, navigate, user]);

  // Load user stats
  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        setLoading(true);
        const response = await statsService.getUserStats();
        setStats(response.data);
      } catch (err) {
        console.error("Error loading user stats:", err);
        setError("Failed to load user statistics.");
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchUserStats();
    }
  }, [isAuthenticated]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value,
    });
  };

  // Handle profile update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await settingsService.updateUserProfile(profileData);
      setSuccessMessage("Profile updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile. Please try again.");
      setTimeout(() => setError(null), 3000);
    }
  };

  if (loading) {
    return (
      <div className="user-profile-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-profile-page">
      <div className="profile-header">
        <h1>Your Profile</h1>
      </div>

      <div className="profile-content">
        <div className="profile-card">
          <div className="avatar-container">
            <div className="avatar">{user?.username?.charAt(0) || "U"}</div>
            <h2>{user?.username}</h2>
            <p className="user-email">{user?.email}</p>
          </div>

          <div className="stats-summary">
            <div className="stat-item">
              <span className="stat-value">{stats?.cards_studied || 0}</span>
              <span className="stat-label">Cards Studied</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats?.streak_days || 0}</span>
              <span className="stat-label">Day Streak</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats?.total_reviews || 0}</span>
              <span className="stat-label">Total Reviews</span>
            </div>
          </div>
        </div>

        <div className="profile-form-container">
          <h2>Edit Profile</h2>

          {successMessage && (
            <div className="success-message">{successMessage}</div>
          )}

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleUpdateProfile} className="profile-form">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={profileData.username}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={profileData.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="primary-btn">
                Save Changes
              </button>
              <button
                type="button"
                className="secondary-btn"
                onClick={() => navigate("/settings")}
              >
                Advanced Settings
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
