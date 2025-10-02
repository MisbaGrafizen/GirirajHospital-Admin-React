import React, { useCallback, useEffect, useState } from 'react'
import Header from '../../Component/header/Header'
import SideBar from '../../Component/sidebar/CubaSidebar'
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, ChevronDown, Hospital, User, Activity, HeartPulse, Frown, Minus, Search, Eye, } from "lucide-react"
import { useNavigate } from 'react-router-dom'
import { FileText, Download, Star, ThumbsUp, BarChart3, Award, Phone, Clock } from "lucide-react"
import { MessageSquare, } from "lucide-react";
import { Users, Stethoscope, ShieldCheck, Microscope, Sparkles } from "lucide-react";

const serviceIcons = {
  "Appointment": Calendar,
  "Reception Staff": Users,
  "Diagnostic Services": Microscope,
  "Doctor Service": Stethoscope,
  "Security": ShieldCheck,
  "Cleanliness": Sparkles,
};


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
import OpdFilter from '../../Component/ReportFilter/OpdFilter'
import Widgets1 from '../../Component/DashboardFiles/Components/Common/CommonWidgets/Widgets1'
import Preloader from '../../Component/loader/Preloader'

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

const OPD_RATING_KEYS = [
  "appointment",
  "receptionStaff",
  "radiologyDiagnosticServices",
  "pathologyDiagnosticServices",
  "doctorServices",
  "cleanliness",   // ✅ include this if backend sends cleanliness rating
  "security",
];


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
  const navigate = useNavigate();

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
const normId = (v) =>
  typeof v === 'object' && v !== null
    ? (v.$oid ?? v._id ?? v.toString?.() ?? '')
    : (v ?? '');
const normDate = (v) =>
  typeof v === 'object' && v !== null && '$date' in v ? v.$date : v;


export default function OPDFeedbackDashboard() {
  const [dateFrom, setDateFrom] = useState("2024-01-01")
  const [dateTo, setDateTo] = useState("2024-01-31")
  const navigate = useNavigate();
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
  const [doctorOptions, setDoctorOptions] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [kpiData, setKpiData] = useState({
    totalFeedback: 0,
    averageRating: 0,
    npsRating: 0,
    overallScore: "-",
  })
  const [filters, setFilters] = useState({
    from: '',                 // "YYYY-MM-DD"
    to: '',                   // "YYYY-MM-DD"
    service: 'All Services',  // matches your UI labels
    doctor: '',               // blank means All Doctors
  });

  const [chartData, setChartData] = useState([
    { label: "Excellent", count: 0, percentage: 0, color: "#10B981" },
    { label: "Good", count: 0, percentage: 0, color: "#3B82F6" },
    { label: "Average", count: 0, percentage: 0, color: "#06B6D4" },
    { label: "Poor", count: 0, percentage: 0, color: "#EAB308" },
    { label: "Very Poor", count: 0, percentage: 0, color: "#F97316" },
  ])

  const defaultColors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899']

  const SERVICE_GROUPS = {
    "Appointment": ["appointment"],
    "Reception Staff": ["receptionStaff"],
    "Diagnostic Services (Radiology)": ["radiologyDiagnosticServices"],   // ✅ match dropdown
    "Diagnostic Services (Pathology)": ["pathologyDiagnosticServices"], // ✅ match dropdown
    "Doctor Service": ["doctorServices"],                               // ✅ match dropdown
    "Cleanliness": ["cleanliness"],                                     // ✅ add cleanliness
    "Security": ["security"],
  };

  const OPD_SERVICE_LABELS = {
    appointment: "Appointment",
    receptionStaff: "Reception Staff",
    radiologyDiagnosticServices: "Diagnostic Services (Radiology)",   // ✅ match dropdown
    pathologyDiagnosticServices: "Diagnostic Services (Pathology)",  // ✅ match dropdown
    doctorServices: "Doctor Service",                                // ✅ match dropdown
    cleanliness: "Cleanliness",                                      // ✅ added
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
    setLoading(true)
    setError(null)
    try {
      const res = await ApiGet(`${API_URL}`)
      const data = Array.isArray(res) ? res : (res.data || [])
      setRawOPD(data)

      const resKeywords = await ApiGet("/admin/opd-frequent-ratings")
      if (resKeywords?.keywords) {
        setKeywords(resKeywords.keywords)
      } else {
        setKeywords([])
      }

      const list = data.map((d) => {
        const id = normId(d._id ?? d.id);
        const rating = calcRowAverage(d.ratings);
        return {
          id,
          _id: id, // keep for safety
          createdAt: normDate(d.createdAt ?? d.date),
          patient: d.patientName || d.name || "-",
          contact: d.contact || "-",
          doctor: d.consultantDoctorName?.name || d.doctorName || d.consultant || "-",
          rating,
          comment: d.comments || d.comment || "",
          overallRecommendation: d.overallRecommendation,
        };
      });

      const avg = list.length ? round1(list.reduce((s, r) => s + (r.rating || 0), 0) / list.length) : 0
      const nps = calcNpsPercent(data)
      const overallScore =
        avg >= 4.5 ? "Excellent" :
          avg >= 4.0 ? "Good" :
            avg >= 3.0 ? "Av" :
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
  }, [dateFrom, dateTo])

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

  useEffect(() => {
    if (!rawOPD || !rawOPD.length) {
      setDoctorOptions(["All Doctors"]);
      return;
    }

    const uniqueDoctors = Array.from(
      new Set(
        rawOPD
          .map(d => d.consultantDoctorName?.name || d.doctorName || d.consultant)
          .filter(Boolean)
      )
    ).sort();

    setDoctorOptions(["All Doctors", ...uniqueDoctors]);
  }, [rawOPD]);



  const handlenavigate = () => {
    navigate("/dashboards/opd-all-list")
  };

  // -------- Export (permission-gated) --------
  const exportToExcel = async () => {
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
    const fileName = `OPD_Feedback_${new Date().toISOString().slice(0, 10)}.xlsx`
    XLSX.writeFile(wb, fileName)
  }

  const handleFilterChange = useCallback((next) => {
    // next looks like: { from, to, service, doctor }
    setFilters((prev) => ({ ...prev, ...next }));
  }, []);

  useEffect(() => {
    // Nothing to do until the first fetch is done
    if (!Array.isArray(rawOPD) || !rawOPD.length) {
      setRows([]);
      setKpiData({ totalFeedback: 0, averageRating: 0, npsRating: 0, overallScore: '-' });
      setServiceSummary([]);
      setChartData(buildServiceDistribution([], 'All Services'));
      return;
    }

    // Build date range (inclusive)
    const start = filters.from ? new Date(filters.from) : null;
    const end = filters.to ? new Date(filters.to) : null;
    if (start) start.setHours(0, 0, 0, 0);
    if (end) end.setHours(23, 59, 59, 999);

    // Service key map (uses your SERVICE_GROUPS)
    const serviceLabel = filters.service || 'All Services';
    const keysForService =
      serviceLabel === 'All Services' ? null : (SERVICE_GROUPS[serviceLabel] || []);

    const doctorQuery = (filters.doctor || '').trim().toLowerCase();

    // Filter raw docs first
    const filteredDocs = rawOPD.filter((d) => {
      // date filter
      const dt = new Date(normDate(d.createdAt ?? d.date));
      if (isNaN(dt)) return false;
      if (start && dt < start) return false;
      if (end && dt > end) return false;

      // service filter (record must have at least one rating in that service group)
      if (keysForService) {
        const r = d?.ratings || {};
        const hasRating = keysForService.some((k) => typeof r[k] === 'number' && r[k] >= 1 && r[k] <= 5);
        if (!hasRating) return false;
      }

      // doctor filter (substring match)
      if (doctorQuery) {
        const docName = (d.consultantDoctorName?.name || d.doctorName || '').toLowerCase();
        if (!docName.includes(doctorQuery)) return false;
      }

      return true;
    });

    // Build table rows (your existing shape)
    const list = filteredDocs.map((d) => {
      const id = normId(d._id ?? d.id);
      const rating = calcRowAverage(d.ratings);
      return {
        id,
        _id: id,
        createdAt: normDate(d.createdAt ?? d.date),
        patient: d.patientName || d.name || '-',
        contact: d.contact || '-',
        doctor: d.consultantDoctorName?.name || d.doctorName || d.consultant || '-',
        rating,
        comment: d.comments || d.comment || '',
        overallRecommendation: d.overallRecommendation,
      };
    });

    // KPIs
    const avg = list.length ? round1(list.reduce((s, r) => s + (r.rating || 0), 0) / list.length) : 0;
    const nps = calcNpsPercent(filteredDocs);
    const overallScore =
      avg >= 4.5 ? 'Excellent' :
        avg >= 4.0 ? 'Good' :

          avg >= 3.0 ? 'Average' :

            avg >= 3.0 ? 'Av.' :

              avg >= 2.0 ? 'Poor' : 'Very Poor';

    setRows(list);
    setKpiData({ totalFeedback: list.length, averageRating: avg, npsRating: nps, overallScore });

    // Summary + charts
    setServiceSummary(buildServiceSummary(filteredDocs));
    setOpdServiceChart(buildOPDServiceChart(filteredDocs));
    setChartData(buildServiceDistribution(filteredDocs, serviceLabel));

    // Keep your existing local states in sync (so Trend uses the same dates)
    setDateFrom(filters.from || '');
    setDateTo(filters.to || '');
    setSelectedService(serviceLabel);
  }, [filters, rawOPD]);



  const openFeedbackDetails = useCallback((fb) => {
    const id = normId(fb?._id ?? fb?.id)
    if (!id) {
      console.error("No ID on feedback row:", fb)
      alert("No ID found for this feedback.")
      return
    }
    sessionStorage.setItem(
      'opdFeedback:last',
      JSON.stringify({ id, preview: fb })
    )

    navigate('/feedback-details', {
      state: { id, feedback: fb }
    })
  }, [navigate])

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
        <div className="mt-6 w-full  flex-wrap flex sm:grid-cols-2 gap-x-3 gap-y-2 justify-center px-[10px]  text-sm">
          {data.map((item, index) => {
            const color = item.color || defaultColors[index % defaultColors.length]
            return (
              <div
                key={index}
                className={`flex items-center justify-center text-center transition-all duration-200 ${hoverIndex === index ? "scale-[1.02]" : ""
                  }`}
                onMouseEnter={() => setHoverIndex(index)}
                onMouseLeave={() => setHoverIndex(null)}
              >
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: color }}
                />
                <span className="text-[13px] text-gray-800">
                  {item.label}:{" "}
                  <strong className="text-[13px] font-[500]">{item.count}</strong> (
                  {item.percentage}%)
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
      <section className="flex font-Poppins w-[100%] h-[100%] select-none  min-h-screen overflow-hidden">
        <div className="flex w-[100%] flex-col gap-[0px] h-[100vh]">
          <Header pageName="OPD Feedback" />
          <div className="flex gap-[10px] w-[100%] h-[100%]">
            <SideBar />

            <div className="flex flex-col w-[100%]  relative max-h-[93%]  md34:!pb-[120px] m md11:!pb-[0px] py-[10px] px-[10px]  overflow-y-auto gap-[10px] rounded-[10px]">
              <Preloader />
              <div className="mx-auto w-full">
                <div className="bg-white rounded-lg shadow-sm p-[13px]  md34:!mx-[12px] md11:!mx-0   mb-[10px] border border-gray-100  ">
                  <OpdFilter value={filters} onChange={handleFilterChange} doctors={doctorOptions} />
                </div>
                <div className="flex gap-6 mb-3">


                  <div className="flex flex-col w-[97%] md11:mx-0 mx-auto md11:w-[100%] max-h-[90%] md34:!pb-[50px] md11:!pb-[10px]  overflow-y-auto gap-[20px] rounded-[10px]">
                    <div className="mx-auto w-full">

                      <div className="pt-[5px] w-[100%] ">




                        <div className="  md34:!grid-cols-2 gap-x-[10px] md11:!grid-cols-4 grid w-[100%]">
                          <Widgets1
                            data={{
                              title: "Total Feedback",
                              gros: kpiData.totalFeedback,
                              total: kpiData.totalFeedback,
                              color: "primary",
                              icon: <MessageSquare className="w-5 h-5 text-[#7366ff]" />,
                            }}
                          />

                          <Widgets1
                            data={{
                              title: "Average Rating",
                              gros: `${kpiData.averageRating} `,
                              total: `${kpiData.averageRating} `,
                              color: "warning",
                              icon: <Star className="w-5 h-5 text-yellow-600" />,
                            }}
                          />

                          <Widgets1
                            data={{
                              title: "NPS Rating",
                              gros: `${kpiData.npsRating}%`,
                              total: `${kpiData.npsRating}%`,
                              color: "success",
                              icon: <ThumbsUp className="w-5 h-5 text-green-600" />,
                            }}
                          />

                          <Widgets1
                            data={{
                              title: "Overall Score",
                              total: kpiData.overallScore,
                              gros: kpiData.overallScore,
                              color: "purple",
                              icon: <Award className="w-5 h-5 text-purple-600" />,
                            }}
                          />
                        </div>
                      </div>

                      {/* Charts Row */}
                      <div className=" flex md11:!flex-row flex-col justify-start gap-[15px] mb-2">
                        <div className="bg-white border  rounded-lg shadow-md p-3">
                          <div className=' flex  mb-[10px] items-center gap-[10px]'>


                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-md flex items-center justify-center">
                              <i className=" text-[#fff] text-[17px] fa-solid fa-star-sharp-half-stroke"></i>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Rating Distribution</h3>
                          </div>

                          <div className="flex justify-center items-center mx-auto">
                            <DonutChart data={chartData} />
                          </div>
                        </div>

                        <div className="bg-white rounded-lg md11:!w-[800px] shadow-sm border border-gray-100 pb-[10px] md11:!p-4">
                          <div className=' flex ml-[15px] mt-[13px]  mb-[17px] items-center gap-[10px]'>

                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-md flex items-center justify-center">
                              <i className="fa-regular fa-chart-simple text-[#fff] text-[19px]"></i>
                            </div>
                            <h3 className="text-lg font-semibold  mt-[10px] ml-[15px] text-gray-900 mb-3">


                              Feedback Trend <span className="ml-2 text-xs text-gray-500">({trendBucket})</span>
                            </h3>
                          </div>
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
                      <div className="bg-white border-[1.7px] shadow-sm  rounded-[10px] p-3 mt-[16px] ">
                        <div className=' flex  mb-[17px] items-center gap-[10px]'>

                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-md flex items-center justify-center">
                            <i className="fa-solid  text-[17px] text-[#fff] fa-keyboard-brightness"></i>

                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Feedback Keywords</h3>
                        </div>
                        {/* <div className="flex flex-wrap gap-3">
                          {[
                            "Excellent",
                            // "Nurse", 
                            // "Professional", 
                            "Clean",
                            // "Comfortable", 
                            // "Doctor", 
                            // "Care", 
                            "Staff",
                            // "Treatment", 
                            "Service",
                            // "Billing", 
                            "Food",
                            // "Room", 
                            // "Pharmacy", 
                            // "Housekeeping",
                          ].map((word, index) => (
                            <span
                              key={index}
                              className={`px-3 py-[3px] rounded-full border text-[13px] font-medium ${index % 6 === 0 ? "bg-blue-100 border-blue-800 text-blue-800" :
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
                        </div> */}
                        <div className="flex flex-wrap gap-3">
                          {keywords.length > 0 ? (
                            keywords.map((word, index) => (
                              <span
                                key={index}
                                className={`px-3 py-[3px] rounded-full border text-[13px] font-medium ${index % 6 === 0 ? "bg-blue-100 border-blue-800 text-blue-800" :
                                    index % 6 === 1 ? "bg-green-100 border-green-800 text-green-800" :
                                      index % 6 === 2 ? "bg-yellow-100 border-yellow-800 text-yellow-800" :
                                        index % 6 === 3 ? "bg-purple-100 border-purple-800 text-purple-800" :
                                          index % 6 === 4 ? "bg-red-100 border-red-800 text-red-800" :
                                            "bg-indigo-100 border-indigo-800 text-indigo-800"
                                  }`}
                              >
                                {word}
                              </span>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500">No keywords available</p>
                          )}
                        </div>

                      </div>

                    </div>
                    {/* Service Summary + Extra Donut */}


                    {/* Service Summary + Extra Donut */}
                    <div className="flex w-[100%] mb-[px] gap-[30px]">
                      <div className="bg-white rounded-xl border w-[100%] shadow-md overflow-hidden">
                        <div className="px-3 py-[13px]  flex  items-center gap-[10px] border-b border-gray-200">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-md flex items-center justify-center">
                            <i className="fa-solid  text-[17px] text-[#fff] fa-user-md"></i>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900">Service-Wise Summary</h3>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="md11:!min-w-full min-w-[800px] ">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-3 py-[10px] text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">Service</th>
                                <th className="px-3 py-[10px] text-center text-xs font-medium text-gray-500 uppercase  flex-shrink-0 tracking-wider border-r border-gray-200">Excellent %</th>
                                <th className="px-3 py-[10px] text-center text-xs font-medium text-gray-500 uppercase  flex-shrink-0 tracking-wider border-r border-gray-200">Good %</th>
                                <th className="px-3 py-[10px] text-center text-xs font-medium text-gray-500 uppercase  flex-shrink-0 tracking-wider border-r border-gray-200">Average %</th>
                                <th className="px-3 py-[10px] text-center text-xs font-medium text-gray-500 uppercase flex-shrink-0 tracking-wider border-r border-gray-200">Poor %</th>
                                <th className="px-3 py-[10px] text-center text-xs font-medium text-gray-500 uppercase flex-shrink-0 tracking-wider">Very Poor %</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white">
                              {serviceSummary.map((service, index) => {
                                const Icon = serviceIcons[service.service] || User; // fallback icon
                                return (
                                  <tr
                                    key={index}
                                    className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50 transition-colors`}
                                  >
                                    <td className="px-3 py-[10px] text-sm font-medium text-gray-900 border-r flex items-center gap-2 border-gray-200">
                                      <Icon className="w-4 h-4 text-gray-600" />
                                      {service.service}
                                    </td>
                                    <td className="px-3 py-[10px] text-center text-sm border-r border-gray-200">
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#10B981] text-white">
                                        {service.excellent}%
                                      </span>
                                    </td>
                                    <td className="px-3 py-[10px] text-center text-sm border-r border-gray-200">
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#3B82F6] text-white">
                                        {service.good}%
                                      </span>
                                    </td>
                                    <td className="px-3 py-[10px] text-center text-sm border-r border-gray-200">
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#06B6D4] text-white">
                                        {service.average}%
                                      </span>
                                    </td>
                                    <td className="px-3 py-[10px] text-center text-sm border-r border-gray-200">
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#EAB308] text-white">
                                        {service.poor}%
                                      </span>
                                    </td>
                                    <td className="px-3 py-[10px] text-center text-sm">
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F97316] text-white">
                                        {service.veryPoor}%
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>


                          </table>
                        </div>
                      </div>


                    </div>




                    {/* Patient-Wise Feedback Table */}
                    <div className="bg-white  md11:!mb-[0px] rounded-lg border shadow-sm overflow-hidden">
                      <div className="px-3  border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                        <div className=' flex gap-[10px]  items-center py-[13px] justify-start '>



                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-md flex items-center justify-center">
                            <i className="fa-regular fa-users-medical text-[17px] text-[#fff] "></i>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 !text-left  sm:mb-0">Patient Feedback Details</h3>
                        </div>
                        <div className="flex flex-row items-center md34:!w-[100%]  md77:!w-fit justify-between  md34:!mb-[10px] gap-3">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                              type="text"
                              placeholder="Search feedback..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="pl-10 pr-3 py-[5px] border md34:!w-[190px] md11:!w-[230px] border-gray-300 rounded-md focus:outline-none focus:ring-[1.3px] focus:ring-blue-500"
                            />
                          </div>
                          <div className=' flex gap-[10px]'>


                            <button
                              onClick={exportToExcel}
                              className=" md34:!hidden md77:!flex items-center px-2 py-[6px] w-[140px] bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Export to Excel
                            </button>


                            <button
                              onClick={exportToExcel}
                              className=" flex md77:!hidden items-center px-2 py-[6px] w-fit bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                              <Download className="w-5 h-5 " />

                            </button>
                            <button

                              className="flex items-center px-2 py-[6px] h-[32px] w-[35px] bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                              onClick={handlenavigate}
                            >
                              <Eye className="w-5 h-5 " />

                            </button>
                          </div>
                        </div>

                      </div>

                      <div className="overflow-x-auto">
                        <table className=" md34:!min-w-[1200px] md11:!min-w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-[7px] text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">Date & Time</th>
                              <th className="px-6 py-[7px] text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">Patient Name</th>
                              <th className="px-6 py-[7px] text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">Contact</th>
                              <th className="px-6 py-[7px] text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">Doctor</th>
                              <th className="px-6 py-[7px] text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">Rating</th>
                              <th className="px-6 py-[7px] text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comment</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white">
                            {filteredFeedback
                              .slice() // clone
                              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // latest first
                              .slice(0, 5) // only first 5
                              .map((feedback, index) => (
                                <tr
                                  key={feedback.id || feedback._id}
                                  onClick={() => openFeedbackDetails(feedback)}
                                  className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50 transition-colors cursor-pointer`}
                                  role="button"
                                  tabIndex={0}
                                  onKeyDown={(e) => { if (e.key === "Enter") openFeedbackDetails(feedback); }}
                                >

                                  <td className="px-4 py-2 text-sm text-gray-900 border-r border-gray-200">
                                    <div className="flex items-center">
                                      <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                                      {formatDate(feedback.createdAt)}
                                    </div>
                                  </td>
                                  <td className="px-6 py-[7px] text-sm font-medium text-gray-900 border-r border-gray-200">



                                    <div className="flex flex-shrink-0 items-center">
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
                                  <td className="px-6 py-[7px] text-sm text-gray-900 max-w-xs">
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
              </div>
            </div>
          </div>
        </div>

      </section>
    </>
  )
}
