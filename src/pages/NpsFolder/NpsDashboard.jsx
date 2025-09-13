"use client"

import { useMemo, useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, ChevronDown, Hospital, User, Activity, HeartPulse, Frown, Minus, Search } from "lucide-react"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts"
import Header from "../../Component/header/Header"
import SideBar from "../../Component/sidebar/CubaSideBar"




// Animated dropdown (no UI library used)
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
      {label &&     <label className="block  text-[10px] font-medium top-[-8px] left-[10px] border-gray-300  bg-white border px-[10px] rounded-[10px] z-[3] absolute text-gray-700 mb-1">{label}</label>}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
        className={`w-full flex items-center justify-between px-3 py-2 border rounded-md bg-white transition-colors ${
          disabled
            ? "border-gray-200 text-gray-400 cursor-not-allowed"
            : "border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sky-500"
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

// KPI Card
function KpiCard({ title, value, subtitle, icon: Icon, color = "text-gray-600", bg = "bg-gray-50" }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 flex items-center gap-4 hover:shadow transition-shadow">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${bg}`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-gray-500">{title}</p>
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  )
}

// Simple deterministic PRNG to generate stable mock data from strings
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

const DOCTORS_BY_DEPT = {
  OPD: ["Dr. Sharma", "Dr. Mehta", "Dr. Patel", "Dr. Gupta"],
  IPD: ["Dr. Rao", "Dr. Singh", "Dr. Das", "Dr. Iyer"],
}
const PATIENT_FIRST = ["Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Reyansh", "Mohammed", "Krishna", "Ishaan"]
const PATIENT_LAST = ["Sharma", "Patel", "Gupta", "Kumar", "Verma", "Reddy", "Shah", "Sinha", "Joshi"]

function makePatientName(rng) {
  const f = PATIENT_FIRST[Math.floor(rng() * PATIENT_FIRST.length)]
  const l = PATIENT_LAST[Math.floor(rng() * PATIENT_LAST.length)]
  return `${f} ${l}`
}
function roomFor(dept, rng) {
  if (dept === "OPD") {
    return `OPD-${Math.floor(rng() * 50 + 1)}`
  }
  // IPD rooms like A-101 to D-520
  const wing = ["A", "B", "C", "D"][Math.floor(rng() * 4)]
  return `${wing}-${Math.floor(rng() * 420 + 100)}`
}

// Rating -> Category
function categoryFromRating(r) {
  if (r >= 9) return "Promoter"
  if (r >= 7) return "Passive"
  return "Detractor"
}

// Generate mock NPS records across date range for selected Department(s) and Doctor(s)
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

// Aggregate to daily percentages and NPS
function aggregateTrends(records, dates) {
  const dayMap = new Map()
  dates.forEach((d) => {
    dayMap.set(d, { date: d, Detractors: 0, Passives: 0, Promoters: 0, total: 0 })
  })

  records.forEach((r) => {
    const m = dayMap.get(r.date) || { date: r.date, Detractors: 0, Passives: 0, Promoters: 0, total: 0 }
    m.total++
    m[r.category + "s"]++
    dayMap.set(r.date, m)
  })

  const areaData = []
  const lineData = []

  for (const d of dates) {
    const m = dayMap.get(d)
    const total = m.total || 1
    const detr = Math.round((m.Detractors / total) * 100)
    const pass = Math.round((m.Passives / total) * 100)
    const prom = Math.round((m.Promoters / total) * 100)
    const nps = prom - detr
    areaData.push({
      date: d,
      Detractors: detr,
      Passives: pass,
      Promoters: prom,
    })
    lineData.push({
      date: d,
      NPS: nps,
    })
  }

  return { areaData, lineData }
}

export default function NpsDashboard() {
  // Filters
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - 14)
    return d.toISOString().slice(0, 10)
  })
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().slice(0, 10))
  const [department, setDepartment] = useState("Both")
  const [doctor, setDoctor] = useState("All Doctors")
  const [room, setRoom] = useState("All Rooms")

  // Table controls
  const [query, setQuery] = useState("")
  const [showDetractors, setShowDetractors] = useState(true)
  const [showPassives, setShowPassives] = useState(true)
  const [showPromoters, setShowPromoters] = useState(true)

  // Dropdown options
  const deptOptions = ["OPD", "IPD", "Both"]
  const doctorOptions = useMemo(() => {
    if (department === "Both") return ["All Doctors", ...DOCTORS_BY_DEPT.OPD, ...DOCTORS_BY_DEPT.IPD]
    return ["All Doctors", ...(DOCTORS_BY_DEPT[department] || [])]
  }, [department])

  // Generate base dataset and filter it
  const baseRecords = useMemo(() => {
    const deptParam = department
    const doctorParam = doctor === "All Doctors" ? undefined : doctor
    return generateNpsDataset({ from: dateFrom, to: dateTo, department: deptParam, doctor: doctorParam })
  }, [dateFrom, dateTo, department, doctor])

  // Room options derive from current baseRecords
  const roomOptions = useMemo(() => {
    const rooms = Array.from(new Set(baseRecords.map((r) => r.room))).sort((a, b) => a.localeCompare(b))
    return ["All Rooms", ...rooms.slice(0, 200)] // limit to keep dropdown manageable
  }, [baseRecords])

  // Ensure selected room remains valid
  useEffect(() => {
    if (!roomOptions.includes(room)) setRoom("All Rooms")
  }, [roomOptions, room])

  // Apply room + query + category filters for table & kpis/charts
  const filteredRecords = useMemo(() => {
    return baseRecords.filter((r) => {
      if (room !== "All Rooms" && r.room !== room) return false
      if (query) {
        const q = query.toLowerCase()
        const match =
          r.patient.toLowerCase().includes(q) ||
          r.room.toLowerCase().includes(q) ||
          r.doctor.toLowerCase().includes(q) ||
          r.comment.toLowerCase().includes(q)
        if (!match) return false
      }
      if (r.category === "Detractor" && !showDetractors) return false
      if (r.category === "Passive" && !showPassives) return false
      if (r.category === "Promoter" && !showPromoters) return false
      return true
    })
  }, [baseRecords, room, query, showDetractors, showPassives, showPromoters])

  // Compute trends
  const dates = useMemo(() => getDateRange(dateFrom, dateTo), [dateFrom, dateTo])
  const { areaData, lineData } = useMemo(() => aggregateTrends(filteredRecords, dates), [filteredRecords, dates])

  // KPIs
  const kpi = useMemo(() => {
    const total = filteredRecords.length || 1
    const detractors = filteredRecords.filter((r) => r.category === "Detractor").length
    const passives = filteredRecords.filter((r) => r.category === "Passive").length
    const promoters = filteredRecords.filter((r) => r.category === "Promoter").length
    const pDetr = Math.round((detractors / total) * 100)
    const pPass = Math.round((passives / total) * 100)
    const pProm = Math.round((promoters / total) * 100)
    const nps = pProm - pDetr
    return { pDetr, pPass, pProm, nps, total }
  }, [filteredRecords])

  // Chart keys to re-trigger animation on data change
  const areaKey = JSON.stringify({
    dateFrom,
    dateTo,
    department,
    doctor,
    room,
    showDetractors,
    showPassives,
    showPromoters,
  })
  const lineKey = areaKey

  return (
  <>

     <section className="flex w-[100%] h-[100%] select-none   pr-[15px] overflow-hidden">
        <div className="flex w-[100%] flex-col gap-[0px] h-[96vh]">
          <Header pageName="NPS Trends (OPD + IPD)" />
          <div className="flex  w-[100%] h-[100%]">
            <SideBar />
            <div className="flex flex-col w-[100%] max-h-[90%] pb-[50px] py-[10px] px-[10px] bg-[#fff] overflow-y-auto gap-[10px] rounded-[10px]">
            
 <div className="">
      <main className="">


        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 mb-3">
          <div className="grid grid-cols-1 pt-[3px] md:grid-cols-5 gap-x-4">
            {/* From date */}
            <div className=" relative">
              <label className="block  text-[10px] font-medium top-[-8px] left-[10px] border-gray-300  bg-white border px-[10px] rounded-[10px] z-[3] absolute text-gray-700 mb-1">From</label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  value={dateFrom}
                  max={dateTo}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full pl-9 text-[14px] pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>
            {/* To date */}
            <div className=" relative">
                <label className="block  text-[10px] font-medium top-[-8px] left-[10px] border-gray-300  bg-white border px-[10px] rounded-[10px] z-[3] absolute text-gray-700 mb-1">To</label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  value={dateTo}
                  min={dateFrom}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-[14px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>
            {/* Department */}
            <AnimatedDropdown
              label="Department"
              options={deptOptions}
              selected={department}
              onSelect={setDepartment}
              icon={Hospital}
            />
            {/* Doctor */}
            <AnimatedDropdown
              label="Doctor Name"
              options={doctorOptions}
              selected={doctor}
              onSelect={setDoctor}
              icon={User}
            />
            {/* Room */}
            <AnimatedDropdown
              label="Room No"
              options={roomOptions}
              selected={room}
              onSelect={setRoom}
              icon={Activity}
              disabled={roomOptions.length === 0}
            />
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
          <KpiCard
            title="Detractors %"
            value={`${kpi.pDetr}%`}
            icon={Frown}
            color="text-red-600"
            bg="bg-red-50"
            subtitle={`${kpi.total} total`}
          />
          <KpiCard
            title="Passives %"
            value={`${kpi.pPass}%`}
            icon={Minus}
            color="text-amber-600"
            bg="bg-amber-50"
            subtitle={`${kpi.total} total`}
          />
          <KpiCard
            title="Promoters %"
            value={`${kpi.pProm}%`}
            icon={HeartPulse}
            color="text-emerald-600"
            bg="bg-emerald-50"
            subtitle={`${kpi.total} total`}
          />
          <KpiCard
            title="Overall NPS"
            value={kpi.nps}
            icon={Activity}
            color="text-gray-600"
            bg="bg-gray-50"
            subtitle="Promoters − Detractors"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Stacked Area */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribution Over Time</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={areaData} key={areaKey} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradDetractors" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="gradPassives" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="gradPromoters" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#f3f4f6" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={{ fontSize: 12 }} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="Detractors"
                    stackId="1"
                    stroke="#ef4444"
                    fill="url(#gradDetractors)"
                    isAnimationActive
                    animationDuration={600}
                  />
                  <Area
                    type="monotone"
                    dataKey="Passives"
                    stackId="1"
                    stroke="#f59e0b"
                    fill="url(#gradPassives)"
                    isAnimationActive
                    animationDuration={600}
                  />
                  <Area
                    type="monotone"
                    dataKey="Promoters"
                    stackId="1"
                    stroke="#10b981"
                    fill="url(#gradPromoters)"
                    isAnimationActive
                    animationDuration={600}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Line NPS */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall NPS Trend</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData} key={lineKey} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                  <CartesianGrid stroke="#f3f4f6" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis domain={[-100, 100]} tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={{ fontSize: 12 }} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="NPS"
                    stroke="#374151"
                    strokeWidth={3}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                    isAnimationActive
                    animationDuration={600}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Table Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  checked={showDetractors}
                  onChange={(e) => setShowDetractors(e.target.checked)}
                />
                <span className="text-sm text-gray-700">Detractors</span>
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                  checked={showPassives}
                  onChange={(e) => setShowPassives(e.target.checked)}
                />
                <span className="text-sm text-gray-700">Passives</span>
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  checked={showPromoters}
                  onChange={(e) => setShowPromoters(e.target.checked)}
                />
                <span className="text-sm text-gray-700">Promoters</span>
              </label>
            </div>
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search patient, doctor, room, comment..."
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SR No
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Room No
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doctor Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    NPS Rating
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Comment
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredRecords.slice(0, 400).map((rec, idx) => (
                  <tr key={`${rec.datetime}-${idx}`} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-700">{idx + 1}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{rec.datetime}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{rec.patient}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{rec.room}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{rec.doctor}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{rec.rating}</td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          rec.category === "Promoter"
                            ? "bg-emerald-100 text-emerald-800"
                            : rec.category === "Passive"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {rec.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 max-w-sm truncate">{rec.comment || "-"}</td>
                  </tr>
                ))}
                {filteredRecords.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-gray-500">
                      No records match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {/* Footer summary */}
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 text-sm text-gray-600 flex items-center justify-between">
            <span>
              Showing {Math.min(400, filteredRecords.length)} of {filteredRecords.length} records
            </span>
            <span className="text-gray-500">Colors: Promoter (green), Passive (yellow), Detractor (red)</span>
          </div>
        </div>
      </main>
    </div>
            </div>

          </div>
        </div>
      </section>

    
  </>
  )
}
