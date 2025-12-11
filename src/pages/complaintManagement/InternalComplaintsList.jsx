import React, { useState, useEffect, useRef } from "react";
import { Eye, User, Search, Download, Clock, Calendar, CalendarClock, Contact, Phone, IdCard, Hospital } from "lucide-react";
import * as XLSX from "xlsx";
import Header from "../../Component/header/Header";
import CubaSidebar from "../../Component/sidebar/CubaSidebar";
import Preloader from "../../Component/loader/Preloader";
import { useNavigate } from "react-router-dom";
import { ApiGet } from "../../helper/axios";
import NewDatePicker from "../../Component/MainInputFolder/NewDatePicker";

// ✅ Department label mapping
const DEPT_LABEL = {
  doctorServices: "Doctor Services",
  billingServices: "Billing Services",
  housekeeping: "Housekeeping",
  maintenance: "Maintenance",
  diagnosticServices: "Diagnostic Services",
  dietitian: "Dietitian Services",
  security: "Security",
  frontDesk: "Front Desk",
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

const formatDateTime = (dateString) => {
  if (!dateString) return "-";
  const d = new Date(dateString);

  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).replace(",", " -");
};


export default function InternalComplaintsList() {
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [allowedBlocks, setAllowedBlocks] = useState([]);
  const [ready, setReady] = useState(false);
  const [dateFrom1, setDateFrom1] = useState(null);
  const [dateTo1, setDateTo1] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    from: null,
    to: null,
  });


  const navigate = useNavigate();

  const fetchedRef = useRef(false); // ✅ prevent double-fetch

  // Step 1️⃣: Resolve permissions immediately on mount
  useEffect(() => {
    const { isAdmin, allowedBlocks } = resolvePermissions();
    setIsAdmin(isAdmin);
    setAllowedBlocks(allowedBlocks);
    setReady(true);
  }, []);


  useEffect(() => {
    let list = complaints;

    // 1️⃣ DATE FILTER
    if (filters.from || filters.to) {
      list = list.filter((c) => {
        const created = new Date(c.createdAt);

        if (filters.from && created < new Date(filters.from)) return false;
        if (filters.to && created > new Date(filters.to)) return false;

        return true;
      });
    }

    // 2️⃣ SEARCH FILTER
    if (filters.search) {
      const s = filters.search.toLowerCase();

      list = list.filter((c) => {
        const departments = Object.keys(c).filter(
          (key) => typeof c[key] === "object" && c[key]?.text
        );

        const deptList = departments
          .map((key) => DEPT_LABEL[key] || key)
          .join(", ")
          .toLowerCase();

        return (
          c.employeeName?.toLowerCase().includes(s) ||
          c.contactNo?.toLowerCase().includes(s) ||
          c.employeeId?.toLowerCase().includes(s) ||
          c.floorNo?.toLowerCase().includes(s) ||
          deptList.includes(s) ||
          c.complaintId?.toLowerCase().includes(s)
        );
      });
    }

    setFilteredComplaints(list);
  }, [filters, complaints]);


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

  // 🔥 Auto-refresh Internal Complaints every 10 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await ApiGet("/admin/internal-complaints");
        let updated = res?.data || [];

        // 🔒 Apply permission filter again
        if (!isAdmin && allowedBlocks.length > 0) {
          updated = updated.filter((complaint) =>
            Object.keys(complaint).some(
              (key) =>
                allowedBlocks.includes(key) &&
                typeof complaint[key] === "object" &&
                (complaint[key]?.text || (complaint[key]?.attachments?.length > 0))
            )
          );
        }

        setComplaints(updated);
        setFilteredComplaints(updated);

      } catch (error) {
        console.error("Auto refresh failed:", error);
      }
    }, 10000); // ← 10 seconds

    return () => clearInterval(interval);
  }, [isAdmin, allowedBlocks]);


  // Step 3️⃣: Search handler
useEffect(() => {
  let list = complaints;

  // 🔥 FIXED DATE RANGE FILTER (Includes All Days Fully)
  if (filters.from || filters.to) {
    const from = filters.from ? new Date(filters.from) : null;
    const to = filters.to ? new Date(filters.to) : null;

    if (from) from.setHours(0, 0, 0, 0);                 // Start of day
    if (to) to.setHours(23, 59, 59, 999);               // End of day

    list = list.filter((c) => {
      const created = new Date(c.createdAt);

      if (from && created < from) return false;
      if (to && created > to) return false;

      return true;
    });
  }

  // 🔍 SEARCH FILTER (same as before)
  if (filters.search) {
    const s = filters.search.toLowerCase();

    list = list.filter((c) => {
      const departments = Object.keys(c).filter(
        (key) => typeof c[key] === "object" && c[key]?.text
      );

      const deptList = departments
        .map((key) => DEPT_LABEL[key] || key)
        .join(", ")
        .toLowerCase();

      return (
        c.employeeName?.toLowerCase().includes(s) ||
        c.contactNo?.toLowerCase().includes(s) ||
        c.employeeId?.toLowerCase().includes(s) ||
        c.floorNo?.toLowerCase().includes(s) ||
        deptList.includes(s) ||
        c.complaintId?.toLowerCase().includes(s)
      );
    });
  }

  setFilteredComplaints(list);
}, [filters, complaints]);


  const handleView = (row) => {
    navigate("/internal-complaint-details", { state: { complaint: row } });
  };

  const getStatusBadge = (status) => {
    const base =
      "px-3 py-[3px] rounded-full text-xs font-[500] inline-flex items-center justify-center";
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

  // DATE RANGE FILTER
  const filterByDate = (list) => {
    return list.filter((c) => {
      const created = new Date(c.createdAt);

      if (dateFrom1) {
        const from = new Date(dateFrom1);
        if (created < from) return false;
      }

      if (dateTo1) {
        const to = new Date(dateTo1);
        to.setHours(23, 59, 59, 999);
        if (created > to) return false;
      }

      return true;
    });
  };


  const exportToExcel = () => {
    const data = filteredComplaints.map((c) => {
      const activeDepts = Object.keys(c)
        .filter(
          (k) =>
            typeof c[k] === "object" &&
            (c[k]?.text || c[k]?.attachments?.length > 0)
        )
        .map((k) => DEPT_LABEL[k] || k)
        .join(", ");

      return {
        ComplaintID: c.complaintId,
        EmployeeName: c.employeeName,
        ContactNo: c.contactNo,
        EmployeeID: c.employeeId,
        FloorNo: c.floorNo,
        Departments: activeDepts,
        Status: c.status,
        CreatedAt: formatDateTime(c.createdAt),
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Internal Complaints");
    XLSX.writeFile(wb, "Internal_Complaints.xlsx");
  };


  const exportCAPA = async () => {
    try {
      const XLSX = await import("xlsx");
      const excelRows = [];

      filteredComplaints.forEach((doc) => {
        if (!doc) return;

        const deptBlocks = [
          "maintenance",
          "itDepartment",
          "bioMedicalDepartment",
          "nursing",
          "medicalAdmin",
          "frontDesk",
          "housekeeping",
          "dietitian",
          "pharmacy",
          "security",
          "hr",
          "icn",
          "mrd",
          "accounts",
        ];

        deptBlocks.forEach((block) => {
          const dep = doc[block];
          if (!dep) return;

          const hasText = dep?.text?.trim();
          const hasFiles =
            Array.isArray(dep?.attachments) && dep.attachments.length > 0;

          // Skip inactive departments
          if (!hasText && !hasFiles) return;

          const status = (dep?.status || "").toLowerCase();
          if (status !== "resolved" && status !== "resolved_by_admin") return;

          if (!dep.resolution) return;

          const res = dep.resolution;

          // ⭐ Get RCA / CA / PA properly (fallback → NA)
          const RCA =
            res.rcaNote ||
            (res.actionType === "RCA" ? res.note : null) ||
            "NA";

          const CA =
            res.caNotes ||
            (res.actionType === "CA" ? res.note : null) ||
            "NA";

          const PA =
            res.paNotes ||
            (res.actionType === "PA" ? res.note : null) ||
            "NA";

          excelRows.push({
            "Complaint ID": doc.complaintId,
            "Date & Time": formatDateTime(doc.createdAt),
            "Employee Name": doc.employeeName || "-",
            "Contact No": doc.contactNo || "-",
            "Employee ID": doc.employeeId || "-",
            "Floor No": doc.floorNo || "-",

            "Department": DEPT_LABEL[block] || block,
            "Complaint Text": dep.text || "-",

            // ⭐ Always show NA when not available
            RCA,
            CA,
            PA,

            // "Resolved At": res.resolvedAt
            //   ? new Date(res.resolvedAt).toLocaleString()
            //   : "-",
            // "Resolved By": res.resolvedBy || "-",
            // "Resolved Type": res.resolvedType || "-",
          });
        });
      });

      if (excelRows.length === 0) {
        alert("No CAPA data found for export.");
        return;
      }

      const ws = XLSX.utils.json_to_sheet(excelRows);

      ws["!cols"] = Object.keys(excelRows[0]).map((key) => ({
        wch: Math.max(15, key.length + 5),
      }));

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Internal_CAPA_Report");

      XLSX.writeFile(
        wb,
        `Internal_CAPA_Report_${new Date().toISOString().slice(0, 10)}.xlsx`
      );
    } catch (err) {
      console.error("CAPA Export Error:", err);
      alert("Failed to export CAPA report.");
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
        <Header
          pageName="Internal"
          onFilterChange={(data) => setFilters(data)}
          onExportExcel={exportToExcel}
          onExportCapa={exportCAPA}
        />
        <div className="flex w-full h-full">
          <CubaSidebar />
          <div className="flex flex-col w-full relative max-h-[90%] md34:!pb-[200px] md:!py-[10px] md34:!px-[10px] md11:!px-0 md11:!overflow-y-auto gap-[10px]">
            {loading && <Preloader />}

            <div className="bg-white w-[98%] overflow-y-auto  mx-auto rounded-lg border shadow-sm ">

              <div className="overflow-x-auto ">
                <table className="min-w-[1100px] border-separate border-spacing-0">
                  <thead>
                    <tr className="bg-gray-100 text-gray-600 text-[12px] font-semibold uppercase tracking-wider">
                      {[
                        "Comp. ID",
                        "Date & Time",
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
                          className="px-[10px] font-[500] text-[12px] border-r py-[10px] border-b border-gray-200 text-left whitespace-nowrap"
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
                          className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"
                            } hover:bg-blue-50 transition`}
                        >
                          <td className="px-2 text-[12px] border-r py-[9px] border-b border-gray-100 font-medium text-blue-600">
                            <button
                              onClick={() => handleView(row)}
                              className="hover:underline flex items-center gap-[6px]"
                            >
                              <i className="fa-regular fa-ticket text-[14px] text-blue-500"></i>
                              {row.complaintId}
                            </button>
                          </td>
                          <td className="px-2 text-[12px] border-r py-[9px] border-gray-100 w-[180px]  text-gray-800">
                            <div className="flex gap-[5px] items-center">
                              <CalendarClock className="w-4 h-4 text-gray-400" />
                              {formatDateTime(row.createdAt)}
                            </div>
                          </td>

                          <td className="px-2 text-[12px] border-r py-[9px] border-gray-100 w-[170px]  text-gray-800  gap-2">
                            <div className=" flex gap-[6px]">
                              <User className="w-4 h-4 text-gray-400" />
                              {row.employeeName}
                            </div>
                          </td>
                          <td className="px-2 text-[12px] border-r py-[9px] border-gray-100">
                            <div className=" flex gap-[7px] items-center">
                              <Phone className="w-4 h-4 text-gray-400" />
                              {row.contactNo}
                            </div>
                          </td>
                          <td className="px-2 text-[12px] border-r py-[9px] border-gray-100">
                            <div className=" flex gap-[7px] items-center">
                              <IdCard className="w-5 h-5 text-gray-400" />
                              {row.employeeId}
                            </div>
                          </td>
                          <td className="px-2 text-[12px] border-r py-[9px] border-gray-100">
                            <div className=" flex gap-[7px] items-center">
                              <Hospital className="w-4 h-4 text-gray-400" />
                              {row.floorNo}
                            </div>
                          </td>
                          <td className="px-2 text-[12px] border-r py-[9px] border-gray-100">
                            {activeDepartments || "-"}
                          </td>
                          <td className="px-2 text-[12px] border-r py-[9px] border-gray-100">
                            <span className={getStatusBadge(row.status)}>
                              {row.status}
                            </span>
                          </td>
                          <td className="px-2 text-[12px] w-[100px] border-r py-[9px] border-gray-100 text-blue-600 text-sm font-medium gap-1">
                          <div className=" flex  items-center gap-1 ju">

                         
                            <Eye className="w-4 h-4" />
                            <button
                              onClick={() => handleView(row)}
                              className="hover:underline"
                            >
                              View
                            </button>
                             </div>
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
