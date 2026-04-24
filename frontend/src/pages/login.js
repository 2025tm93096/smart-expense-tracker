import React, { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import getAuthStyles from "../styles/authStyles";
import { useTheme } from "../context/ThemeContext";
import DarkModeToggle from "../components/DarkModeToggle";
import useWindowWidth from "../hooks/useWindowWidth";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const width = useWindowWidth();
  const isMobile = width < 768;
  const styles = getAuthStyles(isDark, isMobile);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await API.post("/login", { username, password });
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid username or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page} className="auth-page">
      <DarkModeToggle />
      <div style={styles.card} className="auth-card">
        <div style={styles.logo}>
          <span style={styles.logoIcon}>💰</span>
        </div>
        <h2 style={styles.title}>Smart Expense Tracker</h2>
        <p style={styles.subtitle}>Sign in to manage your expenses</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleLogin}>
          <div style={styles.inputWrapper}>
            <label style={styles.label} htmlFor="username">
              Username
            </label>
            <input
              id="username"
              style={styles.input}
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div style={styles.inputWrapper}>
            <label style={styles.label} htmlFor="password">
              Password
            </label>
            <input
              id="password"
              style={styles.input}
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            style={{ ...styles.primaryBtn, opacity: loading ? 0.7 : 1 }}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div style={styles.divider}>
          <div style={styles.dividerLine} />
          <span>or</span>
          <div style={styles.dividerLine} />
        </div>

        <button
          type="button"
          style={styles.outlineBtn}
          onClick={() => navigate("/signup")}
        >
          Create an Account
        </button>
      </div>
    </div>
  );
}

export default Login;
