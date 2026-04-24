import React, { useEffect, useState } from "react";
import API from "../services/api";
import { Link } from "react-router-dom";
import { Pie } from "react-chartjs-2";
import "chart.js/auto";
import { useTheme } from "../context/ThemeContext";
import TopBar from "../components/TopBar";
import getDashboardStyles from "../styles/dashboardStyles";
import useWindowWidth from "../hooks/useWindowWidth";

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

const EmptySVG = ({ isDark }) => (
  <svg
    width="72"
    height="72"
    viewBox="0 0 80 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="10"
      y="30"
      width="60"
      height="38"
      rx="6"
      fill={isDark ? "#2a2a5a" : "#ede9fe"}
    />
    <rect
      x="10"
      y="22"
      width="60"
      height="12"
      rx="4"
      fill={isDark ? "#3a3a7a" : "#c4b5fd"}
    />
    <circle cx="40" cy="19" r="9" fill={isDark ? "#667eea" : "#7c3aed"} />
    <line
      x1="40"
      y1="13"
      x2="40"
      y2="25"
      stroke="white"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
    <line
      x1="34"
      y1="19"
      x2="46"
      y2="19"
      stroke="white"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
    <rect
      x="20"
      y="42"
      width="20"
      height="4"
      rx="2"
      fill={isDark ? "#9090b8" : "#a78bfa"}
    />
    <rect
      x="20"
      y="50"
      width="30"
      height="4"
      rx="2"
      fill={isDark ? "#6060a0" : "#c4b5fd"}
    />
  </svg>
);

function Dashboard() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [incomingSplits, setIncomingSplits] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [monthFilter, setMonthFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [editingExpense, setEditingExpense] = useState(null);
  const [editData, setEditData] = useState({
    category: "",
    amount: "",
    date: "",
    recurring: false,
  });
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [budgetForm, setBudgetForm] = useState({ category: "", limit: "" });
  const [page, setPage] = useState(1);
  const [categoryModal, setCategoryModal] = useState(null);
  const [editingBudgetLimit, setEditingBudgetLimit] = useState(false);
  const [budgetLimitInput, setBudgetLimitInput] = useState("");
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [addExpenseData, setAddExpenseData] = useState({
    category: "",
    amount: "",
    date: "",
    recurring: false,
  });
  const [addExpenseError, setAddExpenseError] = useState("");
  const [addExpenseSuccess, setAddExpenseSuccess] = useState(false);
  const PAGE_SIZE = 10;
  const { isDark } = useTheme();
  const width = useWindowWidth();
  const isMobile = width < 768;
  const s = getDashboardStyles(isDark, isMobile);

  useEffect(() => {
    Promise.all([
      API.get("/expenses"),
      API.get("/splits/incoming"),
      API.get("/budgets"),
    ])
      .then(([expRes, splitRes, budgetRes]) => {
        setExpenses(expRes.data);
        setIncomingSplits(splitRes.data);
        setBudgets(budgetRes.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return d.toISOString().slice(0, 7);
  });

  const filteredExpenses = expenses
    .filter((exp) => {
      if (monthFilter && !exp.date.startsWith(monthFilter)) return false;
      if (categoryFilter && exp.category !== categoryFilter) return false;
      if (
        searchQuery &&
        !exp.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
        return false;
      return true;
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const totalPages = Math.ceil(filteredExpenses.length / PAGE_SIZE);
  const pagedExpenses = filteredExpenses.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  // Reset to page 1 whenever filters change
  const setMonthFilterAndReset = (v) => {
    setMonthFilter(v);
    setPage(1);
  };
  const setSearchQueryAndReset = (v) => {
    setSearchQuery(v);
    setPage(1);
  };
  const setCategoryFilterAndReset = (v) => {
    setCategoryFilter(v);
    setPage(1);
  };

  const totalAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const allCategories = [...new Set(expenses.map((e) => e.category))];
  const sortedCategoryPairs = [
    ...new Set(filteredExpenses.map((e) => e.category)),
  ]
    .map((cat) => [
      cat,
      filteredExpenses
        .filter((e) => e.category === cat)
        .reduce((sum, e) => sum + e.amount, 0),
    ])
    .sort((a, b) => b[1] - a[1]);
  const categories = sortedCategoryPairs.map(([cat]) => cat);
  const categoryTotals = sortedCategoryPairs.map(([, total]) => total);

  const budgetMap = budgets.reduce((acc, b) => {
    acc[b.category] = b;
    return acc;
  }, {});
  const currentMonth = new Date().toISOString().slice(0, 7);
  const spentByCategory = expenses
    .filter((e) => e.date.startsWith(currentMonth))
    .reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {});

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
    onClick: (_, elements) => {
      if (elements.length > 0) {
        setCategoryModal(categories[elements[0].index]);
      }
    },
  };

  const handleEditClick = (exp) => {
    setEditingExpense(exp);
    setEditData({
      category: exp.category,
      amount: exp.amount,
      date: exp.date,
      recurring: !!exp.recurring,
    });
  };

  const handleEditSave = async () => {
    try {
      const res = await API.put(`/expenses/${editingExpense._id}`, editData);
      setExpenses((prev) =>
        prev.map((e) => (e._id === editingExpense._id ? res.data : e)),
      );
      setEditingExpense(null);
    } catch {}
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this expense?")) return;
    try {
      await API.delete(`/expenses/${id}`);
      setExpenses((prev) => prev.filter((e) => e._id !== id));
    } catch {}
  };

  const handleExportCSV = () => {
    const rows = [["Category", "Amount", "Date", "To", "Recurring"]];
    filteredExpenses.forEach((e) =>
      rows.push([
        e.category,
        e.amount,
        e.date,
        e.toUser || "",
        e.recurring ? "Yes" : "No",
      ]),
    );
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `expenses${monthFilter ? "-" + monthFilter : ""}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleUpdateBudgetLimit = async (e) => {
    e.preventDefault();
    const cat = categoryModal;
    try {
      const res = await API.post("/budgets", {
        category: cat,
        monthlyLimit: parseFloat(budgetLimitInput),
      });
      setBudgets((prev) => {
        const idx = prev.findIndex((b) => b.category === res.data.category);
        return idx >= 0
          ? prev.map((b, i) => (i === idx ? res.data : b))
          : [...prev, res.data];
      });
      setEditingBudgetLimit(false);
    } catch {}
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    setAddExpenseError("");
    try {
      const res = await API.post("/expenses/add", addExpenseData);
      setExpenses((prev) => [res.data, ...prev]);
      setAddExpenseSuccess(true);
      setTimeout(() => {
        setShowAddExpense(false);
        setAddExpenseSuccess(false);
        setAddExpenseData({
          category: "",
          amount: "",
          date: "",
          recurring: false,
        });
      }, 900);
    } catch (err) {
      setAddExpenseError(
        err.response?.data?.message || "Failed to add expense",
      );
    }
  };

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/budgets", {
        category: budgetForm.category,
        monthlyLimit: parseFloat(budgetForm.limit),
      });
      setBudgets((prev) => {
        const idx = prev.findIndex((b) => b.category === res.data.category);
        return idx >= 0
          ? prev.map((b, i) => (i === idx ? res.data : b))
          : [...prev, res.data];
      });
      setBudgetForm({ category: "", limit: "" });
      setShowBudgetForm(false);
    } catch {}
  };

  const handleDeleteBudget = async (id) => {
    try {
      await API.delete(`/budgets/${id}`);
      setBudgets((prev) => prev.filter((b) => b._id !== id));
    } catch {}
  };

  return (
    <div style={s.page} className="db-page">
      {/* Header */}
      <div style={s.header} className="db-header">
        <h2 style={s.title} className="db-title">
          💰 Smart Expense Tracker
        </h2>
        <div style={s.headerRight} className="db-header-right">
          <Link
            to="/split-bills"
            style={{
              ...s.addBtn,
              background: "linear-gradient(135deg, #f6ad55, #ed8936)",
            }}
          >
            🔀 Split Bills
            {incomingSplits.length > 0 && (
              <span style={s.notifBadge}>{incomingSplits.length}</span>
            )}
          </Link>
          <button style={s.addBtn} onClick={() => setShowAddExpense(true)}>
            + Add Expense
          </button>
          <TopBar />
        </div>
      </div>

      {/* Incoming Splits */}
      {incomingSplits.length > 0 && (
        <div style={s.incomingCard}>
          <div style={s.cardTitle}>
            🔔 Split Requests ({incomingSplits.length})
          </div>
          {incomingSplits.map((split) => {
            const allSettled = split.members.every((m) => m.settled);
            return (
              <div key={split._id} style={s.incomingItem}>
                <div style={s.incomingLeft}>
                  <div style={s.incomingDesc}>{split.description}</div>
                  <div style={s.incomingMeta}>
                    From: {split.creator?.username || "Unknown"} ·{" "}
                    {new Date(split.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                </div>
                <div style={s.incomingRight}>
                  <div style={s.incomingShare}>
                    ₹{(split.totalAmount / split.members.length).toFixed(2)}
                  </div>
                  <span style={s.incomingBadge}>
                    {allSettled ? "✓ Settled" : "Pending"}
                  </span>
                </div>
              </div>
            );
          })}
          <div
            style={{
              fontSize: "12px",
              color: isDark ? "#9090b8" : "#999",
              marginTop: "8px",
            }}
          >
            Go to{" "}
            <Link
              to="/split-bills"
              style={{
                color: isDark ? "#a78bfa" : "#7c3aed",
                fontWeight: "600",
              }}
            >
              Split Bills
            </Link>{" "}
            to view details and mark yourself as settled.
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div style={s.summaryRow} className="db-summary-row">
        <div style={s.summaryCard}>
          <div style={s.summaryLabel}>Total Expenses</div>
          <div style={s.summaryValue}>{filteredExpenses.length}</div>
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
            {filteredExpenses.length > 0 ? filteredExpenses[0].date : "—"}
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div style={s.filterBar} className="db-filter-bar">
        <select
          style={s.filterSelect}
          className="db-filter-select"
          value={monthFilter}
          onChange={(e) => setMonthFilterAndReset(e.target.value)}
        >
          <option value="">All time</option>
          {monthOptions.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <input
          style={s.filterSearch}
          className="db-filter-search"
          type="text"
          placeholder="🔍 Search category..."
          value={searchQuery}
          onChange={(e) => setSearchQueryAndReset(e.target.value)}
        />
        <select
          style={s.filterSelect}
          className="db-filter-select"
          value={categoryFilter}
          onChange={(e) => setCategoryFilterAndReset(e.target.value)}
        >
          <option value="">All categories</option>
          {allCategories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <button
          style={s.exportBtn}
          className="db-export-btn"
          onClick={handleExportCSV}
        >
          ⬇ Export CSV
        </button>
      </div>

      {/* Category drill-down modal */}
      {categoryModal &&
        (() => {
          const catExpenses = filteredExpenses
            .filter((e) => e.category === categoryModal)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
          const catTotal = catExpenses.reduce((sum, e) => sum + e.amount, 0);
          const catBudget = budgetMap[categoryModal];
          const catSpent = spentByCategory[categoryModal] || 0;
          const catBudgetPct = catBudget
            ? (catSpent / catBudget.monthlyLimit) * 100
            : null;
          const catColor =
            CATEGORY_COLORS[
              categories.indexOf(categoryModal) % CATEGORY_COLORS.length
            ];
          return (
            <div
              style={s.modalOverlay}
              onClick={() => {
                setCategoryModal(null);
                setEditingBudgetLimit(false);
              }}
            >
              <div
                style={{
                  ...s.modal,
                  maxWidth: isMobile ? "calc(100vw - 32px)" : "480px",
                  maxHeight: "80vh",
                  display: "flex",
                  flexDirection: "column",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "16px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <div
                      style={{
                        width: "12px",
                        height: "12px",
                        borderRadius: "50%",
                        background: catColor,
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ ...s.modalTitle, margin: 0 }}>
                      {categoryModal}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setCategoryModal(null);
                      setEditingBudgetLimit(false);
                    }}
                  >
                    ×
                  </button>
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: isDark ? "#9090b8" : "#888",
                    marginBottom: "14px",
                  }}
                >
                  {catExpenses.length} expense
                  {catExpenses.length !== 1 ? "s" : ""} &nbsp;·&nbsp;
                  <strong style={{ color: isDark ? "#e8e8f4" : "#1a1a2e" }}>
                    ₹{catTotal.toLocaleString("en-IN")}
                  </strong>{" "}
                  total
                </div>

                {/* Budget warning banner */}
                {catBudget && (
                  <div
                    style={{
                      borderRadius: "8px",
                      padding: "10px 14px",
                      marginBottom: "14px",
                      background:
                        catBudgetPct >= 100
                          ? isDark
                            ? "#3d1a1a"
                            : "#fff5f5"
                          : catBudgetPct >= 80
                            ? isDark
                              ? "#3d2e1a"
                              : "#fffbf0"
                            : isDark
                              ? "#1a3d2e"
                              : "#f0fff4",
                      border: `1px solid ${
                        catBudgetPct >= 100
                          ? isDark
                            ? "#7a2020"
                            : "#fc8181"
                          : catBudgetPct >= 80
                            ? isDark
                              ? "#7a5a20"
                              : "#f6ad55"
                            : isDark
                              ? "#1a5c3a"
                              : "#68d391"
                      }`,
                    }}
                  >
                    <div
                      style={{
                        fontSize: "12px",
                        fontWeight: 700,
                        marginBottom: "6px",
                        color:
                          catBudgetPct >= 100
                            ? isDark
                              ? "#fc8181"
                              : "#e53e3e"
                            : catBudgetPct >= 80
                              ? isDark
                                ? "#f6ad55"
                                : "#c05621"
                              : isDark
                                ? "#68d391"
                                : "#276749",
                      }}
                    >
                      {catBudgetPct >= 100
                        ? "⚠ Budget Exceeded"
                        : catBudgetPct >= 80
                          ? "⚠ Approaching Budget Limit"
                          : "✓ Within Budget"}
                    </div>
                    <div
                      style={{
                        height: "6px",
                        borderRadius: "4px",
                        background: isDark ? "#2a2a4a" : "#e0e0e0",
                        marginBottom: "6px",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          borderRadius: "4px",
                          width: `${Math.min(catBudgetPct, 100)}%`,
                          background:
                            catBudgetPct >= 100
                              ? "#e53e3e"
                              : catBudgetPct >= 80
                                ? "#ed8936"
                                : "#38a169",
                          transition: "width 0.3s",
                        }}
                      />
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: isDark ? "#9090b8" : "#888",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "8px",
                        flexWrap: "wrap",
                      }}
                    >
                      <span>
                        ₹{catSpent.toLocaleString("en-IN")} spent of ₹
                        {catBudget.monthlyLimit.toLocaleString("en-IN")} monthly
                        limit ({Math.min(catBudgetPct, 100).toFixed(0)}%)
                      </span>
                      {!editingBudgetLimit && (
                        <button
                          onClick={() => {
                            setBudgetLimitInput(catBudget.monthlyLimit);
                            setEditingBudgetLimit(true);
                          }}
                          style={{
                            background: "none",
                            border: `1px solid ${isDark ? "#3a3a5c" : "#ddd"}`,
                            borderRadius: "6px",
                            padding: "2px 8px",
                            fontSize: "11px",
                            fontWeight: 600,
                            cursor: "pointer",
                            color: isDark ? "#9090ee" : "#667eea",
                          }}
                        >
                          Edit limit
                        </button>
                      )}
                    </div>
                    {editingBudgetLimit && (
                      <form
                        onSubmit={handleUpdateBudgetLimit}
                        style={{
                          display: "flex",
                          gap: "8px",
                          marginTop: "10px",
                          alignItems: "center",
                        }}
                      >
                        <input
                          type="number"
                          min="1"
                          value={budgetLimitInput}
                          onChange={(e) => setBudgetLimitInput(e.target.value)}
                          placeholder="New limit (₹)"
                          required
                          style={{
                            flex: 1,
                            padding: "6px 10px",
                            borderRadius: "6px",
                            border: `1.5px solid ${isDark ? "#3a3a5c" : "#e0e0e0"}`,
                            fontSize: "13px",
                            background: isDark ? "#16213e" : "#fff",
                            color: isDark ? "#e8e8f4" : "#333",
                            outline: "none",
                          }}
                        />
                        <button
                          type="submit"
                          style={{
                            padding: "6px 12px",
                            borderRadius: "6px",
                            border: "none",
                            background: isDark ? "#5a6aaa" : "#667eea",
                            color: "#fff",
                            fontSize: "12px",
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingBudgetLimit(false)}
                          style={{
                            padding: "6px 10px",
                            borderRadius: "6px",
                            border: `1px solid ${isDark ? "#3a3a5c" : "#ddd"}`,
                            background: "transparent",
                            color: isDark ? "#9090b8" : "#888",
                            fontSize: "12px",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          Cancel
                        </button>
                      </form>
                    )}
                  </div>
                )}
                <div style={{ overflowY: "auto", flex: 1 }}>
                  {catExpenses.length === 0 ? (
                    <div
                      style={{
                        color: isDark ? "#9090b8" : "#aaa",
                        fontSize: "13px",
                        textAlign: "center",
                        padding: "20px 0",
                      }}
                    >
                      No expenses found.
                    </div>
                  ) : (
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        fontSize: "13px",
                      }}
                    >
                      <thead>
                        <tr
                          style={{
                            borderBottom: `1px solid ${isDark ? "#2a2a4a" : "#f0f0f0"}`,
                          }}
                        >
                          <th
                            style={{
                              textAlign: "left",
                              padding: "6px 8px",
                              color: isDark ? "#9090b8" : "#888",
                              fontWeight: 600,
                            }}
                          >
                            Date
                          </th>
                          <th
                            style={{
                              textAlign: "right",
                              padding: "6px 8px",
                              color: isDark ? "#9090b8" : "#888",
                              fontWeight: 600,
                            }}
                          >
                            Amount
                          </th>
                          <th
                            style={{
                              textAlign: "center",
                              padding: "6px 8px",
                              color: isDark ? "#9090b8" : "#888",
                              fontWeight: 600,
                            }}
                          >
                            Recurring
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {catExpenses.map((exp) => (
                          <tr
                            key={exp._id}
                            style={{
                              borderBottom: `1px solid ${isDark ? "#1e2845" : "#f7f7f7"}`,
                            }}
                          >
                            <td
                              style={{
                                padding: "8px 8px",
                                color: isDark ? "#b0b0cc" : "#555",
                              }}
                            >
                              {exp.date}
                            </td>
                            <td
                              style={{
                                padding: "8px 8px",
                                textAlign: "right",
                                fontWeight: 600,
                                color: isDark ? "#e8e8f4" : "#1a1a2e",
                              }}
                            >
                              ₹{exp.amount.toLocaleString("en-IN")}
                            </td>
                            <td
                              style={{
                                padding: "8px 8px",
                                textAlign: "center",
                                color: isDark ? "#9090b8" : "#aaa",
                              }}
                            >
                              {exp.recurring ? "🔄" : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

      {/* Add Expense modal */}
      {showAddExpense && (
        <div
          style={s.modalOverlay}
          onClick={() => {
            setShowAddExpense(false);
            setAddExpenseError("");
            setAddExpenseData({
              category: "",
              amount: "",
              date: "",
              recurring: false,
            });
          }}
        >
          <div
            style={s.modal}
            className="db-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div style={s.modalTitle}>Add Expense</div>
            {addExpenseError && (
              <div
                style={{
                  background: isDark ? "#3d1a1a" : "#fff0f0",
                  color: isDark ? "#fc8181" : "#e53e3e",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  marginBottom: "12px",
                }}
              >
                {addExpenseError}
              </div>
            )}
            {addExpenseSuccess && (
              <div
                style={{
                  background: isDark ? "#1a3d2e" : "#f0fff4",
                  color: isDark ? "#68d391" : "#276749",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: "600",
                  marginBottom: "12px",
                  textAlign: "center",
                }}
              >
                Expense added! ✓
              </div>
            )}
            <form onSubmit={handleAddExpense}>
              <input
                list="add-cat-list"
                style={s.modalInput}
                placeholder="Category (e.g. Food, Travel)"
                value={addExpenseData.category}
                onChange={(e) =>
                  setAddExpenseData({
                    ...addExpenseData,
                    category: e.target.value,
                  })
                }
                maxLength={50}
                required
              />
              <datalist id="add-cat-list">
                {PRESET_CATEGORIES.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
              <input
                type="number"
                style={s.modalInput}
                placeholder="Amount (₹)"
                value={addExpenseData.amount}
                min="0.01"
                step="0.01"
                onChange={(e) =>
                  setAddExpenseData({
                    ...addExpenseData,
                    amount: e.target.value,
                  })
                }
                required
              />
              <input
                type="date"
                style={s.modalInput}
                value={addExpenseData.date}
                onChange={(e) =>
                  setAddExpenseData({ ...addExpenseData, date: e.target.value })
                }
                required
              />
              <label style={s.modalCheckRow}>
                <input
                  type="checkbox"
                  checked={addExpenseData.recurring}
                  onChange={(e) =>
                    setAddExpenseData({
                      ...addExpenseData,
                      recurring: e.target.checked,
                    })
                  }
                  style={{
                    accentColor: "#667eea",
                    width: "15px",
                    height: "15px",
                  }}
                />
                <span>Recurring monthly expense</span>
              </label>
              <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
                <button type="submit" style={s.modalSaveBtn}>
                  Add Expense
                </button>
                <button
                  type="button"
                  style={s.modalCancelBtn}
                  onClick={() => {
                    setShowAddExpense(false);
                    setAddExpenseError("");
                    setAddExpenseData({
                      category: "",
                      amount: "",
                      date: "",
                      recurring: false,
                    });
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editingExpense && (
        <div style={s.modalOverlay} onClick={() => setEditingExpense(null)}>
          <div
            style={s.modal}
            className="db-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div style={s.modalTitle}>Edit Expense</div>
            <input
              list="edit-cat-list"
              style={s.modalInput}
              placeholder="Category"
              value={editData.category}
              onChange={(e) =>
                setEditData({ ...editData, category: e.target.value })
              }
            />
            <datalist id="edit-cat-list">
              {PRESET_CATEGORIES.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
            <input
              type="number"
              style={s.modalInput}
              placeholder="Amount"
              min="0.01"
              step="0.01"
              value={editData.amount}
              onChange={(e) =>
                setEditData({ ...editData, amount: e.target.value })
              }
            />
            <input
              type="date"
              style={s.modalInput}
              value={editData.date}
              onChange={(e) =>
                setEditData({ ...editData, date: e.target.value })
              }
            />
            <label style={s.modalCheckRow}>
              <input
                type="checkbox"
                checked={editData.recurring}
                onChange={(e) =>
                  setEditData({ ...editData, recurring: e.target.checked })
                }
                style={{
                  accentColor: "#667eea",
                  width: "15px",
                  height: "15px",
                }}
              />
              <span>Recurring monthly</span>
            </label>
            <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
              <button style={s.modalSaveBtn} onClick={handleEditSave}>
                Save
              </button>
              <button
                style={s.modalCancelBtn}
                onClick={() => setEditingExpense(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main grid */}
      <div style={s.grid} className="db-grid">
        {/* Expense table */}
        <div style={s.card} className="db-card">
          <div style={s.cardTitle}>
            {monthFilter ? `Expenses — ${monthFilter}` : "All Expenses"}
            {filteredExpenses.length > 0 && (
              <span style={s.filterBadge}>{filteredExpenses.length}</span>
            )}
          </div>
          {loading ? (
            <div style={s.emptyText}>Loading...</div>
          ) : filteredExpenses.length === 0 ? (
            <div style={s.emptyState}>
              <EmptySVG isDark={isDark} />
              <div style={s.emptyStateText}>
                {expenses.length === 0
                  ? "No expenses yet. Add your first one!"
                  : "No expenses match your filters."}
              </div>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }} className="db-table-wrap">
              <table style={s.table} className="db-table">
                <thead>
                  <tr>
                    <th style={s.th}>Category</th>
                    <th style={s.thRight}>Amount</th>
                    <th style={s.th}>Date</th>
                    <th style={s.th}>To</th>
                    <th style={s.th}></th>
                  </tr>
                </thead>
                <tbody>
                  {pagedExpenses.map((exp) => {
                    const color =
                      CATEGORY_COLORS[
                        allCategories.indexOf(exp.category) %
                          CATEGORY_COLORS.length
                      ];
                    return (
                      <tr key={exp._id}>
                        <td style={s.td}>
                          <span style={s.badge(color)}>{exp.category}</span>
                          {exp.recurring && (
                            <span style={s.recurringBadge} title="Recurring">
                              🔄
                            </span>
                          )}
                        </td>
                        <td style={s.tdAmount}>
                          ₹{exp.amount.toLocaleString("en-IN")}
                        </td>
                        <td style={s.tdDate}>{exp.date}</td>
                        <td style={s.tdTo}>{exp.toUser || "—"}</td>
                        <td style={s.tdActions}>
                          {!exp.toUser && (
                            <>
                              <button
                                style={s.editIcon}
                                onClick={() => handleEditClick(exp)}
                                title="Edit"
                              >
                                ✏️
                              </button>
                              <button
                                style={s.deleteIcon}
                                onClick={() => handleDelete(exp._id)}
                                title="Delete"
                              >
                                🗑
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {/* Pagination */}
          {totalPages > 1 && (
            <div style={s.pagination}>
              <button
                style={s.pageBtn(page === 1)}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                ‹ Prev
              </button>
              <div style={s.pageNumbers}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (n) => (
                    <button
                      key={n}
                      style={s.pageNumBtn(n === page)}
                      onClick={() => setPage(n)}
                    >
                      {n}
                    </button>
                  ),
                )}
              </div>
              <button
                style={s.pageBtn(page === totalPages)}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next ›
              </button>
            </div>
          )}
        </div>

        {/* Pie Chart + Budget */}
        <div style={s.card} className="db-card">
          <div style={s.cardTitle}>Spending by Category</div>
          {categories.length === 0 ? (
            <div style={s.emptyState}>
              <EmptySVG isDark={isDark} />
              <div style={s.emptyStateText}>No data to display.</div>
            </div>
          ) : (
            <>
              <div style={{ ...s.pieWrap, cursor: "pointer" }}>
                <Pie data={pieData} options={pieOptions} />
              </div>
              <div style={s.legend}>
                {categories.map((cat, i) => {
                  const color = CATEGORY_COLORS[i % CATEGORY_COLORS.length];
                  const pct = totalAmount
                    ? ((categoryTotals[i] / totalAmount) * 100).toFixed(1)
                    : 0;
                  const budget = budgetMap[cat];
                  const spent = spentByCategory[cat] || 0;
                  const budgetPct = budget
                    ? Math.min((spent / budget.monthlyLimit) * 100, 100)
                    : null;
                  const barColor =
                    budgetPct === null
                      ? null
                      : budgetPct >= 100
                        ? "#e53e3e"
                        : budgetPct >= 80
                          ? "#ed8936"
                          : "#38a169";
                  return (
                    <div key={cat}>
                      <div
                        style={{ ...s.legendItem, cursor: "pointer" }}
                        onClick={() => setCategoryModal(cat)}
                        title={`View all ${cat} expenses`}
                      >
                        <div style={s.legendLeft}>
                          <div style={s.legendDot(color)} />
                          <span>{cat}</span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <span style={s.legendValue}>
                            ₹{categoryTotals[i].toLocaleString("en-IN")} ({pct}
                            %)
                          </span>
                          {budget && (
                            <button
                              style={s.budgetDeleteBtn}
                              onClick={() => handleDeleteBudget(budget._id)}
                              title="Remove budget"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      </div>
                      {budget && (
                        <div style={s.budgetBarWrap}>
                          <div style={s.budgetBarTrack}>
                            <div
                              style={{
                                ...s.budgetBarFill,
                                width: `${budgetPct}%`,
                                background: barColor,
                              }}
                            />
                          </div>
                          <span style={{ ...s.budgetLabel, color: barColor }}>
                            ₹{spent.toLocaleString("en-IN")} / ₹
                            {budget.monthlyLimit.toLocaleString("en-IN")}
                            {spent > budget.monthlyLimit ? " ⚠ Over" : ""}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Budget form */}
          <div style={{ marginTop: "16px" }}>
            {!showBudgetForm ? (
              <button
                style={s.budgetToggleBtn}
                onClick={() => setShowBudgetForm(true)}
              >
                + Set Monthly Budget
              </button>
            ) : (
              <form onSubmit={handleSaveBudget} style={s.budgetForm}>
                <input
                  list="budget-cat-list"
                  style={s.budgetInput}
                  placeholder="Category"
                  value={budgetForm.category}
                  onChange={(e) =>
                    setBudgetForm({ ...budgetForm, category: e.target.value })
                  }
                  required
                />
                <datalist id="budget-cat-list">
                  {[...new Set([...allCategories, ...PRESET_CATEGORIES])].map(
                    (c) => (
                      <option key={c} value={c} />
                    ),
                  )}
                </datalist>
                <input
                  type="number"
                  style={s.budgetInput}
                  placeholder="Monthly limit (₹)"
                  value={budgetForm.limit}
                  min="1"
                  onChange={(e) =>
                    setBudgetForm({ ...budgetForm, limit: e.target.value })
                  }
                  required
                />
                <div style={{ display: "flex", gap: "8px" }}>
                  <button type="submit" style={s.budgetSaveBtn}>
                    Save
                  </button>
                  <button
                    type="button"
                    style={s.budgetCancelBtn}
                    onClick={() => setShowBudgetForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
