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
      const stepIndex = departments.indexOf(item.CurrentStep);
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
    return departments.map((dept, index) => {
      const deptIndex = departments.indexOf(dept);
      const stepIndex = departments.indexOf(step);
      let bg = "#d1d5db"; // default: ยังไม่ถึง
      if (stepIndex === deptIndex) bg = "#facc15"; // กำลังทำ
      else if (stepIndex > deptIndex) bg = "#4ade80"; // เสร็จแล้ว

      return (
        <div
          key={index}
          style={{
            flex: 1,
            backgroundColor: bg,
            margin: "2px",
            height: "25px",
            borderRadius: "4px",
          }}
        />
      );
    });
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "auto", padding: "20px", fontFamily: "Segoe UI, sans-serif" }}>
      <h2 style={{ fontSize: "1.6rem", marginBottom: "20px" }}>🏠 หน้าหลัก – ภาพรวมการทำงาน</h2>

      <h3>🔴 ความคืบหน้าของงานแต่ละชุด</h3>

      {/* หัวตาราง */}
      <div style={{ display: "flex", fontWeight: "bold", marginTop: "10px", marginLeft: "90px" }}>
        {departments.map((dept) => (
          <div key={dept} style={{ flex: 1, textAlign: "center" }}>{dept}</div>
        ))}
      </div>

      {/* Progress Bars */}
      {allData.map((item) => (
        <div key={item.id} style={{ display: "flex", alignItems: "center", marginBottom: "6px" }}>
          <div style={{ width: "90px", fontSize: "14px" }}>📄 {item.BatchNo}</div>
          <div style={{ display: "flex", flex: 1 }}>{renderProgressBar(item.CurrentStep)}</div>
        </div>
      ))}

      {/* สรุปสถานะงานรายแผนก */}
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

      {/* ปุ่ม Export + รายละเอียด */}
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
          🔍 รายละเอียด
        </button>
      </div>

      {/* รายการงานทั้งหมด (ซ่อนไว้ได้ตามที่ต้องการ) */}
      {/* เพิ่มส่วนนี้หากต้องการให้โชว์รายละเอียดแบบ toggle */}
    </div>
  );
}
