// src/pages/Warehouse.jsx
import { db } from "../firebase";
import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

export default function Warehouse() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    const q = query(collection(db, "production_workflow"), where("currentStep", "==", "Warehouse"));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setJobs(data);
  };

  const handleChange = (id, field, value) => {
    setJobs((prev) =>
      prev.map((job) => (job.id === id ? { ...job, [field]: value } : job))
    );
  };

  const handleUpdate = async (job) => {
    const jobRef = doc(db, "production_workflow", job.id);

    let nextStep = job.currentStep;

    if (job.stock === "มี") {
      nextStep = "QC";
    } else if (job.stock === "ไม่มี" && job.warehouse_step === "เบิกเสร็จ") {
      nextStep = "Production";
    }

    await updateDoc(jobRef, {
      stock: job.stock,
      warehouse_step: job.warehouse_step || "",
      warehouse_status: "Completed",
      timestamp_warehouse: serverTimestamp(),
      currentStep: nextStep,
    });

    alert("📦 อัปเดตสำเร็จแล้ว");
    loadJobs();
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Segoe UI" }}>
      <h2>🏭 Warehouse - จัดการวัตถุดิบ</h2>

      {jobs.length === 0 && <p>⏳ ไม่มีงานที่รอในขั้นตอนนี้</p>}

      {jobs.map((job) => {
        const disableStep = job.stock !== "ไม่มี";
        return (
          <div key={job.id} style={cardStyle}>
            <p><strong>Product:</strong> {job.product_name || job.Product}</p>
            <p><strong>Customer:</strong> {job.customer || job.Customer}</p>

            <label style={labelStyle}>📦 Stock</label>
            <select
              value={job.stock || ""}
              onChange={(e) => handleChange(job.id, "stock", e.target.value)}
              style={inputStyle}
            >
              <option value="">-- เลือก --</option>
              <option value="มี">มี</option>
              <option value="ไม่มี">ไม่มี</option>
            </select>

            <label style={labelStyle}>⚙️ Step</label>
            <select
              value={job.warehouse_step || ""}
              onChange={(e) => handleChange(job.id, "warehouse_step", e.target.value)}
              style={{
                ...inputStyle,
                backgroundColor: disableStep ? "#e5e7eb" : "#fff",
              }}
              disabled={disableStep}
            >
              <option value="">-- เลือก --</option>
              <option value="ยังไม่เบิก">ยังไม่เบิก</option>
              <option value="Pending">Pending</option>
              <option value="เบิกเสร็จ">เบิกเสร็จ</option>
            </select>

            <button onClick={() => handleUpdate(job)} style={buttonStyle}>
              ✅ บันทึกสถานะ
            </button>
          </div>
        );
      })}
    </div>
  );
}

const cardStyle = {
  border: "1px solid #ccc",
  padding: "15px",
  borderRadius: "6px",
  marginBottom: "20px",
  backgroundColor: "#f9fafb",
};

const labelStyle = {
  fontWeight: "bold",
  display: "block",
  marginTop: "10px",
};

const inputStyle = {
  width: "100%",
  padding: "8px",
  marginTop: "5px",
  borderRadius: "5px",
  border: "1px solid #ccc",
  marginBottom: "10px",
};

const buttonStyle = {
  backgroundColor: "#2563eb",
  color: "white",
  padding: "10px 16px",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "14px",
};
