// pages/LoginPage.jsx - Login page

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import "./AuthPages.css";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, error, clearError } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from || "/dashboard";
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  // Clear errors when component mounts
  useEffect(() => {
    clearError && clearError();
  }, [clearError]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear validation error when user types
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: "",
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      setIsSubmitting(true);

      try {
        const success = await login(formData.email, formData.password);

        if (success) {
          const from = location.state?.from || "/dashboard";
          navigate(from, { replace: true });
        }
      } catch (err) {
        console.error("Login error:", err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Check if there's a session expired message in the URL
  const sessionExpired =
    new URLSearchParams(location.search).get("session_expired") === "true";

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <div className="auth-logo">
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Koala face */}
              <circle cx="16" cy="16" r="15" fill="#AAA397" />

              {/* Ears */}
              <circle cx="6" cy="8" r="4" fill="#7D7168" />
              <circle cx="26" cy="8" r="4" fill="#7D7168" />

              {/* Inner ears */}
              <circle cx="6" cy="8" r="2" fill="#FFCBC0" />
              <circle cx="26" cy="8" r="2" fill="#FFCBC0" />

              {/* Face markings */}
              <circle cx="16" cy="19" r="8" fill="#FFFFFF" />

              {/* Eyes */}
              <circle cx="12" cy="14" r="2" fill="#000000" />
              <circle cx="20" cy="14" r="2" fill="#000000" />

              {/* Nose */}
              <ellipse cx="16" cy="17" rx="3" ry="2" fill="#333333" />

              {/* Book */}
              <rect x="10" y="22" width="12" height="6" fill="#4263EB" />
              <line
                x1="16"
                y1="22"
                x2="16"
                y2="28"
                stroke="#FFFFFF"
                strokeWidth="0.5"
              />
            </svg>
            <h1>
              <span className="highlight">Welcome</span>
            </h1>
          </div>
          <p>Sign in to continue learning</p>
        </div>

        {sessionExpired && (
          <div className="auth-alert">
            Your session has expired. Please login again.
          </div>
        )}

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className={formErrors.email ? "error" : ""}
            />
            {formErrors.email && (
              <div className="error-message">{formErrors.email}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className={formErrors.password ? "error" : ""}
            />
            {formErrors.password && (
              <div className="error-message">{formErrors.password}</div>
            )}
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="primary-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing in..." : "Sign In"}
            </button>
          </div>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account? <Link to="/register">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
