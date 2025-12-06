import React, { useCallback, useEffect, useState } from 'react'
import Header from '../../../Component/header/Header'
import CubaSidebar from '../../../Component/sidebar/CubaSidebar'
import Preloader from '../../../Component/loader/Preloader'
import {
  Calendar,
  Search,
  Download,
  User,
  Phone,
  Bed,
  Clock,
  Star
} from "lucide-react"

import { ApiGet } from '../../../helper/axios'
import { useNavigate } from 'react-router-dom'
import NewDatePicker from '../../../Component/MainInputFolder/NewDatePicker'

const API_URL = "/admin/opd-patient"

function round1(n) {
  return Math.round((Number(n) || 0) * 10) / 10
}

const OPD_RATING_KEYS = [
  "appointment",
  "receptionStaff",
  "radiologyDiagnosticServices",
  "pathologyDiagnosticServices",
  "doctorServices",
  "security"
]

function calcRowAverage(ratings = {}) {
  const vals = []
  for (const key of OPD_RATING_KEYS) {
    const v = ratings?.[key]
    if (typeof v === "number" && v >= 1 && v <= 5) vals.push(v)
  }
  if (!vals.length) return 0
  return round1(vals.reduce((a, b) => a + b, 0) / vals.length)
}

function formatDate(dateStr) {
  const d = new Date(dateStr)
  const day = String(d.getDate()).padStart(2, "0")
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

const normId = (v) =>
  typeof v === 'object' && v !== null
    ? (v.$oid ?? v._id ?? v.toString?.() ?? '')
    : (v ?? '');

const normDate = (v) =>
  typeof v === 'object' && v !== null && '$date' in v ? v.$date : v;

export default function OpdAllList() {

  const [searchTerm, setSearchTerm] = useState("")
  const [rows, setRows] = useState([])
  const [dateFrom1, setDateFrom1] = useState(null)
  const [dateTo1, setDateTo1] = useState(null)
  const [loading, setLoading] = useState(false)
  const [rawOPD, setRawOPD] = useState([])
  const navigate = useNavigate()

  const getRatingStars = (rating = 0) => {
    const filled = Math.floor(rating)
    const fractional = rating - filled

    return (
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, i) => {
          if (i < filled) {
            return <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
          } else if (i === filled && fractional > 0) {
            const percent = Math.round(fractional * 100)
            return (
              <div key={i} className="relative w-4 h-4">
                <Star className="absolute w-4 h-4 text-gray-300" />
                <Star
                  className="absolute w-4 h-4 text-yellow-400"
                  style={{ clipPath: `inset(0 ${100 - percent}% 0 0)` }}
                />
              </div>
            )
          } else {
            return <Star key={i} className="w-4 h-4 text-gray-300" />
          }
        })}
        <span className="ml-1 text-sm font-medium text-gray-700">{rating.toFixed(1)}/5</span>
      </div>
    )
  }

  /* -------------------- Date Range Helper -------------------- */
  const isWithinDateRange = (createdAt) => {
    if (!dateFrom1 && !dateTo1) return true;

    const entryDate = new Date(createdAt);

    if (dateFrom1) {
      const from = new Date(dateFrom1);
      if (entryDate < from) return false;
    }

    if (dateTo1) {
      const to = new Date(dateTo1);
      to.setHours(23, 59, 59, 999);
      if (entryDate > to) return false;
    }

    return true;
  };

  /* -------------------- Fetch Data -------------------- */
  const fetchOPD = useCallback(async () => {
    setLoading(true)
    try {
      const res = await ApiGet(API_URL)
      const data = Array.isArray(res) ? res : (res.data || [])
      setRawOPD(data)

      const list = data.map((d) => {
        const id = normId(d._id ?? d.id)
        const rating = calcRowAverage(d.ratings || {})
        return {
          id,
          _id: id,
          createdAt: normDate(d.createdAt ?? d.date),
          patient: d.patientName || d.name || "-",
          contact: d.contact || "-",
          doctor: d.consultantDoctorName?.name || d.doctorName || d.consultant || "-",
          rating,
          comment: d.comments || d.comment || "",
          overallRecommendation: d.overallRecommendation,
        }
      })

      setRows(list)
    } catch (error) {
      console.error("Fetch OPD failed:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchOPD() }, [fetchOPD])

  /* -------------------- Filters -------------------- */
  const filteredFeedback = rows.filter((f) => {
    const matchText =
      f.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.comment.toLowerCase().includes(searchTerm.toLowerCase());

    const matchDate = isWithinDateRange(f.createdAt);

    return matchText && matchDate;
  })

  /* -------------------- Export Excel -------------------- */
  const exportToExcel = async () => {
    const XLSX = await import("xlsx")

    const rowsToExport = filteredFeedback.map((f) => ({
      "Date": formatDate(f.createdAt),
      "Patient Name": f.patient,
      "Contact": f.contact,
      "Doctor": f.doctor,
      "Rating (/5)": f.rating,
      "Comment": f.comment || "",
    }))

    const ws = XLSX.utils.json_to_sheet(rowsToExport)

    ws["!cols"] = Object.keys(rowsToExport[0] || {}).map((key) => ({
      wch: Math.max(15, key.length + 5)
    }))

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Filtered OPD Feedback")

    XLSX.writeFile(
      wb,
      `OPD_Feedback_${new Date().toISOString().slice(0, 10)}.xlsx`
    )
  }

  /* -------------------- Navigate -------------------- */
  const openFeedbackDetails = useCallback((fb) => {
    const id = normId(fb?._id ?? fb?.id)
    if (!id) return alert("No ID found")
    sessionStorage.setItem(
      "opdFeedback:last",
      JSON.stringify({ id, preview: fb })
    )
    navigate("/opd-feedback-details", { state: { id, feedback: fb } })
  }, [navigate])

  return (
    <>
      <section className="flex w-[100%] h-[100%] overflow-hidden">
        <div className="flex flex-col w-full h-[100vh]">
          <Header pageName="Opd Feedback List" />
          <div className="flex w-full h-full">
            <CubaSidebar />

            <div className="flex flex-col w-full px-3 max-h-[93%] overflow-y-auto py-3">
              <Preloader />

              {/* Top Bar */}
              <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                <div className="px-3 py-2 border-b flex justify-between items-center">

                  {/* Date Range */}
                  <div className="flex gap-4">
                    <NewDatePicker
                      label="From Date"
                      selectedDate={dateFrom1}
                      setSelectedDate={setDateFrom1}
                    />
                    <NewDatePicker
                      label="To Date"
                      selectedDate={dateTo1}
                      setSelectedDate={setDateTo1}
                    />
                  </div>

                  {/* Search + Export */}
                  <div className="flex gap-3 items-center">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search feedback..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-3 py-[5px] border rounded-md"
                      />
                    </div>
{/* 
                    <button
                      onClick={exportToExcel}
                      className="flex items-center px-2 py-[6px] w-[140px] bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export to Excel
                    </button> */}
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-[1200px]">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase border-r">Date</th>
                        <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase border-r">Patient Name</th>
                        <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase border-r">Contact</th>
                        <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase border-r">Doctor</th>
                        <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase border-r">Rating</th>
                        <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">Comment</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredFeedback.map((fb, i) => (
                        <tr
                          key={fb.id}
                          className={`${i % 2 === 0 ? "bg-white" : "bg-gray-50"} cursor-pointer hover:bg-blue-50`}
                          onClick={() => openFeedbackDetails(fb)}
                        >
                          <td className="px-4 py-2 border-r text-sm">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                              {formatDate(fb.createdAt)}
                            </div>
                          </td>

                          <td className="px-6 py-2 border-r">{fb.patient}</td>
                          <td className="px-6 py-2 border-r">{fb.contact}</td>
                          <td className="px-6 py-2 border-r">{fb.doctor}</td>

                          <td className="px-6 py-2 border-r">
                            {getRatingStars(fb.rating)}
                          </td>

                          <td className="px-6 py-2">{fb.comment}</td>
                        </tr>
                      ))}

                      {filteredFeedback.length === 0 && (
                        <tr>
                          <td colSpan={6} className="text-center text-gray-500 py-4">
                            No records found for selected date range.
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
    </>
  )
}
