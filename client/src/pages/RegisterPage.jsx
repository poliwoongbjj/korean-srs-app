// pages/RegisterPage.jsx - Registration page

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import "./AuthPages.css";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated, error, clearError } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  // Only clear errors when component mounts
  useEffect(() => {
    return () => {
      clearError && clearError();
    };
  }, []);

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

    if (!formData.username.trim()) {
      errors.username = "Username is required";
    } else if (formData.username.length < 3) {
      errors.username = "Username must be at least 3 characters";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
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
        // Call register function from auth context
        const success = await register({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        });

        if (success) {
          navigate("/login", { state: { fromRegistration: true } });
        }
      } catch (err) {
        console.error("Registration error:", err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="auth-page">
      {/* Debug info - remove after fixing */}
      <div style={{ background: "yellow", padding: "10px" }}>
        Error state: {error ? error : "No error"}
      </div>
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
              Learn with <span className="highlight">Wanki</span>
            </h1>
          </div>
          <p>Create an account and start learning languages today</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Choose a username"
              className={formErrors.username ? "error" : ""}
            />
            {formErrors.username && (
              <div className="error-message">{formErrors.username}</div>
            )}
          </div>

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
              placeholder="Create a password"
              className={formErrors.password ? "error" : ""}
            />
            {formErrors.password && (
              <div className="error-message">{formErrors.password}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              className={formErrors.confirmPassword ? "error" : ""}
            />
            {formErrors.confirmPassword && (
              <div className="error-message">{formErrors.confirmPassword}</div>
            )}
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="primary-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating Account..." : "Sign Up"}
            </button>
          </div>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account? <Link to="/login">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
