import React, { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function Sales() {
  const [formData, setFormData] = useState({
    product_name: "",
    volume: "",
    customer: "",
    delivery_date: "",
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newJob = {
      ...formData,
      status: {},
      currentStep: "Warehouse",
      timestamp_sales: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, "production_workflow"), newJob);
      alert("✅ เพิ่มงานใหม่สำเร็จแล้ว!");
      setFormData({ product_name: "", volume: "", customer: "", delivery_date: "" });
    } catch (error) {
      console.error("❌ เพิ่มงานไม่สำเร็จ:", error);
      alert("เกิดข้อผิดพลาด ลองใหม่อีกครั้ง");
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: "auto", padding: 20 }}>
      <h2>🛒 Sales - สร้างคำสั่งผลิตใหม่</h2>
      <form onSubmit={handleSubmit}>
        <label>📦 Product Name</label>
        <input
          value={formData.product_name}
          onChange={(e) => handleChange("product_name", e.target.value)}
          required
          style={inputStyle}
        />

        <label>⚖️ Volume (KG.)</label>
        <input
          value={formData.volume}
          onChange={(e) => handleChange("volume", e.target.value)}
          required
          type="number"
          style={inputStyle}
        />

        <label>👤 Customer Name</label>
        <input
          value={formData.customer}
          onChange={(e) => handleChange("customer", e.target.value)}
          required
          style={inputStyle}
        />

        <label>📅 Delivery Date</label>
        <input
          value={formData.delivery_date}
          onChange={(e) => handleChange("delivery_date", e.target.value)}
          required
          type="date"
          style={inputStyle}
        />

        <button type="submit" style={buttonStyle}>➕ สร้างงานใหม่</button>
      </form>
    </div>
  );
}

const inputStyle = {
  display: "block",
  width: "100%",
  padding: "10px",
  margin: "10px 0",
  borderRadius: "5px",
  border: "1px solid #ccc",
};

const buttonStyle = {
  backgroundColor: "#10b981",
  color: "white",
  padding: "10px 20px",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "16px",
  marginTop: "10px",
};
