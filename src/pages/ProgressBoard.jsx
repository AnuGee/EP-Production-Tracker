import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

const steps = ["Sales", "Warehouse", "Production", "QC", "Account"];
const statusFields = {
  Sales: "Sales_Status",
  Warehouse: "Warehouse_Status",
  Production: "Production_Status",
  QC: "QC_Status",
  Account: "Account_Status",
};

const ProgressBoard = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const snap = await getDocs(collection(db, "production_workflow"));
      const all = snap.docs.map((doc) => doc.data());
      setData(all);
    };
    loadData();
  }, []);

  const getStepStatus = (item, step) => {
    const currentIndex = steps.indexOf(item.CurrentStep);
    const stepIndex = steps.indexOf(step);
    const status = item[statusFields[step]];

    if (status === "Completed") return "done";
    if (currentIndex === stepIndex) return "doing";
    if (currentIndex > stepIndex) return "done";
    return "notyet";
  };

  const getColor = (status) => {
    if (status === "done") return "#4ade80"; // เขียว
    if (status === "doing") return "#facc15"; // เหลือง
    return "#e5e7eb"; // เทา
  };

  return (
    <div style={{ padding: "20px", fontFamily: "'Segoe UI', sans-serif" }}>
      <h1 style={{ fontSize: "1.8rem", marginBottom: "20px" }}>
        🚦 Progress งานทั้งหมด
      </h1>

      {data.map((item, idx) => (
        <div key={idx} style={{ marginBottom: "15px" }}>
          <div style={{ marginBottom: "6px", fontWeight: "500" }}>
            🧾 {item.Product || "ไม่ระบุชื่อสินค้า"} ({item.BatchNo})
          </div>
          <div style={{ display: "flex", gap: "4px" }}>
            {steps.map((step) => {
              const status = getStepStatus(item, step);
              return (
                <div
                  key={step}
                  title={step}
                  style={{
                    flex: 1,
                    height: "20px",
                    backgroundColor: getColor(status),
                    borderRadius: "4px",
                    textAlign: "center",
                    fontSize: "0.7rem",
                    color: "#111",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold"
                  }}
                >
                  {step[0]}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProgressBoard;