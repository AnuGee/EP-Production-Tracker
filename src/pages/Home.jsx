import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import * as XLSX from "xlsx";

const Home = ({ user }) => {
  const [jobs, setJobs] = useState([]);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const fetchJobs = async () => {
      const querySnapshot = await getDocs(collection(db, "jobs"));
      const jobData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setJobs(jobData);
    };

    fetchJobs();
  }, []);

  const getProgress = (job) => {
    const steps = ["sales", "warehouse", "production", "qc", "account"];
    const completed = steps.filter((step) => job[step]);
    return (completed.length / steps.length) * 100;
  };

  const handleExport = () => {
    const data = jobs.map((job) => ({
      Product: job.productName,
      Batch: job.batchNumber,
      Sales: job.sales ? "✅" : "",
      Warehouse: job.warehouse ? "✅" : "",
      Production: job.production ? "✅" : "",
      QC: job.qc ? "✅" : "",
      Account: job.account ? "✅" : "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Jobs");
    XLSX.writeFile(workbook, "EP_Jobs.xlsx");
  };

  const handleDelete = async (jobId) => {
    if (window.confirm("ลบงานนี้หรือไม่?")) {
      await deleteDoc(doc(db, "jobs", jobId));
      setJobs(jobs.filter((job) => job.id !== jobId));
    }
  };

  const handleViewDetails = (jobId) => {
    alert("ดูรายละเอียดของงาน: " + jobId);
  };

  const handleUpdateStatus = async (jobId) => {
    const confirmUpdate = window.confirm("อัปเดตสถานะงานนี้เป็น 'เสร็จสิ้น' หรือไม่?");
    if (confirmUpdate) {
      const jobRef = doc(db, "jobs", jobId);
      await updateDoc(jobRef, { status: "เสร็จสิ้น" });
      alert("อัปเดตสถานะเรียบร้อย");
      window.location.reload();
    }
  };

  return (
    <div style={{ padding: "24px" }}>
      <h1>📊 Dashboard</h1>

      {/* สรุปกราฟ (Placeholder) */}
      <div style={{ margin: "24px 0", border: "1px solid #ccc", padding: "16px", borderRadius: "12px" }}>
        <p>📈 สรุปกราฟ (จะใส่ Dashboard จริงภายหลัง)</p>
      </div>

      {/* ความคืบหน้าของงานแต่ละชุด */}
      <h2>📌 ความคืบหน้าของงานแต่ละชุด</h2>
      {jobs.map((job) => (
        <div key={job.id} style={{ marginBottom: "16px" }}>
          <strong>{job.productName}</strong>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
            {["sales", "warehouse", "production", "qc", "account"].map((step) => (
              <div key={step}>
                <div style={{ textAlign: "center", fontSize: "12px" }}>{step.toUpperCase()}</div>
                <div
                  style={{
                    width: "110px",
                    height: "14px",
                    backgroundColor: job[step] ? "#4ade80" : "#f3f4f6",
                    border: "1px solid #ccc",
                    borderRadius: "6px",
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* ปุ่ม 🔍 รายละเอียด */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        style={{
          margin: "16px 0",
          padding: "8px 16px",
          borderRadius: "8px",
          border: "1px solid #888",
          cursor: "pointer",
        }}
      >
        🔍 รายละเอียด
      </button>

      {/* Job List */}
      {showDetails && (
        <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th>Product</th>
              <th>Batch</th>
              <th>Sales</th>
              <th>Warehouse</th>
              <th>Production</th>
              <th>QC</th>
              <th>Account</th>
              {(user?.role === "admin" || user?.role === "sales") && <th>ลบ</th>}
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id}>
                <td>{job.productName}</td>
                <td>{job.batchNumber}</td>
                <td>{job.sales ? "✅" : ""}</td>
                <td>{job.warehouse ? "✅" : ""}</td>
                <td>{job.production ? "✅" : ""}</td>
                <td>{job.qc ? "✅" : ""}</td>
                <td>{job.account ? "✅" : ""}</td>
                {(user?.role === "admin" || user?.role === "sales") && (
                  <td>
                    <button onClick={() => handleDelete(job.id)} style={{ color: "red" }}>
                      ลบ
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* ปุ่ม Export Excel */}
      <button
        onClick={handleExport}
        style={{
          marginTop: "16px",
          padding: "8px 16px",
          borderRadius: "8px",
          backgroundColor: "#2563eb",
          color: "white",
          border: "none",
          cursor: "pointer",
        }}
      >
        📥 Export Excel
      </button>

      {/* Stack Card ด้านล่างสุด */}
      <div style={{ marginTop: "48px" }}>
        <h2 style={{ marginBottom: "16px" }}>📦 รายการงานทั้งหมด</h2>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "16px",
            justifyContent: "flex-start",
          }}
        >
          {jobs.map((job) => (
            <div
              key={job.id}
              style={{
                border: "1px solid #ccc",
                borderRadius: "12px",
                padding: "16px",
                width: "280px",
                boxShadow: "2px 2px 8px rgba(0,0,0,0.1)",
                backgroundColor: "#fdfdfd",
              }}
            >
              <h3 style={{ margin: "0 0 8px 0" }}>{job.productName}</h3>
              <p>
                <strong>Batch:</strong> {job.batchNumber}
              </p>
              <p>
                <strong>วันที่สร้าง:</strong>{" "}
                {job.createdAt?.seconds
                  ? new Date(job.createdAt.seconds * 1000).toLocaleDateString()
                  : "-"}
              </p>
              <p>
                <strong>สถานะ:</strong> {job.status || "รอดำเนินการ"}
              </p>
              <div style={{ marginTop: "12px", display: "flex", gap: "8px" }}>
                <button
                  onClick={() => handleViewDetails(job.id)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "6px",
                    border: "1px solid #888",
                    backgroundColor: "#eee",
                    cursor: "pointer",
                  }}
                >
                  🔍 ดูรายละเอียด
                </button>
                <button
                  onClick={() => handleUpdateStatus(job.id)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "6px",
                    border: "1px solid #3b82f6",
                    backgroundColor: "#3b82f6",
                    color: "white",
                    cursor: "pointer",
                  }}
                >
                  ✅ อัปเดตสถานะ
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
