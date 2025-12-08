import React, { useState, useEffect, useMemo } from "react";
import { Eye, Clock, Bed, CalendarClock, User, Stethoscope } from "lucide-react";
import Header from "../../Component/header/Header";
import CubaSidebar from "../../Component/sidebar/CubaSidebar";
import Preloader from "../../Component/loader/Preloader";
import { useLocation, useNavigate } from "react-router-dom";
import { ApiGet } from "../../helper/axios";

/* ---------------- Permission Logic ---------------- */
const MODULE_TO_BLOCK = {
  doctor_service: "doctorServices",
  billing_service: "billingServices",
  housekeeping: "housekeeping",
  maintenance: "maintenance",
  diagnostic_service: "diagnosticServices",
  dietitian: "dietitianServices",
  nursing: "nursing",
  security: "security",
};

function resolvePermissions() {
  const loginType = localStorage.getItem("loginType");
  const isAdmin = loginType === "admin";

  let permsArray = [];
  try {
    const parsed = JSON.parse(localStorage.getItem("rights"));
    if (parsed?.permissions && Array.isArray(parsed.permissions)) {
      permsArray = parsed.permissions;
    } else if (Array.isArray(parsed)) {
      permsArray = parsed;
    }
  } catch {
    permsArray = [];
  }

  return {
    isAdmin,
    permsArray,
  };
}

/* ---------------- Helper to get allowed & active departments ---------------- */
function getAllowedAndActiveDepartments(issue = {}, allowedBlocks = []) {
  if (!issue || typeof issue !== "object") return "-";
  if (!allowedBlocks || allowedBlocks.length === 0) return "-";

  const SERVICE_LABELS = {
    doctorServices: "Doctor Service",
    billingServices: "Billing Service",
    housekeeping: "Housekeeping",
    maintenance: "Maintenance",
    diagnosticServices: "Diagnostic Service",
    dietitianServices: "Dietitian Service",
    nursing: "Nursing",
    security: "Security",
  };

  const normalizedAllowed = allowedBlocks.map((b) => b.toLowerCase());

  const activeAllowed = normalizedAllowed.filter((key) => {
    const block = issue[key];
    if (!block || typeof block !== "object") return false;

    const hasText =
      typeof block.text === "string" && block.text.trim().length > 0;
    const hasAttachments =
      Array.isArray(block.attachments) && block.attachments.length > 0;

    return hasText || hasAttachments;
  });

  const readable = activeAllowed
    .map((key) => SERVICE_LABELS[key] || key)
    .filter(Boolean);

  return readable.length > 0 ? readable.join(", ") : "-";
}

function getDepartmentsString(doc, allowedBlocks) {
  if (!doc) return "-";

  const SERVICE_LABELS = {
    doctorServices: "Doctor Service",
    billingServices: "Billing Service",
    housekeeping: "Housekeeping",
    maintenance: "Maintenance",
    diagnosticServices: "Diagnostic Service",
    dietitianServices: "Dietitian Service",
    nursing: "Nursing",
    security: "Security",
  };

  return allowedBlocks
    .filter((key) => {
      const d = doc[key];
      return d && (d.text?.trim() || (d.attachments?.length > 0));
    })
    .map((key) => SERVICE_LABELS[key] || key)
    .join(", ") || "-";
}


/* ---------------- Main Component ---------------- */
export default function AllComplaintPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [complaints, setComplaints] = useState([]);
  const [error, setError] = useState("");
  const [rawConcerns, setRawConcerns] = useState([]);
const [filteredComplaints, setFilteredComplaints] = useState([]);
const [filters, setFilters] = useState({
  search: "",
  from: null,
  to: null,
  status: "All Status",
});

/* 🔹 Update filters when Header → ComplainListFilter sends data */
const onFilterChange = (f) => {
  setFilters((prev) => ({
    ...prev,
    ...f
  }));
};

console.log('filters', filters)

  const filterType = location.state?.filter || "All";
  const { isAdmin, permsArray } = resolvePermissions();

  const allowedBlocks = useMemo(() => {
    if (isAdmin) return Object.values(MODULE_TO_BLOCK);
    return permsArray.map((p) => MODULE_TO_BLOCK[p.module]).filter(Boolean);
  }, [isAdmin, permsArray]);

  /* ---------------- Fetch Complaints ---------------- */
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setLoading(true);
        const res = await ApiGet("/admin/ipd-concern");
        const allComplaints = res?.data || [];

        // 🔹 Filter by department (permissions)
        const filteredByDept = isAdmin
          ? allComplaints
          : allComplaints.filter((c) => {
            return allowedBlocks.some((block) => {
              const b = c[block];
              if (!b) return false;

              return (
                (b.text && b.text.trim() !== "") ||
                (Array.isArray(b.attachments) && b.attachments.length > 0)
              );
            });
          });


        // 🔹 Filter by complaint status based on dashboard selection
        const filteredByStatus = filteredByDept.filter((c) => {
          const status = String(c.status || "").toLowerCase();

          if (filterType === "All") return true;

          if (filterType === "Open") return status === "open";
          if (filterType === "Pending") return status === "open";
          if (filterType === "Resolved") return status === "resolved";
          if (filterType === "Escalated") return status === "escalated";
          if (filterType === "In Progress") return status === "in_progress";

          return true;
        });


        // 🔹 Sort by latest
        const sorted = filteredByStatus.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setRawConcerns(allComplaints);
setComplaints(sorted);
setFilteredComplaints(sorted);

      } catch (err) {
        console.error("Fetch complaints failed:", err);
        setError("Unable to load complaints.");
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, [filterType, isAdmin, allowedBlocks.join(",")]);

useEffect(() => {
  const term = (filters.search || "").toLowerCase();

  const from = filters.from ? new Date(filters.from) : null;
  const to = filters.to ? new Date(filters.to) : null;
  if (to) to.setHours(23, 59, 59, 999);

  
  const result = complaints.filter((c) => {
    const created = new Date(c.createdAt);

    // DATE FILTER
    if (from && created < from) return false;
    if (to && created > to) return false;

    // SEARCH FILTER
    return (
      c.patient?.toLowerCase().includes(term) ||
      c.complaintId?.toLowerCase().includes(term) ||
      c.doctor?.toLowerCase().includes(term)
    );
  });

  setFilteredComplaints(result);
}, [filters, complaints]);



const exportToExcel = async () => {
  const XLSX = await import("xlsx");

  if (!filteredComplaints.length) {
    alert("No complaints found for selected filters.");
    return;
  }

  const excelRows = filteredComplaints.map((c) => {
    const fullDoc = rawConcerns.find((d) => d._id === c._id);

    return {
      "Complaint ID": c.complaintId,
      "Date & Time": new Date(c.createdAt).toLocaleString(),
      "Patient Name": c.patientName,
      "Doctor Name": c.consultantDoctorName?.name || "-",
      "Bed No": c.bedNo || "-",
      Departments: getDepartmentsString(fullDoc, allowedBlocks),
      Status: c.status,
    };
  });

  const ws = XLSX.utils.json_to_sheet(excelRows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Complaints");

  XLSX.writeFile(wb, "IPD_Complaints.xlsx");
};

/* ------------------ EXPORT CAPA TO EXCEL (FINAL LOGIC) ------------------ */
const exportCAPA = async () => {
  const XLSX = await import("xlsx");
  const excelRows = [];

  filteredComplaints.forEach((c) => {
    const doc = rawConcerns.find((d) => d._id === c._id);
    if (!doc) return;

    const deptBlocks = [
      "doctorServices",
      "billingServices",
      "housekeeping",
      "maintenance",
      "diagnosticServices",
      "dietitianServices",
      "security",
      "nursing",
    ];

    deptBlocks.forEach((block) => {
      const dep = doc[block];
      if (!dep) return;

      const hasContent =
        dep.text?.trim() ||
        (Array.isArray(dep.attachments) && dep.attachments.length > 0);

      if (!hasContent) return;

      const status = dep.status?.toLowerCase();
      if (status !== "resolved" && status !== "resolved_by_admin") return;

      const r = dep.resolution || {};

      excelRows.push({
        "Complaint ID": c.complaintId,
        "Date & Time": new Date(c.createdAt).toLocaleString(),
        "Patient Name": c.patientName,
        "Doctor Name": c.consultantDoctorName?.name || "-",
        "Bed No": c.bedNo || "-",
        Department: block,
        "Complaint Text": dep.text || "-",
        RCA: r.rcaNote || "NA",
        CA: r.caNote || "NA",
        PA: r.paNote || "NA",
      });
    });
  });

  if (!excelRows.length) {
    alert("No CAPA data found.");
    return;
  }

  const ws = XLSX.utils.json_to_sheet(excelRows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "CAPA_Report");

  XLSX.writeFile(wb, "IPD_CAPA_Report.xlsx");
};



  /* ---------------- Search Filter ---------------- */
  const filtered = useMemo(() => {
    return complaints.filter(
      (item) =>
        item.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.complaintId?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [complaints, searchTerm]);

  /* ---------------- UI ---------------- */
  return (
    <section className="flex w-full h-full select-none overflow-hidden">
      <div className="flex w-full flex-col h-screen">
        <Header pageName={`${filterType} Complaints`}   
           onFilterChange={(data) => {
        setFilters((prev) => ({ ...prev, ...data }));
    }}
  onExportExcel={exportToExcel}
  onExportCapa={exportCAPA}/>
        <div className="flex w-full h-full">
          <CubaSidebar />

          <div className="flex flex-col w-full bg-white relative pt-[10px] md34:!pb-[100px]  max-h-[100%] pr-[10px] md11:!overflow-y-auto gap-1 ">
            {loading && <Preloader />}

       

            {/* 📋 Complaint Table */}
            <div className="bg-white mx-[10px] rounded-xl border shadow-sm w-[98.2%] max-h-[88%] overflow-y-auto">
              <table className="w-full  min-w-[1200px] ">
                <thead className="bg-gray-100 !text-xs !font-[500] text-gray-600 uppercase tracking-wide">
                  <tr>
                    <th className="px-3 py-[12px] text-left text-[12px] font-[500] border-r w-[100px]">Comp. ID</th>
                    <th className="px-3 py-[12px] text-left text-[12px] font-[500] border-r w-[210px]">Date & Time</th>
                    <th className="px-3 py-[12px] text-left text-[12px] font-[500] border-r w-[230px] ">Patient</th>
                    <th className="px-3 py-[12px] text-left text-[12px] font-[500] border-r w-[220px]">Doctor</th>
                    <th className="px-3 py-[12px] text-left text-[12px] font-[500] border-r w-[90px]">Bed No.</th>
                    <th className="px-3 py-[12px] text-left text-[12px] font-[500] border-r">Department</th>
                    <th className="px-3 py-[12px] text-left text-[12px] font-[500] border-r">Status</th>
                    <th className="px-3 py-[12px] text-left text-[12px] font-[500]">Details</th>
                  </tr>
                </thead>

                <tbody className="text-sm text-gray-700">
                  {filteredComplaints.map((issue, idx) => (
                    <tr
                      key={issue._id || `${issue.complaintId}-${idx}`}
                      className={`${idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                        } hover:bg-blue-50 transition text`}
                    >
                      <td className="px-3 py-[12px] font-[500] text-blue-700 border-r cursor-pointer hover:underline">

                        <div className=" flex gap-[5px] items-center">
                          <i className="fa-regular fa-ticket text-[14px] text-blue-500"></i>
                          {issue.complaintId || issue.id}

                        </div>

                      </td>

                      <td className="px-3 py-[12px] border-r  text-[13px]">
                        <div className=" flex items-center gap-2">


                          <CalendarClock className="w-4 h-4 text-gray-400" />
                          {new Date(issue.createdAt).toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>

                      <td className="px-2 py-[12px] border-r font-[400] capitalize">
                        <div className=" flex items-center gap-2">
                          <User className="w-4 h-4 flex-shrink-0 text-gray-400" />


                          {issue.patientName || "-"}
                        </div>
                      </td>

                      <td className="px-3 py-[12px] border-r">

                        <div className=" flex items-center gap-2">
                          <Stethoscope className="w-4 h-4 flex-shrink-0 text-gray-400" />

                          {issue.consultantDoctorName?.name || "-"}
                        </div>
                      </td>

                      <td className="px-3 py-[12px] border-r text-[13px]  gap-2">
                        <div className=" flex items-center gap-[10px]">


                          <Bed className="w-4 h-4 text-gray-400" />
                          {issue.bedNo || "-"}
                        </div>
                      </td>

                      <td className="px-3 py-[12px] border-r">
                        {getAllowedAndActiveDepartments(
                          issue,
                          isAdmin
                            ? Object.values(MODULE_TO_BLOCK)
                            : allowedBlocks
                        )}
                      </td>

                      <td className="px-3 py-[12px] border-r">
                        <span
                          className={`px-2 py-[3px] rounded-full  text-[10px]  font-[500] ${issue.status === "resolved"
                            ? "bg-green-100 text-green-700"
                            : issue.status === "open"
                              ? "bg-yellow-100 text-yellow-700"
                              : issue.status === "escalated"
                                ? "bg-red-100 text-red-700"
                                : issue.status === "in_progress"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-gray-100 text-gray-700"
                            }`}
                        >
                          {issue.status?.toUpperCase() || "-"}
                        </span>
                      </td>

                      <td
                        onClick={() =>
                          navigate("/complaint-details", {
                            state: { complaint: issue },
                          })
                        }
                        className="px-3 py-[12px] text-blue-600 font-medium cursor-pointer  items-center gap-1 hover:underline"
                      >
                        <div  className=" flex  gap-1 items-center">
                          <Eye className="w-4 h-4" />
                          View

                        </div>
                      </td>
                    </tr>
                  ))}

                  {!loading && filteredComplaints.length === 0 && (
                    <tr>
                      <td
                        colSpan="8"
                        className="text-center py-4 text-gray-500"
                      >
                        No complaints found for {filterType}.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center my-3">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
