import React, { useEffect, useState } from "react";
import API from "../services/api";
import { Link } from "react-router-dom";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS } from "chart.js/auto";
import { useTheme } from "../context/ThemeContext";
import DarkModeToggle from "../components/DarkModeToggle";

function Dashboard() {
  const [expenses, setExpenses] = useState([]);
  const { isDark } = useTheme();

  const pageStyle = {
    minHeight: "100vh",
    background: isDark ? "#0f0c29" : "#f5f6fa",
    color: isDark ? "#e8e8f4" : "#1a1a2e",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    padding: "40px 24px",
    transition: "background 0.3s, color 0.3s",
  };

  const cardStyle = {
    background: isDark ? "#1e2845" : "#fff",
    borderRadius: "12px",
    padding: "24px",
    marginBottom: "24px",
    boxShadow: isDark
      ? "0 4px 20px rgba(0,0,0,0.4)"
      : "0 4px 20px rgba(0,0,0,0.08)",
    transition: "background 0.3s",
  };

  const linkStyle = {
    display: "inline-block",
    marginBottom: "20px",
    padding: "10px 20px",
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    color: "#fff",
    borderRadius: "8px",
    textDecoration: "none",
    fontWeight: "600",
    fontSize: "14px",
  };

  const listItemStyle = {
    padding: "10px 0",
    borderBottom: `1px solid ${isDark ? "#3a3a5c" : "#eee"}`,
    fontSize: "15px",
    color: isDark ? "#c8c8e8" : "#333",
  };

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const res = await API.get("/expenses");
        setExpenses(res.data);
      } catch (err) {
        alert("Failed to fetch expenses");
      }
    };
    fetchExpenses();
  }, []);

  // Prepare chart data
  const categories = [...new Set(expenses.map((e) => e.category))];
  const totals = categories.map((cat) =>
    expenses
      .filter((e) => e.category === cat)
      .reduce((sum, e) => sum + e.amount, 0),
  );

  const data = {
    labels: categories,
    datasets: [
      {
        label: "Expenses",
        data: totals,
        backgroundColor: ["#ff6384", "#36a2eb", "#ffce56", "#4bc0c0"],
      },
    ],
  };

  return (
    <div style={pageStyle}>
      <DarkModeToggle />
      <h2 style={{ marginBottom: "20px" }}>Dashboard</h2>
      <Link to="/add-expense" style={linkStyle}>
        + Add Expense
      </Link>
      <div style={cardStyle}>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {expenses.map((exp) => (
            <li key={exp._id} style={listItemStyle}>
              {exp.category} — ₹{exp.amount} on {exp.date}
            </li>
          ))}
        </ul>
      </div>
      <div style={cardStyle}>
        <Bar data={data} />
      </div>
    </div>
  );
}

export default Dashboard;
