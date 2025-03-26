import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";
import * as XLSX from "xlsx";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

export default function Dashboard() {
  const [jobs, setJobs] = useState([]);
  const [showDetails, setShowDetails] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));
  const userRole = user?.role || "guest";

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const snapshot = await getDocs(collection(db, "production_workflow"));
    const all = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setJobs(all);
  };

  const handleExport = () => {
    const exportData = jobs.map((job) => ({
      BatchNo: job.BatchNo || "",
      Product: job.Product || "",
      Customer: job.Customer || "",
      Volume: job.Volume || "",
      Step: job.CurrentStep || "",
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Jobs");
    XLSX.writeFile(workbook, "production_jobs.xlsx");
  };

  const handleDeleteJob = async (jobId) => {
    const confirmed = window.confirm("❗ คุณแน่ใจว่าต้องการลบงานนี้หรือไม่?");
    if (!confirmed) return;
    try {
      await deleteDoc(doc(db, "production_workflow", jobId));
      alert("🗑 ลบเรียบร้อยแล้ว");
      loadData();
    } catch (err) {
      alert("เกิดข้อผิดพลาด: " + err.message);
    }
  };

  const barData = ["Sales", "Warehouse", "Production", "QC", "Account", "Completed"].map((step) => ({
    name: step,
    count: jobs.filter((job) => job.CurrentStep === step).length
  }));

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "auto", fontFamily: "Segoe UI, sans-serif" }}>
      <h2 style={{ fontSize: "1.8rem", marginBottom: "20px" }}>📊 Dashboard</h2>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={barData} layout="vertical" margin={{ left: 50 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" allowDecimals={false} />
          <YAxis type="category" dataKey="name" />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" fill="#2563eb" />
        </BarChart>
      </ResponsiveContainer>

      <div style={{ marginTop: "20px" }}>
        <button onClick={handleExport} style={greenBtn}>📥 Export Excel</button>
        <button onClick={() => setShowDetails(!showDetails)} style={blueBtn}>
          {showDetails ? "🔽 ซ่อนรายละเอียด" : "🔍 ดูรายละเอียด"}
        </button>
      </div>

      {showDetails && (
        <div style={{ marginTop: "30px" }}>
          <h3 style={{ marginBottom: "10px" }}>📄 ข้อมูลทั้งหมด</h3>
          <table style={tableStyle}>
            <thead>
              <tr style={{ backgroundColor: "#f1f5f9" }}>
                <th style={th}>Product</th>
                <th style={th}>Customer</th>
                <th style={th}>Volume</th>
                <th style={th}>สถานะ</th>
                {userRole === "admin" && <th style={th}>ลบ</th>}
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id}>
                  <td style={td}>{job.Product}</td>
                  <td style={td}>{job.Customer}</td>
                  <td style={td}>{job.Volume}</td>
                  <td style={td}>{job.CurrentStep}</td>
                  {userRole === "admin" && (
                    <td style={td}>
                      <button onClick={() => handleDeleteJob(job.id)} style={deleteBtn}>🗑</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const greenBtn = {
  backgroundColor: "#22c55e",
  color: "white",
  padding: "10px 16px",
  border: "none",
  borderRadius: "6px",
  marginRight: "10px",
  cursor: "pointer",
  fontWeight: "bold"
};

const blueBtn = {
  backgroundColor: "#2563eb",
  color: "white",
  padding: "10px 16px",
  border: "none",
  borderRadius: "6px",
  fontWeight: "bold",
  cursor: "pointer"
};

const deleteBtn = {
  backgroundColor: "#dc2626",
  color: "white",
  border: "none",
  borderRadius: "4px",
  padding: "6px 12px",
  cursor: "pointer"
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: "10px"
};

const th = {
  padding: "10px",
  border: "1px solid #ccc",
  textAlign: "left"
};

const td = {
  padding: "8px",
  border: "1px solid #ddd"
};
