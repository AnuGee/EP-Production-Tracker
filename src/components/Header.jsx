import React from "react";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div style={{
      backgroundColor: "#f3f4f6",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "10px 20px",
      borderBottom: "1px solid #e5e7eb",
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        flexWrap: "wrap",
        justifyContent: "center",
      }}>
        <img src="/logo_ep.png" alt="Logo" style={{ height: "45px" }} />
        <h2 style={{ margin: 0 }}>ระบบติดตามสถานะงาน</h2>
      </div>

      {user && (
        <div style={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          gap: "10px",
          justifyContent: "center",
          marginTop: "8px",
        }}>
          <span style={{ fontSize: "14px" }}>
            👤 <strong>{user.email}</strong> ({user.role})
          </span>
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: "#ef4444",
              color: "white",
              border: "none",
              padding: "6px 12px",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "14px",
            }}
          >
            🔒 Logout
          </button>
        </div>
      )}
    </div>
  );
}
