import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API_URL from "../config";
import "./Auth.css";

const Signup = () => {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [message,  setMessage]  = useState("");
  const [loading,  setLoading]  = useState(false);
  const [msgType,  setMsgType]  = useState("error");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res  = await fetch(`${API_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (res.ok) {
        setMsgType("success");
        setMessage("Account created! Redirecting to login...");
        setFormData({ name: "", email: "", password: "" });
        setTimeout(() => navigate("/login"), 1200);
      } else {
        setMsgType("error");
        setMessage(data.message || "Signup failed. Please try again.");
      }
    } catch {
      setMsgType("error");
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="auth-brand">
          <span className="auth-logo">UKZAI</span>
          <p className="auth-tagline">Pakistan's hottest noodles 🔥</p>
        </div>

        <h2 className="auth-title">Create account</h2>
        <p className="auth-sub">Join thousands of Buldak lovers</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label className="auth-label">Full Name</label>
            <input
              className="auth-input"
              type="text"
              name="name"
              placeholder="Your name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="auth-field">
            <label className="auth-label">Email Address</label>
            <input
              className="auth-input"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="auth-field">
            <label className="auth-label">Password</label>
            <input
              className="auth-input"
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {message && (
            <div className={`auth-message ${msgType}`}>{message}</div>
          )}

          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? <span className="auth-spinner"></span> : "Create Account"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
