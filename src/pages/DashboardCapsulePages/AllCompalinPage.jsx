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

          <div className="flex flex-col w-full bg-white relative pt-[10px]  max-h-[92%] overflow-y-auto gap-1 ">
            {loading && <Preloader />}

       

            {/* 📋 Complaint Table */}
            <div className="bg-white mx-[10px] rounded-xl border shadow-sm w-[98.2%]  max-h-[88%] overflow-y-auto">
              <table className="w-full">
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
                  {filtered.map((issue, idx) => (
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
