import React from "react";
import { useTheme } from "../context/ThemeContext";

function DarkModeToggle() {
  const { isDark, toggleTheme } = useTheme();

  const container = {
    position: "fixed",
    top: "16px",
    right: "20px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    zIndex: 1000,
  };

  const track = {
    width: "50px",
    height: "26px",
    borderRadius: "13px",
    background: isDark ? "#667eea" : "#ccc",
    position: "relative",
    cursor: "pointer",
    transition: "background 0.3s",
    boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
  };

  const thumb = {
    position: "absolute",
    top: "3px",
    left: isDark ? "27px" : "3px",
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    background: "#fff",
    transition: "left 0.3s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "11px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
  };

  return (
    <div style={container}>
      <span style={{ fontSize: "16px" }}>{isDark ? "🌙" : "☀️"}</span>
      <div
        style={track}
        onClick={toggleTheme}
        role="switch"
        aria-checked={isDark}
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && toggleTheme()}
      >
        <div style={thumb} />
      </div>
    </div>
  );
}

export default DarkModeToggle;
