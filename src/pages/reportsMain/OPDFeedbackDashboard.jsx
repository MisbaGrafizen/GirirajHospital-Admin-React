import React, { useCallback, useMemo, useEffect, useState } from 'react'
import Header from '../../Component/header/Header'
import SideBar from '../../Component/sidebar/CubaSidebar'
import { motion, AnimatePresence } from "framer-motion"

import {
  FileText,
  Download,
  Search,
  Star,
  ThumbsUp,
  Award,
  Phone,
  Pill,
  XCircle,
  CalendarClock,
  ClipboardPlus,
  Bed,
  Eye,
  SprayCan,
  TestTube2,

  IndianRupee,
} from "lucide-react"
import {
  Stethoscope,
  Building2,
  ShieldCheck,

  DollarSign,

  Wrench,
  Utensils,

} from "lucide-react";

const serviceIcons = {
  "Overall Experience": Star,
  "Consultant Doctor": Stethoscope,
  "Medical Admin Doctor": Pill ,
  "Billing Services": IndianRupee,
  "Housekeeping": SprayCan,
  "Maintenance": Wrench,
  "Radiology": Building2,
  "Pathology": TestTube2,
  "Dietitian Services": Utensils,
  "Security": ShieldCheck,
  "Nursing": ClipboardPlus,

};
import { ApiGet } from '../../helper/axios'
import { Calendar, ChevronDown, Hospital, MessageSquare, User, Activity, HeartPulse, Frown, Minus, } from "lucide-react"

import {
  ResponsiveContainer,
  LineChart as RLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"
import { useNavigate } from 'react-router-dom'
import Widgets1 from '../../Component/DashboardFiles/Components/Common/CommonWidgets/Widgets1'
import Preloader from '../../Component/loader/Preloader'
import ModernDatePicker from '../../Component/MainInputFolder/ModernDatePicker'

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------
const API_URL = "/admin/opd-patient"

const DOCTORS_BY_DEPT = {
  OPD: ["Dr. Sharma", "Dr. Mehta", "Dr. Patel", "Dr. Gupta"],
  IPD: ["Dr. Rao", "Dr. Singh", "Dr. Das", "Dr. Iyer"],
}
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

function calcRowAverage(ratings = {}) {
  const values = Object.values(ratings || {})
    .map((v) => Number(v))
    .filter((v) => v >= 1 && v <= 5);

  if (!values.length) return 0;

  const avg = values.reduce((a, b) => a + b, 0) / values.length;

  return Number(avg.toFixed(1)); // consistent rounding
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
// Permissions (mirrors your MainPoOrder pattern)
// Looks for "ipd_feedback" module; also tries "ipd"/"feedback"/"reports".
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

function getOverallScoreLabel(avg) {
  if (avg >= 4.5) return "Excellent";
  if (avg >= 4.0) return "Good";
  if (avg >= 3.0) return "Average";
  if (avg >= 2.0) return "Poor";
  return "Very Poor";
}

function AnimatedDropdown({ label, options, selected, onSelect, icon: Icon, disabled = false }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const onEsc = (e) => {
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onEsc)
    return () => window.removeEventListener("keydown", onEsc)
  }, [open])

  return (
    <div className="relative">
      {label && <label className="block  text-[10px] font-medium top-[-8px] left-[10px] border-gray-300  bg-white border px-[10px] rounded-[10px] z-[3] absolute text-gray-700 mb-1">{label}</label>}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
        className={`w-full flex items-center justify-between px-3 py-2 border rounded-md bg-white transition-colors ${disabled
          ? "border-gray-200 text-gray-400 cursor-not-allowed"
          : "border-gray-300 hover:bg-gray-50 focus:outline-none "
          }`}
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-gray-400" />}
          <span className="text-gray-900 text-[14px]">{selected}</span>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.18 }}>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && !disabled && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
          >
            {options.map((opt, idx) => (
              <motion.button
                key={opt}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.02 }}
                onClick={() => {
                  onSelect(opt)
                  setOpen(false)
                }}
                className="w-full text-left px-3 py-2 hover:bg-sky-50 focus:bg-sky-50 focus:outline-none text-gray-900"
              >
                {opt}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function generateNpsDataset({ from, to, department, doctor }) {
  const dates = getDateRange(from, to)
  const depts = department === "Both" ? ["OPD", "IPD"] : [department]
  const doctorsPool =
    department === "Both" ? [...DOCTORS_BY_DEPT.OPD, ...DOCTORS_BY_DEPT.IPD] : DOCTORS_BY_DEPT[department] || []

  const records = []

  dates.forEach((date) => {
    depts.forEach((dept) => {
      const docList = doctor && doctor !== "All Doctors" ? [doctor] : DOCTORS_BY_DEPT[dept] || []
      docList.forEach((doc) => {
        const seed = hashString(`${date}-${dept}-${doc}`)
        const rng = mulberry32(seed)
        const count = Math.floor(rng() * 10) + 10 // 10-19 entries per doc per day

        for (let i = 0; i < count; i++) {
          const r = Math.floor(rng() * 11) // 0..10
          const time = `${String(Math.floor(rng() * 24)).padStart(2, "0")}:${String(Math.floor(rng() * 60)).padStart(
            2,
            "0",
          )}`
          const cat = categoryFromRating(r)
          const pt = makePatientName(rng)
          const rm = roomFor(dept, rng)
          const comment =
            rng() > 0.75
              ? cat === "Detractor"
                ? "Wait time was too long."
                : cat === "Promoter"
                  ? "Great care and attention."
                  : "Average experience."
              : ""
          records.push({
            date,
            datetime: `${date} ${time}`,
            patient: pt,
            room: rm,
            doctor: doc,
            department: dept,
            rating: r,
            category: cat,
            comment,
          })
        }
      })
    })
  })

  return records
}

function getDateRange(from, to) {
  const start = new Date(from)
  const end = new Date(to)
  const days = []
  const d = new Date(start)
  while (d <= end) {
    days.push(d.toISOString().slice(0, 10))
    d.setDate(d.getDate() + 1)
  }
  return days
}

function hashString(str) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24)
  }
  return h >>> 0
}

function mulberry32(a) {
  return () => {
    let t = (a += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const PATIENT_FIRST = ["Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Reyansh", "Mohammed", "Krishna", "Ishaan"]
const PATIENT_LAST = ["Sharma", "Patel", "Gupta", "Kumar", "Verma", "Reddy", "Shah", "Sinha", "Joshi"]

function makePatientName(rng) {
  const f = PATIENT_FIRST[Math.floor(rng() * PATIENT_FIRST.length)]
  const l = PATIENT_LAST[Math.floor(rng() * PATIENT_LAST.length)]
  return `${f} ${l}`
}

function categoryFromRating(r) {
  if (r >= 9) return "Promoter"
  if (r >= 7) return "Passive"
  return "Detractor"
}



function roomFor(dept, rng) {
  if (dept === "OPD") {
    return `OPD-${Math.floor(rng() * 50 + 1)}`
  }
  // IPD rooms like A-101 to D-520
  const wing = ["A", "B", "C", "D"][Math.floor(rng() * 4)]
  return `${wing}-${Math.floor(rng() * 420 + 100)}`
}


// ------------------------------------------------------------------
// Component
// ------------------------------------------------------------------
export default function OPDFeedbackDashboard() {
  // Dates kept for future filtering; used by trend bucketing
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const navigate = useNavigate()
  const [room, setRoom] = useState("All Rooms")
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [rows, setRows] = useState([])
  const [lineData, setLineData] = useState([]);
  const [trendBucket, setTrendBucket] = useState("day") // "day" | "week" | "month"
  const [serviceSummary, setServiceSummary] = useState([]);
  const [department, setDepartment] = useState("Both")
  const [doctor, setDoctor] = useState("All Doctors")
  const [rawOPD, setRawOPD] = useState([]);

  const [frequentRatings, setFrequentRatings] = useState([]);
  const [service, setService] = useState("All Services");



  useEffect(() => {
    const fetchFrequentRatings = async () => {
      try {
        const res = await ApiGet("/admin/opd-frequent-ratings"); // backend endpoint we made
        setFrequentRatings(res?.keywords || []);
      } catch (err) {
        console.error("Failed to fetch frequent ratings:", err);
      }
    };

    fetchFrequentRatings();
  }, []);



  // Build doctor list from data (keeps "All Doctors" at top)
  const doctorOptions = useMemo(() => {
    const set = new Set();
    (Array.isArray(rawOPD) ? rawOPD : []).forEach((d) => {
      const name = d?.consultantDoctorName?.name || d?.doctorName;
      if (name) set.add(String(name));
    });
    return ["All Doctors", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [rawOPD]);

  const roomOptions = useMemo(() => {
    const set = new Set();
    (Array.isArray(rawOPD) ? rawOPD : []).forEach((d) => {
      const bed = d?.bedNo;
      if (bed != null && bed !== "") set.add(String(bed));
    });
    return ["All Rooms", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [rawOPD]);


  useEffect(() => {
    if (!roomOptions.includes(room)) setRoom("All Rooms");
  }, [roomOptions, room]);


  const deptOptions = ["OPD", "IPD", "Both"]
  const [kpiData, setKpiData] = useState({
    totalFeedback: 0,
    averageRating: 0,
    npsRating: 0,
    overallScore: "-",
  })

  const depts = department === "Both" ? ["OPD", "IPD"] : [department]
  const baseRecords = useMemo(() => {
    const deptParam = department
    const doctorParam = doctor === "All Doctors" ? undefined : doctor
    return generateNpsDataset({ from: dateFrom, to: dateTo, department: deptParam, doctor: doctorParam })
  }, [dateFrom, dateTo, department, doctor])


  const handlenavigate = () => {
    navigate("/dashboards/opd-all-list")
  };


  // const roomOptions = useMemo(() => {
  //   const rooms = Array.from(new Set(baseRecords.map((r) => r.room))).sort((a, b) => a.localeCompare(b))
  //   return ["All Rooms", ...rooms.slice(0, 200)] // limit to keep dropdown manageable
  // }, [baseRecords])

  // Ensure selected room remains valid
  useEffect(() => {
    if (!roomOptions.includes(room)) setRoom("All Rooms")
  }, [roomOptions, room])

  const [chartData, setChartData] = useState([
    { label: "Excellent", count: 0, percentage: 0, color: "#10B981" },   // 5
    { label: "Good", count: 0, percentage: 0, color: "#3B82F6" },        // 4
    { label: "Average", count: 0, percentage: 0, color: "#06B6D4" },     // 3
    { label: "Poor", count: 0, percentage: 0, color: "#EAB308" },        // 2
    { label: "Very Poor", count: 0, percentage: 0, color: "#F97316" },   // 1
  ])

  const defaultColors = [
    '#3b82f6',
    '#ef4444',
    '#10b981',
    '#f59e0b',
    '#8b5cf6',
    '#ec4899',
  ]
  // ---------------- Service summary helpers ----------------
  function prettyKey(key = "") {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/_/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/^./, (c) => c.toUpperCase());
  }

  const SERVICE_GROUPS = {
    "Overall Experience": ["overallExperience"],
    "Consultant Doctor": ["consultantDoctorServices"],
    "Medical Admin Doctor": ["medicalAdminDoctorService"],
    "Billing Services": ["billingServices"],
    "Housekeeping": ["housekeeping"],
    "Maintenance": ["maintenance"],
    "Radiology": ["radiologyDiagnosticServices"],
    "Pathology": ["pathologyDiagnosticServices"],
    "Dietitian Services": ["dietitianServices"],
    "Security": ["security"],
    "Nursing": ["nursing"]
  };

  function toArray(maybeArray) {
    if (Array.isArray(maybeArray)) return maybeArray;
    return [];
  }

function buildServiceSummary(rows = [], selectedDepartment = "Both") {
  // ⭐ MAP FRONTEND LABELS → BACKEND RATING KEYS
  const SERVICE_MAP = {
    "Appointment": "appointment",
    "Reception Staff": "receptionStaff",
    "Doctor Services": "doctorServices",
    "Diagnostic Services (Pathology)": "pathologyDiagnosticServices",
    "Diagnostic Services (Radiology)": "radiologyDiagnosticServices",
    "Cleanliness": "cleanliness",
    "Security": "security",
  };

  // ⭐ Filter rows by department (if required)
  const filteredRows =
    selectedDepartment === "Both"
      ? rows
      : rows.filter(
          (item) =>
            (item?.ratings?.department || "OPD") === selectedDepartment
        );

  const result = [];

  Object.entries(SERVICE_MAP).forEach(([label, key]) => {
    let total = 0;
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    filteredRows.forEach((item) => {
      const v = item?.ratings?.[key];
      const num = Number(v);

      if (num >= 1 && num <= 5) {
        counts[num]++;
        total++;
      }
    });

    const denom = total || 1;

    result.push({
      service: label,
      excellent: Math.round((counts[5] / denom) * 100),
      good: Math.round((counts[4] / denom) * 100),
      average: Math.round((counts[3] / denom) * 100),
      poor: Math.round((counts[2] / denom) * 100),
      veryPoor: Math.round((counts[1] / denom) * 100),
    });
  });

  return result;
}


  // ---------------- Trend helpers ----------------
  function pad2(n) { return String(n).padStart(2, "0"); }

  function weekOfYear(d) {
    const a = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = a.getUTCDay() || 7;
    a.setUTCDate(a.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(a.getUTCFullYear(), 0, 1));
    return Math.ceil((((a - yearStart) / 86400000) + 1) / 7);
  }

  function pickBucket(fromDate, toDate) {
    const ms = Math.max(1, toDate - fromDate);
    const days = Math.ceil(ms / 86400000);
    if (days <= 31) return "day";
    if (days <= 180) return "week";
    return "month";
  }

  function bucketKeyAndLabel(d, bucket) {
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const day = d.getDate();

    if (bucket === "day") {
      return {
        key: `${y}-${pad2(m)}-${pad2(day)}`,
        label: d.toLocaleDateString("en-US", { month: "short", day: "2-digit" }),
      };
    }

    if (bucket === "week") {
      const w = weekOfYear(d);
      return { key: `${y}-W${pad2(w)}`, label: `W${pad2(w)} ${y}` };
    }

    return {
      key: `${y}-${pad2(m)}`,
      label: d.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
    };
  }

  function getRangeFromRows(list) {
    let min = Infinity, max = -Infinity;
    for (const r of list) {
      const t = +new Date(r.createdAt);
      if (!isNaN(t)) {
        if (t < min) min = t;
        if (t > max) max = t;
      }
    }
    if (!isFinite(min) || !isFinite(max)) {
      const now = Date.now();
      return { from: new Date(now), to: new Date(now) };
    }
    return { from: new Date(min), to: new Date(max) };
  }

  function buildAutoTrend(list, dateFrom, dateTo) {
    let from = dateFrom ? new Date(dateFrom) : null;
    let to = dateTo ? new Date(dateTo) : null;
    if (!from || !to || isNaN(from) || isNaN(to)) {
      const r = getRangeFromRows(list);
      from = r.from; to = r.to;
    }

    const bucket = pickBucket(from, to);
    const map = new Map();

    for (const row of list) {
      const d = new Date(row.createdAt);
      if (isNaN(d)) continue;
      const { key, label } = bucketKeyAndLabel(d, bucket);
      if (!map.has(key)) map.set(key, { sum: 0, count: 0, label });
      const b = map.get(key);
      b.sum += (row.rating || 0);
      b.count += 1;
    }

    let trend = Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([, v]) => ({ date: v.label, value: round1(v.sum / v.count) }));

    const MAX_POINTS = 40;
    if (trend.length > MAX_POINTS) {
      const step = Math.ceil(trend.length / MAX_POINTS);
      trend = trend.filter((_, i) => i % step === 0);
    }

    return { trend, bucket };
  }

  // ---------------- UI helpers ----------------
const getRatingStars = (rating = 0) => {
  const totalStars = 5;
  const filledStars = Math.floor(rating); // full yellow stars
  const fractionalPart = rating - filledStars; // 0.0–0.99 (for partial fill)

  return (
    <div className="flex items-center">
      {Array.from({ length: totalStars }, (_, i) => {
        if (i < filledStars) {
          // 🟡 Full star
          return (
            <Star
              key={i}
              className="w-4 h-4 text-yellow-400 fill-current"
            />
          );
        } else if (i === filledStars && fractionalPart > 0) {
          // 🌓 Partial star — fill % based on fractional value
          const fillPercent = Math.round(fractionalPart * 100); // 0–100
          return (
            <div key={i} className="relative w-4 h-4">
              {/* Base gray star */}
              <Star className="absolute w-4 h-4 text-gray-300" />
              {/* Overlay yellow clipped to percentage */}
              <Star
                className="absolute w-4 h-4 text-yellow-400"
                style={{
                  clipPath: `inset(0 ${100 - fillPercent}% 0 0)`,
                  transition: "clip-path 0.3s ease",
                }}
              />
            </div>
          );
        } else {
          // ⚪ Empty star
          return (
            <Star
              key={i}
              className="w-4 h-4 text-gray-300"
            />
          );
        }
      })}
      {/* Numeric value beside stars */}
      <span className="ml-1 text-sm font-medium text-gray-700">
        {rating.toFixed(1)}/5
      </span>
    </div>
  );
};


  function buildDistribution(list = []) {
    const buckets = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    list.forEach((r) => {
      const rounded = Math.max(1, Math.min(5, Math.round(r.rating || 0)));
      if (buckets[rounded] != null) buckets[rounded] += 1;
    });
    const total = list.length || 1;
    return [
      { label: "Excellent", count: buckets[5], percentage: Math.round((buckets[5] / total) * 100), color: "#10B981" },
      { label: "Good", count: buckets[4], percentage: Math.round((buckets[4] / total) * 100), color: "#3B82F6" },
      { label: "Average", count: buckets[3], percentage: Math.round((buckets[3] / total) * 100), color: "#06B6D4" },
      { label: "Poor", count: buckets[2], percentage: Math.round((buckets[2] / total) * 100), color: "#EAB308" },
      { label: "Very Poor", count: buckets[1], percentage: Math.round((buckets[1] / total) * 100), color: "#F97316" },
    ];
  }


  const fetchOPD = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await ApiGet(`${API_URL}`);
      console.log('res', res)
      const data = Array.isArray(res?.data) ? res.data : [];

      setRawOPD(data);

      const list = data.map((d) => {
        const rating = calcRowAverage(d.ratings);
        return {
          id: String(d._id || d.id),
          createdAt: d.createdAt || d.date,
          patient: d.patientName || d.name || "-",
          contact: d.contact || "-",
          bedNo: d.bedNo || "-",
          consultantDoctorName: d.consultantDoctorNamez?.name || "-",
          rating,
          overallRecommendation: d.overallRecommendation,
          comments: d.comments || "-",
        };
      });

      const avg = list.length
        ? round1(list.reduce((s, r) => s + (r.rating || 0), 0) / list.length)
        : 0;

      const nps = calcNpsPercent(list);
      const overallScore = getOverallScoreLabel(avg);


      setRows(list);
      setKpiData({ totalFeedback: list.length, averageRating: avg, npsRating: nps, overallScore });
      setChartData(buildDistribution(list));
      setServiceSummary(buildServiceSummary(list));
    } catch (e) {
      console.error("Fetch OPD failed:", e);
      setError("Failed to load OPD feedback");
      setRows([]);
      setKpiData({ totalFeedback: 0, averageRating: 0, npsRating: 0, overallScore: "-" });
      setChartData(buildDistribution([]));
    } finally {
      setLoading(false);
    }
  }, []);


  useEffect(() => {
    fetchOPD()
  }, [fetchOPD])

  useEffect(() => {
  if (!Array.isArray(rawOPD) || !rawOPD.length) {
    setRows([]);
    setKpiData({ totalFeedback: 0, averageRating: 0, npsRating: 0, overallScore: "-" });
    setChartData(buildDistribution([]));
    setServiceSummary([]);
    setLineData([]);
    return;
  }

  const start = dateFrom ? new Date(dateFrom) : null;
  const end = dateTo ? new Date(dateTo) : null;
  if (start) start.setHours(0, 0, 0, 0);
  if (end) end.setHours(23, 59, 59, 999);

  const doctorFilter = (doctor || "").trim().toLowerCase();
  const roomFilter = (room || "").trim().toLowerCase();
  const serviceFilter = (service || "").trim().toLowerCase().replace(/\s+/g, "");

  // ✅ Filtering logic
  const filteredDocs = rawOPD.filter((d) => {
    // 🔹 Date filter
    const dt = new Date(d.createdAt || d.date);
    if (isNaN(dt)) return false;
    if (start && dt < start) return false;
    if (end && dt > end) return false;

    // 🔹 Doctor filter
    if (doctorFilter && doctorFilter !== "all doctors") {
      const nm = (d.consultantDoctorName?.name || d.doctorName || "").trim().toLowerCase();
      if (!nm.includes(doctorFilter)) return false;
    }

    // 🔹 Service filter
    if (serviceFilter && serviceFilter !== "allservices") {
      const ratings = d?.ratings || {};
      const hasService = Object.keys(ratings).some((key) =>
        key.toLowerCase().includes(serviceFilter)
      );
      if (!hasService) return false;
    }

    // 🔹 Room filter
    if (roomFilter && roomFilter !== "all rooms") {
      const b = String(d.bedNo ?? "").trim().toLowerCase();
      if (b !== roomFilter) return false;
    }

    return true;
  });

  // ✅ Build display rows
  const list = filteredDocs.map((d) => {
    const rating = calcRowAverage(d.ratings);
    return {
      id: String(d._id || d.id),
      createdAt: d.createdAt || d.date,
      patient: d.patientName || d.name || "-",
      contact: d.contact || "-",
      bedNo: d.bedNo || "-",
      consultantDoctorName: d.consultantDoctorName?.name || "-",
      rating,
      overallRecommendation: d.overallRecommendation,
      comments: d.comments,
    };
  });

  // ✅ KPI & Charts
  const avg = list.length
    ? round1(list.reduce((s, r) => s + (r.rating || 0), 0) / list.length)
    : 0;
  const nps = calcNpsPercent(filteredDocs);
  const overallScore = getOverallScoreLabel(avg);

  setRows(list);
  setKpiData({
    totalFeedback: list.length,
    averageRating: avg,
    npsRating: nps,
    overallScore,
  });

  setChartData(buildDistribution(list));
  setServiceSummary(buildServiceSummary(filteredDocs));

  // ✅ Line chart trend
  const { trend, bucket } = buildAutoTrend(list, dateFrom, dateTo);
  setTrendBucket(bucket);
  setLineData(trend);
}, [rawOPD, dateFrom, dateTo, doctor, service, room]);



  useEffect(() => {
    const { trend, bucket } = buildAutoTrend(rows, dateFrom, dateTo);
    setTrendBucket(bucket);
    setLineData(trend);
  }, [rows, dateFrom, dateTo])

  // ---------------- Search + Export ----------------
const filteredFeedback = rows
  .filter((f) => {
    const q = searchTerm.toLowerCase();

    return (
      f.patient?.toLowerCase().includes(q) ||
      f.contact?.toLowerCase().includes(q) ||
      String(f.consultantDoctorName || "")
        .toLowerCase()
        .includes(q) ||
      f.comments?.toLowerCase().includes(q)
    );
  })
  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // latest first
  .slice(0, 5); // only top


  const exportToExcel = async () => {

    const XLSX = await import("xlsx")

    const feedbackRows = filteredFeedback.map((f) => ({
      Date: formatDate(f.createdAt),
      "Patient Name": f.patient,
      Contact: f.contact,
      "Doctor Name": f.consultantDoctorName?.name,
      "Average Rating (/5)": f.rating,
      ...(typeof f.overallRecommendation === "number"
        ? { "Overall Recommendation (NPS)": f.overallRecommendation }
        : {}),
      comments: f.comments
    }))

    const feedbackHeaders = feedbackRows.length
      ? Object.keys(feedbackRows[0])
      : ["Date", "Patient Name", "Contact", "Doctor Name", "Average Rating (/5)"]

    const wsFeedback = XLSX.utils.json_to_sheet(feedbackRows, { header: feedbackHeaders })

    const feedbackCols = feedbackHeaders.map((key) => {
      const headerLen = String(key).length
      const maxCellLen = feedbackRows.reduce(
        (m, r) => Math.max(m, String(r[key] ?? "").length),
        0
      )
      return { wch: Math.min(Math.max(headerLen, maxCellLen) + 2, 60) }
    })
    wsFeedback["!cols"] = feedbackCols

    let wsSummary = null
    if (Array.isArray(serviceSummary) && serviceSummary.length) {
      const summaryRows = serviceSummary.map((s) => ({
        Service: s.service,
        "Excellent %": s.excellent,
        "Good %": s.good,
        "Average %": s.average,
        "Poor %": s.poor,
        "Very Poor %": s.veryPoor,
        ...(Array.isArray(s.usedFields) ? { "Fields Used": s.usedFields.join(", ") } : {}),
      }))
      wsSummary = XLSX.utils.json_to_sheet(summaryRows)
      const summaryHeaders = Object.keys(summaryRows[0] || { Service: "" })
      wsSummary["!cols"] = summaryHeaders.map((key) => {
        const headerLen = String(key).length
        const maxCellLen = summaryRows.reduce(
          (m, r) => Math.max(m, String(r[key] ?? "").length),
          0
        )
        return { wch: Math.min(Math.max(headerLen, maxCellLen) + 2, 60) }
      })
    }

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, wsFeedback, "Patient Feedback")
    if (wsSummary) XLSX.utils.book_append_sheet(wb, wsSummary, "Service Summary")

    const fileName = `OPD_Feedback_${new Date().toISOString().slice(0, 10)}.xlsx`
    XLSX.writeFile(wb, fileName)
  }

  const handleOpdFeedbackDetails = useCallback((row) => {
    const id = row?.id || row?._id;
    if (!id) {
      console.error("No id on OPD row:", row);
      alert("No id found for this feedback.");
      return;
    }
    // ✅ pass id (and the shallow row) via navigation state; no id in URL
    navigate("/Opd-feedback-details", {
      state: { id, feedback: row, from: "opd" },
    });
  }, [navigate]);

  // ---------------- Small components ----------------
  const DonutChart = ({ data }) => {
    const size = 160
    const strokeWidth = 30
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius

    const [animated, setAnimated] = useState(false)
    const [hoverIndex, setHoverIndex] = useState(null)

    useEffect(() => {
      const timeout = setTimeout(() => setAnimated(true), 100)
      return () => clearTimeout(timeout)
    }, [])

    let cumulativePercentage = 0

    return (
      <div className="flex flex-col items-center">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Base ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
          />
          {/* Segments */}
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
                style={{
                  transition: 'stroke-dashoffset 1s ease, stroke 0.3s',
                  cursor: 'pointer',
                  filter: hoverIndex === index ? 'brightness(1.2)' : 'none',
                }}
                onMouseEnter={() => setHoverIndex(index)}
                onMouseLeave={() => setHoverIndex(null)}
              />
            )
          })}
        </svg>

        {/* Legend */}
        <div className="mt-6 w-full  flex-wrap flex sm:grid-cols-2 gap-x-3 gap-y-1 justify-center px-[10px]  text-sm">
          {data.map((item, index) => {
            const color = item.color || defaultColors[index % defaultColors.length]
            return (
              <div
                key={index}
                className={`flex items-center  transition-all duration-200 ${hoverIndex === index ? 'scale-[1.02]' : ''}`}
                onMouseEnter={() => setHoverIndex(index)}
                onMouseLeave={() => setHoverIndex(null)}
              >
                <div
                  className="w-2 h-2 rounded-full mr-2"
                  style={{ backgroundColor: color }}
                />
                <span className="text-gray-800 text-[12px]">
                  {item.label}: <strong className=" font-[500]">{item.count}</strong> ({item.percentage}%)
                </span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }



  const [showPopup, setShowPopup] = useState(null);

  // 🎯 Handlers for each KPI
  const handleWidgetClick = (type) => {
    switch (type) {
      case "totalFeedback":
        // navigate("/dashboard/ipd-opd-list");
        navigate("/dashboard/ipd-opd-list", { state: { select: "OPD" } })
        break;
      case "npsRating":
        navigate("/reports/nps-all-list");
        break;
      case "averageRating":
        setShowPopup("averageRating");
        break;
      case "overallScore":
        setShowPopup("overallScore");
        break;
      default:
        break;
    }
  };
  // ---------------- Render ----------------
  return (
    <>
      <section className="flex font-Poppins w-[100%] h-[100%] select-none  overflow-hidden">
        <div className="flex w-[100%] flex-col gap-[0px] h-[100vh]">
<Header
  pageName="OPD"
  doctors={doctorOptions}
  onDateRangeChange={({ from, to, doctor, service }) => {
    setDateFrom(from);
    setDateTo(to);
    setDoctor(doctor || "All Doctors");
    setService(service || "All Services");
  }}
/>



          <div className="flex  w-[100%] h-[100%]">
            <SideBar />

            <div className="flex flex-col w-[100%]  relative max-h-[93%]  md34:!pb-[120px] m md11:!pb-[30px] py-[10px] px-[10px]  overflow-y-auto gap-[10px] rounded-[10px]">
              <Preloader />

              <div className="mx-auto  w-[100%] overflow-x-hidden">
                {/* KPI Cards */}
                <div className="grid md34:!grid-cols-2 md11:!grid-cols-4 gap-x-[10px] w-[100%]">
                  {/* 📨 Total Feedback (Navigate) */}
                  <div onClick={() => handleWidgetClick("totalFeedback")} className="cursor-pointer">
                    <Widgets1
                      data={{
                        title: "Total Feedback",
                        gros: kpiData.totalFeedback,
                        total: kpiData.totalFeedback,
                        color: "primary",
                        icon: <MessageSquare className="w-5 h-5 text-[#7366ff]" />,
                      }}
                    />
                  </div>

                  {/* ⭐ Average Rating (Modal) */}
                  <div onClick={() => handleWidgetClick("averageRating")} className="cursor-pointer">
                    <Widgets1
                      data={{
                        title: "Average Rating",
                        gros: `${kpiData.averageRating}`,
                        total: `${kpiData.averageRating}`,
                        color: "warning",
                        icon: <Star className="w-5 h-5 text-yellow-600" />,
                      }}
                    />
                  </div>

                  {/* 👍 NPS Rating (Navigate) */}
                  <div onClick={() => handleWidgetClick("npsRating")} className="cursor-pointer">
                    <Widgets1
                      data={{
                        title: "NPS Rating",
                        gros: `${kpiData.npsRating}%`,
                        total: `${kpiData.npsRating}%`,
                        color: "success",
                        icon: <ThumbsUp className="w-5 h-5 text-green-600" />,
                      }}
                    />
                  </div>

                  {/* 🏆 Overall Score (Modal) */}
                  <div onClick={() => handleWidgetClick("overallScore")} className="cursor-pointer">
                    <Widgets1
                      data={{
                        title: "Overall Score",
                        total: (
                          <span
                            className={`font-semibold ${kpiData.overallScore === "Excellent"
                                ? "text-green-600"
                                : kpiData.overallScore === "Good"
                                  ? "text-blue-600"
                                  : kpiData.overallScore === "Average"
                                    ? "text-yellow-600"
                                    : kpiData.overallScore === "Poor"
                                      ? "text-orange-600"
                                      : "text-red-600"
                              }`}
                          >
                            {kpiData.overallScore}
                          </span>
                        ),
                        gros: kpiData.overallScore,
                        color: "purple",
                        icon: <Award className="w-5 h-5 text-purple-600" />,
                      }}
                    />
                  </div>
                </div>

                {/* 🌟 Popups for Average Rating & Overall Score */}
                <AnimatePresence>
                  {showPopup && (
                    <motion.div
                      className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl relative"
                      >
                        {/* Close Button */}
                        <button
                          onClick={() => setShowPopup(null)}
                          className="absolute top-3 right-3 text-gray-500 hover:text-red-600"
                        >
                          <XCircle className="w-6 h-6" />
                        </button>

                        {/* Title */}
                        <h2 className="text-xl font-semibold mb-3 text-gray-800">
                          {showPopup === "averageRating"
                            ? "Average Rating Overview"
                            : "Overall Score Summary"}
                        </h2>

                        {/* Description */}
                        <p className="text-gray-600 text-sm leading-relaxed mb-4">
                          {showPopup === "averageRating"
                            ? "The Average Rating represents the mean satisfaction level across all feedback received. Aim for 4.5+ for exceptional service quality."
                            : "Overall Score is a combined evaluation of patient satisfaction, response rate, and service quality. Higher scores reflect consistent excellence across departments."}
                        </p>

                        {/* Values */}
                        <div className="mt-4 text-center">
                          <p
                            className={`text-4xl font-bold ${showPopup === "averageRating"
                                ? "text-yellow-600"
                                : kpiData.overallScore === "Excellent"
                                  ? "text-green-600"
                                  : kpiData.overallScore === "Good"
                                    ? "text-blue-600"
                                    : kpiData.overallScore === "Average"
                                      ? "text-yellow-600"
                                      : kpiData.overallScore === "Poor"
                                        ? "text-orange-600"
                                        : "text-red-600"
                              }`}
                          >
                            {showPopup === "averageRating"
                              ? kpiData.averageRating
                              : kpiData.overallScore}
                          </p>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Charts Row */}
                <div className="flex  md11:!flex-row flex-col  justify-start  gap-[15px] mb-2  ">
                  {/* Rating Distribution Donut Chart */}
                  <div className="bg-white rounded-xl h-fit dashShadow md34:!w-[100%] md:!w-[300px]  p-[13px]">
                    <div className=' flex  mb-[10px] items-center gap-[10px]'>


                      <div className="w-[35px] h-[35px] bg-gradient-to-br from-blue-500 to-indigo-500 rounded-md flex items-center justify-center">
                        <i className=" text-[#fff] text-[15px] fa-solid fa-star-sharp-half-stroke"></i>
                      </div>
                      <h3 className="text-[13px] font-[500] text-gray-900">Rating Distribution</h3>
                    </div>
                    <div className="flex justify-center">
                      <DonutChart data={chartData} />
                    </div>
                  </div>

                  {/* Average Rating Trend Line Chart */}
                  <div className="bg-white rounded-xl md34:!w-[100%] md11:!w-[440px]  md13:!w-[550px]   dashShadow  p-[13px] ">
                    <div className=' flex   mb-[10px] items-center gap-[10px]'>

                      <div className="w-[35px] h-[35px] bg-gradient-to-br from-blue-500 to-indigo-500 rounded-md flex items-center justify-center">
                        <i className="fa-regular fa-chart-simple text-[#fff] text-[15px]"></i>
                      </div>
                      <h3 className="text-[13px] font-[500] text-gray-900 ">


                        Feedback Trend <span className="ml-2 text-xs text-gray-500">({trendBucket})</span>
                      </h3>
                    </div>
                    <div className="h-[250px] pr-[10px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RLineChart
                          data={lineData.length ? lineData : [{ date: "-", value: 0 }]}
                          margin={{ left: -40, right: 0, top: 20, bottom: 0 }}>

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

                  <div className="bg-white  dashShadow  md:!w-[400px] rounded-xl p-[13px]  ">
                    <div className=' flex  mb-[17px] items-center gap-[10px]'>

                      <div className="w-[35px] h-[35px] bg-gradient-to-br from-blue-500 to-indigo-500 rounded-md flex items-center justify-center">
                        <i className="fa-solid  text-[15px] text-[#fff] fa-keyboard-brightness"></i>
                      </div>
                      <h3 className="ext-[13px] font-[500] text-gray-900">Feedback Keywords</h3>
                    </div>
                   
                    <div className="bg-white   ">
                      <div className="flex flex-wrap gap-2">
                        {frequentRatings.length ? (
                          frequentRatings.map((word, index) => (
                            <span
                              key={index}
                              className={`px-4 py-[3px] rounded-full border text-[13px] font-medium ${index % 6 === 0
                                ? "bg-blue-100 border-blue-800 text-blue-800"
                                : index % 6 === 1
                                  ? "bg-green-100 border-green-800 text-green-800"
                                  : index % 6 === 2
                                    ? "bg-yellow-100 border-yellow-800 text-yellow-800"
                                    : index % 6 === 3
                                      ? "bg-purple-100 border-purple-800 text-purple-800"
                                      : index % 6 === 4
                                        ? "bg-red-100 border-red-800 text-red-800"
                                        : "bg-indigo-100 border-indigo-800 text-indigo-800"
                                }`}
                            >
                              {word}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-500 text-sm">No frequent ratings yet</span>
                        )}
                      </div>
                    </div>

                  </div>
                </div>

                {/* Word Cloud */}


                {/* Service Summary + Extra Donut */}
                <div className="flex w-[100%] mb-[15px] gap-[30px]">
                  {/* Service-Wise Summary Table */}
                  <div className=" rounded-xl  w-[100%]  overflow-hidden">
                    <div className="px-2 items-center py-[8px] flex  mt-[5px] gap-[10px] border-gray-200">
                      <div className="w-[35px] h-[35px]  bg-gradient-to-br from-blue-500 to-indigo-500 rounded-md flex items-center justify-center">
                        <i className="fa-solid  text-[15px] text-[#fff] fa-user-md"></i>

                      </div>
                      <h3 className="text-[13px] font-[500] text-gray-900 ">Service-Wise Summary</h3>
                    </div>
                    <div className="overflow-x-auto border  rounded-[10px]">
                      <table className=" min-w-[800px] md11:!min-w-full">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-6 py-[13px] text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                              Service
                            </th>
                            <th className="px-6 py-[13px] text-center text-[11px] font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                              Excellent %
                            </th>
                            <th className="px-6 py-[13px] text-center text-[11px] font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                              Good %
                            </th>
                            <th className="px-6 py-[13px] text-center text-[11px] font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                              Average %
                            </th>
                            <th className="px-6 py-[13px] text-center text-[11px] font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                              Poor %
                            </th>
                            <th className="px-6 py-[13px] text-center text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                              Very Poor %
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white">
                          {serviceSummary.map((service, index) => {
                            const Icon = serviceIcons[service.service] || User; // fallback icon
                            return (
                              <tr key={index} className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50 transition-colors`}>
                                <td className="px-6 flex gap-[10px] py-[10px] text-sm font-medium text-gray-900 border-r border-gray-200">           <Icon className="w-4 h-4 text-gray-600" />
                                  {service.service}</td>
                                <td className="px-6 py-[10px] text-center text-sm border-r border-gray-200">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#10B981] text-white">{service.excellent}%</span>
                                </td>
                                <td className="px-6 py-[10px] text-center text-sm border-r border-gray-200">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#3B82F6] text-white">{service.good}%</span>
                                </td>
                                <td className="px-6 py-[10px] text-center text-sm border-r border-gray-200">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#06B6D4] text-white">{service.average}%</span>
                                </td>
                                <td className="px-6 py-[10px] text-center text-sm border-r border-gray-200">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#EAB308] text-[#fff]">{service.poor}%</span>
                                </td>
                                <td className="px-6 py-[10px] text-center text-sm">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F97316] text-white">{service.veryPoor}%</span>
                                </td>
                              </tr>
                            );
                          })}


                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Extra Donut (optional) */}
                  {/* <div className="flex">
                        <div className="bg-white w-[100%] rounded-lg border shadow-md p-4">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Service-Wise Chart</h3>
                          <div className="flex">
                            <DonutChart data={chartData} />
                          </div>
                        </div>
                      </div> */}
                </div>

                {/* Patient-Wise Feedback Table */}
                <div className= "rounded-xl e md34:!mb-[60px] md11:!mb-0    overflow-hidden">
                  <div className="px-2  pt-[5px] pb-[13px]   border-gray-200 flex flex-col sm:flex-row justify-between md77:!items-center">
                    <div className=' flex gap-[10px] items-center    justify-start '>


                      <div className="w-[35px] h-[35px] bg-gradient-to-br from-blue-500 to-indigo-500 rounded-md flex items-center justify-center">
                        <i className="fa-regular fa-users-medical text-[15px] text-[#fff] "></i>
                      </div>
                      <h3 className="text-[13px] font-[500] text-gray-900">Patient Feedback Details</h3>
                    </div>
                    <div className="flex flex-row justify-between gap-2   mt-[10px] md md11:!mb-0">
                      <div className="relative">
                        <Search className="absolute left-3 top-[18px] transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          placeholder="Search feedback..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 pr-[6px] py-[6px]  border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      {/* Export only if permitted */}
                      <div className=' flex gap-[10px]'>

                 
                        <button

                          className="flex items-center px-2 py-[6px] h-[35px] w-[37px] bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                          onClick={handlenavigate}
                        >
                          <Eye className="w-5 h-5 " />

                        </button>
                      </div>
                    </div>
                  </div>
                  

                  <div className="overflow-x-auto border  rounded-[10px]">
                    <table className=" min-w-[1200px] md11:!min-w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-[10px] text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                            Date & Time
                          </th>
                          <th className="px-6 py-[10px] text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                            Patient Name
                          </th>
                          <th className="px-6 py-[10px] text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                            Contact
                          </th>
                          <th className="px-6 py-[10px] text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                            Doctor Name
                          </th>
                          <th className="px-6 py-[10px] text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                            Rating
                          </th>
                          <th className="px-6 py-[10px] text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider  border-gray-200">Comment</th>
                        </tr>
                      </thead>
                                            {filteredFeedback.length === 0 && (
  <div className="py-6 text-center text-gray-500 text-sm">
    No feedback found
  </div>
)}
                      <tbody className="bg-white">
                        {filteredFeedback.map((feedback, index) => (
                          <tr
                            key={feedback.id}
                            className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50  cursor-pointer transition-colors`}
                            onClick={() => handleOpdFeedbackDetails(feedback)}
                          >
                            <td className="px-4 py-2 text-sm text-gray-900 border-r border-gray-200">
                              <div className="flex items-center">
                                <CalendarClock className="w-4 h-4 text-gray-400 mr-2" />
                                {formatDate(feedback.createdAt)}
                              </div>
                            </td>
                            <td className="px-6 py-[10px] text-sm font-medium text-gray-900 border-r border-gray-200">
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
                            <td className="px-4 py-2 text-sm text-gray-900 border-r border-gray-200">
                              <div className="flex items-center">
                                <Stethoscope className="w-4 h-4 text-gray-400 mr-2" />
                                {feedback.consultantDoctorName}
                              </div>
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900 border-r border-gray-200">
                              <div className="flex items-center">
                                {getRatingStars(feedback.rating)}
                                {/* <span className="ml-2 text-sm font-medium">{feedback.rating}/5</span> */}
                              </div>
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900  border-gray-200">

                              <div className="flex text-[12px] items-center">
                                {feedback.comments || "-"}
                              </div>
                            </td>
                          </tr>
                        ))} 
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Error state (optional) */}
                {error && (
                  <div className="text-red-600 text-sm mt-3 px-2">
                    {error}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

