// src/pages/Account.jsx
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

export default function Account() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    const q = query(collection(db, "production_workflow"), where("currentStep", "==", "Account"));
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

    const nextStep = job.account_status === "Invoice ออกแล้ว" ? "Completed" : "Account";

    await updateDoc(jobRef, {
      account_status: job.account_status || "",
      Timestamp_Account: serverTimestamp(),
      currentStep: nextStep,
    });

    alert("บันทึกเรียบร้อย ✅");
    loadJobs();
  };

  return (
    <div style={{ padding: 20, fontFamily: "Segoe UI" }}>
      <h2>💰 ฝ่ายบัญชี - ออกใบแจ้งหนี้</h2>

      {jobs.length === 0 && <p>ไม่มีงานที่รอในขั้นตอนนี้</p>}

      {jobs.map((job) => (
        <div key={job.id} style={cardStyle}>
          <p><strong>Product:</strong> {job.product_name}</p>
          <p><strong>Customer:</strong> {job.customer}</p>

          <label style={labelStyle}>💸 สถานะใบแจ้งหนี้</label>
          <select
            value={job.account_status || ""}
            onChange={(e) => handleChange(job.id, "account_status", e.target.value)}
            style={inputStyle}
          >
            <option value="">-- เลือก --</option>
            <option value="Invoice ยังไม่ออก">Invoice ยังไม่ออก</option>
            <option value="Invoice ออกแล้ว">Invoice ออกแล้ว</option>
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
  backgroundColor: "#16a34a",
  color: "white",
  padding: "10px 16px",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "14px",
};
