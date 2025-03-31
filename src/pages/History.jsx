import { db } from "../firebase";
import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  Timestamp,
} from "firebase/firestore";


export default function History() {
  const [completedJobs, setCompletedJobs] = useState([]);

  useEffect(() => {
    loadCompletedJobs();
  }, []);

  const loadCompletedJobs = async () => {
    const q = query(collection(db, "production_workflow"), where("CurrentStep", "==", "Completed"));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setCompletedJobs(data);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "-";
    const date = timestamp.toDate();
    return date.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Segoe UI" }}>
      <h2>📁 ประวัติงานที่จบแล้ว</h2>

      {completedJobs.length === 0 ? (
        <p>ยังไม่มีงานที่จบกระบวนการ</p>
      ) : (
        <table style={tableStyle}>
          <thead>
            <tr style={theadStyle}>
              <th>Product</th>
              <th>Customer</th>
              <th>Volume</th>
              <th>Delivery Date</th>
              <th>Completed At</th>
            </tr>
          </thead>
          <tbody>
            {completedJobs.map((job) => (
              <tr key={job.id}>
                <td>{job.Product || "-"}</td>
                <td>{job.Customer || "-"}</td>
                <td>{job.Volume || "-"}</td>
                <td>{job.DeliveryDate || "-"}</td>
                <td>{formatDate(job.Timestamp_Account)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ✅ Style
const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: "20px",
};

const theadStyle = {
  backgroundColor: "#f3f4f6",
  fontWeight: "bold",
};

const tdStyle = {
  border: "1px solid #ccc",
  padding: "10px",
};