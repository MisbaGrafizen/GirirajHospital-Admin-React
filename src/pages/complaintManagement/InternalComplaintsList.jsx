import React, { useState, useEffect, useRef } from "react";
import { Eye, User } from "lucide-react";
import * as XLSX from "xlsx";
import Header from "../../Component/header/Header";
import CubaSidebar from "../../Component/sidebar/CubaSidebar";
import Preloader from "../../Component/loader/Preloader";
import { useNavigate } from "react-router-dom";
import { ApiGet } from "../../helper/axios";

// ✅ Department label mapping
const DEPT_LABEL = {
  doctorServices: "Doctor Services",
  billingServices: "Billing Services",
  housekeeping: "Housekeeping",
  maintenance: "Maintenance",
  diagnosticServices: "Diagnostic Services",
  dietitianServices: "Dietitian Services",
  security: "Security",
  nursing: "Nursing",
  itDepartment: "IT Department",
  bioMedicalDepartment: "Bio Medical",
  medicalAdmin: "Medical Admin",
  hr: "HR",
  pharmacy: "Pharmacy",
  icn: "ICN",
  mrd: "MRD",
  accounts: "Accounts",
};

// ✅ Map module names → backend keys
const MODULE_TO_BLOCK = {
  doctor_service: "doctorServices",
  diagnostic_service: "diagnosticServices",
  nursing: "nursing",
  dietitian: "dietitianServices",
  maintenance: "maintenance",
  security: "security",
  billing_service: "billingServices",
  housekeeping: "housekeeping",
  it_department: "itDepartment",
  bio_medical: "bioMedicalDepartment",
  medical_admin: "medicalAdmin",
  pharmacy: "pharmacy",
  accounts: "accounts",
  hr: "hr",
  icn: "icn",
  mrd: "mrd",
};

// ✅ Permission Denied component
function PermissionDenied() {
  return (
    <div className="flex items-center justify-center h-[70vh]">
      <div className="bg-white border rounded-xl p-8 shadow-sm text-center max-w-md">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Permission required
        </h2>
        <p className="text-gray-600">
          You don’t have access to view this Complaint Dashboard. Please contact
          an administrator.
        </p>
      </div>
    </div>
  );
}

// ✅ Permission Resolver (SYNCHRONOUS, reliable)
function resolvePermissions() {
  try {
    const loginType = localStorage.getItem("loginType");
    const isAdmin = loginType === "admin";

    let rights = [];
    const stored = localStorage.getItem("rights");

    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed?.permissions && Array.isArray(parsed.permissions)) {
        rights = parsed.permissions;
      } else if (Array.isArray(parsed)) {
        rights = parsed;
      }
    }

    const allowedBlocks = isAdmin
      ? Object.values(MODULE_TO_BLOCK)
      : rights.map((r) => MODULE_TO_BLOCK[r.module]).filter(Boolean);

    return { isAdmin, allowedBlocks };
  } catch (err) {
    console.error("Permission parse error:", err);
    return { isAdmin: false, allowedBlocks: [] };
  }
}

export default function InternalComplaintsList() {
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [allowedBlocks, setAllowedBlocks] = useState([]);
  const [ready, setReady] = useState(false); // ✅ ensures order
  const navigate = useNavigate();

  const fetchedRef = useRef(false); // ✅ prevent double-fetch

  // Step 1️⃣: Resolve permissions immediately on mount
  useEffect(() => {
    const { isAdmin, allowedBlocks } = resolvePermissions();
    setIsAdmin(isAdmin);
    setAllowedBlocks(allowedBlocks);
    setReady(true);
  }, []);

  // Step 2️⃣: Fetch complaints only when permissions ready
  useEffect(() => {
    if (!ready || fetchedRef.current) return; // wait until permissions loaded
    fetchedRef.current = true;

    const fetchComplaints = async () => {
      try {
        setLoading(true);
        const res = await ApiGet("/admin/internal-complaints");
        let allComplaints = res?.data || [];

        if (!isAdmin && allowedBlocks.length > 0) {
          allComplaints = allComplaints.filter((complaint) =>
            Object.keys(complaint).some(
              (key) =>
                allowedBlocks.includes(key) &&
                typeof complaint[key] === "object" &&
                (complaint[key]?.text ||
                  (complaint[key]?.attachments?.length > 0))
            )
          );
        }

        setComplaints(allComplaints);
        setFilteredComplaints(allComplaints);
      } catch (err) {
        console.error("Error fetching complaints:", err);
        setError("Failed to load complaints.");
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, [ready, isAdmin, allowedBlocks]);

  // Step 3️⃣: Search handler
  useEffect(() => {
    const filtered = complaints.filter((c) => {
      const departments = Object.keys(c).filter(
        (key) => typeof c[key] === "object" && c[key]?.text
      );
      const deptList = departments.map((key) => DEPT_LABEL[key] || key).join(", ");
      return (
        c.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.contactNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.floorNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deptList.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.complaintId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
    setFilteredComplaints(filtered);
  }, [searchTerm, complaints]);

  const handleView = (row) => {
    navigate("/internal-complaint-details", { state: { complaint: row } });
  };

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

  const exportToExcel = () => {
    try {
      const formatted = filteredComplaints.map((c) => {
        const activeDepts = Object.keys(c)
          .filter(
            (key) =>
              typeof c[key] === "object" &&
              (c[key]?.text || c[key]?.attachments?.length > 0)
          )
          .map((key) => DEPT_LABEL[key] || key)
          .join(", ");
        return {
          ComplaintID: c.complaintId,
          EmployeeName: c.employeeName,
          ContactNo: c.contactNo,
          EmployeeID: c.employeeId,
          FloorNo: c.floorNo,
          Departments: activeDepts,
          Status: c.status,
          CreatedAt: new Date(c.createdAt).toLocaleString(),
        };
      });
      const ws = XLSX.utils.json_to_sheet(formatted);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Internal Complaints");
      XLSX.writeFile(wb, "Internal_Complaints.xlsx");
    } catch {
      setError("Export failed. Try again.");
    }
  };

  // Step 4️⃣: handle loading / permission
  if (!ready) {
    return <Preloader />;
  }

  if (!isAdmin && allowedBlocks.length === 0) {
    return (
      <section className="flex w-full h-full select-none overflow-hidden">
        <Header pageName="Internal Complaints List" />
        <CubaSidebar />
        <PermissionDenied />
      </section>
    );
  }

  return (
    <section className="flex w-full h-full select-none overflow-hidden">
      <div className="flex w-full flex-col h-screen">
        <Header pageName="Internal Complaints List" />
        <div className="flex w-full h-full">
          <CubaSidebar />
          <div className="flex flex-col w-full relative max-h-[93%] py-[10px] overflow-y-auto gap-[10px]">
            {loading && <Preloader />}

            <div className="bg-white w-[98%] mx-auto rounded-lg border shadow-sm overflow-hidden">
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
                          className="px-2 font-[500] text-[12px] border-r py-[10px] border-b border-gray-200 text-left whitespace-nowrap"
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
                        .map((key) => DEPT_LABEL[key] || key)
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
                          <td className="px-2 text-[12px] border-r py-[9px] border-gray-100 font-medium text-gray-800 flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            {row.employeeName}
                          </td>
                          <td className="px-2 text-[12px] border-r py-[9px] border-gray-100">
                            {row.contactNo}
                          </td>
                          <td className="px-2 text-[12px] border-r py-[9px] border-gray-100">
                            {row.employeeId}
                          </td>
                          <td className="px-2 text-[12px] border-r py-[9px] border-gray-100">
                            {row.floorNo}
                          </td>
                          <td className="px-2 text-[12px] border-r py-[9px] border-gray-100">
                            {activeDepartments || "-"}
                          </td>
                          <td className="px-2 text-[12px] border-r py-[9px] border-gray-100">
                            <span className={getStatusBadge(row.status)}>
                              {row.status}
                            </span>
                          </td>
                          <td className="px-2 text-[12px] border-r py-[9px] border-gray-100 text-blue-600 text-sm font-medium flex items-center gap-1">
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

                    {!loading && filteredComplaints.length === 0 && (
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
                <div className="text-red-600 text-sm mt-3 px-6 pb-3">{error}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
