// src/pages/Sales.jsx
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";

export default function Sales() {
  const [form, setForm] = useState({
    product_name: "",
    volume: "",
    customer: "",
    delivery_date: "",
  });
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    const snapshot = await getDocs(collection(db, "production_workflow"));
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setJobs(data.filter((job) => job.currentStep === "Sales"));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!form.product_name || !form.volume || !form.customer || !form.delivery_date) {
    alert("กรุณากรอกข้อมูลให้ครบทุกช่อง");
    return;
  }

  const docRef = await addDoc(collection(db, "production_workflow"), {
    ...form,
    currentStep: "Warehouse",
    status: {},
    Timestamp_Sales: serverTimestamp(),
  });

  // ✅ เพิ่ม Notification ไปยังแผนก Warehouse
  await addDoc(collection(db, "notifications"), {
    message: `Sales เพิ่มงาน ${form.product_name} ของลูกค้า ${form.customer} เรียบร้อย รอเบิกวัตถุดิบที่แผนก Warehouse`,
    department: "Warehouse",
    timestamp: serverTimestamp(),
    read: false,
  });

  // ✅ เพิ่ม Notification ไปยังหน้า Home (Global)
  await addDoc(collection(db, "notifications"), {
    message: `Sales เพิ่มงาน ${form.product_name} ของลูกค้า ${form.customer} เรียบร้อย รอเบิกวัตถุดิบที่แผนก Warehouse`,
    department: "All",
    timestamp: serverTimestamp(),
    read: false,
  });

  alert("✅ บันทึกเรียบร้อยแล้ว");
  setForm({ product_name: "", volume: "", customer: "", delivery_date: "" });
  fetchJobs();
};

  return (
    <div style={{ padding: 20 }}>
      <h2>📄 Sales - สร้างคำสั่งผลิต</h2>

      {/* 📝 ฟอร์มกรอกข้อมูล */}
      <form onSubmit={handleSubmit} style={formStyle}>
        <div>
          <label>🎨 Product Name</label>
          <input
            type="text"
            name="product_name"
            value={form.product_name}
            onChange={handleChange}
            style={inputStyle}
          />
        </div>
        <div>
          <label>📦 Volume (KG.)</label>
          <input
            type="number"
            name="volume"
            value={form.volume}
            onChange={handleChange}
            style={inputStyle}
          />
        </div>
        <div>
          <label>👥 Customer Name</label>
          <input
            type="text"
            name="customer"
            value={form.customer}
            onChange={handleChange}
            style={inputStyle}
          />
        </div>
        <div>
          <label>📅 Delivery Date</label>
          <input
            type="date"
            name="delivery_date"
            value={form.delivery_date}
            onChange={handleChange}
            style={inputStyle}
          />
        </div>
        <button type="submit" style={buttonStyle}>✅ บันทึก</button>
      </form>

      {/* 📋 งานที่ยังอยู่ขั้น Sales */}
      <h3 style={{ marginTop: 40 }}>📌 งานในขั้น Sales</h3>
      {jobs.length === 0 && <p>📭 ยังไม่มีงานในขั้นตอนนี้</p>}
      {jobs.map((job) => (
        <div key={job.id} style={jobCard}>
          <p><strong>Product:</strong> {job.product_name}</p>
          <p><strong>Customer:</strong> {job.customer}</p>
          <p><strong>Volume:</strong> {job.volume} KG</p>
          <p><strong>Delivery:</strong> {job.delivery_date}</p>
        </div>
      ))}
    </div>
  );
}

const formStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
  gap: "15px",
  marginBottom: "20px",
};

const inputStyle = {
  width: "100%",
  padding: "8px",
  borderRadius: "4px",
  border: "1px solid #ccc",
};

const buttonStyle = {
  gridColumn: "span 2",
  padding: "10px",
  backgroundColor: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "bold",
};

const jobCard = {
  padding: "12px",
  marginTop: "10px",
  border: "1px solid #ddd",
  borderRadius: "5px",
  backgroundColor: "#f9fafb",
};
