import React, { useEffect, useState } from "react";
import API from "../services/api";
import { Link, useNavigate } from "react-router-dom";
import { Pie } from "react-chartjs-2";
import "chart.js/auto";
import { useTheme } from "../context/ThemeContext";
import DarkModeToggle from "../components/DarkModeToggle";
import getDashboardStyles from "../styles/dashboardStyles";

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
  const s = getDashboardStyles(isDark);

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
          <div style={s.latestEntry}>
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
                    <th style={s.thRight}>Amount</th>
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
                        <td style={s.tdAmount}>
                          ₹{exp.amount.toLocaleString("en-IN")}
                        </td>
                        <td style={s.tdDate}>{exp.date}</td>
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
                      <span style={s.legendValue}>
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
