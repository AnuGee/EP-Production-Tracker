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

export default function Account() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    const q = query(collection(db, "production_workflow"), where("CurrentStep", "==", "Account"));
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

    const nextStep = job.Account_Status === "Invoice ออกแล้ว" ? "Completed" : "Account";

    await updateDoc(jobRef, {
      Account_Status: job.Account_Status || "",
      Timestamp_Account: serverTimestamp(),
      CurrentStep: nextStep,
    });

    alert("อัปเดตสำเร็จ ✅");
    loadJobs();
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Segoe UI" }}>
      <h2>💵 Account - สถานะการออกใบแจ้งหนี้</h2>

      {jobs.length === 0 && <p>ไม่มีงานในขั้นตอนนี้</p>}

      {jobs.map((job) => (
        <div key={job.id} style={cardStyle}>
          <p><strong>Product:</strong> {job.Product}</p>
          <p><strong>Customer:</strong> {job.Customer}</p>

          <label style={labelStyle}>🧾 สถานะใบแจ้งหนี้</label>
          <select
            value={job.Account_Status || ""}
            onChange={(e) => handleChange(job.id, "Account_Status", e.target.value)}
            style={inputStyle}
          >
            <option value="">-- เลือก --</option>
            <option value="Invoice ยังไม่ออก">Invoice ยังไม่ออก</option>
            <option value="Invoice ออกแล้ว">Invoice ออกแล้ว</option>
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
