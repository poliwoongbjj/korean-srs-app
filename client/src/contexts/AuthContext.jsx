// contexts/AuthContext.jsx - Authentication context

import React, { createContext, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/services/api";

// Create auth context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // Load user from token on initial load
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          // Set token in api headers
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

          // Get user profile
          const res = await api.get("/auth/profile");
          setUser(res.data.data);
          setError(null);
        } catch (err) {
          console.error("Error loading user:", err);
          localStorage.removeItem("token");
          setToken(null);
          setUser(null);
          setError("Session expired. Please login again.");
        }
      }

      setLoading(false);
    };

    loadUser();
  }, [token]);

  // Register user
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      await api.post("/auth/register", userData);

      return true;
    } catch (err) {
      console.error("Registration error:", err);

      // Extract the error message from the response
      // Notice how we dive into err.response.data.message
      const errorMessage =
        err.response?.data?.message || "Registration failed. Please try again.";
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const res = await api.post("/auth/login", { email, password });

      const { token: newToken, user: userData } = res.data.data;

      // Save token to localStorage
      localStorage.setItem("token", newToken);
      setToken(newToken);
      setUser(userData);

      // Set token in api headers
      api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;

      return true;
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err.response?.data?.message ||
          "Login failed. Please check your credentials."
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    // Remove token from localStorage
    localStorage.removeItem("token");

    // Remove token from api headers
    delete api.defaults.headers.common["Authorization"];

    // Clear state
    setToken(null);
    setUser(null);

    // Redirect to login page
    navigate("/login");
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Context value
  const contextValue = {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!token,
    register,
    login,
    logout,
    clearError,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

// Custom hook for using the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

export default AuthContext;
