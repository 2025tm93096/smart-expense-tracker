import React, { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import getAuthStyles from "../styles/authStyles";
import { useTheme } from "../context/ThemeContext";
import DarkModeToggle from "../components/DarkModeToggle";

function Signup() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [purpose, setPurpose] = useState("Personal");
  const [purposeNote, setPurposeNote] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [mobile, setMobile] = useState("");

  const COUNTRY_CODES = [
    { code: "+91", label: "🇮🇳 +91" },
    { code: "+1", label: "🇺🇸 +1" },
    { code: "+44", label: "🇬🇧 +44" },
    { code: "+61", label: "🇦🇺 +61" },
    { code: "+971", label: "🇦🇪 +971" },
    { code: "+65", label: "🇸🇬 +65" },
    { code: "+81", label: "🇯🇵 +81" },
    { code: "+49", label: "🇩🇪 +49" },
    { code: "+33", label: "🇫🇷 +33" },
    { code: "+86", label: "🇨🇳 +86" },
  ];
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const styles = getAuthStyles(isDark);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await API.post("/signup", {
        username,
        password,
        purpose,
        purposeNote: purpose === "Other" ? purposeNote : "",
        mobile: `${countryCode}${mobile}`,
      });
      setSuccess("Account created! Redirecting to login...");
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      setError("Signup failed. Username may already be taken.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <DarkModeToggle />
      <div style={styles.card}>
        <div style={styles.logo}>
          <span style={styles.logoIcon}>💰</span>
        </div>
        <h2 style={styles.title}>Create Account</h2>
        <p style={styles.subtitle}>Join Smart Expense Tracker today</p>

        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.success}>{success}</div>}

        <form onSubmit={handleSignup}>
          <div style={styles.inputWrapper}>
            <label style={styles.label} htmlFor="username">
              Username
            </label>
            <input
              id="username"
              style={styles.input}
              type="text"
              placeholder="Choose a username"
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
              placeholder="Choose a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div style={styles.inputWrapper}>
            <label style={styles.label} htmlFor="purpose">
              Purpose of Use
            </label>
            <select
              id="purpose"
              style={styles.select}
              value={purpose}
              onChange={(e) => {
                setPurpose(e.target.value);
                if (e.target.value !== "Other") setPurposeNote("");
              }}
            >
              <option value="Personal">Personal</option>
              <option value="Retail Shop">Retail Shop</option>
              <option value="Trip">Trip</option>
              <option value="Petrol">Petrol</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {purpose === "Other" && (
            <div style={styles.inputWrapper}>
              <label style={styles.label} htmlFor="purposeNote">
                Please specify
              </label>
              <input
                id="purposeNote"
                style={styles.input}
                type="text"
                placeholder="Describe your purpose..."
                value={purposeNote}
                onChange={(e) => setPurposeNote(e.target.value)}
                maxLength={200}
                required
              />
            </div>
          )}

          <div style={styles.inputWrapper}>
            <label style={styles.label} htmlFor="mobile">
              Mobile Number
            </label>
            <div style={styles.phoneRow}>
              <select
                style={styles.countrySelect}
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                aria-label="Country code"
              >
                {COUNTRY_CODES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
              <input
                id="mobile"
                style={styles.phoneInput}
                type="tel"
                placeholder="Enter mobile number"
                value={mobile}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  if (val.length <= 12) setMobile(val);
                }}
                pattern="[0-9]{7,12}"
                title="Enter 7–12 digit mobile number"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            style={{ ...styles.primaryBtn, opacity: loading ? 0.7 : 1 }}
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
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
          onClick={() => navigate("/")}
        >
          Back to Sign In
        </button>
      </div>
    </div>
  );
}

export default Signup;
