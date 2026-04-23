const getAddExpenseStyles = (isDark) => ({
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: isDark
      ? "linear-gradient(135deg, #0f0c29 0%, #302b63 100%)"
      : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    transition: "background 0.3s",
  },
  card: {
    background: isDark ? "#1e2845" : "#fff",
    borderRadius: "16px",
    padding: "48px 40px",
    width: "100%",
    maxWidth: "420px",
    boxShadow: isDark
      ? "0 20px 60px rgba(0,0,0,0.5)"
      : "0 20px 60px rgba(0,0,0,0.2)",
    transition: "background 0.3s",
  },
  title: {
    textAlign: "center",
    fontSize: "24px",
    fontWeight: "700",
    color: isDark ? "#e8e8f4" : "#1a1a2e",
    marginBottom: "28px",
  },
  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: "600",
    color: isDark ? "#b0b0cc" : "#555",
    marginBottom: "6px",
  },
  input: {
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
  },
  submitBtn: {
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
  },
  backBtn: {
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
  },
});

export default getAddExpenseStyles;
