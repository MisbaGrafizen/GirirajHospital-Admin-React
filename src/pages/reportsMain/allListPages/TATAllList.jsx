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
  const res = await ApiGet(`/admin/ipd-concern`)
  return Array.isArray(res?.data) ? res.data : [res?.data].filter(Boolean)
}

// Helper: check if concern item has text or attachments
const hasConcernContent = (b) => {
  if (!b || typeof b !== "object") return false
  const hasText = typeof b.text === "string" && b.text.trim().length > 0
  const hasFiles = Array.isArray(b.attachments) && b.attachments.length > 0
  return hasText || hasFiles
}

// Create readable department list from allowed blocks
const getDepartmentsString = (doc, allowedBlocks) =>
  allowedBlocks
    .filter((k) => hasConcernContent(doc?.[k]))
    .map((k) => DEPT_LABEL[k] || k)
    .join(", ")

export default function TATAllList() {
  const [rows, setRows] = useState([])
  const [rawConcerns, setRawConcerns] = useState([])
  const { allowedBlocks } = resolvePermissions()
  const navigate = useNavigate()

  const handlenavigate = (complaintRow, fullDoc) => {
    navigate("/complaint-details", { state: { complaint: complaintRow, doc: fullDoc } })
  }

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const docs = await getConcerns()
        if (!alive) return

        // ✅ Only resolved complaints
        const resolvedDocs = docs.filter((d) => d.resolution?.resolvedAt)
        setRawConcerns(resolvedDocs)

        const mapped = resolvedDocs.map((d) => {
          // compute TAT
          let totalTime = null
          if (d.resolution?.resolvedAt && d.createdAt) {
            const diffMs = new Date(d.resolution.resolvedAt) - new Date(d.createdAt)
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
            const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
            totalTime = `${diffHours}h ${diffMinutes}m`
          }

          return {
            id: d._id,
            complaintId: d.complaintId,
            patient: d.patientName || "-",
            doctor: d.consultantDoctorName?.name || "-",
            bedNo: d.bedNo || "-",
            status: d.status || "Pending",
            createdAt: d.createdAt,
            stampIn: d.createdAt,
            stampOut: d.resolution?.resolvedAt || null,
            totalTimeTaken: totalTime,
            departments: getDepartmentsString(d, allowedBlocks),
          }
        })

        setRows(mapped)
      } catch (e) {
        if (!alive) return
        console.error("Failed to load concerns", e)
        setRawConcerns([])
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  return (
    <section className="flex w-full h-full select-none overflow-hidden">
      <div className="flex w-full flex-col h-[100vh]">
        <Header pageName="TAT List " />
        <div className="flex w-full h-full">
          <CubaSidebar />
          <div className="flex flex-col w-full relative max-h-[93%] py-3 px-2 overflow-y-auto gap-3 rounded-[10px]">
            <Preloader />
            <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
              <div className="px-3 py-3 border-b flex gap-[10px] items-center border-gray-200">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-md flex items-center justify-center">
                  <i className="fa-regular fa-users-medical text-[17px] text-[#fff]"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">TAT (Turnaround Time)</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">Complaint ID</th>
                      <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                      <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">Departments</th>
                      <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">Created At</th>
                      <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">Resolved At</th>
                      <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">TAT</th>
                      <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {rows.map((complaint, index) => (
                      <tr
                        key={complaint.id}
                        className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50 transition-colors`}
                      >
                        <td className="px-6 py-2 text-sm font-medium text-blue-600">{complaint.complaintId}</td>
                        <td className="px-6 py-2 text-sm text-gray-900">{complaint.patient}</td>
                        <td className="px-6 py-2 text-sm text-gray-900">
                          {complaint.departments || "-"}
                        </td>
                        <td className="px-6 py-2 text-sm text-gray-900">
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
                        <td className="px-6 py-2 text-sm text-gray-900">
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
                        <td className="px-6 py-2 text-sm text-gray-900">
                          {complaint.totalTimeTaken || "-"}
                        </td>
                        <td className="px-6 py-2 text-sm text-gray-900">
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
                        <td colSpan={8} className="px-6 py-6 text-center text-gray-500">
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
