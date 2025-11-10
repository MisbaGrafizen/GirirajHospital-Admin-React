import React, { useState, useEffect } from "react";
import { Eye, User, Search } from "lucide-react";
import * as XLSX from "xlsx";
import Header from "../../Component/header/Header";
import CubaSidebar from "../../Component/sidebar/CubaSidebar";
import Preloader from "../../Component/loader/Preloader";
import { useNavigate } from "react-router-dom";
import { ApiGet } from "../../helper/axios"; // ✅ use your axios helper

export default function InternalComplaintsList() {
  const [complaints, setComplaints] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ✅ Fetch complaints from backend
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setLoading(true);
        const res = await ApiGet("/admin/internal-complaints");
        console.log('res', res)
        if (res?.data) {
          setComplaints(res.data);
        } else {
          setError("No complaints found.");
        }
      } catch (err) {
        console.error("Error fetching complaints:", err);
        setError("Failed to load complaints.");
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, []);

  // 🔍 Search filter
  const filteredComplaints = complaints.filter((c) => {
    const departments = Object.keys(c).filter(
      (key) => typeof c[key] === "object" && c[key]?.text
    );
    const deptList = departments.join(", ");

    return (
      c.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.contactNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.floorNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deptList.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.complaintId?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // 📤 Export to Excel
  const exportToExcel = () => {
    try {
      const formatted = complaints.map((c) => {
        const activeDepts = Object.keys(c)
          .filter(
            (key) =>
              typeof c[key] === "object" &&
              (c[key]?.text || c[key]?.attachments?.length > 0)
          )
          .join(", ");
        return {
          ComplaintID: c.complaintId,
          EmployeeName: c.employeeName,
          ContactNo: c.contactNo,
          EmployeeID: c.employeeId,
          FloorNo: c.floorNo,
          ActiveDepartments: activeDepts,
          Status: c.status,
          CreatedAt: new Date(c.createdAt).toLocaleString(),
        };
      });

      const ws = XLSX.utils.json_to_sheet(formatted);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Internal Complaints");
      XLSX.writeFile(wb, "Internal_Complaint_List.xlsx");
    } catch {
      setError("Export failed. Try again.");
    }
  };

  // 🎨 Badge
  const getStatusBadge = (status) => {
    const base =
      "px-3 py-[3px] rounded-full text-xs font-semibold inline-flex items-center justify-center";
    switch (status) {
      case "resolved":
        return `${base} bg-green-100 text-green-700`;
      case "open":
        return `${base} bg-yellow-100 text-yellow-700`;
      case "escalated":
        return `${base} bg-gray-100 text-gray-800`;
      default:
        return `${base} bg-blue-100 text-blue-700`;
    }
  };

  const handleView = (row) => {
  navigate("/internal-complaint-details", {
    state: { complaint: row }, // ✅ Pass only the selected complaint, not the ID
  });
};



  return (
    <>
      <section className="flex w-[100%] h-[100%] select-none overflow-hidden">
        <div className="flex w-[100%] flex-col gap-[0px] h-[100vh]">
          <Header pageName="Internal Complaints List" />
          <div className="flex w-[100%] h-[100%]">
            <CubaSidebar />
            <div className="flex flex-col w-[100%] relative max-h-[93%] py-[10px] overflow-y-auto gap-[10px] ">
              {loading && <Preloader />}
              <div className="bg-white w-[98%] mx-auto rounded-lg border shadow-sm overflow-hidden">
                {/* ---------- Header ---------- */}
                {/* <div className="px-4 py-2 border-b border-gray-200 flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-gray-50">
                  <div className="flex justify-between w-[100%] items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search complaints..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 pr-3 py-[6px] border w-[200px] border-gray-300 rounded-md text-sm focus:outline-none"
                      />
                    </div>

              
                  </div>
                </div> */}

                {/* ---------- Table ---------- */}
                <div className="overflow-x-auto">
                  <table className="min-w-full border-separate border-spacing-0">
                    <thead>
                      <tr className="bg-gray-100 text-gray-600 text-xs font-semibold uppercase tracking-wider">
                        {[
                          "Complaint ID",
                          "Employee Name",
                          "Contact No",
                          "Employee ID",
                          "Floor No",
                          "Departments",
                          "Status",
                          "Action",
                        ].map((header, i) => (
                          <th
                            key={i}
                            className="px-2  font-[500] text-[12px] border-r py-[10px] border-b border-gray-200 text-left whitespace-nowrap"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {filteredComplaints.map((row, index) => {
                        const activeDepartments = Object.keys(row)
                          .filter(
                            (key) =>
                              typeof row[key] === "object" &&
                              (row[key]?.text ||
                                (row[key]?.attachments &&
                                  row[key].attachments.length > 0))
                          )
                          .join(", ");

                        return (
                          <tr
                            key={row._id}
                            className={`${
                              index % 2 === 0 ? "bg-white" : "bg-gray-50"
                            } hover:bg-blue-50 transition`}
                          >
                            <td className="px-2 text-[12px] border-r py-[9px] border-b border-gray-100 font-medium text-blue-600">
                              <button
                                onClick={() => handleView(row)}
                                className="hover:underline"
                              >
                                {row.complaintId}
                              </button>
                            </td>
                            <td className="px-2 text-[12px] border-r py-[9px]  border-gray-100 font-medium text-gray-800 flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-400" />
                              {row.employeeName}
                            </td>
                            <td className="px-2 text-[12px] border-r py-[9px]  border-gray-100 text-gray-800 text-sm">
                              {row.contactNo}
                            </td>
                            <td className="px-2 text-[12px] border-r py-[9px]  border-gray-100 text-gray-800 text-sm">
                              {row.employeeId}
                            </td>
                            <td className="px-2 text-[12px] border-r py-[9px]  border-gray-100 text-gray-800 text-sm">
                              {row.floorNo}
                            </td>
                            <td className="px-2 text-[12px] border-r py-[9px]  border-gray-100 text-gray-800 text-sm">
                              {activeDepartments || "-"}
                            </td>
                            <td className="px-2 text-[12px] border-r py-[9px]  border-gray-100">
                              <span className={getStatusBadge(row.status)}>
                                {row.status}
                              </span>
                            </td>
                            <td className="px-2 text-[12px] border-r py-[9px]  border-gray-100 text-blue-600 text-sm font-medium flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              <button
                                onClick={() => handleView(row)}
                                className="hover:underline"
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        );
                      })}

                      {filteredComplaints.length === 0 && !loading && (
                        <tr>
                          <td
                            colSpan="8"
                            className="text-center py-5 text-gray-500 text-sm"
                          >
                            No complaints found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {error && (
                  <div className="text-red-600 text-sm mt-3 px-6 pb-3">
                    {error}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
