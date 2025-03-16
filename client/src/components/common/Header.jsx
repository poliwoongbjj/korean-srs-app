// components/common/Header.jsx - Updated with profile link and help link

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
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
              <div className="logo-image">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 32 32"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Koala face */}
                  <circle cx="16" cy="16" r="15" fill="#AAA397" />

                  {/* Ears */}
                  <circle cx="6" cy="8" r="4" fill="#7D7168" />
                  <circle cx="26" cy="8" r="4" fill="#7D7168" />

                  {/* Inner ears */}
                  <circle cx="6" cy="8" r="2" fill="#FFCBC0" />
                  <circle cx="26" cy="8" r="2" fill="#FFCBC0" />

                  {/* Face markings */}
                  <circle cx="16" cy="19" r="8" fill="#FFFFFF" />

                  {/* Eyes */}
                  <circle cx="12" cy="14" r="2" fill="#000000" />
                  <circle cx="20" cy="14" r="2" fill="#000000" />

                  {/* Nose */}
                  <ellipse cx="16" cy="17" rx="3" ry="2" fill="#333333" />

                  {/* Book */}
                  <rect x="10" y="22" width="12" height="6" fill="#4263EB" />
                  <line
                    x1="16"
                    y1="22"
                    x2="16"
                    y2="28"
                    stroke="#FFFFFF"
                    strokeWidth="0.5"
                  />
                </svg>
              </div>
              <span className="logo-app">Wanki</span>
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
                  <Link to="/decks" onClick={() => setMobileMenuOpen(false)}>
                    Decks
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    to="/categories"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Categories
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/help" onClick={() => setMobileMenuOpen(false)}>
                    Help
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
                        to="/profile"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        My Profile
                      </Link>
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
                  <Link to="/help" onClick={() => setMobileMenuOpen(false)}>
                    Help
                  </Link>
                </li>
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
