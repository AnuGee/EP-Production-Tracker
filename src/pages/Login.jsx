import React, { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

import { auth } from "../firebase";
import { db } from "../firebase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // 🔍 ดึง role จาก Firestore
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        const role = userData.role;

        // ✅ บันทึกสถานะ Login
        localStorage.setItem("user", JSON.stringify({ uid, email, role }));

        // 🔁 ไปตาม role
        switch (role) {
          case "sales":
            navigate("/sales");
            break;
          case "warehouse":
            navigate("/warehouse");
            break;
		  case "production": // ✅ เพิ่มตรงนี้!
            navigate("/production");
            break;
          case "qc":
            navigate("/qc");
            break;
          case "account":
            navigate("/account");
            break;
          case "admin":
            navigate("/");
            break;
          default:
            setError("ไม่มีสิทธิ์เข้าระบบ");
        }
      } else {
        setError("ยังไม่ได้กำหนดสิทธิ์ในระบบ");
      }
    } catch (err) {
      setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "auto", padding: "20px", fontFamily: "Segoe UI, sans-serif" }}>
      <h2>🔐 เข้าสู่ระบบ</h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={inputStyle}
      />
      <input
        type="password"
        placeholder="รหัสผ่าน"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={inputStyle}
      />
      <button onClick={handleLogin} style={buttonStyle}>
        ➤ Login
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px",
  marginBottom: "10px",
  borderRadius: "5px",
  border: "1px solid #ccc"
};

const buttonStyle = {
  width: "100%",
  padding: "12px",
  backgroundColor: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "5px",
  fontSize: "1rem",
  fontWeight: "bold",
  cursor: "pointer"
};
