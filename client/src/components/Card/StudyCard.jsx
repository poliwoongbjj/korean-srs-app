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
    // If it's a new card, handle the transition
    if (card.id !== displayedCard.id) {
      // Step 1: Mark as changing to hide content
      setChangingCard(true);

      // Step 2: Make sure card is face-down
      setIsFlipped(false);

      // Step 3: After a brief delay, update the displayed card
      const changeTimer = setTimeout(() => {
        setDisplayedCard(card);
        setUserInput("");
        setStartTime(Date.now());

        // Step 4: After updating content, remove the changing flag
        setTimeout(() => {
          setChangingCard(false);
        }, 50);
      }, 300); // Wait for flip animation

      return () => clearTimeout(changeTimer);
    } else {
      // Just update the start time for the same card
      setStartTime(Date.now());
    }
  }, [card]);

  // Toggle card flip
  const flipCard = () => {
    // For spelling cards, only flip if there's input or already flipped
    if (
      displayedCard.card_type === "spelling" &&
      !isFlipped &&
      !userInput.trim()
    ) {
      return; // Don't flip empty spelling cards
    }
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
    const currentTime = Date.now();
    const timeTakenMs = startTime ? currentTime - startTime : 5000;
    const cappedTimeTaken = Math.min(timeTakenMs, 300000); // Cap at 5 minutes

    // Call onReview callback with rating and capped time taken
    onReview(displayedCard.id, rating, cappedTimeTaken);
  };

  // Play audio if available
  const playAudio = (e) => {
    if (e) e.stopPropagation(); // Prevent card flip

    if (displayedCard.audio_url) {
      const audio = new Audio(displayedCard.audio_url);
      audio.play();
    }
  };

  // Handle spelling check
  const checkSpelling = (e) => {
    e.preventDefault();
    setIsFlipped(true);
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

  // Render different card front based on card type
  const renderCardFront = () => {
    const cardType = displayedCard.card_type || "recognition";

    switch (cardType) {
      case "production": // English → Korean
        return (
          <div className="card-content">
            <h2 className="english-text">{displayedCard.english_text}</h2>

            <div className="card-type-indicator">Production Card</div>
            <p className="hint-text">Click to flip</p>
          </div>
        );

      case "spelling": // English → Korean with audio (spelling test)
        return (
          <div className="card-content">
            <h2 className="english-text">{displayedCard.english_text}</h2>
            {displayedCard.audio_url && (
              <button className="audio-btn" onClick={playAudio}>
                <i className="fas fa-volume-up"></i> Listen
              </button>
            )}
            <form onSubmit={checkSpelling} className="spelling-form">
              <input
                type="text"
                placeholder="Type the Korean spelling..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                autoFocus
              />
              <button type="submit" className="check-btn">
                Check
              </button>
            </form>
            <div className="card-type-indicator">Spelling Card</div>
          </div>
        );

      default: // recognition: Korean → English
        return (
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
            <div className="card-type-indicator">Recognition Card</div>
            <p className="hint-text">Click to flip</p>
          </div>
        );
    }
  };

  // Render different card back based on card type
  const renderCardBack = () => {
    const cardType = displayedCard.card_type || "recognition";

    switch (cardType) {
      case "production": // English → Korean
        return (
          <div className="card-content">
            <h2 className="korean-text">{displayedCard.korean_text}</h2>
            {displayedCard.romanization && (
              <p className="romanization">{displayedCard.romanization}</p>
            )}
            {displayedCard.audio_url && (
              <button className="audio-btn" onClick={playAudio}>
                <i className="fas fa-volume-up"></i>
              </button>
            )}
            {displayedCard.example_sentence && (
              <p className="example-sentence">
                {displayedCard.example_sentence}
              </p>
            )}
          </div>
        );

      case "spelling": // Spelling card back shows correctness
        const isCorrect =
          userInput.trim().toLowerCase() ===
          displayedCard.korean_text.trim().toLowerCase();

        return (
          <div className="card-content">
            <h2 className="korean-text">{displayedCard.korean_text}</h2>
            {displayedCard.romanization && (
              <p className="romanization">{displayedCard.romanization}</p>
            )}
            <div
              className={`spelling-result ${
                isCorrect ? "correct" : "incorrect"
              }`}
            >
              <p>Your answer: {userInput || "(empty)"}</p>
              <p>Correct answer: {displayedCard.korean_text}</p>
            </div>
            {displayedCard.example_sentence && (
              <p className="example-sentence">
                {displayedCard.example_sentence}
              </p>
            )}
          </div>
        );

      default: // Recognition: Korean → English
        return (
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
        );
    }
  };

  return (
    <div className="study-card-container">
      <div
        className={`study-card ${isFlipped ? "flipped" : ""} ${
          changingCard ? "changing-card" : ""
        }`}
        onClick={flipCard}
      >
        {/* Front Side */}
        <div className="card-front">{renderCardFront()}</div>

        {/* Back Side */}
        <div className="card-back">{renderCardBack()}</div>
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
