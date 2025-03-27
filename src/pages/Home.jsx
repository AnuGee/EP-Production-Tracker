import React, { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import * as XLSX from "xlsx";

const db = getFirestore();
const departments = ["Sales", "Warehouse", "Production", "QC", "Account"];

export default function Home() {
  const [allData, setAllData] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("user"));
    setUser(userInfo);
    fetchData();
  }, []);

  const fetchData = async () => {
    const snapshot = await getDocs(collection(db, "production_workflow"));
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setAllData(data);
  };

  const countStatus = (dept) => {
    const counts = { ยังไม่ถึง: 0, กำลังทำ: 0, เสร็จแล้ว: 0 };

    allData.forEach((item) => {
      const step = item.CurrentStep;
      const stepIndex = departments.indexOf(step);
      const deptIndex = departments.indexOf(dept);

      if (stepIndex === deptIndex) {
        counts["กำลังทำ"]++;
      } else if (stepIndex > deptIndex) {
        counts["เสร็จแล้ว"]++;
      } else {
        counts["ยังไม่ถึง"]++;
      }
    });

    return counts;
  };

  const chartData = departments.map((dept) => ({
    name: dept,
    ...countStatus(dept),
  }));

  const handleExport = () => {
    const exportData = allData.map((item) => ({
      BatchNo: item.BatchNo || "",
      Product: item.Product || "",
      CurrentStep: item.CurrentStep || "",
      Customer: item.Customer || "",
      Volume: item.Volume || "",
      DeliveryDate: item.DeliveryDate || "",
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Jobs");
    XLSX.writeFile(wb, "production_data.xlsx");
  };

  const handleDelete = async (id) => {
    if (window.confirm("ยืนยันลบงานนี้?")) {
      await deleteDoc(doc(db, "production_workflow", id));
      fetchData();
    }
  };

  const renderProgressBar = (step) => {
    const currentIndex = departments.indexOf(step);
    return (
      <div style={{ display: "flex", gap: "4px", marginBottom: "5px" }}>
        {departments.map((dept, index) => (
          <div
            key={dept}
            style={{
              flex: 1,
              height: "20px",
              backgroundColor:
                index < currentIndex
                  ? "#4ade80" // เสร็จแล้ว
                  : index === currentIndex
                  ? "#facc15" // กำลังทำ
                  : "#d1d5db", // ยังไม่ถึง
              borderRadius: "4px",
              textAlign: "center",
              fontSize: "0.65rem",
              lineHeight: "20px",
              fontWeight: "bold",
              color: "#1f2937",
            }}
          >
            {dept}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "auto", padding: "20px", fontFamily: "Segoe UI, sans-serif" }}>
      <h2 style={{ fontSize: "1.6rem", marginBottom: "20px" }}>🏠 หน้าหลัก – ภาพรวมการทำงาน</h2>

      <h3 style={{ fontSize: "1.2rem", marginBottom: "10px" }}>📊 สรุปสถานะงานรายแผนก</h3>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} layout="vertical" margin={{ left: 50 }}>
          <XAxis type="number" />
          <YAxis dataKey="name" type="category" />
          <Tooltip />
          <Legend />
          <Bar dataKey="ยังไม่ถึง" stackId="a" fill="#d1d5db" />
          <Bar dataKey="กำลังทำ" stackId="a" fill="#facc15" />
          <Bar dataKey="เสร็จแล้ว" stackId="a" fill="#4ade80" />
        </BarChart>
      </ResponsiveContainer>

      <button
        onClick={handleExport}
        style={{
          padding: "10px 16px",
          backgroundColor: "#16a34a",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          marginTop: "20px",
          cursor: "pointer",
        }}
      >
        📥 Export Excel
      </button>

      <div style={{ marginTop: "30px" }}>
        <h3 style={{ marginBottom: "10px" }}>📋 รายการงานทั้งหมด</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#f3f4f6" }}>
              <th style={thStyle}>Batch No</th>
              <th style={thStyle}>Product</th>
              <th style={thStyle}>Current Step</th>
              <th style={thStyle}>Customer</th>
              <th style={thStyle}>Volume</th>
              <th style={thStyle}>Delivery Date</th>
              <th style={thStyle}>Progress</th>
              {(user?.role === "admin" || user?.role === "sales") && <th style={thStyle}>ลบ</th>}
            </tr>
          </thead>
          <tbody>
            {allData.map((item) => (
              <tr key={item.id}>
                <td style={tdStyle}>{item.BatchNo}</td>
                <td style={tdStyle}>{item.Product}</td>
                <td style={tdStyle}>{item.CurrentStep}</td>
                <td style={tdStyle}>{item.Customer || "-"}</td>
                <td style={tdStyle}>{item.Volume || "-"}</td>
                <td style={tdStyle}>{item.DeliveryDate || "-"}</td>
                <td style={tdStyle}>{renderProgressBar(item.CurrentStep)}</td>
                {(user?.role === "admin" || user?.role === "sales") && (
                  <td style={tdStyle}>
                    <button
                      onClick={() => handleDelete(item.id)}
                      style={{
                        backgroundColor: "red",
                        color: "#fff",
                        border: "none",
                        padding: "5px 10px",
                        borderRadius: "5px",
                        cursor: "pointer",
                      }}
                    >
                      ลบ
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const thStyle = {
  padding: "8px",
  border: "1px solid #ddd",
  textAlign: "left",
};

const tdStyle = {
  padding: "8px",
  border: "1px solid #ddd",
};
