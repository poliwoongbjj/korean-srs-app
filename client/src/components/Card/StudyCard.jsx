import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import "./StudyCard.css";

const StudyCard = ({ card, onReview, isLast }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [userInput, setUserInput] = useState("");
  const [changingCard, setChangingCard] = useState(false);
  const [displayedCard, setDisplayedCard] = useState(card);

  // Handle card changes more gracefully
  useEffect(() => {
    // Set start time immediately when component mounts
    setStartTime(Date.now());
    setIsFlipped(false);
    setUserInput("");

    return () => {
      // Clean up when component unmounts
      setStartTime(null);
    };
  }, [displayedCard.id]); // Depend on card ID, not the entire card object

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
    // Make sure we're using the correct time calculation
    const currentTime = Date.now();
    const timeTakenMs = startTime ? currentTime - startTime : 5000; // Default to 5 seconds if startTime not set

    // Add a sanity check to prevent absurdly large values
    const cappedTimeTaken = Math.min(timeTakenMs, 300000); // Cap at 5 minutes (300,000ms)

    // Call onReview callback with rating and capped time taken
    onReview(displayedCard.id, rating, cappedTimeTaken);
  };

  // Play audio if available
  const playAudio = () => {
    if (displayedCard.audio_url) {
      const audio = new Audio(displayedCard.audio_url);
      audio.play();
    }
  };

  // Get next interval based on SRS data
  const getNextInterval = (rating) => {
    if (!displayedCard.review_interval) return "1 day";

    let interval = displayedCard.review_interval;
    const ease = parseFloat(displayedCard.ease_factor || 2.5);

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
      <div
        className={`study-card ${isFlipped ? "flipped" : ""} ${
          changingCard ? "changing-card" : ""
        }`}
        onClick={flipCard}
      >
        {/* Front Side (Korean) */}
        <div className="card-front">
          <div className="card-content">
            <h2 className="korean-text">{displayedCard.korean_text}</h2>
            {displayedCard.romanization && (
              <p className="romanization">{displayedCard.romanization}</p>
            )}
            {displayedCard.audio_url && (
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
            <h2 className="english-text">{displayedCard.english_text}</h2>
            {displayedCard.example_sentence && (
              <p className="example-sentence">
                {displayedCard.example_sentence}
              </p>
            )}
            {displayedCard.pronunciation_notes && (
              <p className="pronunciation-notes">
                {displayedCard.pronunciation_notes}
              </p>
            )}
            {displayedCard.image_url && (
              <img
                src={displayedCard.image_url}
                alt={displayedCard.english_text}
                className="card-image"
              />
            )}
          </div>
        </div>
      </div>

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
      {displayedCard.totalCards && (
        <div className="progress-indicator">
          Card {displayedCard.currentIndex} of {displayedCard.totalCards}
          {isLast && <span className="last-card-indicator"> (Last card)</span>}
        </div>
      )}
    </div>
  );
};

export default StudyCard;
