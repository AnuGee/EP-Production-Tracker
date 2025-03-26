import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div style={styles.container}>
      <div style={styles.navLinks}>
        <Link to="/" style={styles.tab}>📊 Dashboard</Link>
        <Link to="/sales" style={styles.tab}>📄 Sales</Link>
        <Link to="/warehouse" style={styles.tab}>🏭 Warehouse</Link>
        <Link to="/production" style={styles.tab}>🧪 Production</Link>
        <Link to="/qc" style={styles.tab}>🧬 QC</Link>
        <Link to="/account" style={styles.tab}>💰 Account</Link>
      </div>

      <div style={styles.userInfo}>
        {user ? (
          <>
            <span style={styles.userText}>👤 {user.email} ({user.role})</span>
            <button onClick={handleLogout} style={styles.logout}>🔴 Logout</button>
          </>
        ) : (
          <Link to="/login" style={{ ...styles.tab, fontWeight: "bold", backgroundColor: "#e0f2fe" }}>
            🔐 Login
          </Link>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: "#f1f5f9",
    padding: "10px 20px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    alignItems: "flex-start",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  navLinks: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    width: "100%",
    justifyContent: "center",
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    justifyContent: "center",
    flexWrap: "wrap",
    width: "100%",
  },
  tab: {
    padding: "8px 14px",
    backgroundColor: "#e2e8f0",
    borderRadius: "6px",
    textDecoration: "none",
    color: "#1e293b",
    fontSize: "14px",
  },
  userText: {
    fontWeight: "bold",
    color: "#334155",
    fontSize: "14px",
  },
  logout: {
    padding: "8px 14px",
    backgroundColor: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "14px",
  },
};
