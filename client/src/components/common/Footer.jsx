// components/common/Footer.jsx - Updated with logo and original links

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
            <p>Learn with Wanki</p>
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
          <p>&copy; {currentYear} Wanki. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
