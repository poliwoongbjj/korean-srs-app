// components/common/Footer.jsx - Footer component

import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-logo">
            <Link to="/">
              <span className="logo-text">한국어</span>{" "}
              <span className="logo-app">Anki</span>
            </Link>
            <p>Learn Korean with spaced repetition</p>
          </div>

          <div className="footer-links">
            <div className="footer-links-column">
              <h3>App</h3>
              <ul>
                <li>
                  <Link to="/dashboard">Dashboard</Link>
                </li>
                <li>
                  <Link to="/study">Study</Link>
                </li>
                <li>
                  <Link to="/cards">Cards</Link>
                </li>
                <li>
                  <Link to="/decks">Decks</Link>
                </li>
              </ul>
            </div>

            <div className="footer-links-column">
              <h3>Resources</h3>
              <ul>
                <li>
                  <a href="#">Korean Alphabet</a>
                </li>
                <li>
                  <a href="#">Grammar Guide</a>
                </li>
                <li>
                  <a href="#">Pronunciation</a>
                </li>
                <li>
                  <a href="#">Common Phrases</a>
                </li>
              </ul>
            </div>

            <div className="footer-links-column">
              <h3>About</h3>
              <ul>
                <li>
                  <a href="#">About Us</a>
                </li>
                <li>
                  <a href="#">Contact</a>
                </li>
                <li>
                  <a href="#">Privacy Policy</a>
                </li>
                <li>
                  <a href="#">Terms of Service</a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {currentYear} Korean Anki. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
