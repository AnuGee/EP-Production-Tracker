# แก้ Login.jsx ให้ใช้ import db จาก "../../firebase" แทน getFirestore()
fixed_login_code = """\
import React, { useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const snapshot = await getDocs(collection(db, "users"));
      const users = snapshot.docs.map((doc) => doc.data());

      const foundUser = users.find(
        (u) => u.username === username && u.password === password
      );

      if (foundUser) {
        localStorage.setItem("user", JSON.stringify(foundUser));
        navigate("/");
      } else {
        setError("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "auto", padding: 40 }}>
      <h2>🔐 เข้าสู่ระบบ</h2>
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: 20 }}>
          <label>👤 Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{ width: "100%", padding: 10, borderRadius: 6, marginTop: 6 }}
          />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label>🔒 Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%", padding: 10, borderRadius: 6, marginTop: 6 }}
          />
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button
          type="submit"
          style={{
            width: "100%",
            padding: 12,
            backgroundColor: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          🚪 Login
        </button>
      </form>
    </div>
  );
}
"""

# Save patched Login.jsx
fixed_login_path = "/mnt/data/Login_fixed_import.jsx"
with open(fixed_login_path, "w", encoding="utf-8") as f:
    f.write(fixed_login_code)

fixed_login_path
