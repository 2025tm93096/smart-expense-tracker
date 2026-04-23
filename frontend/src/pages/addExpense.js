import React, { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import DarkModeToggle from "../components/DarkModeToggle";
import getAddExpenseStyles from "../styles/addExpenseStyles";

function AddExpense() {
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const s = getAddExpenseStyles(isDark);

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
    <div style={s.page}>
      <DarkModeToggle />
      <div style={s.card}>
        <h2 style={s.title}>Add Expense</h2>
        <form onSubmit={handleAdd}>
          <label style={s.label} htmlFor="category">
            Category
          </label>
          <input
            id="category"
            style={s.input}
            type="text"
            placeholder="e.g. Food, Travel"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          />
          <label style={s.label} htmlFor="amount">
            Amount (₹)
          </label>
          <input
            id="amount"
            style={s.input}
            type="number"
            placeholder="Enter amount"
            value={amount}
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
          <button type="submit" style={s.submitBtn}>
            Add Expense
          </button>
        </form>
        <button
          type="button"
          style={s.backBtn}
          onClick={() => navigate("/dashboard")}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

export default AddExpense;
