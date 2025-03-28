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
  const [showDetails, setShowDetails] = useState(false);

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

  const renderProgressBar = (step, currentStep) => {
    const stepIndex = departments.indexOf(step);
    const currentIndex = departments.indexOf(currentStep);

    let bgColor = "#d1d5db"; // เทา = ยังไม่ถึง
    if (currentIndex > stepIndex) bgColor = "#4ade80"; // เขียว = เสร็จแล้ว
    else if (currentIndex === stepIndex) bgColor = "#facc15"; // เหลือง = กำลังทำ

    return (
      <div
        key={step}
        style={{
          width: "80px",
          height: "24px",
          backgroundColor: bgColor,
          borderRadius: "4px",
          marginRight: "4px",
        }}
        title={step}
      />
    );
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "auto", padding: "20px", fontFamily: "Segoe UI, sans-serif" }}>
      <h2>🏠 <strong>หน้าหลัก – ภาพรวมการทำงาน</strong></h2>

      <h3 style={{ marginTop: "20px" }}>🔴 ความคืบหน้าของงานแต่ละชุด</h3>
      <div style={{ display: "flex", marginBottom: "8px", marginLeft: "150px", gap: "8px" }}>
        {departments.map((dept) => (
          <strong key={dept} style={{ width: "80px", textAlign: "center" }}>{dept}</strong>
        ))}
      </div>

      {allData.map((item) => (
        <div key={item.id} style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
          <span style={{ width: "140px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            📄 {item.Product || "-"}
          </span>
          <div style={{ display: "flex", gap: "4px" }}>
            {departments.map((dept) => renderProgressBar(dept, item.CurrentStep))}
          </div>
        </div>
      ))}

      <h3 style={{ marginTop: "40px" }}>📊 สรุปสถานะงานรายแผนก</h3>
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

      <div style={{ marginTop: "20px" }}>
        <button
          onClick={handleExport}
          style={{
            padding: "10px 16px",
            backgroundColor: "#16a34a",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            marginRight: "10px",
            cursor: "pointer",
          }}
        >
          📥 Export Excel
        </button>

        <button
          onClick={() => setShowDetails(true)}
          style={{
            padding: "10px 16px",
            backgroundColor: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          🔍 ดูรายละเอียด
        </button>
      </div>

      {showDetails && (
        <div style={{ marginTop: "30px" }}>
          <h3>📋 รายการงานทั้งหมด</h3>
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
            <thead>
              <tr style={{ backgroundColor: "#f3f4f6" }}>
                <th style={thStyle}>Batch No</th>
                <th style={thStyle}>Product</th>
                <th style={thStyle}>Current Step</th>
                <th style={thStyle}>Customer</th>
                <th style={thStyle}>Volume</th>
                <th style={thStyle}>Delivery Date</th>
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
      )}
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
