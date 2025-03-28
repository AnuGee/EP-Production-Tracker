import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import * as XLSX from "xlsx";

const Home = ({ user }) => {
  const [jobs, setJobs] = useState([]);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("all");

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

  const filteredJobs = jobs.filter((job) => {
    if (selectedMonth === "all") return true;
    if (!job.createdAt?.seconds) return false;
    const jobDate = new Date(job.createdAt.seconds * 1000);
    return jobDate.getMonth() + 1 === parseInt(selectedMonth);
  });

  const handleExport = () => {
    const data = filteredJobs.map((job) => ({
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

  return (
    <div style={{ padding: "24px" }}>
      <h1>📊 Dashboard</h1>

      <div style={{ margin: "24px 0", border: "1px solid #ccc", padding: "16px", borderRadius: "12px" }}>
        <p>📈 สรุปกราฟ (จะใส่ Dashboard จริงภายหลัง)</p>
      </div>

      {/* Dropdown เลือกเดือน */}
      <div style={{ marginBottom: "16px" }}>
        <label>
          📅 เลือกเดือน:{" "}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{ padding: "6px 12px", borderRadius: "6px" }}
          >
            <option value="all">ทั้งหมด</option>
            <option value="1">มกราคม</option>
            <option value="2">กุมภาพันธ์</option>
            <option value="3">มีนาคม</option>
            <option value="4">เมษายน</option>
            <option value="5">พฤษภาคม</option>
            <option value="6">มิถุนายน</option>
            <option value="7">กรกฎาคม</option>
            <option value="8">สิงหาคม</option>
            <option value="9">กันยายน</option>
            <option value="10">ตุลาคม</option>
            <option value="11">พฤศจิกายน</option>
            <option value="12">ธันวาคม</option>
          </select>
        </label>
      </div>

      {/* ความคืบหน้า */}
      <h2>📌 ความคืบหน้าของงานแต่ละชุด</h2>
      {filteredJobs.map((job) => (
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

      {/* ปุ่มรายละเอียด */}
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

      {/* รายการงาน */}
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
            </tr>
          </thead>
          <tbody>
            {filteredJobs.map((job) => (
              <tr key={job.id}>
                <td>{job.productName}</td>
                <td>{job.batchNumber}</td>
                <td>{job.sales ? "✅" : ""}</td>
                <td>{job.warehouse ? "✅" : ""}</td>
                <td>{job.production ? "✅" : ""}</td>
                <td>{job.qc ? "✅" : ""}</td>
                <td>{job.account ? "✅" : ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Export */}
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
    </div>
  );
};

export default Home;
