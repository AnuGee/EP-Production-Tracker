import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";

const statusOptions = {
  Warehouse: ["ยังไม่เบิก", "Pending", "เบิกเสร็จ"],
  Production: ["ยังไม่เริ่มผลิต", "กำลังผลิต", "รอผลตรวจ", "กำลังบรรจุ", "ผลิตเสร็จ"],
  QC: {
    qc_inspection: ["ยังไม่ได้ตรวจ", "กำลังตรวจ (รอปรับ)", "กำลังตรวจ (Hold)", "ตรวจผ่านแล้ว"],
    qc_coa: ["ยังไม่เตรียม", "กำลังเตรียม", "เตรียมพร้อมแล้ว"]
  },
  Account: ["Invoice ยังไม่ออก", "Invoice ออกแล้ว"]
};

export default function Home() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    const snapshot = await getDocs(collection(db, "production_workflow"));
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setJobs(data);
  };

  const handleStatusChange = async (job, field, value) => {
    const jobRef = doc(db, "production_workflow", job.id);
    const updatedStatus = { ...job.status, [field]: value };
    let nextStep = job.currentStep;

    if (job.currentStep === "Warehouse") {
      if (updatedStatus.stock === "มี") {
        nextStep = "QC";
      } else if (updatedStatus.stock === "ไม่มี" && updatedStatus.warehouse === "เบิกเสร็จ") {
        nextStep = "Production";
      }
    }

    if (job.currentStep === "Production") {
      if (updatedStatus.production === "รอผลตรวจ") {
        nextStep = "QC";
      } else if (updatedStatus.production === "ผลิตเสร็จ") {
        nextStep = "Account";
      }
    }

    if (job.currentStep === "QC") {
      if (
        updatedStatus.qc_inspection === "ตรวจผ่านแล้ว" &&
        updatedStatus.qc_coa === "เตรียมพร้อมแล้ว"
      ) {
        nextStep = "Production";
      }
    }

    if (job.currentStep === "Account") {
      if (updatedStatus.account === "Invoice ออกแล้ว") {
        updatedStatus.complete = true;
        nextStep = "Completed";
      }
    }

    await updateDoc(jobRef, {
      status: updatedStatus,
      currentStep: nextStep
    });

    fetchJobs();
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "production_workflow", id));
    fetchJobs();
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>📊 ความคืบหน้าของงานแต่ละชุด</h2>

      <table border="1" cellPadding="5" style={{ marginTop: 20, width: "100%", borderCollapse: "collapse" }}>
        <thead style={{ backgroundColor: "#f3f4f6" }}>
          <tr>
            <th>Batch No</th>
            <th>Product</th>
            <th>Current Step</th>
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

            return (
              <tr key={job.id}>
                <td>{job.batch_no || "N/A"}</td>
                <td>{job.product_name || job.Product || "-"}</td>
                <td>{current || "-"}</td>

                <td>
                  {current === "Warehouse" ? (
                    <>
                      <div>
                        Stock:
                        <select
                          value={status.stock || ""}
                          onChange={(e) =>
                            handleStatusChange(job, "stock", e.target.value)
                          }
                        >
                          <option value="">--เลือก--</option>
                          <option value="มี">มี</option>
                          <option value="ไม่มี">ไม่มี</option>
                        </select>
                      </div>

                      <div>
                        Step:
                        <select
                          value={status.warehouse || ""}
                          disabled={status.stock === "มี"}
                          style={{
                            backgroundColor: status.stock === "มี" ? "#eee" : "#fff",
                          }}
                          onChange={(e) =>
                            handleStatusChange(job, "warehouse", e.target.value)
                          }
                        >
                          <option value="">--เลือก--</option>
                          {statusOptions.Warehouse.map((opt) => (
                            <option key={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                    </>
                  ) : current === "QC" ? (
                    <>
                      <div>
                        ตรวจปล่อย:
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
                        COA & Sample:
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

                <td>
                  {Object.entries(status).length > 0 ? (
                    Object.entries(status).map(([key, value]) => (
                      <div key={key}>
                        <strong>{key}</strong>: {value}
                      </div>
                    ))
                  ) : (
                    <span style={{ color: "#888" }}>–</span>
                  )}
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
