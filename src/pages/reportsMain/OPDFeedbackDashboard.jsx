import React, { useCallback, useEffect, useState } from 'react'
import Header from '../../Component/header/Header'
import SideBar from '../../Component/sidebar/CubaSideBar'
import { FileText, Download, Search, Star, ThumbsUp, Award, Phone, User, Clock } from "lucide-react"
import { ApiGet } from '../../helper/axios'
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart as RLineChart,
  Line,
  CartesianGrid,
} from "recharts"

// ------------------------------------------------------------------
// Config / Helpers
// ------------------------------------------------------------------
const API_URL = "/admin/opd-patient"

function formatDate(dateStr) {
  const d = new Date(dateStr)
  const day = String(d.getDate()).padStart(2, "0")
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}
function round1(n) {
  return Math.round((Number(n) || 0) * 10) / 10
}

const OPD_RATING_KEYS = ["appointment", "receptionStaff", "diagnosticServices", "doctorServices", "security"]

function calcRowAverage(ratings = {}) {
  const vals = []
  for (const key of OPD_RATING_KEYS) {
    const v = ratings?.[key]
    if (typeof v === "number" && v >= 1 && v <= 5) vals.push(v)
  }
  if (!vals.length) return 0
  return round1(vals.reduce((a, b) => a + b, 0) / vals.length)
}

function calcNpsPercent(items) {
  const values = items
    .map((it) => it.overallRecommendation)
    .filter((v) => typeof v === "number")
  if (!values.length) return 0
  const promoters = values.filter((v) => v >= 9).length
  const detractors = values.filter((v) => v <= 6).length
  const n = values.length
  return Math.round(((promoters - detractors) / n) * 100)
}

// ------------------------------------------------------------------
// Permissions (mirrors your IPD logic)
// Looks for "opd_feedback" module; also tries "opd"/"feedback"/"reports".
// ------------------------------------------------------------------
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

  const findPerm = (mod) =>
    Array.isArray(permsArray) && permsArray.find((p) => p?.module === mod)

  const modulePerm =
    findPerm("opd_feedback") ||
    findPerm("opd") ||
    findPerm("feedback") ||
    findPerm("reports") ||
    null

  const has = (perm) => isAdmin || modulePerm?.permissions?.includes(perm)

  return {
    isAdmin,
    canViewFeedback: has("View"),
    canExportFeedback: has("Download") || has("Export"),
  }
}

// ------------------------------------------------------------------
// Component
// ------------------------------------------------------------------
export default function OPDFeedbackDashboard() {
  const [dateFrom, setDateFrom] = useState("2024-01-01")
  const [dateTo, setDateTo] = useState("2024-01-31")
  const [selectedService, setSelectedService] = useState("All Services")
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [rows, setRows] = useState([])
  const [lineData, setLineData] = useState([]);
  const [trendBucket, setTrendBucket] = useState("day")
  const [serviceSummary, setServiceSummary] = useState([]);
  const [opdServiceChart, setOpdServiceChart] = useState([]);
  const [metric, setMetric] = useState("avg")
  const [rawOPD, setRawOPD] = useState([])
  const [kpiData, setKpiData] = useState({
    totalFeedback: 0,
    averageRating: 0,
    npsRating: 0,
    overallScore: "-",
  })
  const [chartData, setChartData] = useState([
    { label: "Excellent", count: 0, percentage: 0, color: "#10B981" },
    { label: "Good", count: 0, percentage: 0, color: "#3B82F6" },
    { label: "Average", count: 0, percentage: 0, color: "#06B6D4" },
    { label: "Poor", count: 0, percentage: 0, color: "#EAB308" },
    { label: "Very Poor", count: 0, percentage: 0, color: "#F97316" },
  ])

  const defaultColors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899']

  const { canViewFeedback, canExportFeedback } = resolvePermissions()

  const SERVICE_GROUPS = {
    "Appointment": ["appointment"],
    "Reception Staff": ["receptionStaff"],
    "Diagnostic Services": ["diagnosticServices"],
    "Doctor Service": ["doctorServices"],
    "Security": ["security"],
  }

  const OPD_SERVICE_LABELS = {
    appointment: "Appointment",
    receptionStaff: "Reception Staff",
    diagnosticServices: "Diagnostic Services",
    doctorServices: "Doctor Services",
    security: "Security",
  };

  // -------- Service summary builders --------
  function buildServiceSummary(rawItems = []) {
    const rows = []
    for (const [service, keys] of Object.entries(SERVICE_GROUPS)) {
      const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      let total = 0
      for (const item of rawItems) {
        const r = item?.ratings || {}
        for (const k of keys) {
          const v = Number(r[k])
          if (v >= 1 && v <= 5) {
            counts[Math.round(v)] += 1
            total += 1
          }
        }
      }
      const denom = total || 1
      rows.push({
        service,
        excellent: Math.round((counts[5] / denom) * 100),
        good: Math.round((counts[4] / denom) * 100),
        average: Math.round((counts[3] / denom) * 100),
        poor: Math.round((counts[2] / denom) * 100),
        veryPoor: Math.round((counts[1] / denom) * 100),
      })
    }
    return rows
  }

  function buildOPDServiceChart(rawItems = []) {
    const keys = Object.keys(OPD_SERVICE_LABELS)
    const agg = {}
    keys.forEach((k) => {
      agg[k] = { count: 0, sum: 0, c1: 0, c2: 0, c3: 0, c4: 0, c5: 0 }
    })
    for (const it of rawItems) {
      const r = it?.ratings || {}
      keys.forEach((k) => {
        const v = Number(r[k])
        if (v >= 1 && v <= 5) {
          agg[k].count += 1
          agg[k].sum += v
          agg[k][`c${v}`] += 1
        }
      })
    }
    const rows = []
    keys.forEach((k) => {
      const a = agg[k]
      if (a.count === 0) return
      rows.push({
        service: OPD_SERVICE_LABELS[k],
        excellent: Math.round((a.c5 / a.count) * 100),
        good: Math.round((a.c4 / a.count) * 100),
        average: Math.round((a.c3 / a.count) * 100),
        poor: Math.round((a.c2 / a.count) * 100),
        veryPoor: Math.round((a.c1 / a.count) * 100),
        avg: round1(a.sum / a.count),
      })
    })
    return rows
  }

  function buildServiceDistribution(rawItems = [], serviceLabel = "All Services") {
    const groups = SERVICE_GROUPS
    const selectedKeys =
      serviceLabel === "All Services"
        ? Object.values(groups).flat()
        : (groups[serviceLabel] || [])

    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    let total = 0

    for (const item of rawItems) {
      const r = item?.ratings || {}
      for (const k of selectedKeys) {
        const v = Number(r[k])
        if (v >= 1 && v <= 5) {
          counts[v] += 1
          total += 1
        }
      }
    }

    const denom = total || 1
    return [
      { label: "Excellent", count: counts[5], percentage: Math.round((counts[5] / denom) * 100), color: "#10B981" },
      { label: "Good", count: counts[4], percentage: Math.round((counts[4] / denom) * 100), color: "#3B82F6" },
      { label: "Average", count: counts[3], percentage: Math.round((counts[3] / denom) * 100), color: "#06B6D4" },
      { label: "Poor", count: counts[2], percentage: Math.round((counts[2] / denom) * 100), color: "#EAB308" },
      { label: "Very Poor", count: counts[1], percentage: Math.round((counts[1] / denom) * 100), color: "#F97316" },
    ]
  }

  // -------- Trend helpers --------
  function pad2(n) { return String(n).padStart(2, "0") }
  function weekOfYear(d) {
    const a = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
    const dayNum = a.getUTCDay() || 7
    a.setUTCDate(a.getUTCDate() + 4 - dayNum)
    const yearStart = new Date(Date.UTC(a.getUTCFullYear(), 0, 1))
    return Math.ceil((((a - yearStart) / 86400000) + 1) / 7)
  }
  function pickBucket(fromDate, toDate) {
    const ms = Math.max(1, toDate - fromDate)
    const days = Math.ceil(ms / 86400000)
    if (days <= 31) return "day"
    if (days <= 180) return "week"
    return "month"
  }
  function bucketKeyAndLabel(d, bucket) {
    const y = d.getFullYear()
    const m = d.getMonth() + 1
    const day = d.getDate()
    if (bucket === "day") {
      return { key: `${y}-${pad2(m)}-${pad2(day)}`, label: d.toLocaleDateString("en-US", { month: "short", day: "2-digit" }) }
    }
    if (bucket === "week") {
      const w = weekOfYear(d)
      return { key: `${y}-W${pad2(w)}`, label: `W${pad2(w)} ${y}` }
    }
    return { key: `${y}-${pad2(m)}`, label: d.toLocaleDateString("en-US", { month: "short", year: "numeric" }) }
  }
  function getRangeFromRows(list) {
    let min = Infinity, max = -Infinity
    for (const r of list) {
      const t = +new Date(r.createdAt)
      if (!isNaN(t)) { if (t < min) min = t; if (t > max) max = t }
    }
    if (!isFinite(min) || !isFinite(max)) {
      const now = Date.now()
      return { from: new Date(now), to: new Date(now) }
    }
    return { from: new Date(min), to: new Date(max) }
  }
  function buildAutoTrendBoth(list, dateFrom, dateTo) {
    let from = dateFrom ? new Date(dateFrom) : null
    let to = dateTo ? new Date(dateTo) : null
    if (!from || !to || isNaN(from) || isNaN(to)) {
      const r = getRangeFromRows(list); from = r.from; to = r.to
    }
    const bucket = pickBucket(from, to)
    const map = new Map()
    for (const row of list) {
      const d = new Date(row.createdAt)
      if (isNaN(d)) continue
      const { key, label } = bucketKeyAndLabel(d, bucket)
      if (!map.has(key)) map.set(key, { sum: 0, count: 0, label })
      const b = map.get(key)
      b.sum += (row.rating || 0)
      b.count += 1
    }
    let trendAvg = Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]))
      .map(([, v]) => ({ date: v.label, value: v.count ? round1(v.sum / v.count) : 0 }))
    let trendCount = Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]))
      .map(([, v]) => ({ date: v.label, value: v.count }))
    const MAX_POINTS = 40
    if (trendAvg.length > MAX_POINTS) {
      const step = Math.ceil(trendAvg.length / MAX_POINTS)
      trendAvg = trendAvg.filter((_, i) => i % step === 0)
      trendCount = trendCount.filter((_, i) => i % step === 0)
    }
    return { trendAvg, trendCount, bucket }
  }

  // -------- UI helpers --------
  const getRatingStars = (rating) => {
    const filled = Math.round(rating)
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < filled ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
    ))
  }

  const buildDistribution = (list) => {
    const buckets = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    list.forEach((r) => {
      const rounded = Math.max(1, Math.min(5, Math.round(r.rating || 0)))
      if (buckets[rounded] != null) buckets[rounded] += 1
    })
    const total = list.length || 1
    return [
      { label: "Excellent", count: buckets[5], percentage: Math.round((buckets[5] / total) * 100), color: "#10B981" },
      { label: "Good", count: buckets[4], percentage: Math.round((buckets[4] / total) * 100), color: "#3B82F6" },
      { label: "Average", count: buckets[3], percentage: Math.round((buckets[3] / total) * 100), color: "#06B6D4" },
      { label: "Poor", count: buckets[2], percentage: Math.round((buckets[2] / total) * 100), color: "#EAB308" },
      { label: "Very Poor", count: buckets[1], percentage: Math.round((buckets[1] / total) * 100), color: "#F97316" },
    ]
  }

  // -------- Data Fetch (permission-gated) --------
  const fetchOPD = useCallback(async () => {
    if (!canViewFeedback) return
    setLoading(true)
    setError(null)
    try {
      const res = await ApiGet(`${API_URL}`)
      const data = Array.isArray(res) ? res : (res.data || [])
      setRawOPD(data)

      const list = data.map((d) => {
        const rating = calcRowAverage(d.ratings)
        return {
          id: d._id || d.id,
          createdAt: d.createdAt || d.date,
          patient: d.patientName || d.name || "-",
          contact: d.contact || "-",
          doctor: d.consultantDoctorName || d.doctorName || d.consultant || "-",
          rating,
          comment: d.comments || d.comment || "",
          overallRecommendation: d.overallRecommendation,
        }
      })

      const avg = list.length ? round1(list.reduce((s, r) => s + (r.rating || 0), 0) / list.length) : 0
      const nps = calcNpsPercent(data)
      const overallScore =
        avg >= 4.5 ? "Excellent" :
        avg >= 4.0 ? "Good" :
        avg >= 3.0 ? "Average" :
        avg >= 2.0 ? "Poor" : "Very Poor"

      setRows(list)
      setKpiData({ totalFeedback: list.length, averageRating: avg, npsRating: nps, overallScore })
      setServiceSummary(buildServiceSummary(data))
      setOpdServiceChart(buildOPDServiceChart(data))
    } catch (e) {
      console.error("Fetch OPD failed:", e)
      setError("Failed to load OPD feedback")
      setRows([])
      setKpiData({ totalFeedback: 0, averageRating: 0, npsRating: 0, overallScore: "-" })
      setChartData(buildDistribution([]))
    } finally {
      setLoading(false)
    }
  }, [canViewFeedback, dateFrom, dateTo])

  useEffect(() => { fetchOPD() }, [fetchOPD])

  useEffect(() => {
    setChartData(buildServiceDistribution(rawOPD, selectedService))
  }, [rawOPD, selectedService])

  useEffect(() => {
    const { trendAvg, trendCount, bucket } = buildAutoTrendBoth(rows, dateFrom, dateTo)
    setTrendBucket(bucket)
    setLineData(metric === "avg" ? trendAvg : trendCount)
  }, [rows, dateFrom, dateTo, metric])

  const filteredFeedback = rows.filter(
    (f) =>
      f.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.comment.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // -------- Export (permission-gated) --------
  const exportToExcel = async () => {
    if (!canExportFeedback) {
      alert("You don't have permission to download/export.")
      return
    }
    const XLSX = await import("xlsx")
    const rows = filteredFeedback.map((f) => ({
      "Date": formatDate(f.createdAt),
      "Patient Name": f.patient,
      "Contact": f.contact,
      "Doctor": f.doctor,
      "Rating (/5)": f.rating,
      "Comment": f.comment || "",
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    const colWidths = Object.keys(rows[0] || { " ": "" }).map((key) => {
      const headerLen = String(key).length
      const maxCellLen = rows.reduce((m, r) => Math.max(m, String(r[key] ?? "").length), 0)
      return { wch: Math.min(Math.max(headerLen, maxCellLen) + 2, 60) }
    })
    ws["!cols"] = colWidths
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Patient Feedback")
    const fileName = `OPD_Feedback_${new Date().toISOString().slice(0,10)}.xlsx`
    XLSX.writeFile(wb, fileName)
  }

  // -------- Small components --------
  const DonutChart = ({ data }) => {
    const size = 220
    const strokeWidth = 45
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const [animated, setAnimated] = useState(false)
    const [hoverIndex, setHoverIndex] = useState(null)
    useEffect(() => { const t = setTimeout(() => setAnimated(true), 100); return () => clearTimeout(t) }, [])
    let cumulativePercentage = 0
    return (
      <div className="flex flex-col items-center">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e5e7eb" strokeWidth={strokeWidth} />
          {data.map((item, index) => {
            const color = item.color || defaultColors[index % defaultColors.length]
            const dash = (item.percentage / 100) * circumference
            const strokeDasharray = `${dash} ${circumference}`
            const strokeDashoffset = (-cumulativePercentage * circumference) / 100
            cumulativePercentage += item.percentage
            return (
              <circle
                key={index}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={animated ? strokeDashoffset : circumference}
                style={{ transition: 'stroke-dashoffset 1s ease, stroke 0.3s', cursor: 'pointer', filter: hoverIndex === index ? 'brightness(1.2)' : 'none' }}
                onMouseEnter={() => setHoverIndex(index)}
                onMouseLeave={() => setHoverIndex(null)}
              />
            )
          })}
        </svg>
        <div className="mt-6 w-full grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          {data.map((item, index) => {
            const color = item.color || defaultColors[index % defaultColors.length]
            return (
              <div
                key={index}
                className={`flex items-center transition-all duration-200 ${hoverIndex === index ? 'scale-[1.02]' : ''}`}
                onMouseEnter={() => setHoverIndex(index)}
                onMouseLeave={() => setHoverIndex(null)}
              >
                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: color }} />
                <span className="text-gray-800">
                  {item.label}: <strong className=" font-[500]">{item.count}</strong> ({item.percentage}%)
                </span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const PermissionDenied = () => (
    <div className="flex items-center justify-center h-[70vh]">
      <div className="bg-white border rounded-xl p-8 shadow-sm text-center max-w-md">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Permission required</h2>
        <p className="text-gray-600">
          You don’t have access to view OPD Feedback. Please contact an administrator.
        </p>
      </div>
    </div>
  )

  // -------- Render --------
  return (
    <>
      <section className="flex font-Poppins w-[100%] h-[100%] select-none p-[15px] overflow-hidden">
        <div className="flex w-[100%] flex-col gap-[0px] h-[96vh]">
          <Header pageName="OPD Feedback" />
          <div className="flex gap-[10px] w-[100%] h-[100%]">
            <SideBar />

            {!canViewFeedback ? (
              <div className="flex flex-col w-[100%] max-h-[90%] pb-[50px] pr-[15px] bg-[#fff] overflow-y-auto gap-[30px] rounded-[10px]">
                <PermissionDenied />
              </div>
            ) : (
              <div className="flex flex-col w-[100%] max-h-[90%] pb-[50px] pr-[15px] bg-[#fff] overflow-y-auto gap-[30px] rounded-[10px]">
                <div className="mx-auto w-full">
                  {/* KPI Cards */}
                  <div className="pt-[5px] flex gap-6 mb-4">
                    <div className="bg-white rounded-lg min-w-[240px] border-[#cacaca66] shadow-md border p-6 border-l-4 border-l-blue-500">
                      <div className="flex items-center">
                        <div className="flex-shrink-0"><FileText className="w-8 h-8 text-blue-600" /></div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Total Feedback</p>
                          <p className="text-2xl font-[600] text-gray-900">{kpiData.totalFeedback}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white min-w-[240px] rounded-lg border-[#cacaca66] shadow-md border p-6 border-l-4 border-l-yellow-500">
                      <div className="flex items-center">
                        <div className="flex-shrink-0"><Star className="w-8 h-8 text-yellow-600" /></div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Average Rating</p>
                          <p className="text-2xl font-[600] text-gray-900">{kpiData.averageRating} / 5</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white min-w-[240px] rounded-lg border-[#cacaca66] shadow-md border p-6 border-l-4 border-l-green-500">
                      <div className="flex items-center">
                        <div className="flex-shrink-0"><ThumbsUp className="w-8 h-8 text-green-600" /></div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">NPS Rating</p>
                          <p className="text-2xl font-[600] text-gray-900">{kpiData.npsRating}%</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white min-w-[240px] rounded-lg border-[#cacaca66] shadow-md border p-6 border-l-4 border-l-purple-500">
                      <div className="flex items-center">
                        <div className="flex-shrink-0"><Award className="w-8 h-8 text-purple-600" /></div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Overall Score</p>
                          <p className="text-2xl font-[600] text-gray-900">{kpiData.overallScore}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Charts Row */}
                  <div className="flex justify-start items-center gap-[150px] mb-6">
                    <div className="bg-white rounded-lg shadow-md p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Rating Distribution</h3>
                      <div className="flex">
                        <DonutChart data={chartData} />
                      </div>
                    </div>

                    <div className="bg-white rounded-lg w-[700px] shadow-sm border border-gray-100 p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Feedback Trend <span className="ml-2 text-xs text-gray-500">({trendBucket})</span>
                      </h3>
                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <RLineChart data={lineData.length ? lineData : [{ date: "-", value: 0 }]} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                            <CartesianGrid stroke="#f3f4f6" vertical={false} />
                            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                            <YAxis domain={[0, 5]} tick={{ fontSize: 12 }} />
                            <Tooltip contentStyle={{ fontSize: 12 }} />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="value"
                              name="Average Rating"
                              stroke="#3B82F6"
                              strokeWidth={3}
                              dot={{ r: 3 }}
                              activeDot={{ r: 5 }}
                              isAnimationActive
                              animationDuration={600}
                            />
                          </RLineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* Word Cloud */}
                  <div className="bg-white border-b-[1.7px] border-dashed p-3 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Feedback Keywords</h3>
                    <div className="flex flex-wrap gap-3">
                      {[
                        "Excellent","Nurse","Professional","Clean","Comfortable","Doctor","Care","Staff",
                        "Treatment","Service","Billing","Food","Room","Pharmacy","Housekeeping",
                      ].map((word, index) => (
                        <span
                          key={index}
                          className={`px-4 py-[3px] rounded-full border text-[13px] font-medium ${
                            index % 6 === 0 ? "bg-blue-100 border-blue-800 text-blue-800" :
                            index % 6 === 1 ? "bg-green-100 border-green-800 text-green-800" :
                            index % 6 === 2 ? "bg-yellow-100 border-yellow-800 text-yellow-800" :
                            index % 6 === 3 ? "bg-purple-100 border-purple-800 text-purple-800" :
                            index % 6 === 4 ? "bg-red-100 border-red-800 text-red-800" :
                                              "bg-indigo-100 border-indigo-800 text-indigo-800"
                          }`}
                        >
                          {word}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Service Summary + Extra Donut */}
                  <div className="flex w-[100%] mb-[40px] gap-[30px]">
                    <div className="bg-white rounded-xl border w-[60%] shadow-lg overflow-hidden">
                      <div className="px-6 py-2 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Service-Wise Summary</h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="min-w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">Service</th>
                              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">Excellent %</th>
                              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">Good %</th>
                              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">Average %</th>
                              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">Poor %</th>
                              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Very Poor %</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white">
                            {serviceSummary.map((service, index) => (
                              <tr key={index} className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50 transition-colors`}>
                                <td className="px-6 py-3 text-sm font-medium text-gray-900 border-r border-gray-200">{service.service}</td>
                                <td className="px-6 py-3 text-center text-sm border-r border-gray-200">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">{service.excellent}%</span>
                                </td>
                                <td className="px-6 py-3 text-center text-sm border-r border-gray-200">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{service.good}%</span>
                                </td>
                                <td className="px-6 py-3 text-center text-sm border-r border-gray-200">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">{service.average}%</span>
                                </td>
                                <td className="px-6 py-3 text-center text-sm border-r border-gray-200">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">{service.poor}%</span>
                                </td>
                                <td className="px-6 py-3 text-center text-sm">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">{service.veryPoor}%</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="flex">
                      <div className="bg-white w-[100%] rounded-lg shadow-md p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Service-Wise Chart</h3>
                        <div className="flex">
                          <DonutChart data={chartData} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Patient-Wise Feedback Table */}
                  <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 sm:mb-0">Patient Feedback Details</h3>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            type="text"
                            placeholder="Search feedback..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        {canExportFeedback && (
                          <button
                            onClick={exportToExcel}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Export to Excel
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">Date & Time</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">Patient Name</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">Contact</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">Doctor</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">Rating</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comment</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white">
                          {filteredFeedback.map((feedback, index) => (
                            <tr
                              key={feedback.id}
                              className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50 transition-colors`}
                            >
                              <td className="px-4 py-2 text-sm text-gray-900 border-r border-gray-200">
                                <div className="flex items-center">
                                  <Clock className="w-4 h-4 text-gray-400 mr-2" />
                                  {formatDate(feedback.createdAt)}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm font-medium text-gray-900 border-r border-gray-200">
                                <div className="flex items-center">
                                  <User className="w-4 h-4 text-gray-400 mr-2" />
                                  {feedback.patient}
                                </div>
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-900 border-r border-gray-200">
                                <div className="flex items-center">
                                  <Phone className="w-4 h-4 text-gray-400 mr-2" />
                                  {feedback.contact}
                                </div>
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-900 border-r border-gray-200">{feedback.doctor}</td>
                              <td className="px-4 py-2 text-sm text-gray-900 border-r border-gray-200">
                                <div className="flex items-center">
                                  {getRatingStars(feedback.rating)}
                                  <span className="ml-2 text-sm font-medium">{feedback.rating}/5</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                                <div className="truncate" title={feedback.comment}>{feedback.comment}</div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {error && <div className="text-red-600 text-sm mt-3 px-6">{error}</div>}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
