import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { useTheme } from "../context/ThemeContext";
import getProfileMenuStyles from "../styles/profileMenuStyles";
import useWindowWidth from "../hooks/useWindowWidth";

function ProfileMenu() {
  const [profile, setProfile] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const { isDark } = useTheme();
  const width = useWindowWidth();
  const isMobile = width < 768;
  const styles = getProfileMenuStyles(isDark, isMobile);
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/me")
      .then((res) => setProfile(res.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = () => setMenuOpen(false);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [menuOpen]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const initial = profile ? profile.username[0].toUpperCase() : "👤";

  return (
    <div style={styles.wrapper} onClick={(e) => e.stopPropagation()}>
      <button
        style={styles.btn}
        onClick={() => setMenuOpen((o) => !o)}
        title="Profile"
        aria-label="Open profile menu"
      >
        {initial}
      </button>

      {menuOpen && (
        <div style={styles.dropdown}>
          <div style={styles.avatar}>{initial}</div>
          <div style={styles.name}>{profile ? profile.username : "—"}</div>
          <div style={styles.mobile}>
            {profile?.mobile || "No mobile added"}
          </div>
          <div style={styles.divider} />
          <button style={styles.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default ProfileMenu;
