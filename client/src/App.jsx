// App.jsx - Updated with all routes

import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import { AuthProvider } from "@contexts/AuthContext";

// Pages
import LandingPage from "@pages/LandingPage";
import LoginPage from "@pages/LoginPage";
import RegisterPage from "@pages/RegisterPage";
import DashboardPage from "@pages/DashboardPage";
import StudyPage from "@pages/StudyPage";
import CardsPage from "@pages/CardsPage";
import NewCardPage from "@pages/NewCardPage";
import EditCardPage from "@pages/EditCardPage";
import DecksPage from "@pages/DecksPage";
import DeckPage from "@pages/DeckPage";
import NewDeckPage from "@pages/NewDeckPage";
import EditDeckPage from "@pages/EditDeckPage";
import CategoriesPage from "@pages/CategoriesPage";
import CategoryPage from "@pages/CategoryPage";
import StatsPage from "@pages/StatsPage";
import SettingsPage from "@pages/SettingsPage";
import UserProfilePage from "@pages/UserProfilePage";
import HelpPage from "@pages/HelpPage";
import NotFoundPage from "@pages/NotFoundPage";

// Components
import Header from "@components/common/Header";
import Footer from "@components/common/Footer";
import ProtectedRoute from "@components/common/ProtectedRoute";

// Styles
import "./App.css";

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <div className="app">
          <Header />
          <main className="main-content">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/help" element={<HelpPage />} />

              {/* Protected routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/study/:deckId?"
                element={
                  <ProtectedRoute>
                    <StudyPage />
                  </ProtectedRoute>
                }
              />

              {/* Cards management */}
              <Route
                path="/cards"
                element={
                  <ProtectedRoute>
                    <CardsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cards/new"
                element={
                  <ProtectedRoute>
                    <NewCardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cards/:id/edit"
                element={
                  <ProtectedRoute>
                    <EditCardPage />
                  </ProtectedRoute>
                }
              />

              {/* Decks management */}
              <Route
                path="/decks"
                element={
                  <ProtectedRoute>
                    <DecksPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/decks/new"
                element={
                  <ProtectedRoute>
                    <NewDeckPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/decks/:id"
                element={
                  <ProtectedRoute>
                    <DeckPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/decks/:id/edit"
                element={
                  <ProtectedRoute>
                    <EditDeckPage />
                  </ProtectedRoute>
                }
              />

              {/* Categories management */}
              <Route
                path="/categories"
                element={
                  <ProtectedRoute>
                    <CategoriesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/categories/:id"
                element={
                  <ProtectedRoute>
                    <CategoryPage />
                  </ProtectedRoute>
                }
              />

              {/* Stats, settings and profile */}
              <Route
                path="/stats"
                element={
                  <ProtectedRoute>
                    <StatsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <UserProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />

              {/* Default routes */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;
