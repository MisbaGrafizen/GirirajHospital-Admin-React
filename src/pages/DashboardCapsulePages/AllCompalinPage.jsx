import React, { useState, useEffect, useMemo } from "react";
import { Eye, Clock, Bed } from "lucide-react";
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

/* ---------------- Main Component ---------------- */
export default function AllComplaintPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [complaints, setComplaints] = useState([]);
  const [error, setError] = useState("");

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
          : allComplaints.filter((c) =>
              allowedBlocks.includes(c.departmentBlock)
            );

        // 🔹 Filter by complaint status based on dashboard selection
        const filteredByStatus = filteredByDept.filter((c) => {
          const status = c.status?.toLowerCase();
          switch (filterType) {
            case "Open":
            case "Pending":
              return status === "open";
            case "Resolved":
              return status === "resolved";
            case "Escalated":
              return status === "escalated";
            case "In Progress":
              return status === "in_progress";
            case "All":
            default:
              return true;
          }
        });

        // 🔹 Sort by latest
        const sorted = filteredByStatus.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setComplaints(sorted);
      } catch (err) {
        console.error("❌ Fetch complaints failed:", err);
        setError("Unable to load complaints.");
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, [filterType, isAdmin, allowedBlocks.join(",")]);

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
        <Header pageName={`${filterType} Complaints`} />
        <div className="flex w-full h-full">
          <CubaSidebar />

          <div className="flex flex-col w-full bg-white relative max-h-[93%] overflow-y-auto gap-4 rounded-[10px]">
            {loading && <Preloader />}

            {/* 🔍 Search Bar */}
            <div className="flex items-center justify-end px-5 py-2 border-b border-gray-200 bg-gray-50 sticky top-0 z-10">
              <div className="relative">
                <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                <input
                  type="text"
                  placeholder="Search complaints..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-3 py-2 w-[230px] border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* 📋 Complaint Table */}
            <div className="bg-white rounded-xl border shadow-sm w-[92%] mx-auto mt-2 overflow-y-auto">
              <table className="w-full">
                <thead className="bg-gray-100 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  <tr>
                    <th className="px-4 py-2 text-left border-r">Complaint ID</th>
                    <th className="px-4 py-2 text-left border-r">Date & Time</th>
                    <th className="px-4 py-2 text-left border-r">Patient</th>
                    <th className="px-4 py-2 text-left border-r">Doctor</th>
                    <th className="px-4 py-2 text-left border-r">Bed No.</th>
                    <th className="px-4 py-2 text-left border-r">Department</th>
                    <th className="px-4 py-2 text-left border-r">Status</th>
                    <th className="px-4 py-2 text-left">Details</th>
                  </tr>
                </thead>

                <tbody className="text-sm text-gray-700">
                  {filtered.map((issue, idx) => (
                    <tr
                      key={issue._id || `${issue.complaintId}-${idx}`}
                      className={`${
                        idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } hover:bg-blue-50 transition`}
                    >
                      <td className="px-4 py-2 font-semibold text-blue-700 border-r cursor-pointer hover:underline">
                        {issue.complaintId || issue.id}
                      </td>

                      <td className="px-4 py-2 border-r flex items-center gap-2 text-[13px]">
                        <Clock className="w-4 h-4 text-gray-400" />
                        {new Date(issue.createdAt).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>

                      <td className="px-4 py-2 border-r font-medium capitalize">
                        {issue.patientName || "-"}
                      </td>

                      <td className="px-4 py-2 border-r">
                        {issue.consultantDoctorName?.name || "-"}
                      </td>

                      <td className="px-4 py-2 border-r flex items-center gap-2">
                        <Bed className="w-4 h-4 text-gray-400" />
                        {issue.bedNo || "-"}
                      </td>

                      <td className="px-4 py-2 border-r">
                        {getAllowedAndActiveDepartments(
                          issue,
                          isAdmin
                            ? Object.values(MODULE_TO_BLOCK)
                            : allowedBlocks
                        )}
                      </td>

                      <td className="px-4 py-2 border-r">
                        <span
                          className={`px-3 py-[3px] rounded-full text-xs font-semibold ${
                            issue.status === "resolved"
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
                        className="px-4 py-2 text-blue-600 font-medium cursor-pointer flex items-center gap-1 hover:underline"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </td>
                    </tr>
                  ))}

                  {!loading && filtered.length === 0 && (
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
