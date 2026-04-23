import React, { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import DarkModeToggle from "../components/DarkModeToggle";

function AddExpense() {
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const pageStyle = {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: isDark
      ? "linear-gradient(135deg, #0f0c29 0%, #302b63 100%)"
      : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    transition: "background 0.3s",
  };

  const cardStyle = {
    background: isDark ? "#1e2845" : "#fff",
    borderRadius: "16px",
    padding: "48px 40px",
    width: "100%",
    maxWidth: "420px",
    boxShadow: isDark
      ? "0 20px 60px rgba(0,0,0,0.5)"
      : "0 20px 60px rgba(0,0,0,0.2)",
    transition: "background 0.3s",
  };

  const titleStyle = {
    textAlign: "center",
    fontSize: "24px",
    fontWeight: "700",
    color: isDark ? "#e8e8f4" : "#1a1a2e",
    marginBottom: "28px",
  };

  const labelStyle = {
    display: "block",
    fontSize: "13px",
    fontWeight: "600",
    color: isDark ? "#b0b0cc" : "#555",
    marginBottom: "6px",
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "8px",
    border: `1.5px solid ${isDark ? "#3a3a5c" : "#e0e0e0"}`,
    fontSize: "15px",
    outline: "none",
    boxSizing: "border-box",
    color: isDark ? "#e8e8f4" : "#333",
    background: isDark ? "#16213e" : "#fafafa",
    transition: "background 0.3s, border-color 0.3s",
    marginBottom: "20px",
  };

  const submitBtnStyle = {
    width: "100%",
    padding: "13px",
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "8px",
  };

  const backBtnStyle = {
    width: "100%",
    padding: "12px",
    marginTop: "12px",
    background: "transparent",
    color: isDark ? "#9090ee" : "#667eea",
    border: `1.5px solid ${isDark ? "#9090ee" : "#667eea"}`,
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await API.post("/expenses/add", { category, amount, date });
      alert("Expense added!");
      navigate("/dashboard");
    } catch (err) {
      alert("Failed to add expense");
    }
  };

  return (
    <div style={pageStyle}>
      <DarkModeToggle />
      <div style={cardStyle}>
        <h2 style={titleStyle}>Add Expense</h2>
        <form onSubmit={handleAdd}>
          <label style={labelStyle} htmlFor="category">
            Category
          </label>
          <input
            id="category"
            style={inputStyle}
            type="text"
            placeholder="e.g. Food, Travel"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          />
          <label style={labelStyle} htmlFor="amount">
            Amount (₹)
          </label>
          <input
            id="amount"
            style={inputStyle}
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
          <label style={labelStyle} htmlFor="date">
            Date
          </label>
          <input
            id="date"
            style={inputStyle}
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
          <button type="submit" style={submitBtnStyle}>
            Add Expense
          </button>
        </form>
        <button
          type="button"
          style={backBtnStyle}
          onClick={() => navigate("/dashboard")}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

export default AddExpense;
