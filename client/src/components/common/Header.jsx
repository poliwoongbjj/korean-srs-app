// components/common/Header.jsx - Header component

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@contexts/AuthContext";
import "./Header.css";

const Header = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="logo">
            <Link to={isAuthenticated ? "/dashboard" : "/"}>
              <span className="logo-text">한국어</span>{" "}
              <span className="logo-app">Anki</span>
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <button
            className={`mobile-menu-toggle ${mobileMenuOpen ? "active" : ""}`}
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          {/* Navigation */}
          <nav className={`nav ${mobileMenuOpen ? "mobile-open" : ""}`}>
            {isAuthenticated ? (
              <ul className="nav-list">
                <li className="nav-item">
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/study" onClick={() => setMobileMenuOpen(false)}>
                    Study
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/cards" onClick={() => setMobileMenuOpen(false)}>
                    Cards
                  </Link>
                </li>
                <li className="nav-item">
                  <div className="user-dropdown">
                    <button className="user-dropdown-toggle">
                      <span className="user-name">{user?.username}</span>
                      <i className="fa fa-chevron-down"></i>
                    </button>
                    <div className="user-dropdown-content">
                      <Link
                        to="/settings"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Settings
                      </Link>
                      <Link
                        to="/stats"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Statistics
                      </Link>
                      <button onClick={handleLogout}>Logout</button>
                    </div>
                  </div>
                </li>
              </ul>
            ) : (
              <ul className="nav-list">
                <li className="nav-item">
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    to="/register"
                    className="btn-primary"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </li>
              </ul>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
