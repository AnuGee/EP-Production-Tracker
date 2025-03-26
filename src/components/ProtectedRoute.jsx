import React from "react";
import { Navigate } from "react-router-dom";

// ✅ ใช้ใน <Route> เพื่อตรวจ role ก่อนเข้า
export default function ProtectedRoute({ children, allowedRoles }) {
  const user = JSON.parse(localStorage.getItem("user"));

  // ❌ ยังไม่ login
  if (!user) return <Navigate to="/login" />;

  // ❌ login แล้วแต่ไม่มีสิทธิ์
  if (!allowedRoles.includes(user.role)) return <Navigate to="/login" />;

  // ✅ ผ่าน
  return children;
}
