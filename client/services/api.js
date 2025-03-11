// services/api.js - Axios API service

import axios from "axios";

// Create axios instance
const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem("token");

    // If token exists, add it to headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle authentication errors
    if (error.response && error.response.status === 401) {
      // Clear token from localStorage
      localStorage.removeItem("token");

      // Redirect to login page if not already there
      if (window.location.pathname !== "/login") {
        window.location.href = "/login?session_expired=true";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
