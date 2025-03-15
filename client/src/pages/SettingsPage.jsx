// pages/SettingsPage.jsx - User settings page

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import settingsService from "@/services/settings.service";
import "./SettingsPage.css";

const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState("account");
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState(null);

  // Theme options
  const themes = [
    { id: "light", name: "Light" },
    { id: "dark", name: "Dark" },
    { id: "system", name: "System Default" },
  ];

  // Account form
  const [accountForm, setAccountForm] = useState({
    username: user?.username || "",
    email: user?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Study preferences
  const [studyPreferences, setStudyPreferences] = useState({
    newCardsPerDay: 10,
    reviewsPerDay: 50,
    studyOrder: "random",
    theme: "light",
  });

  // Load user preferences
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const response = await settingsService.getUserPreferences();
        console.log("Loaded preferences:", response);

        if (response.success && response.data) {
          setStudyPreferences({
            newCardsPerDay: response.data.newCardsPerDay,
            reviewsPerDay: response.data.reviewsPerDay,
            studyOrder: response.data.studyOrder,
            theme: response.data.theme,
          });
        }
      } catch (err) {
        console.error("Error loading preferences:", err);
      }
    };

    loadPreferences();
  }, []);

  // Handle account form changes
  const handleAccountChange = (e) => {
    const { name, value } = e.target;
    setAccountForm({
      ...accountForm,
      [name]: value,
    });
  };

  // Handle study preferences changes
  const handlePreferencesChange = (e) => {
    const { name, value } = e.target;
    setStudyPreferences({
      ...studyPreferences,
      [name]: value,
    });
  };

  // Handle account form submission
  const handleAccountSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      // Only send username and email, not password
      const profileData = {
        username: accountForm.username,
        email: accountForm.email,
      };

      await settingsService.updateUserProfile(profileData);

      // If there's a password change, send it separately
      if (accountForm.currentPassword && accountForm.newPassword) {
        if (accountForm.newPassword !== accountForm.confirmPassword) {
          setError("New passwords do not match");
          return;
        }

        await settingsService.updatePassword({
          currentPassword: accountForm.currentPassword,
          newPassword: accountForm.newPassword,
        });

        // Clear password fields
        setAccountForm({
          ...accountForm,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }

      setSuccessMessage("Account settings updated successfully.");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Error updating account:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to update account settings."
      );
    }
  };

  // Handle study preferences submission
  const handlePreferencesSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      await settingsService.updateStudyPreferences(studyPreferences);
      setSuccessMessage("Study preferences updated successfully.");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Error updating preferences:", err);
      setError(
        err.response?.data?.message || "Failed to update study preferences."
      );
    }
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Handle account deletion confirmation
  const handleDeleteAccount = () => {
    if (
      window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      // In a real app, this would call an API to delete the user's account
      logout();
      navigate("/register");
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-container">
        <div className="settings-sidebar">
          <h1>Settings</h1>
          <ul className="settings-tabs">
            <li
              className={activeTab === "account" ? "active" : ""}
              onClick={() => setActiveTab("account")}
            >
              <i className="fa fa-user"></i> Account
            </li>
            <li
              className={activeTab === "study" ? "active" : ""}
              onClick={() => setActiveTab("study")}
            >
              <i className="fa fa-book"></i> Study Preferences
            </li>
            <li
              className={activeTab === "privacy" ? "active" : ""}
              onClick={() => setActiveTab("privacy")}
            >
              <i className="fa fa-lock"></i> Privacy & Security
            </li>
          </ul>
          <div className="sidebar-actions">
            <button className="logout-btn" onClick={handleLogout}>
              <i className="fa fa-sign-out-alt"></i> Logout
            </button>
          </div>
        </div>

        <div className="settings-content">
          {successMessage && (
            <div className="success-message">{successMessage}</div>
          )}

          {activeTab === "account" && (
            <div className="settings-section">
              <h2>Account Settings</h2>
              <form onSubmit={handleAccountSubmit}>
                <div className="form-group">
                  <label htmlFor="username">Username</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={accountForm.username}
                    onChange={handleAccountChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={accountForm.email}
                    onChange={handleAccountChange}
                  />
                </div>

                <div className="form-divider">
                  <span>Change Password</span>
                </div>

                <div className="form-group">
                  <label htmlFor="currentPassword">Current Password</label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={accountForm.currentPassword}
                    onChange={handleAccountChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="newPassword">New Password</label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={accountForm.newPassword}
                    onChange={handleAccountChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm New Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={accountForm.confirmPassword}
                    onChange={handleAccountChange}
                  />
                </div>

                {error && <div className="error-message">{error}</div>}

                <div className="form-actions">
                  <button type="submit" className="save-btn">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === "study" && (
            <div className="settings-section">
              <h2>Study Preferences</h2>
              <form onSubmit={handlePreferencesSubmit}>
                <div className="form-group">
                  <label htmlFor="newCardsPerDay">New Cards per Day</label>
                  <input
                    type="number"
                    id="newCardsPerDay"
                    name="newCardsPerDay"
                    min="0"
                    max="100"
                    value={studyPreferences.newCardsPerDay}
                    onChange={handlePreferencesChange}
                  />
                  <div className="form-help">
                    Maximum number of new cards to show each day.
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="reviewsPerDay">Reviews per Day</label>
                  <input
                    type="number"
                    id="reviewsPerDay"
                    name="reviewsPerDay"
                    min="0"
                    max="500"
                    value={studyPreferences.reviewsPerDay}
                    onChange={handlePreferencesChange}
                  />
                  <div className="form-help">
                    Maximum number of reviews to show each day.
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="studyOrder">Study Order</label>
                  <select
                    id="studyOrder"
                    name="studyOrder"
                    value={studyPreferences.studyOrder}
                    onChange={handlePreferencesChange}
                  >
                    <option value="added">Order Added</option>
                    <option value="random">Random</option>
                  </select>
                  <div className="form-help">
                    Choose how cards are ordered during study sessions.
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="theme">Theme</label>
                  <select
                    id="theme"
                    name="theme"
                    value={studyPreferences.theme}
                    onChange={handlePreferencesChange}
                  >
                    {themes.map((theme) => (
                      <option key={theme.id} value={theme.id}>
                        {theme.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-actions">
                  <button type="submit" className="save-btn">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === "privacy" && (
            <div className="settings-section">
              <h2>Privacy & Security</h2>
              <div className="warning-section">
                <h3>Delete Account</h3>
                <p>
                  This will permanently delete your account and all your data.
                  This action cannot be undone.
                </p>
                <button
                  className="delete-account-btn"
                  onClick={handleDeleteAccount}
                >
                  Delete Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
