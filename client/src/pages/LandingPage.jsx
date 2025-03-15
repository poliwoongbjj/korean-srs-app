// pages/LandingPage.jsx
import React from "react";
import { Link } from "react-router-dom";
import "./LandingPage.css";

const LandingPage = () => {
  return (
    <div className="landing-page">
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h1>
              Learn Any Language with <span className="highlight">Wanki</span>
            </h1>
            <p className="hero-subtitle">
              Master vocabulary through spaced repetition - scientifically
              proven to help you remember more and study less.
            </p>
            <div className="hero-buttons">
              <Link to="/register" className="primary-btn">
                Get Started Free
              </Link>
              <Link to="/login" className="secondary-btn">
                Sign In
              </Link>
            </div>
          </div>
          <div className="hero-image">
            <div className="mockup-container">
              <div className="phone-mockup">
                <div className="mockup-screen">
                  <div className="mockup-card">
                    <div className="mockup-korean">안녕하세요</div>
                    <div className="mockup-english">Hello</div>
                  </div>
                  <div className="mockup-buttons">
                    <div className="mockup-button red">Again</div>
                    <div className="mockup-button orange">Hard</div>
                    <div className="mockup-button green">Good</div>
                    <div className="mockup-button blue">Easy</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="container">
          <h2>Why Choose Wanki?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fa fa-brain"></i>
              </div>
              <h3>Spaced Repetition</h3>
              <p>
                Our algorithm optimizes your learning by showing you cards right
                before you're about to forget them.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fa fa-clock"></i>
              </div>
              <h3>Study Less, Remember More</h3>
              <p>
                Spend less time studying while dramatically improving long-term
                retention.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fa fa-chart-line"></i>
              </div>
              <h3>Track Your Progress</h3>
              <p>
                Detailed statistics show your learning progress and help you
                stay motivated.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fa fa-mobile-alt"></i>
              </div>
              <h3>Study Anywhere</h3>
              <p>
                Access your cards from any device with our responsive web app.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="how-it-works-section">
        <div className="container">
          <h2>How It Works</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Create Cards</h3>
              <p>
                Add vocabulary cards with translations, examples, and notes.
              </p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>Study Daily</h3>
              <p>Review cards and rate how well you remembered each one.</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Smart Review</h3>
              <p>
                Our algorithm schedules reviews at the optimal time for memory
                retention.
              </p>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <h3>Track Progress</h3>
              <p>
                See your improvements with detailed statistics and insights.
              </p>
            </div>
          </div>
          <div className="cta-container">
            <Link to="/register" className="primary-btn">
              Start Learning Today
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
