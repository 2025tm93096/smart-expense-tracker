import React from "react";
import { useTheme } from "../context/ThemeContext";
import ProfileMenu from "./ProfileMenu";

function TopBar() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div
      className="topbar-wrap"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        flexShrink: 0,
      }}
    >
      <ProfileMenu />

      {/* Dark mode toggle */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "16px" }}>{isDark ? "🌙" : "☀️"}</span>
        <div
          style={{
            width: "50px",
            height: "26px",
            borderRadius: "13px",
            background: isDark ? "#667eea" : "#ccc",
            position: "relative",
            cursor: "pointer",
            transition: "background 0.3s",
            boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
          }}
          onClick={toggleTheme}
          role="switch"
          aria-checked={isDark}
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && toggleTheme()}
        >
          <div
            style={{
              position: "absolute",
              top: "3px",
              left: isDark ? "27px" : "3px",
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              background: "#fff",
              transition: "left 0.3s",
              boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default TopBar;
