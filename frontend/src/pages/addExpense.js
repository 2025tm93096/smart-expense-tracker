import React, { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import TopBar from "../components/TopBar";
import getAddExpenseStyles from "../styles/addExpenseStyles";
import useWindowWidth from "../hooks/useWindowWidth";

const PRESET_CATEGORIES = [
  "Food",
  "Travel",
  "Shopping",
  "Entertainment",
  "Utilities",
  "Health",
  "Education",
  "Rent",
  "Petrol",
  "Split Bill",
  "Other",
];

function AddExpense() {
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [recurring, setRecurring] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const width = useWindowWidth();
  const isMobile = width < 768;
  const s = getAddExpenseStyles(isDark, isMobile);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await API.post("/expenses/add", { category, amount, date, recurring });
      setSuccess(true);
      setTimeout(() => navigate("/dashboard"), 900);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add expense");
    }
  };

  return (
    <div style={s.page} className="ae-page">
      <div style={s.topHeader}>
        <button
          type="button"
          style={s.backBtn}
          onClick={() => navigate("/dashboard")}
        >
          ← Dashboard
        </button>
        <TopBar />
      </div>
      <div style={s.card} className="ae-card">
        <h2 style={s.title}>Add Expense</h2>
        {error && <div style={s.errorBox}>{error}</div>}
        {success && <div style={s.successBox}>Expense added! ✓</div>}
        <form onSubmit={handleAdd}>
          <label style={s.label} htmlFor="category">
            Category
          </label>
          <input
            id="category"
            style={s.input}
            type="text"
            list="category-list"
            placeholder="e.g. Food, Travel"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            maxLength={50}
            required
          />
          <datalist id="category-list">
            {PRESET_CATEGORIES.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>

          <label style={s.label} htmlFor="amount">
            Amount (₹)
          </label>
          <input
            id="amount"
            style={s.input}
            type="number"
            placeholder="Enter amount"
            value={amount}
            min="0.01"
            step="0.01"
            onChange={(e) => setAmount(e.target.value)}
            required
          />

          <label style={s.label} htmlFor="date">
            Date
          </label>
          <input
            id="date"
            style={s.input}
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />

          <label style={s.checkRow}>
            <input
              type="checkbox"
              checked={recurring}
              onChange={(e) => setRecurring(e.target.checked)}
              style={{
                accentColor: "#667eea",
                width: "16px",
                height: "16px",
                cursor: "pointer",
              }}
            />
            <span>Recurring monthly expense</span>
          </label>

          <button type="submit" style={s.submitBtn}>
            Add Expense
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddExpense;
