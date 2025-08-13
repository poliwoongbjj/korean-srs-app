// components/Card/StudyCard.jsx - Updated with improved audio handling

import React, { useState, useEffect } from "react";
import "./StudyCard.css";

const StudyCard = ({ card, onReview, isLast }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [userInput, setUserInput] = useState("");
  const [changingCard, setChangingCard] = useState(false);
  const [displayedCard, setDisplayedCard] = useState(card);
  const [audioError, setAudioError] = useState(false);

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
        setAudioError(false);

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

  // Enhanced play audio function with better error handling and debugging
  const playAudio = (e) => {
    if (e) e.stopPropagation(); // Prevent card flip

    // Try using the uploaded file first, fall back to URL if needed
    let audioSource = displayedCard.audio_file_path || displayedCard.audio_url;


    // No need to change the path if it's already an API endpoint
    if (
      audioSource &&
      !audioSource.startsWith("http") &&
      !audioSource.startsWith("/api/")
    ) {
      // If it's a traditional path, convert it to the API endpoint
      const filename = audioSource.split("/").pop(); // Get the filename part
      if (filename) {
        audioSource = `/api/audio/${filename}`;
      }
    }


    if (audioSource) {
      try {
        setAudioError(false);
        const audio = new Audio(audioSource);





        audio.onerror = (err) => {
          console.error("Audio playback error:", err);
          console.error(
            "Audio element error code:",
            audio.error ? audio.error.code : "unknown"
          );
          console.error(
            "Audio element error message:",
            audio.error ? audio.error.message : "unknown"
          );
          setAudioError(true);
        };

        audio.play().catch((err) => {
          console.error("Audio play error:", err);
          setAudioError(true);
        });
      } catch (err) {
        console.error("Audio error:", err);
        setAudioError(true);
      }
    } else {
      console.error("No audio source available for playback");
    }
  };

  // Test with a known working audio file
  // const testAudioPlayback = () => {
  //   const testAudio = new Audio(
  //     "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
  //   );
  //   testAudio.onerror = (err) => {
  //     console.error("Test audio error:", err);
  //   };
  //   testAudio.play().catch((err) => {
  //     console.error("Test audio play error:", err);
  //   });
  // };

  // Fallback audio player component
  const AudioPlayer = ({ src }) => {
    if (!src) return null;

    // Convert traditional paths to API paths if needed
    let audioSrc = src;
    if (
      !src.startsWith("http") &&
      !src.startsWith("/api/") &&
      src.includes("/uploads/")
    ) {
      const filename = src.split("/").pop();
      if (filename) {
        audioSrc = `/api/audio/${filename}`;
      }
    }

    return (
      <div className="audio-player">
        <audio controls>
          <source src={audioSrc} type="audio/mpeg" />
          <source src={audioSrc} type="audio/wav" />
          <source src={audioSrc} type="audio/ogg" />
          Your browser does not support the audio element.
        </audio>
        <div className="audio-link">
          <a href={audioSrc} target="_blank" rel="noopener noreferrer">
            Open in new tab
          </a>
        </div>
      </div>
    );
  };

  // Handle automatic audio playback for spelling cards
  useEffect(() => {
    if (displayedCard.card_type === "spelling" && !isFlipped && !changingCard) {
      // Auto-play audio for spelling cards after a short delay
      const autoPlayTimer = setTimeout(() => playAudio(), 500);
      return () => clearTimeout(autoPlayTimer);
    }
  }, [displayedCard, changingCard, isFlipped]);


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
            <p className="hint-text">What's the Korean translation?</p>
            <div className="card-type-indicator">Production Card</div>
            <p className="hint-text">Click to flip</p>
          </div>
        );

      case "spelling": // English → Korean with audio (spelling test)
        return (
          <div className="card-content">
            <h2 className="english-text">{displayedCard.english_text}</h2>
            {/* Audio controls with error handling */}
            <div className="audio-controls">
              <button
                className="audio-btn"
                onClick={playAudio}
                title="Play pronunciation"
              >
                <i className="fas fa-volume-up"></i> Listen
              </button>
              {audioError && (
                <>
                  <div className="audio-error">
                    Unable to play audio automatically. Try using the player
                    below:
                  </div>
                  <AudioPlayer
                    src={
                      displayedCard.audio_file_path || displayedCard.audio_url
                    }
                  />
                </>
              )}
            </div>

            {/* Spelling form */}
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
            {(displayedCard.audio_file_path || displayedCard.audio_url) && (
              <div className="audio-controls">
                <button
                  className="audio-btn"
                  onClick={playAudio}
                  title="Play pronunciation"
                >
                  <i className="fas fa-volume-up"></i> Listen
                </button>
                {audioError && (
                  <>
                    <div className="audio-error">
                      Unable to play audio. Try using the player below:
                    </div>
                    <AudioPlayer
                      src={
                        displayedCard.audio_file_path || displayedCard.audio_url
                      }
                    />
                  </>
                )}
              </div>
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
            {(displayedCard.audio_file_path || displayedCard.audio_url) && (
              <div className="audio-controls">
                <button
                  className="audio-btn"
                  onClick={playAudio}
                  title="Play pronunciation"
                >
                  <i className="fas fa-volume-up"></i> Listen
                </button>
                {audioError && (
                  <>
                    <div className="audio-error">
                      Unable to play audio. Try using the player below:
                    </div>
                    <AudioPlayer
                      src={
                        displayedCard.audio_file_path || displayedCard.audio_url
                      }
                    />
                  </>
                )}
              </div>
            )}
            {displayedCard.example_sentence && (
              <p className="example-sentence">
                {displayedCard.example_sentence}
              </p>
            )}
          </div>
        );

      case "spelling": { // Spelling card back shows correctness
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
              <p>
                Your answer: <strong>{userInput || "(empty)"}</strong>
              </p>
              <p>
                Correct answer: <strong>{displayedCard.korean_text}</strong>
              </p>
            </div>
            {(displayedCard.audio_file_path || displayedCard.audio_url) && (
              <div className="audio-controls">
                <button
                  className="audio-btn"
                  onClick={playAudio}
                  title="Play pronunciation again"
                >
                  <i className="fas fa-volume-up"></i> Listen Again
                </button>
                {audioError && (
                  <>
                    <div className="audio-error">
                      Unable to play audio. Try using the player below:
                    </div>
                    <AudioPlayer
                      src={
                        displayedCard.audio_file_path || displayedCard.audio_url
                      }
                    />
                  </>
                )}
              </div>
            )}
            {displayedCard.example_sentence && (
              <p className="example-sentence">
                {displayedCard.example_sentence}
              </p>
            )}
          </div>
        );
      }

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
