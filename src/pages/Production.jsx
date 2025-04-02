// src/pages/Production.jsx
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
  query,
  where,
} from "firebase/firestore";

export default function Production() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    const q = query(collection(db, "production_workflow"), where("currentStep", "==", "Production"));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setJobs(data);
  };

  const handleChange = (id, field, value) => {
    setJobs((prev) =>
      prev.map((job) => (job.id === id ? { ...job, [field]: value } : job))
    );
  };

  const handleSave = async (job) => {
    const jobRef = doc(db, "production_workflow", job.id);

    let nextStep = "Production";
    if (job.Production_Status === "รอผลตรวจ") {
      nextStep = "QC";
    } else if (job.Production_Status === "ผลิตเสร็จ") {
      nextStep = "Account";
    }

    await updateDoc(jobRef, {
      batch_no: job.batch_no || "",
      Production_Status: job.Production_Status || "",
      Timestamp_Production: serverTimestamp(),
      currentStep: nextStep,
    });

    alert("บันทึกข้อมูลสำเร็จ ✅");
    loadJobs();
  };

  return (
    <div style={{ padding: 20, fontFamily: "Segoe UI" }}>
      <h2>🧪 Production - ตรวจสอบและผลิต</h2>

      {jobs.length === 0 && <p>ไม่มีงานในขั้นตอนนี้</p>}

      {jobs.map((job) => (
        <div key={job.id} style={cardStyle}>
          <p><strong>Product:</strong> {job.product_name}</p>
          <p><strong>Customer:</strong> {job.customer}</p>

          <label style={labelStyle}>🔢 Batch Number</label>
          <input
            value={job.batch_no || ""}
            onChange={(e) => handleChange(job.id, "batch_no", e.target.value)}
            style={inputStyle}
          />

          <label style={labelStyle}>📦 สถานะการผลิต</label>
          <select
            value={job.Production_Status || ""}
            onChange={(e) =>
              handleChange(job.id, "Production_Status", e.target.value)
            }
            style={inputStyle}
          >
            <option value="">-- เลือก --</option>
            <option value="ยังไม่เริ่มผลิต">ยังไม่เริ่มผลิต</option>
            <option value="กำลังผลิต">กำลังผลิต</option>
            <option value="รอผลตรวจ">รอผลตรวจ</option>
            <option value="กำลังบรรจุ">กำลังบรรจุ</option>
            <option value="ผลิตเสร็จ">ผลิตเสร็จ</option>
          </select>

          <button style={buttonStyle} onClick={() => handleSave(job)}>
            ✅ บันทึกสถานะ
          </button>
        </div>
      ))}
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
