import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("https://ukzai.onrender.com/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        const { token, user, role } = data;

        // Save token and user data
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        // ✅ Log everything to console
        console.log("User Data:", user);
        console.log("Token:", token);
        console.log("Role:", role);

        setMessage("✅ Login successful!");

        // Navigate based on role
        if (role === "admin") navigate("/admin");
        else navigate("/");
      } else {
        setMessage(data.message || "❌ Login failed");
        console.error("Login failed:", data.message);
      }
    } catch (err) {
      console.error("Error during login:", err);
      setMessage("❌ Something went wrong");
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-logo">MyApp</div>
        <h2>Login</h2>

        <input
          className="auth-input"
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <input
          className="auth-input"
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <button className="auth-btn" type="submit">Login</button>

        {message && <p className="auth-message">{message}</p>}

        <p className="auth-switch">
          Don’t have an account? <Link to="/signup">Signup</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
