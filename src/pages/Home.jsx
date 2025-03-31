import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  deleteDoc
} from "firebase/firestore";

// ค่าคงที่
const departments = ["Sales", "Warehouse", "Production", "QC", "Account"];
const statusOptions = {
  Warehouse: ["ยังไม่เบิก", "Pending", "เบิกเสร็จ"],
  Production: ["ยังไม่เริ่มผลิต", "กำลังผลิต", "กำลังบรรจุ", "ผลิตเสร็จ"],
  QC: {
    qc_inspection: ["ยังไม่ได้ตรวจ", "กำลังตรวจ (รอปรับ)", "กำลังตรวจ (Hold)", "ตรวจผ่านแล้ว"],
    qc_coa: ["ยังไม่เตรียม", "กำลังเตรียม", "เตรียมพร้อมแล้ว"]
  },
  Account: ["Invoice ยังไม่ออก", "Invoice ออกแล้ว"]
};

const getNextStep = (current) => {
  const index = departments.findIndex((d) => d === current);
  return index !== -1 && index < departments.length - 1
    ? departments[index + 1]
    : null;
};

export default function Home() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    const querySnapshot = await getDocs(collection(db, "production_workflow"));
    const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setJobs(data);
    console.log("🔥 jobs:", data);
  };

  const handleStatusChange = async (job, field, value) => {
    const jobRef = doc(db, "production_workflow", job.id);
    const newStatus = { ...job.status, [field]: value };

    let shouldAdvance = false;
    if (job.currentStep === "Warehouse" && value === "เบิกเสร็จ") {
      shouldAdvance = true;
    }
    if (job.currentStep === "Production" && value === "ผลิตเสร็จ") {
      shouldAdvance = true;
    }
    if (
      job.currentStep === "QC" &&
      newStatus.qc_inspection === "ตรวจผ่านแล้ว" &&
      newStatus.qc_coa === "เตรียมพร้อมแล้ว"
    ) {
      shouldAdvance = true;
    }
    if (job.currentStep === "Account" && value === "Invoice ออกแล้ว") {
      shouldAdvance = true;
    }

    const updateData = { status: newStatus };
    if (shouldAdvance) {
      updateData.currentStep = getNextStep(job.currentStep);
    }

    await updateDoc(jobRef, updateData);
    fetchJobs();
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "production_workflow", id));
    fetchJobs();
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>📊 ความคืบหน้าของงานแต่ละชุด</h2>
      
      {/* ตารางถูกลบออกแล้ว */}
      
    </div>
  );
}
