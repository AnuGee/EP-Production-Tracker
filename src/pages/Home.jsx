import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import * as XLSX from "xlsx";

function Home({ userRole }) {
  const [jobs, setJobs] = useState([]);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, "production_workflow"));
      const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setJobs(data);
    };
    fetchData();
  }, []);

  const getStatus = (job) => {
    switch (job.currentStep) {
      case "Sales":
        return job.salesStatus || "-";
      case "Warehouse":
        return job.warehouseStatus || "-";
      case "Production":
        return job.productionStatus || "-";
      case "QC":
        return job.qcStatus || "-";
      case "Account":
        return job.accountStatus || "-";
      default:
        return "-";
    }
  };

  const handleExport = () => {
    const worksheet = XLSX.utils.json_to_sheet(jobs);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Jobs");
    XLSX.writeFile(workbook, "job_list.xlsx");
  };

  const handleDelete = async (id) => {
    if (window.confirm("ต้องการลบงานนี้หรือไม่?")) {
      await deleteDoc(doc(db, "production_workflow", id));
      setJobs(jobs.filter((job) => job.id !== id));
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">ความคืบหน้าของงานแต่ละชุด</h1>

      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="bg-blue-500 text-white px-4 py-2 rounded shadow"
        >
          {showDetails ? "ซ่อนรายละเอียด" : "🔍 รายละเอียด"}
        </button>
        <button
          onClick={handleExport}
          className="bg-green-500 text-white px-4 py-2 rounded shadow"
        >
          Export Excel
        </button>
      </div>

      {showDetails && (
        <div className="overflow-x-auto border rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-300 border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border">Product Name</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border">Current Step</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border">Status</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border">Date</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center px-4 py-4 text-gray-500">
                    ยังไม่มีข้อมูลงานในระบบ
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm text-gray-800 border">{job.productName || "-"}</td>
                    <td className="px-4 py-2 text-sm text-gray-800 border">{job.currentStep || "-"}</td>
                    <td className="px-4 py-2 text-sm text-gray-800 border">{getStatus(job)}</td>
                    <td className="px-4 py-2 text-sm text-gray-600 border">{job.date || "-"}</td>
                    <td className="px-4 py-2 text-sm border">
                      <button
                        className="text-blue-500 hover:underline mr-2 text-sm"
                        title="รายละเอียด"
                      >
                        🔍
                      </button>
                      {(userRole === "admin" || userRole === "sales") && (
                        <button
                          className="text-red-500 hover:underline text-sm"
                          onClick={() => handleDelete(job.id)}
                        >
                          ลบ
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Home;
