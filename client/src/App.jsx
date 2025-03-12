// App.jsx - Main application component

import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "@contexts/AuthContext";

// Pages
import LoginPage from "@pages/LoginPage";
import RegisterPage from "@pages/RegisterPage";
import DashboardPage from "@pages/DashboardPage";
import StudyPage from "@pages/StudyPage";
import CardsPage from "@pages/CardsPage";
import DecksPage from "@pages/DecksPage";
import DeckPage from "@pages/DeckPage";
import NewCardPage from "@pages/NewCardPage";
import NewDeckPage from "@pages/NewDeckPage";
import StatsPage from "@pages/StatsPage";
import SettingsPage from "@pages/SettingsPage";
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
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

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
                path="/decks"
                element={
                  <ProtectedRoute>
                    <DecksPage />
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
                path="/decks/new"
                element={
                  <ProtectedRoute>
                    <NewDeckPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/stats"
                element={
                  <ProtectedRoute>
                    <StatsPage />
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
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
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
