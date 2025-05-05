// src/pages/QC.jsx
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

export default function QC() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    const q = query(collection(db, "production_workflow"), where("currentStep", "==", "QC"));
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

    let nextStep = "QC";

    if (
      job.qc_inspection === "ตรวจผ่านแล้ว" &&
      job.qc_coa === "เตรียมพร้อมแล้ว"
    ) {
      nextStep = "Production"; // กลับไป Production
    }

    await updateDoc(jobRef, {
      qc_inspection: job.qc_inspection || "",
      qc_coa: job.qc_coa || "",
      Timestamp_QC: serverTimestamp(),
      currentStep: nextStep,
    });

    alert("อัปเดตสำเร็จ ✅");
    loadJobs();
  };

  return (
    <div style={{ padding: 20, fontFamily: "Segoe UI" }}>
      <h2>🧬 Quality Control - ตรวจสอบคุณภาพ</h2>

      {jobs.length === 0 && <p>ไม่มีงานในขั้นตอนนี้</p>}

      {jobs.map((job) => (
        <div key={job.id} style={cardStyle}>
          <p><strong>Product:</strong> {job.product_name}</p>
          <p><strong>Customer:</strong> {job.customer}</p>

          <label style={labelStyle}>✅ ตรวจปล่อย</label>
          <select
            value={job.qc_inspection || ""}
            onChange={(e) => handleChange(job.id, "qc_inspection", e.target.value)}
            style={inputStyle}
          >
            <option value="">-- เลือก --</option>
            <option value="ยังไม่ได้ตรวจ">ยังไม่ได้ตรวจ</option>
            <option value="กำลังตรวจ (รอปรับ)">กำลังตรวจ (รอปรับ)</option>
            <option value="กำลังตรวจ (Hold)">กำลังตรวจ (Hold)</option>
            <option value="ตรวจผ่านแล้ว">ตรวจผ่านแล้ว</option>
          </select>

          <label style={labelStyle}>🧾 COA & Sample</label>
<select
  value={job.qc_coa || ""}
  onChange={(e) => handleChange(job.id, "qc_coa", e.target.value)}
  disabled={!job.qc_inspection || job.qc_inspection !== "ตรวจผ่านแล้ว"}
  style={{
    ...inputStyle,
    backgroundColor: !job.qc_inspection || job.qc_inspection !== "ตรวจผ่านแล้ว" ? "#e5e7eb" : "",
    color: !job.qc_inspection || job.qc_inspection !== "ตรวจผ่านแล้ว" ? "#9ca3af" : ""
  }}
>
  <option value="">-- เลือก --</option>
  <option value="ยังไม่เตรียม">ยังไม่เตรียม</option>
  <option value="กำลังเตรียม">กำลังเตรียม</option>
  <option value="เตรียมพร้อมแล้ว">เตรียมพร้อมแล้ว</option>
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
