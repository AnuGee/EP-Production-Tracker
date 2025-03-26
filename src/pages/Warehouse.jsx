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

export default function Warehouse() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    const q = query(collection(db, "production_workflow"), where("CurrentStep", "==", "Warehouse"));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setJobs(data);
  };

  const handleUpdate = async (job) => {
    const jobRef = doc(db, "production_workflow", job.id);

    let nextStep = "Warehouse";

    // ✅ ถ้า Stock = มี → ข้ามไป QC ทันที
    if (job.Stock === "มี") {
      nextStep = "QC";
    }
    // ✅ ถ้า Stock = ไม่มี → ต้องเป็น "เบิกเสร็จ" ถึงจะข้ามไป Production
    else if (job.Stock === "ไม่มี" && job.Warehouse_Step === "เบิกเสร็จ") {
      nextStep = "Production";
    }

    await updateDoc(jobRef, {
      Stock: job.Stock,
      BatchNo: job.BatchNo || "",
      Warehouse_Step: job.Warehouse_Step || "",
      Warehouse_Status: "Completed",
      Timestamp_Warehouse: serverTimestamp(),
      CurrentStep: nextStep,
    });

    alert("อัปเดตสำเร็จ ✅");
    loadJobs();
  };

  const handleChange = (id, field, value) => {
    setJobs((prev) =>
      prev.map((job) => (job.id === id ? { ...job, [field]: value } : job))
    );
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Segoe UI" }}>
      <h2>🏭 Warehouse - จัดการวัตถุดิบ</h2>

      {jobs.length === 0 && <p>ไม่มีงานที่รอในขั้นตอนนี้</p>}

      {jobs.map((job) => {
        const disableFields = job.Stock === "มี";
        return (
          <div key={job.id} style={cardStyle}>
            <p><strong>Product:</strong> {job.Product}</p>
            <p><strong>Customer:</strong> {job.Customer}</p>

            <label style={labelStyle}>📦 Stock</label>
            <select
              value={job.Stock || ""}
              onChange={(e) => handleChange(job.id, "Stock", e.target.value)}
              style={inputStyle}
            >
              <option value="">-- เลือก --</option>
              <option value="มี">มี</option>
              <option value="ไม่มี">ไม่มี</option>
            </select>

            <label style={labelStyle}>🔢 Batch Number</label>
            <input
              value={job.BatchNo || ""}
              onChange={(e) => handleChange(job.id, "BatchNo", e.target.value)}
              style={{
                ...inputStyle,
                backgroundColor: disableFields ? "#e5e7eb" : "#fff",
              }}
              disabled={disableFields}
            />

            <label style={labelStyle}>⚙️ Step</label>
            <select
              value={job.Warehouse_Step || ""}
              onChange={(e) => handleChange(job.id, "Warehouse_Step", e.target.value)}
              style={{
                ...inputStyle,
                backgroundColor: disableFields ? "#e5e7eb" : "#fff",
              }}
              disabled={disableFields}
            >
              <option value="">-- เลือก --</option>
              <option value="ยังไม่เบิก">ยังไม่เบิก</option>
              <option value="Pending">Pending</option>
              <option value="เบิกเสร็จ">เบิกเสร็จ</option>
            </select>

            <button
              onClick={() => handleUpdate(job)}
              style={buttonStyle}
            >
              ✅ บันทึกสถานะ
            </button>
          </div>
        );
      })}
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
