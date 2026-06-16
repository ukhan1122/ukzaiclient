import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import API_URL from "../config";
import "./Auth.css";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message,  setMessage]  = useState("");
  const [loading,  setLoading]  = useState(false);
  const [msgType,  setMsgType]  = useState("error");

  const navigate = useNavigate();
  const location = useLocation();
  const from     = location.state?.from || "/";

  const handleChange = (e) =>
    setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res  = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (res.ok) {
        const { token, user, role } = data;
        localStorage.setItem("token", token);
        localStorage.setItem("user",  JSON.stringify(user));
        localStorage.setItem("role",  role);
        setMsgType("success");
        setMessage("Login successful! Redirecting...");
        setTimeout(() => navigate(role === "admin" ? "/admin" : from), 800);
      } else {
        setMsgType("error");
        setMessage(data.message || "Login failed. Please check your credentials.");
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

        <h2 className="auth-title">Welcome back</h2>
        <p className="auth-sub">Sign in to your account</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label className="auth-label">Email Address</label>
            <input className="auth-input" type="email" name="email"
              placeholder="you@example.com" value={formData.email}
              onChange={handleChange} required />
          </div>

          <div className="auth-field">
            <label className="auth-label">Password</label>
            <input className="auth-input" type="password" name="password"
              placeholder="••••••••" value={formData.password}
              onChange={handleChange} required />
          </div>

          {message && <div className={`auth-message ${msgType}`}>{message}</div>}

          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? <span className="auth-spinner"></span> : "Sign In"}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account? <Link to="/signup">Create one</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
