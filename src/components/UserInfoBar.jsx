import React from "react";
import { getAuth, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function UserInfoBar() {
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    const auth = getAuth();
    signOut(auth).then(() => {
      localStorage.removeItem("user");
      navigate("/login");
    });
  };

  return (
    <div style={barStyle}>
      <div>
        👤 <strong>{user.email}</strong> ({user.role})
      </div>
      <button onClick={handleLogout} style={buttonStyle}>🚪 Logout</button>
    </div>
  );
}

const barStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  backgroundColor: "#f3f4f6",
  padding: "10px 15px",
  borderRadius: "8px",
  marginBottom: "15px",
  fontFamily: "Segoe UI, sans-serif"
};

const buttonStyle = {
  padding: "6px 12px",
  backgroundColor: "#ef4444",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "0.9rem"
};
