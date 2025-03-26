import React from "react";
import logo from "../assets/logo_ep.png"; // ✅ ตรวจ path logo ให้ถูก

export default function Header() {
  return (
    <div style={styles.container}>
      <div style={styles.left}>
        <img src={logo} alt="Logo" style={styles.logo} />
        <h2 style={styles.title}>ระบบติดตามสถานะงาน</h2>
      </div>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: "#f3f4f6",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "10px 20px",
    borderBottom: "1px solid #e5e7eb",
  },
  left: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  logo: {
    height: "45px",
  },
  title: {
    margin: 0,
    fontSize: "1.3rem",
    fontWeight: "bold",
    color: "#1e293b",
    textAlign: "center",
  },
};
