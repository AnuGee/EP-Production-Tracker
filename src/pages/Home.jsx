import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  deleteDoc
} from "firebase/firestore";
import * as XLSX from "xlsx";

// ค่าคงที่
const departments = ["Sales", "Warehouse", "Production", "QC", "Account"];
const statusOptions = {
  Warehouse: ["ยังไม่เบิก", "Pending", "เบิกเสร็จ"],
  Production: ["ยังไม่เริ่มผลิต", "กำลังผลิต", "กำลังบรรจุ", "ผลิตเสร็จ"],
  QC: {
    qc_inspection: ["ยังไม่ได้ตรวจ", "กำลังตรวจ (รอปรับ)", "กำลังตรวจ (Hold)", "ตรวจผ่านแล้ว"],
    qc_coa: ["ยังไม่เตรียม", "กำลังเตรียม", "เตรียมพร้อมแล้ว"]
  },
  Account: ["Invoice ยังไม่ออก", "Invoice ออกแล้ว"]
};

const getNextStep = (current) => {
  const index = departments.findIndex((d) => d === current);
  return index !== -1 && index < departments.length - 1
    ? departments[index + 1]
    : null;
};

export default function Home() {
  console.log("🟢 Home loaded");
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    const querySnapshot = await getDocs(collection(db, "production_workflow"));
    const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setJobs(data);
    console.log("🔥 ตัวอย่าง job:", JSON.stringify(data[0], null, 2));
  };

  const handleStatusChange = async (job, field, value) => {
    const jobRef = doc(db, "production_workflow", job.id);
    const newStatus = { ...job.status, [field]: value };

    let shouldAdvance = false;
    if (job.currentStep === "Warehouse" && value === "เบิกเสร็จ") {
      shouldAdvance = true;
    }
    if (job.currentStep === "Production" && value === "ผลิตเสร็จ") {
      shouldAdvance = true;
    }
    if (
      job.currentStep === "QC" &&
      newStatus.qc_inspection === "ตรวจผ่านแล้ว" &&
      newStatus.qc_coa === "เตรียมพร้อมแล้ว"
    ) {
      shouldAdvance = true;
    }
    if (job.currentStep === "Account" && value === "Invoice ออกแล้ว") {
      shouldAdvance = true;
    }

    const updateData = { status: newStatus };
    if (shouldAdvance) {
      updateData.currentStep = getNextStep(job.currentStep);
    }

    await updateDoc(jobRef, updateData);
    fetchJobs();
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(jobs);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Jobs");
    XLSX.writeFile(workbook, "jobs_export.xlsx");
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "production_workflow", id));
    fetchJobs();
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>📊 ความคืบหน้าของงานแต่ละชุด</h2>
      <button onClick={exportToExcel}>📤 Export Excel</button>

      <table border="1" cellPadding="5" style={{ marginTop: 20, width: "100%" }}>
        <thead>
          <tr>
            <th>Batch No</th>
            <th>Product</th>
            <th>Current Step</th>
            <th>Status</th>
            <th>Customer</th>
            <th>Volume</th>
            <th>Delivery Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => {
            const current = job.currentStep;
            const status = job.status || {};
            return (
              <tr key={job.id}>
                <td>{job.batch_no || "N/A"}</td>
                <td>{job.product_name}</td>
                <td>{current}</td>
                <td>
                  {current === "QC" ? (
                    <>
                      <div>
                        ตรวจปล่อย:{" "}
                        <select
                          value={status.qc_inspection || ""}
                          onChange={(e) =>
                            handleStatusChange(job, "qc_inspection", e.target.value)
                          }
                        >
                          <option value="">--เลือก--</option>
                          {statusOptions.QC.qc_inspection.map((opt) => (
                            <option key={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        COA & Sample:{" "}
                        <select
                          value={status.qc_coa || ""}
                          onChange={(e) =>
                            handleStatusChange(job, "qc_coa", e.target.value)
                          }
                        >
                          <option value="">--เลือก--</option>
                          {statusOptions.QC.qc_coa.map((opt) => (
                            <option key={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                    </>
                  ) : (
                    <select
                      value={status[current?.toLowerCase()] || ""}
                      onChange={(e) =>
                        handleStatusChange(job, current?.toLowerCase(), e.target.value)
                      }
                    >
                      <option value="">--เลือก--</option>
                      {statusOptions[current]?.map?.((opt) => (
                        <option key={opt}>{opt}</option>
                      ))}
                    </select>
                  )}
                </td>
                <td>{job.customer || "-"}</td>
                <td>{job.volume || "-"}</td>
                <td>{job.delivery_date || "-"}</td>
                <td>
                  {(current === "Sales" || current === "Admin") && (
                    <button onClick={() => handleDelete(job.id)}>🗑 ลบ</button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
