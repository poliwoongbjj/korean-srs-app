// pages/SettingsPage.jsx - User settings page

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import "./SettingsPage.css";

const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState("account");
  const [successMessage, setSuccessMessage] = useState("");

  // Theme options (for future implementation)
  const themes = [
    { id: "light", name: "Light" },
    { id: "dark", name: "Dark" },
    { id: "system", name: "System Default" },
  ];

  // Mock account form - would be connected to real API in production
  const [accountForm, setAccountForm] = useState({
    username: user?.username || "",
    email: user?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Mock study preferences - would be connected to real API in production
  const [studyPreferences, setStudyPreferences] = useState({
    newCardsPerDay: 10,
    reviewsPerDay: 50,
    theme: "light",
  });

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
  const handleAccountSubmit = (e) => {
    e.preventDefault();
    // In a real app, this would call an API to update the user's account
    setSuccessMessage("Account settings updated successfully.");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  // Handle study preferences submission
  const handlePreferencesSubmit = (e) => {
    e.preventDefault();
    // In a real app, this would call an API to update the user's preferences
    setSuccessMessage("Study preferences updated successfully.");
    setTimeout(() => setSuccessMessage(""), 3000);
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
