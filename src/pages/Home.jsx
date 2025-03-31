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
  const [jobs, setJobs] = useState([]);
  const [debug, setDebug] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "production_workflow"));
      const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setJobs(data);
      console.log("🔥 jobs:", data);
      // แสดงโครงสร้างข้อมูลของ job แรก (ถ้ามี) เพื่อตรวจสอบ
      if (data.length > 0) {
        setDebug(JSON.stringify(data[0], null, 2));
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };

  const handleStatusChange = async (job, field, value) => {
    try {
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
    } catch (error) {
      console.error("Error updating status:", error);
      alert("เกิดข้อผิดพลาดในการอัพเดทสถานะ: " + error.message);
    }
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(jobs);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Jobs");
    XLSX.writeFile(workbook, "jobs_export.xlsx");
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "production_workflow", id));
      fetchJobs();
    } catch (error) {
      console.error("Error deleting job:", error);
      alert("เกิดข้อผิดพลาดในการลบข้อมูล: " + error.message);
    }
  };

  const getCurrentStatusText = (job) => {
    const current = job.currentStep;
    const status = job.status || {};

    if (!current) return "-";
    
    if (current === "QC") {
      const inspection = status.qc_inspection ? `ตรวจปล่อย: ${status.qc_inspection}` : '';
      const coa = status.qc_coa ? `COA: ${status.qc_coa}` : '';
      return [inspection, coa].filter(Boolean).join(', ') || '-';
    }
    
    const statusKey = current.toLowerCase();
    return status[statusKey] || "-";
  };

  // แถบสีตามสถานะ
  const getStatusColor = (job) => {
    const current = job.currentStep;
    if (!current || !job.status) return "#ffffff"; // สีขาว (ไม่มีสถานะ)

    switch (current) {
      case "Warehouse":
        if (job.status.warehouse === "เบิกเสร็จ") return "#d1ffd1"; // สีเขียวอ่อน
        return "#ffffd1"; // สีเหลืองอ่อน
      case "Production":
        if (job.status.production === "ผลิตเสร็จ") return "#d1ffd1"; // สีเขียวอ่อน
        return "#ffffd1"; // สีเหลืองอ่อน
      case "QC":
        if (job.status.qc_inspection === "ตรวจผ่านแล้ว" && job.status.qc_coa === "เตรียมพร้อมแล้ว") 
          return "#d1ffd1"; // สีเขียวอ่อน
        return "#ffffd1"; // สีเหลืองอ่อน
      case "Account":
        if (job.status.account === "Invoice ออกแล้ว") return "#d1ffd1"; // สีเขียวอ่อน
        return "#ffffd1"; // สีเหลืองอ่อน
      default:
        return "#ffffff"; // สีขาว (แผนกอื่นๆ)
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>📊 ความคืบหน้าของงานแต่ละชุด</h2>
      <div style={{ marginBottom: 10 }}>
        <button onClick={exportToExcel} style={{ marginRight: 10, padding: "5px 10px" }}>
          📤 Export Excel
        </button>
        <button onClick={fetchJobs} style={{ padding: "5px 10px" }}>
          🔄 Refresh
        </button>
      </div>

      {/* Debug Panel - แสดงเฉพาะในโหมดพัฒนา */}
      {debug && (
        <div style={{ marginBottom: 20, padding: 10, border: '1px solid #ccc', borderRadius: 5 }}>
          <h4>โครงสร้างข้อมูล (Debug):</h4>
          <pre style={{ overflowX: 'auto' }}>{debug}</pre>
          <button onClick={() => setDebug(null)}>ปิด Debug</button>
        </div>
      )}

      <table border="1" cellPadding="5" style={{ marginTop: 20, width: "100%", borderCollapse: "collapse" }}>
        <thead style={{ backgroundColor: "#f3f4f6" }}>
          <tr>
            <th>Batch No</th>
            <th>Product</th>
            <th>Current Step</th>
            <th>Current Status</th>
            <th>Update Status</th>
            <th>สถานะรวม</th>
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
            const rowColor = getStatusColor(job);
            
            return (
              <tr key={job.id} style={{ backgroundColor: rowColor }}>
                <td>{job.batch_no || "N/A"}</td>
                <td>{job.product_name || job.Product || "-"}</td>
                <td>{current || "-"}</td>
                
                {/* แสดงสถานะปัจจุบัน */}
                <td>{getCurrentStatusText(job)}</td>

                {/* ปรับสถานะแผนกปัจจุบัน */}
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

                {/* แสดงสถานะรวม */}
                <td>
                  {job.status
                    ? Object.entries(job.status).map(([key, value]) => (
                        <div key={key}>
                          <strong>{key}</strong>: {value}
                        </div>
                      ))
                    : "-"}
                </td>

                <td>{job.customer || job.Customer || "-"}</td>
                <td>{job.volume || job.Volume || "-"}</td>
                <td>{job.delivery_date || job.DeliveryDate || "-"}</td>
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
