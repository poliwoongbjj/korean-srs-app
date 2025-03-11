// components/Card/StudyCard.jsx - Study card component for reviews

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import "./StudyCard.css";

const StudyCard = ({ card, onReview, isLast }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [startTime, setStartTime] = useState(null);

  // Set start time when card is shown
  useEffect(() => {
    setIsFlipped(false);
    setStartTime(Date.now());
  }, [card]);

  // Toggle card flip
  const flipCard = () => {
    setIsFlipped(!isFlipped);
  };

  // Handle rating click
  const handleRating = (rating) => {
    if (!isFlipped) {
      // Flip card first if not flipped
      setIsFlipped(true);
      return;
    }

    // Calculate time taken in milliseconds
    const timeTakenMs = Date.now() - startTime;

    // Call onReview callback with rating and time taken
    onReview(card.id, rating, timeTakenMs);
  };

  // Play audio if available
  const playAudio = () => {
    if (card.audio_url) {
      const audio = new Audio(card.audio_url);
      audio.play();
    }
  };

  // Get next interval based on SRS data
  const getNextInterval = (rating) => {
    if (!card.interval) return "1 day";

    let interval = card.interval;
    const ease = parseFloat(card.ease_factor || 2.5);

    switch (rating) {
      case 1: // Again
        return "1 day";
      case 2: // Hard
        interval = Math.max(1, Math.round(interval * 1.2));
        break;
      case 3: // Good
        interval = Math.round(interval * ease);
        break;
      case 4: // Easy
        interval = Math.round(interval * ease * 1.3);
        break;
      default:
        return "Unknown";
    }

    // Format interval
    if (interval === 1) return "1 day";
    if (interval < 30) return `${interval} days`;
    if (interval < 365) return `${Math.round(interval / 30)} month(s)`;
    return `${Math.round(interval / 365)} year(s)`;
  };

  return (
    <div className="study-card-container">
      <motion.div
        className={`study-card ${isFlipped ? "flipped" : ""}`}
        onClick={flipCard}
        initial={{ rotateY: 0 }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Front Side (Korean) */}
        <div className="card-front">
          <div className="card-content">
            <h2 className="korean-text">{card.korean_text}</h2>
            {card.romanization && (
              <p className="romanization">{card.romanization}</p>
            )}
            {card.audio_url && (
              <button
                className="audio-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  playAudio();
                }}
              >
                <i className="fas fa-volume-up"></i>
              </button>
            )}
            <p className="hint-text">Click to flip</p>
          </div>
        </div>

        {/* Back Side (English) */}
        <div className="card-back">
          <div className="card-content">
            <h2 className="english-text">{card.english_text}</h2>
            {card.example_sentence && (
              <p className="example-sentence">{card.example_sentence}</p>
            )}
            {card.pronunciation_notes && (
              <p className="pronunciation-notes">{card.pronunciation_notes}</p>
            )}
            {card.image_url && (
              <img
                src={card.image_url}
                alt={card.english_text}
                className="card-image"
              />
            )}
          </div>
        </div>
      </motion.div>

      {/* Rating buttons (shown after card is flipped) */}
      <div className={`rating-buttons ${isFlipped ? "visible" : ""}`}>
        <button
          className="rating-btn again"
          onClick={() => handleRating(1)}
          title={`Next review: ${getNextInterval(1)}`}
        >
          Again
        </button>
        <button
          className="rating-btn hard"
          onClick={() => handleRating(2)}
          title={`Next review: ${getNextInterval(2)}`}
        >
          Hard
        </button>
        <button
          className="rating-btn good"
          onClick={() => handleRating(3)}
          title={`Next review: ${getNextInterval(3)}`}
        >
          Good
        </button>
        <button
          className="rating-btn easy"
          onClick={() => handleRating(4)}
          title={`Next review: ${getNextInterval(4)}`}
        >
          Easy
        </button>
      </div>

      {/* Progress indicator */}
      {card.totalCards && (
        <div className="progress-indicator">
          Card {card.currentIndex} of {card.totalCards}
          {isLast && <span className="last-card-indicator"> (Last card)</span>}
        </div>
      )}
    </div>
  );
};
