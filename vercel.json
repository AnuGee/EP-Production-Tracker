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

  const handleUpdate = async (job) => {
    const jobRef = doc(db, "production_workflow", job.id);

    let nextStep = "Warehouse";

    if (job.Stock === "มี") {
      nextStep = "QC";
    } else if (job.Stock === "ไม่มี" && job.Warehouse_Step === "เบิกเสร็จ") {
      nextStep = "Production";
    }

    await updateDoc(jobRef, {
      Stock: job.Stock,
      Warehouse_Step: job.Warehouse_Step || "",
      Warehouse_Status: "Completed",
      Timestamp_Warehouse: serverTimestamp(),
      currentStep: nextStep,
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
        const disableStep = job.Stock !== "ไม่มี";
        return (
          <div key={job.id} style={cardStyle}>
            <p><strong>Product:</strong> {job.product_name}</p>
            <p><strong>Customer:</strong> {job.customer}</p>

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

            <label style={labelStyle}>⚙️ Step</label>
            <select
              value={job.Warehouse_Step || ""}
              onChange={(e) => handleChange(job.id, "Warehouse_Step", e.target.value)}
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
