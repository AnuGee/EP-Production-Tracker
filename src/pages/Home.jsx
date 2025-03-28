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

export default function Home() {
  const [allData, setAllData] = useState([]);
  const [user, setUser] = useState(null);

  const departments = ["Sales", "Warehouse", "Production", "QC", "Account"];

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

  return (
    <div style={{ maxWidth: "1200px", margin: "auto", padding: "20px" }}>
      <h2>🏠 หน้าหลัก – ภาพรวมการทำงาน</h2>

      {/* 🔴 Progress Bar แต่ละชุด */}
      <h3 style={{ marginTop: "30px" }}>🔴 ความคืบหน้าของงานแต่ละชุด</h3>
      <div style={{ display: "grid", gridTemplateColumns: "200px repeat(5, 110px)", gap: "10px", fontWeight: "bold", marginTop: "10px" }}>
        <div>Product</div>
        {departments.map((dept) => (
          <div key={dept}>{dept}</div>
        ))}
      </div>

      {allData.map((item) => {
        const currentIndex = departments.indexOf(item.CurrentStep);
        return (
          <div
            key={item.id}
            style={{
              display: "grid",
              gridTemplateColumns: "200px repeat(5, 110px)",
              gap: "10px",
              marginTop: "6px",
              alignItems: "center",
            }}
          >
            <div style={{ fontSize: "14px" }}>📄 {item.Product || "-"}</div>
            {departments.map((dept, index) => {
              let color = "#d1d5db";
              if (index < currentIndex) color = "#4ade80";
              else if (index === currentIndex) color = "#facc15";

              return (
                <div
                  key={dept}
                  style={{
                    height: "20px",
                    backgroundColor: color,
                    borderRadius: "4px",
                  }}
                ></div>
              );
            })}
          </div>
        );
      })}

      {/* 📊 สรุปสถานะรายแผนก */}
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

      {/* 📦 รายละเอียดงานทั้งหมด */}
      <div style={{ marginTop: "30px" }}>
        <h3>📋 รายการงานทั้งหมด</h3>
        <button
          onClick={handleExport}
          style={{
            marginBottom: "10px",
            padding: "8px 16px",
            backgroundColor: "#16a34a",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          📥 Export Excel
        </button>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#f3f4f6" }}>
              <th style={thStyle}>Batch No</th>
              <th style={thStyle}>Product</th>
              <th style={thStyle}>Current Step</th>
              <th style={thStyle}>Customer</th>
              <th style={thStyle}>Volume</th>
              <th style={thStyle}>Delivery Date</th>
              {(user?.role === "admin" || user?.role === "sales") && (
                <th style={thStyle}>ลบ</th>
              )}
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
