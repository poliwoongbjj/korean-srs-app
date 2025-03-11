// pages/CardsPage.jsx - Cards browsing and management page

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import cardsService from "@/services/cards.service";
import categoriesService from "@/services/categories.service";
import "./CardsPage.css";

const CardsPage = () => {
  const [cards, setCards] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCards, setTotalCards] = useState(0);
  const cardsPerPage = 12;

  // Load cards and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch categories
        const categoriesResponse = await categoriesService.getAllCategories();
        setCategories(categoriesResponse.data);

        // Fetch cards with pagination and filters
        const params = {
          limit: cardsPerPage,
          offset: (currentPage - 1) * cardsPerPage,
        };

        if (searchTerm) {
          params.search = searchTerm;
        }

        if (selectedCategory) {
          params.category = selectedCategory;
        }

        const cardsResponse = await cardsService.getAllCards(params);
        setCards(cardsResponse.data);
        setTotalCards(cardsResponse.total);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load cards. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage, searchTerm, selectedCategory]);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle category change
  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setCurrentPage(1); // Reset to first page when changing category
  };

  // Handle delete card
  const handleDeleteCard = async (id) => {
    if (window.confirm("Are you sure you want to delete this card?")) {
      try {
        await cardsService.deleteCard(id);
        // Refresh cards
        setCards(cards.filter((card) => card.id !== id));
        setTotalCards(totalCards - 1);
      } catch (err) {
        console.error("Error deleting card:", err);
        setError("Failed to delete card. Please try again.");
      }
    }
  };

  // Get category name by ID
  const getCategoryName = (categoryId) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : "Uncategorized";
  };

  // Calculate total pages
  const totalPages = Math.ceil(totalCards / cardsPerPage);

  if (loading) {
    return (
      <div className="cards-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading cards...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cards-page">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <button
            className="primary-btn"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cards-page">
      <div className="cards-header">
        <h1>Browse Cards</h1>
        <Link to="/cards/new" className="add-card-btn">
          <i className="fa fa-plus"></i> Add New Card
        </Link>
      </div>

      <div className="cards-filters">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search cards..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-btn">
            <i className="fa fa-search"></i>
          </button>
        </form>

        <div className="category-filter">
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="category-select"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {cards.length === 0 ? (
        <div className="empty-cards">
          <p>No cards found. Try a different search or category.</p>
          <Link to="/cards/new" className="primary-btn">
            Create Your First Card
          </Link>
        </div>
      ) : (
        <>
          <div className="cards-grid">
            {cards.map((card) => (
              <div key={card.id} className="card-item">
                <div className="card-content">
                  <div className="card-top">
                    <span className="card-category">
                      {getCategoryName(card.category_id)}
                    </span>
                    <div className="card-actions">
                      <Link to={`/cards/${card.id}/edit`} className="edit-btn">
                        <i className="fa fa-edit"></i>
                      </Link>
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteCard(card.id)}
                      >
                        <i className="fa fa-trash"></i>
                      </button>
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

          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <i className="fa fa-chevron-left"></i>
              </button>

              <span className="pagination-info">
                Page {currentPage} of {totalPages}
              </span>

              <button
                className="pagination-btn"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                <i className="fa fa-chevron-right"></i>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CardsPage;
