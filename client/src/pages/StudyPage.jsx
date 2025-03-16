// pages/StudyPage.jsx - Study page for reviewing cards

import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import StudyCard from "@components/Card/StudyCard";
import cardsService from "@services/cards.service";
import settingsService from "@services/settings.service";
import statsService from "@/services/stats.service";
import { useAuth } from "@contexts/AuthContext";
import "./StudyPage.css";

const StudyPage = () => {
  const { deckId } = useParams();
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get("category");
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [cards, setCards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sourceInfo, setSourceInfo] = useState({ name: "", type: "" });
  const [studyOrder, setStudyOrder] = useState("random");
  const [studyComplete, setStudyComplete] = useState(false);
  const [stats, setStats] = useState({
    totalCards: 0,
    reviewed: 0,
    again: 0,
    hard: 0,
    good: 0,
    easy: 0,
  });

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/study/${deckId || ""}` } });
    }
  }, [isAuthenticated, navigate, deckId]);

  // Load user preferences
  useEffect(() => {
    const fetchUserPreferences = async () => {
      try {
        const preferencesResponse = await settingsService.getUserPreferences();
        setStudyOrder(preferencesResponse.data.studyOrder || "random");
      } catch (err) {
        console.error("Error loading preferences:", err);
      }
    };

    fetchUserPreferences();
  }, []);

  // Load cards after preferences are set
  useEffect(() => {
    if (isAuthenticated) {
      fetchCards();
    }
  }, [isAuthenticated, studyOrder]); // Added dependency on studyOrder

  // Function to fetch cards
  const fetchCards = async () => {
    try {
      setLoading(true);

      // Parameters object for API calls
      const params = {
        limit: 20,
        orderBy: studyOrder,
      };

      // Add deck ID if provided
      if (deckId) {
        params.deckId = deckId;
      }

      // Add category ID if provided
      if (categoryId) {
        params.categoryId = categoryId;
      }

      // Get due cards with parameters
      const dueResponse = await cardsService.getDueCards(params);
      let studyCards = dueResponse.data;

      // If not enough due cards, get new cards
      if (studyCards.length < 10) {
        const newCardParams = {
          ...params,
          limit: 10 - studyCards.length,
        };

        const newResponse = await cardsService.getNewCards(newCardParams);
        studyCards = [...studyCards, ...newResponse.data];
      }

      // Add index and total count to each card
      const cardsWithMeta = studyCards.map((card, index) => ({
        ...card,
        currentIndex: index + 1,
        totalCards: studyCards.length,
      }));

      setCards(cardsWithMeta);
      setStats((prev) => ({
        ...prev,
        totalCards: cardsWithMeta.length,
      }));
    } catch (err) {
      console.error("Error loading cards:", err);
      setError("Failed to load cards. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Then add this effect to fetch the category or deck name:
  useEffect(() => {
    const fetchSourceInfo = async () => {
      if (deckId) {
        try {
          const response = await decksService.getDeckById(deckId);
          setSourceInfo({
            name: response.data.deck.name,
            type: "deck",
          });
        } catch (err) {
          console.error("Error fetching deck info:", err);
        }
      } else if (categoryId) {
        try {
          const response = await categoriesService.getCategoryById(categoryId);
          setSourceInfo({
            name: response.data.category.name,
            type: "category",
          });
        } catch (err) {
          console.error("Error fetching category info:", err);
        }
      }
    };

    if (deckId || categoryId) {
      fetchSourceInfo();
    } else {
      setSourceInfo({ name: "", type: "" });
    }
  }, [deckId, categoryId]);

  // Handle card review
  const handleReview = async (cardId, rating, timeTakenMs) => {
    try {
      console.log("Card ID being sent:", cardId);

      // Update card review in API
      await cardsService.reviewCard(cardId, {
        rating,
        timeTakenMs,
      });

      // Update stats
      setStats((prev) => {
        const newStats = { ...prev, reviewed: prev.reviewed + 1 };

        switch (rating) {
          case 1:
            newStats.again = prev.again + 1;
            break;
          case 2:
            newStats.hard = prev.hard + 1;
            break;
          case 3:
            newStats.good = prev.good + 1;
            break;
          case 4:
            newStats.easy = prev.easy + 1;
            break;
          default:
            break;
        }

        return newStats;
      });

      // Move to next card or complete
      if (currentCardIndex < cards.length - 1) {
        // Add a small delay to allow card to flip back before showing next card
        setTimeout(() => {
          setCurrentCardIndex((prevIndex) => prevIndex + 1);
        }, 300);
      } else {
        setStudyComplete(true);
      }
    } catch (err) {
      console.error("Error reviewing card:", err);
      setError("Failed to save review. Please try again.");
    }
  };

  const restudyFailedCards = () => {
    // Use the stats state which has been tracking ratings during the session
    const failedCards = cards.filter((card, index) => {
      // Check if this card was rated as "Again" (rating 1) in this session
      return stats.again > 0 && index < stats.reviewed;
    });

    if (failedCards.length > 0) {
      setCards(failedCards);
      setCurrentCardIndex(0);
      setStudyComplete(false);
    } else {
      // If no failed cards tracked in this session, just restart with all cards
      setCurrentCardIndex(0);
      setStudyComplete(false);
    }
  };

  // Reset study session
  const resetStudy = () => {
    setCards([]);
    setCurrentCardIndex(0);
    setStudyComplete(false);
    setStats({
      totalCards: 0,
      reviewed: 0,
      again: 0,
      hard: 0,
      good: 0,
      easy: 0,
    });
    setLoading(true);

    // Reload the page to start fresh
    window.location.reload();
  };

  // Go back to dashboard
  const goToDashboard = () => {
    navigate("/dashboard");
  };

  if (loading) {
    return (
      <div className="study-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading cards...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="study-page">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <button className="primary-btn" onClick={resetStudy}>
            Try Again
          </button>
          <button className="secondary-btn" onClick={goToDashboard}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="study-page">
        <div className="empty-container">
          <h2>No cards to review</h2>
          <p>
            You have no cards due for review. Check back later or add more
            cards.
          </p>
          <button className="primary-btn" onClick={goToDashboard}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (studyComplete) {
    return (
      <div className="study-page">
        <div className="complete-container">
          <h2>Study Session Complete!</h2>
          <div className="stats-container">
            <div className="stat-item">
              <span className="stat-label">Cards Reviewed:</span>
              <span className="stat-value">{stats.reviewed}</span>
            </div>
            <div className="stat-item again">
              <span className="stat-label">Again:</span>
              <span className="stat-value">{stats.again}</span>
            </div>
            <div className="stat-item hard">
              <span className="stat-label">Hard:</span>
              <span className="stat-value">{stats.hard}</span>
            </div>
            <div className="stat-item good">
              <span className="stat-label">Good:</span>
              <span className="stat-value">{stats.good}</span>
            </div>
            <div className="stat-item easy">
              <span className="stat-label">Easy:</span>
              <span className="stat-value">{stats.easy}</span>
            </div>
          </div>
          <div className="action-buttons">
            <button className="primary-btn" onClick={resetStudy}>
              Study New Cards
            </button>
            <button className="secondary-btn" onClick={restudyFailedCards}>
              Restudy Cards
            </button>
            <button className="tertiary-btn" onClick={goToDashboard}>
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="study-page">
      <div className="study-header">
        <h1>
          {sourceInfo.name
            ? `Review Cards: ${sourceInfo.name} ${
                sourceInfo.type === "deck" ? "Deck" : "Category"
              }`
            : "Review Cards"}
        </h1>
        <button className="exit-btn" onClick={goToDashboard}>
          Exit Study
        </button>
      </div>

      <div className="study-content">
        {cards.length > 0 && (
          <StudyCard
            key={cards[currentCardIndex].id} // Add a key prop to force re-mounting
            card={cards[currentCardIndex]}
            onReview={handleReview}
            isLast={currentCardIndex === cards.length - 1}
          />
        )}
      </div>
    </div>
  );
};

export default StudyPage;
