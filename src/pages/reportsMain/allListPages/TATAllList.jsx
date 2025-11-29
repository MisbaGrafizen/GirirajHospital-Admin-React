import Header from '../../../Component/header/Header'
import CubaSidebar from '../../../Component/sidebar/CubaSidebar'
import Preloader from '../../../Component/loader/Preloader'
import React, { useState, useEffect } from "react"
import { Eye } from "lucide-react"
import { useNavigate } from 'react-router-dom'
import { ApiGet } from '../../../helper/axios'

// Map of module keys to their internal block names
const MODULE_TO_BLOCK = {
  doctor_service: "doctorServices",
  billing_service: "billingServices",
  housekeeping: "housekeeping",
  maintenance: "maintenance",
  diagnostic_service: "diagnosticServices",
  dietetics: "dietitianServices",
  nursing: "nursing",
  security: "security",
}

// Readable labels for display
const DEPT_LABEL = {
  doctorServices: "Doctor Services",
  billingServices: "Billing Services",
  housekeeping: "Housekeeping",
  maintenance: "Maintenance",
  diagnosticServices: "Diagnostic Services",
  dietitianServices: "Dietitian Services",
  security: "Security",
  nursing: "Nursing",
}

// Get logged-in user permissions
function resolvePermissions() {
  const loginType = localStorage.getItem("loginType")
  const isAdmin = loginType === "admin"

  let permsArray = []
  try {
    const parsed = JSON.parse(localStorage.getItem("rights"))
    if (parsed?.permissions && Array.isArray(parsed.permissions)) {
      permsArray = parsed.permissions
    } else if (Array.isArray(parsed)) {
      permsArray = parsed
    }
  } catch {
    permsArray = []
  }

  const allowedBlocks = isAdmin
    ? Object.values(MODULE_TO_BLOCK)
    : permsArray.map((p) => MODULE_TO_BLOCK[p.module]).filter(Boolean)

  return { isAdmin, allowedBlocks }
}

// Fetch all IPD concerns
async function getConcerns() {
  const res = await ApiGet(`/admin/complaint-details`)
  console.log('res', res)
  return Array.isArray(res) ? res : [res].filter(Boolean)
}

// Helper: check if department item has text or attachments
const hasConcernContent = (item) => {
  if (!item) return false;
  const hasText = item.text && item.text.trim() !== "";
  const hasFiles = Array.isArray(item.attachments) && item.attachments.length > 0;
  return hasText || hasFiles;
};

// Convert backend dept names → module keys
const DEPT_MAP = {
  "doctor services": "doctorServices",
  "doctor service": "doctorServices",
  "billing services": "billingServices",
  "billing service": "billingServices",
  "housekeeping": "housekeeping",
  "maintenance": "maintenance",
  "diagnostic services": "diagnosticServices",
  "diagnostic service": "diagnosticServices",
  "dietetics": "dietitianServices",
  "dietitian services": "dietitianServices",
  "dietitian service": "dietitianServices",
  "nursing": "nursing",
  "security": "security",
};

const getDepartmentsString = (doc, allowedBlocks) => {
  if (!Array.isArray(doc?.departments)) return "-";

  const allowed = doc.departments
    .map((d) => {
      const key = DEPT_MAP[d.department?.toLowerCase()?.trim()];
      if (!key) return null;

      // Check permission
      if (!allowedBlocks.includes(key)) return null;

      if (!hasConcernContent(d)) return null;

      return DEPT_LABEL[key] || d.department;
    })
    .filter(Boolean);

  return allowed.length ? allowed.join(", ") : "-";
};


export default function TATAllList() {
  const [rows, setRows] = useState([])
  const [rawConcerns, setRawConcerns] = useState([])
  const { allowedBlocks } = resolvePermissions()
  const navigate = useNavigate()

  const handlenavigate = (complaintRow, fullDoc) => {
    navigate("/complaint-details", { state: { complaint: complaintRow, doc: fullDoc } })
  }

useEffect(() => {
    let alive = true;
    (async () => {
        try {
            const docs = await getConcerns();
            if (!alive) return;

            // Only resolved complaints
            const resolvedDocs = docs.filter((d) => d.stampOut);
            console.log('resolvedDocs', resolvedDocs)

            const mapped = resolvedDocs.map((d) => {
                // Calculate TAT
                let totalTime = null;
             if (d.stampOut && d.stampIn) {
    const diffMs = new Date(d.stampOut) - new Date(d.stampIn);

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffDays > 0) {
        totalTime = `${diffDays}day ${diffHours}hrs`;
    } else {
        totalTime = `${diffHours}hrs ${diffMinutes}mins`;
    }
}

                return {
                    id: d._id,
                    complaintId: d.complaintId,
                    patient: d.patientName || "-",
                    doctor: d.consultantDoctorName?.name || "-",
                    bedNo: d.bedNo || "-",
                    status: d.status || "Pending",
                    createdAt: d.createdAt,
                    stampIn: d.stampIn,
                    stampOut: d.stampOut || null,
                    totalTimeTaken: totalTime,

                    // ✅ NEW DEPARTMENT LOGIC (based on API response)
                    departments: Array.isArray(d.departments)
                        ? d.departments
                              .map((item) => {
                                  const dep = item.department?.trim().toLowerCase();
                                  const key = DEPT_MAP[dep];
                                  if (!key) return null;

                                  // permission check
                                  if (!allowedBlocks.includes(key)) return null;

                                  // must have text/attachment
                                  if (!hasConcernContent(item)) return null;

                                  return DEPT_LABEL[key] || item.department;
                              })
                              .filter(Boolean)
                              .join(", ") || "-"
                        : "-",
                };
            });
            console.log('mapped', mapped)

            setRows(mapped);
        } catch (e) {
            if (!alive) return;
            console.error("Failed to load concerns", e);
            setRows([]);
        }
    })();

    return () => {
        alive = false;
    };
}, []);


  return (
    <section className="flex w-full h-full select-none overflow-hidden">
      <div className="flex w-full flex-col h-[100vh]">
        <Header pageName="TAT List " />
        <div className="flex w-full h-full">
          <CubaSidebar />
          <div className="flex flex-col w-full relative max-h-[93%] py-3 px-2 overflow-y-auto gap-3 ">
            <Preloader />
            <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
          

              <div className="overflow-x-auto ">
                <table className="min-w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs border-r font-medium text-gray-500 min-w-[140px] uppercase">Complaint ID</th>
                      <th className="px-3 py-2 text-left text-xs border-r font-medium text-gray-500  min-w-[100px] uppercase">Patient</th>
                      <th className="px-3 py-2 text-left text-xs border-r font-medium text-gray-500 min-w-[140px]  uppercase">Departments</th>
                      <th className="px-3 py-2 text-left text-xs border-r font-medium text-gray-500 min-w-[180px]  uppercase">Created At</th>
                      <th className="px-3 py-2 text-left text-xs border-r font-medium text-gray-500 uppercase">Resolved At</th>
                      <th className="px-3 py-2 text-left text-xs  border-r font-medium text-gray-500 uppercase">TAT</th>
                      <th className="px-3 py-2 text-left text-xs border-r font-medium text-gray-500 uppercase">Details</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {rows.map((complaint, index) => (
                      <tr
                        key={complaint.id}
                        className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50 transition-colors`}
                      >
                        <td className="px-3 py-2 border-r text-sm  font-medium text-blue-600">{complaint.complaintId}</td>
                        <td className="px-3 py-2 text-[13px] border-r  text-gray-900">{complaint.patient}</td>
                        <td className="px-3 py-2 text-[12px] border-r text-gray-900">
                          {complaint.departments || "-"}
                        </td>
                        <td className="px-4 py-2  min-w-[140px] border-r text-[13px] text-gray-900">
                          {complaint.stampIn
                            ? new Date(complaint.stampIn).toLocaleString("en-GB", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "-"}
                        </td>
                        <td className="px-4 py-2  border-r   min-w-[160px] text-[13px] text-gray-900">
                          {complaint.stampOut
                            ? new Date(complaint.stampOut).toLocaleString("en-GB", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "-"}
                        </td>
                        <td className="px-3 py-2 min-w-[100px]  border-r  text-[13px] text-gray-900">
                          {complaint.totalTimeTaken || "-"}
                        </td>
                        <td className="px-3 py-2 min-w-[100px]  text-[13px] text-gray-900">
                          <button
                            onClick={() => handlenavigate(complaint, rawConcerns.find((d) => d._id === complaint.id))}
                            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <Eye className="w-4 h-4 mr-1" /> View
                          </button>
                        </td>
                      </tr>
                    ))}
                    {rows.length === 0 && (
                      <tr>
                        <td colSpan={8} className="px-3 py-6 text-center text-gray-500">
                          No resolved complaints found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
