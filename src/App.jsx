import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// ส่วนประกอบหลัก
import Header from "./components/Header";
import Navbar from "./components/Navbar";

// ระบบ login + auth
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";

// หน้าต่าง ๆ
import Home from "./pages/Home";
import Sales from "./pages/Sales";
import Warehouse from "./pages/Warehouse";
import Production from "./pages/Production";
import QC from "./pages/QC";
import Account from "./pages/Account";

export default function App() {
  return (
    <BrowserRouter>
      {/* 🔼 Header + Navbar แสดงทุกหน้า */}
      <Header />
      <Navbar />

      {/* เส้นทางการเข้าแต่ละหน้า */}
      <Routes>
        {/* ✅ หน้าแรก */}
        <Route path="/" element={<Home />} />

        {/* ✅ Login */}
        <Route path="/login" element={<Login />} />

        {/* ✅ แผนกต่าง ๆ (ต้อง login ก่อน และตรงกับ role) */}
        <Route
          path="/sales"
          element={
            <ProtectedRoute allowedRoles={["sales", "admin"]}>
              <Sales />
            </ProtectedRoute>
          }
        />
        <Route
          path="/warehouse"
          element={
            <ProtectedRoute allowedRoles={["warehouse", "admin"]}>
              <Warehouse />
            </ProtectedRoute>
          }
        />
        <Route
          path="/production"
          element={
            <ProtectedRoute allowedRoles={["production", "admin"]}>
              <Production />
            </ProtectedRoute>
          }
        />
        <Route
          path="/qc"
          element={
            <ProtectedRoute allowedRoles={["qc", "admin"]}>
              <QC />
            </ProtectedRoute>
          }
        />
        <Route
          path="/account"
          element={
            <ProtectedRoute allowedRoles={["account", "admin"]}>
              <Account />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
