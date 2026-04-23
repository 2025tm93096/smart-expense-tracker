import React, { useEffect, useState } from "react";
import API from "../services/api";
import { Link, useNavigate } from "react-router-dom";
import { Pie } from "react-chartjs-2";
import "chart.js/auto";
import { useTheme } from "../context/ThemeContext";
import DarkModeToggle from "../components/DarkModeToggle";

const CATEGORY_COLORS = [
  "#667eea",
  "#f6ad55",
  "#68d391",
  "#fc8181",
  "#76e4f7",
  "#b794f4",
  "#f687b3",
  "#fbd38d",
  "#9ae6b4",
  "#90cdf4",
];

function Dashboard() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isDark } = useTheme();
  const navigate = useNavigate();

  // ── styles ──────────────────────────────────────────────
  const s = {
    page: {
      minHeight: "100vh",
      background: isDark ? "#0f0c29" : "#f0f2f8",
      color: isDark ? "#e8e8f4" : "#1a1a2e",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      padding: "32px 24px",
      transition: "background 0.3s, color 0.3s",
    },
    header: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: "28px",
      flexWrap: "wrap",
      gap: "12px",
      paddingRight: "100px",
    },
    title: {
      fontSize: "24px",
      fontWeight: "700",
      margin: 0,
    },
    headerRight: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
    },
    addBtn: {
      padding: "10px 20px",
      background: "linear-gradient(135deg, #667eea, #764ba2)",
      color: "#fff",
      borderRadius: "8px",
      textDecoration: "none",
      fontWeight: "600",
      fontSize: "14px",
      whiteSpace: "nowrap",
    },
    logoutBtn: {
      padding: "10px 16px",
      background: "transparent",
      color: isDark ? "#fc8181" : "#e53e3e",
      border: `1.5px solid ${isDark ? "#fc8181" : "#e53e3e"}`,
      borderRadius: "8px",
      fontWeight: "600",
      fontSize: "14px",
      cursor: "pointer",
    },
    summaryRow: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
      gap: "16px",
      marginBottom: "24px",
    },
    summaryCard: {
      background: isDark ? "#1e2845" : "#fff",
      borderRadius: "12px",
      padding: "20px 24px",
      boxShadow: isDark
        ? "0 4px 20px rgba(0,0,0,0.4)"
        : "0 4px 20px rgba(0,0,0,0.07)",
      transition: "background 0.3s",
    },
    summaryLabel: {
      fontSize: "12px",
      fontWeight: "600",
      color: isDark ? "#9090b8" : "#888",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      marginBottom: "6px",
    },
    summaryValue: {
      fontSize: "26px",
      fontWeight: "700",
      color: isDark ? "#e8e8f4" : "#1a1a2e",
    },
    summaryAccent: {
      fontSize: "26px",
      fontWeight: "700",
      background: "linear-gradient(135deg, #667eea, #764ba2)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "24px",
      alignItems: "start",
    },
    card: {
      background: isDark ? "#1e2845" : "#fff",
      borderRadius: "12px",
      padding: "24px",
      boxShadow: isDark
        ? "0 4px 20px rgba(0,0,0,0.4)"
        : "0 4px 20px rgba(0,0,0,0.07)",
      transition: "background 0.3s",
    },
    cardTitle: {
      fontSize: "16px",
      fontWeight: "700",
      marginBottom: "16px",
      color: isDark ? "#e8e8f4" : "#1a1a2e",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      fontSize: "14px",
    },
    th: {
      textAlign: "left",
      padding: "10px 12px",
      background: isDark ? "#16213e" : "#f7f8fc",
      color: isDark ? "#9090b8" : "#888",
      fontWeight: "600",
      fontSize: "12px",
      textTransform: "uppercase",
      letterSpacing: "0.4px",
      borderRadius: "6px",
    },
    td: {
      padding: "12px 12px",
      borderBottom: `1px solid ${isDark ? "#2a2a4a" : "#f0f0f0"}`,
      color: isDark ? "#c8c8e8" : "#333",
      verticalAlign: "middle",
    },
    badge: (color) => ({
      display: "inline-block",
      padding: "3px 10px",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: "600",
      background: color + "22",
      color: color,
    }),
    emptyText: {
      textAlign: "center",
      color: isDark ? "#5a5a7a" : "#bbb",
      padding: "32px 0",
      fontSize: "14px",
    },
    pieWrap: {
      maxWidth: "320px",
      margin: "0 auto",
    },
    legend: {
      marginTop: "20px",
      display: "flex",
      flexDirection: "column",
      gap: "8px",
    },
    legendItem: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      fontSize: "13px",
      color: isDark ? "#c8c8e8" : "#444",
    },
    legendLeft: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    legendDot: (color) => ({
      width: "10px",
      height: "10px",
      borderRadius: "50%",
      background: color,
      flexShrink: 0,
    }),
  };

  // ── data fetching ────────────────────────────────────────
  useEffect(() => {
    API.get("/expenses")
      .then((res) => setExpenses(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  // ── derived stats ────────────────────────────────────────
  const totalAmount = expenses.reduce((s, e) => s + e.amount, 0);
  const categories = [...new Set(expenses.map((e) => e.category))];
  const categoryTotals = categories.map((cat) =>
    expenses
      .filter((e) => e.category === cat)
      .reduce((s, e) => s + e.amount, 0),
  );

  const pieData = {
    labels: categories,
    datasets: [
      {
        data: categoryTotals,
        backgroundColor: categories.map(
          (_, i) => CATEGORY_COLORS[i % CATEGORY_COLORS.length],
        ),
        borderWidth: 2,
        borderColor: isDark ? "#1e2845" : "#fff",
      },
    ],
  };

  const pieOptions = {
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ₹${ctx.parsed.toLocaleString("en-IN")}`,
        },
      },
    },
    maintainAspectRatio: true,
  };

  return (
    <div style={s.page}>
      <DarkModeToggle />
      {/* Header */}
      <div style={s.header}>
        <h2 style={s.title}>💰 Smart Expense Tracker</h2>
        <div style={s.headerRight}>
          <Link to="/add-expense" style={s.addBtn}>
            + Add Expense
          </Link>
          <button style={s.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={s.summaryRow}>
        <div style={s.summaryCard}>
          <div style={s.summaryLabel}>Total Expenses</div>
          <div style={s.summaryValue}>{expenses.length}</div>
        </div>
        <div style={s.summaryCard}>
          <div style={s.summaryLabel}>Total Amount</div>
          <div style={s.summaryAccent}>
            ₹{totalAmount.toLocaleString("en-IN")}
          </div>
        </div>
        <div style={s.summaryCard}>
          <div style={s.summaryLabel}>Categories</div>
          <div style={s.summaryValue}>{categories.length}</div>
        </div>
        <div style={s.summaryCard}>
          <div style={s.summaryLabel}>Latest Entry</div>
          <div
            style={{ ...s.summaryValue, fontSize: "16px", paddingTop: "4px" }}
          >
            {expenses.length > 0 ? expenses[0].date : "—"}
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div style={s.grid}>
        {/* Expense List */}
        <div style={s.card}>
          <div style={s.cardTitle}>All Expenses</div>
          {loading ? (
            <div style={s.emptyText}>Loading...</div>
          ) : expenses.length === 0 ? (
            <div style={s.emptyText}>No expenses yet. Add your first one!</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={s.th}>Category</th>
                    <th style={{ ...s.th, textAlign: "right" }}>Amount</th>
                    <th style={s.th}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((exp, i) => {
                    const color =
                      CATEGORY_COLORS[
                        categories.indexOf(exp.category) %
                          CATEGORY_COLORS.length
                      ];
                    return (
                      <tr key={exp._id}>
                        <td style={s.td}>
                          <span style={s.badge(color)}>{exp.category}</span>
                        </td>
                        <td
                          style={{
                            ...s.td,
                            textAlign: "right",
                            fontWeight: "600",
                          }}
                        >
                          ₹{exp.amount.toLocaleString("en-IN")}
                        </td>
                        <td
                          style={{
                            ...s.td,
                            color: isDark ? "#9090b8" : "#999",
                          }}
                        >
                          {exp.date}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pie Chart */}
        <div style={s.card}>
          <div style={s.cardTitle}>Spending by Category</div>
          {categories.length === 0 ? (
            <div style={s.emptyText}>No data to display.</div>
          ) : (
            <>
              <div style={s.pieWrap}>
                <Pie data={pieData} options={pieOptions} />
              </div>
              <div style={s.legend}>
                {categories.map((cat, i) => {
                  const color = CATEGORY_COLORS[i % CATEGORY_COLORS.length];
                  const pct = totalAmount
                    ? ((categoryTotals[i] / totalAmount) * 100).toFixed(1)
                    : 0;
                  return (
                    <div key={cat} style={s.legendItem}>
                      <div style={s.legendLeft}>
                        <div style={s.legendDot(color)} />
                        <span>{cat}</span>
                      </div>
                      <span style={{ fontWeight: "600" }}>
                        ₹{categoryTotals[i].toLocaleString("en-IN")} ({pct}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
