import { db } from "../firebase";
import React, { useState } from "react";

import { db } from "../firebase";

export default function Sales() {
  const [product, setProduct] = useState("");
  const [volume, setVolume] = useState("");
  const [customer, setCustomer] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");

  const handleSubmit = async () => {
    if (!product || !volume || !customer || !deliveryDate) {
      alert("กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return;
    }

    try {
      await addDoc(collection(db, "production_workflow"), {
        Product: product,
        Volume: volume,
        Customer: customer,
        DeliveryDate: deliveryDate,
        CurrentStep: "Warehouse",
        Sales_Status: "Completed",
        Timestamp_Sales: serverTimestamp(),
      });
      alert("บันทึกข้อมูลเรียบร้อย ✅");

      // reset
      setProduct("");
      setVolume("");
      setCustomer("");
      setDeliveryDate("");
    } catch (err) {
      alert("เกิดข้อผิดพลาด: " + err.message);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Segoe UI", maxWidth: "500px", margin: "auto" }}>
      <h2>📝 Sales - กรอกข้อมูลเริ่มต้น</h2>

      <label style={labelStyle}>📦 Product Name</label>
      <input style={inputStyle} value={product} onChange={(e) => setProduct(e.target.value)} />

      <label style={labelStyle}>⚖️ Volume (KG.)</label>
      <input type="number" style={inputStyle} value={volume} onChange={(e) => setVolume(e.target.value)} />

      <label style={labelStyle}>👤 Customer Name</label>
      <input style={inputStyle} value={customer} onChange={(e) => setCustomer(e.target.value)} />

      <label style={labelStyle}>🚚 Delivery Date</label>
      <input type="date" style={inputStyle} value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} />

      <button style={buttonStyle} onClick={handleSubmit}>
        ✅ บันทึกข้อมูล และส่งต่อไปยัง Warehouse
      </button>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px",
  marginBottom: "15px",
  borderRadius: "6px",
  border: "1px solid #ccc",
  fontSize: "14px"
};

const labelStyle = {
  fontWeight: "bold",
  marginBottom: "5px",
  display: "block"
};

const buttonStyle = {
  width: "100%",
  padding: "12px",
  backgroundColor: "#2563eb",
  color: "white",
  fontWeight: "bold",
  fontSize: "16px",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer"
};
