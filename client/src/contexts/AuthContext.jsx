// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Placeholder functions - implement actual logic later
  const login = async (email, password) => {
    // Temporary implementation
    console.log("Login attempt with:", email, password);
    setIsAuthenticated(true);
    setUser({ email });
    return true;
  };

  const register = async (userData) => {
    // Temporary implementation
    console.log("Register attempt with:", userData);
    return true;
  };

  const logout = () => {
    // Temporary implementation
    setUser(null);
    setIsAuthenticated(false);
  };

  useEffect(() => {
    // Simulate checking for stored authentication
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        isAuthenticated,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
