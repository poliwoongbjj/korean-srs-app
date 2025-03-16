// pages/CategoryPage.jsx
import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import categoriesService from "@/services/categories.service";
import "./CategoryPage.css";

const CategoryPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [category, setCategory] = useState(null);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        setLoading(true);
        const response = await categoriesService.getCategoryById(id);

        setCategory(response.data.category);
        setCards(response.data.cards);
      } catch (err) {
        console.error("Error loading category:", err);
        setError("Failed to load category data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryData();
  }, [id]);

  if (loading) {
    return (
      <div className="category-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading category...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="category-page">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <button
            className="primary-btn"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
          <button
            className="secondary-btn"
            onClick={() => navigate("/categories")}
          >
            Back to Categories
          </button>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="category-page">
        <div className="not-found-container">
          <h2>Category Not Found</h2>
          <p>
            The category you're looking for doesn't exist or has been deleted.
          </p>
          <button
            className="primary-btn"
            onClick={() => navigate("/categories")}
          >
            View All Categories
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="category-page">
      <div className="category-header">
        <div className="category-title">
          <h1>{category.name}</h1>
          {category.description && (
            <p className="category-description">{category.description}</p>
          )}
        </div>
        <div className="category-actions">
          <button
            className="primary-btn"
            onClick={() => navigate(`/study?category=${id}`)}
          >
            Study Category
          </button>
          <Link to="/cards/new" className="secondary-btn">
            Add Card to Category
          </Link>
        </div>
      </div>

      <div className="category-stats">
        <div className="stat-item">
          <div className="stat-value">{cards.length}</div>
          <div className="stat-label">Total Cards</div>
        </div>
      </div>

      {cards.length === 0 ? (
        <div className="empty-cards">
          <p>No cards in this category yet.</p>
          <Link to="/cards/new" className="primary-btn">
            Add First Card
          </Link>
        </div>
      ) : (
        <div className="category-cards">
          <h2>Cards in {category.name}</h2>
          <div className="cards-grid">
            {cards.map((card) => (
              <div key={card.id} className="card-item">
                <div className="card-content">
                  <div className="card-top">
                    {card.card_type && (
                      <span className={`card-type-badge ${card.card_type}`}>
                        {card.card_type.charAt(0).toUpperCase() +
                          card.card_type.slice(1)}
                      </span>
                    )}
                    <div className="card-actions">
                      <Link to={`/cards/${card.id}/edit`} className="edit-btn">
                        <i className="fa fa-edit"></i>
                      </Link>
                    </div>
                  </div>
                  <div className="card-text">
                    <h3 className="korean-text">{card.korean_text}</h3>
                    <p className="english-text">{card.english_text}</p>
                    {card.romanization && (
                      <p className="romanization">{card.romanization}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
