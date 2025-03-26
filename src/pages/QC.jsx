import React, { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../firebase";

export default function QC() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    const q = query(collection(db, "production_workflow"), where("CurrentStep", "==", "QC"));
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

    const isReady =
      job.QC_Check === "ตรวจผ่านแล้ว" &&
      job.COA_Sample === "เตรียมพร้อมแล้ว";

    const nextStep = isReady ? "Account" : "QC";

    await updateDoc(jobRef, {
      QC_Check: job.QC_Check || "",
      COA_Sample: job.COA_Sample || "",
      Timestamp_QC: serverTimestamp(),
      CurrentStep: nextStep,
    });

    alert("อัปเดต QC สำเร็จ ✅");
    loadJobs();
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Segoe UI" }}>
      <h2>🧬 Quality Control - ตรวจสอบคุณภาพ</h2>

      {jobs.length === 0 && <p>ไม่มีงานในขั้นตอนนี้</p>}

      {jobs.map((job) => (
        <div key={job.id} style={cardStyle}>
          <p><strong>Product:</strong> {job.Product}</p>
          <p><strong>Customer:</strong> {job.Customer}</p>

          <label style={labelStyle}>🔍 ตรวจปล่อย</label>
          <select
            value={job.QC_Check || ""}
            onChange={(e) => handleChange(job.id, "QC_Check", e.target.value)}
            style={inputStyle}
          >
            <option value="">-- เลือก --</option>
            <option value="ยังไม่ได้ตรวจ">ยังไม่ได้ตรวจ</option>
            <option value="กำลังตรวจ (รอปรับ)">กำลังตรวจ (รอปรับ)</option>
            <option value="กำลังตรวจ (Hold)">กำลังตรวจ (Hold)</option>
            <option value="ตรวจผ่านแล้ว">ตรวจผ่านแล้ว</option>
          </select>

          <label style={labelStyle}>📄 COA & Sample</label>
          <select
            value={job.COA_Sample || ""}
            onChange={(e) => handleChange(job.id, "COA_Sample", e.target.value)}
            style={inputStyle}
          >
            <option value="">-- เลือก --</option>
            <option value="ยังไม่เตรียม">ยังไม่เตรียม</option>
            <option value="กำลังเตรียม">กำลังเตรียม</option>
            <option value="เตรียมพร้อมแล้ว">เตรียมพร้อมแล้ว</option>
          </select>

          <button onClick={() => handleUpdate(job)} style={buttonStyle}>
            ✅ บันทึกสถานะ
          </button>
        </div>
      ))}
    </div>
  );
}

// ✅ Style
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
