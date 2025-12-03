"use client"

import { useMemo, useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, ChevronDown, Hospital, User, Activity, HeartPulse, Frown, Minus, Search, Eye } from "lucide-react"
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
import SideBar from "../../Component/sidebar/CubaSidebar"
import { ApiGet } from "../../helper/axios"
import Widgets1 from "../../Component/DashboardFiles/Components/Common/CommonWidgets/Widgets1"
import Preloader from "../../Component/loader/Preloader"
import { useNavigate } from "react-router-dom"
import ModernDatePicker from "../../Component/MainInputFolder/ModernDatePicker"


// ---------------- UI pieces (unchanged) ----------------
function AnimatedDropdown({ label, options, selected, onSelect, icon: Icon, disabled = false }) {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    if (!open) return
    const onEsc = (e) => e.key === "Escape" && setOpen(false)
    window.addEventListener("keydown", onEsc)
    return () => window.removeEventListener("keydown", onEsc)
  }, [open])
  return (
    <div className="relative">
      {label && (
        <label className="block text-[10px] font-medium top-[-8px] left-[10px] border-gray-300 bg-white border px-[10px] rounded-[10px] z-[3] absolute text-gray-700 mb-1">
          {label}
        </label>
      )}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
        className={`w-full flex items-center justify-between px-3 py-2 border rounded-md bg-white transition-colors ${disabled
          ? "border-gray-200 text-gray-400 cursor-not-allowed"
          : "border-gray-300 hover:bg-gray-50 focus:outline-none  focus:ring-sky-500"
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

// ---------------- utilities (kept) ----------------
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
function categoryFromRating(r) {
  if (r >= 9) return "Promoter"
  if (r >= 7) return "Passive"
  return "Detractor"
}

function aggregateTrends(records, dates) {
  const dayMap = new Map()
  dates.forEach((d) => dayMap.set(d, { date: d, Detractors: 0, Passives: 0, Promoters: 0, total: 0 }))

  records.forEach((r) => {
    const m = dayMap.get(r.date) || { date: r.date, Detractors: 0, Passives: 0, Promoters: 0, total: 0 }
    m.total++
    if (r.category === "Detractor") m.Detractors++
    else if (r.category === "Passive") m.Passives++
    else if (r.category === "Promoter") m.Promoters++
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
    areaData.push({ date: d, Detractors: detr, Passives: pass, Promoters: prom })
    lineData.push({ date: d, NPS: nps })
  }

  return { areaData, lineData }
}


// ---------------- NEW: real-data normalizers ----------------
const pick = (...vals) => vals.find((v) => v != null && v !== "") ?? "-"
const toNps = (v) => {
  const n = Number(v)
  return Number.isFinite(n) ? Math.max(0, Math.min(10, Math.round(n))) : null
}
const pickDoctor = (d) => pick(d.consultantDoctorName?.name, d.doctorName, d.doctor, d.consultant, "-")
const pickPatient = (d) => pick(d.patientName, d.name, d.patient, "-")
const pickCreatedAt = (d) => new Date(d.createdAt || d.date || d.dateTime || d.createdOn || Date.now())
const pickRoom = (d, dept) => (dept === "IPD" ? pick(d.bedNo, d.roomNo, d.room, "") : "-")
function inRange(dt, fromISO, toISO) {
  // if both filters are empty → show everything
  if (!fromISO && !toISO) return true;

  const t = +dt;
  const from = fromISO ? +new Date(`${fromISO}T00:00:00`) : 0;
  const to = toISO ? +new Date(`${toISO}T23:59:59`) : Date.now();

  return t >= from && t <= to;
}


// ============================================================
//                      COMPONENT
// ============================================================
export default function NpsDashboard() {
  // Filters (unchanged)
  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 6);

  const [dateFrom, setDateFrom] = useState(sevenDaysAgo.toISOString().slice(0, 10));
  const [dateTo, setDateTo] = useState(today.toISOString().slice(0, 10));


  const [department, setDepartment] = useState("Both")
  const [doctor, setDoctor] = useState("All Doctors")
  const [room, setRoom] = useState("All Rooms")

  // Table controls (unchanged)
  const [query, setQuery] = useState("")
  const [showDetractors, setShowDetractors] = useState(true)
  const [showPassives, setShowPassives] = useState(true)
  const [showPromoters, setShowPromoters] = useState(true)

  // -------- NEW: fetch real OPD/IPD data once --------
  const [rawOpd, setRawOpd] = useState([])
  const [rawIpd, setRawIpd] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate();


  const handlenavigate = () => {
    navigate("/reports/nps-all-list")
  };

  useEffect(() => {
    ; (async () => {
      try {
        setLoading(true)
        setError(null)
        const [opdRes, ipdRes] = await Promise.all([ApiGet("/admin/opd-patient"), ApiGet("/admin/ipd-patient")])
        console.log('opdRes', opdRes)
        console.log('ipdRes', ipdRes)
        setRawOpd(Array.isArray(opdRes) ? opdRes : opdRes?.data || [])
        setRawIpd(Array.isArray(ipdRes) ? ipdRes : ipdRes?.data?.patients || [])
      } catch (e) {
        console.error("NPS load failed:", e)
        setError("Failed to load NPS data.")
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  // Dropdown options now come from real data
  // Dropdown options now come from real data
  const deptOptions = ["OPD", "IPD", "Both"];

  // ✅ Doctor dropdown options (merged from OPD + IPD)
  const doctorOptions = useMemo(() => {
    const all = [];
    if (department === "Both" || department === "OPD") all.push(...(rawOpd || []));
    if (department === "Both" || department === "IPD") all.push(...(rawIpd || []));

    const set = new Set();
    all.forEach((d) => {
      const name =
        d.consultantDoctorName?.name ||
        d.doctorName ||
        d.consultantName ||
        d.doctor ||
        d.consultant ||
        d.Doctor ||
        "";
      if (name && typeof name === "string") set.add(name.trim());
    });

    return ["All Doctors", ...Array.from(set).filter(Boolean).sort((a, b) => a.localeCompare(b))];
  }, [department, rawOpd, rawIpd]);

  // ✅ Room dropdown options (IPD / Both only)
  const roomOptions = useMemo(() => {
    const all = [];
    if (department === "Both" || department === "IPD") all.push(...(rawIpd || []));

    const set = new Set();
    all.forEach((d) => {
      const room =
        d.bedNo ||
        d.roomNo ||
        d.bed_name ||
        d.room_name ||
        d.room ||
        d.bed ||
        "";
      if (room && typeof room === "string") set.add(room.trim());
    });

    return ["All Rooms", ...Array.from(set).filter(Boolean).sort((a, b) => a.localeCompare(b))];
  }, [department, rawIpd]);

  // ✅ Optional: Log to confirm data is visible
  useEffect(() => {
    console.log("👨‍⚕️ Doctor Options:", doctorOptions);
    console.log("🛏️ Room Options:", roomOptions);
  }, [doctorOptions, roomOptions]);


  // Map real docs -> records for charts/table, using overallRecommendation as NPS
  const baseRecords = useMemo(() => {
    const wantOPD = department === "OPD" || department === "Both";
    const wantIPD = department === "IPD" || department === "Both";
    const doctorFilter = doctor !== "All Doctors" ? doctor.toLowerCase() : null;

    const project = (list, dept) => {
      if (!Array.isArray(list)) return [];
      return list
        .map((d) => {
          const nps = toNps(d.overallRecommendation);
          if (nps === null) return null;

          const when = pickCreatedAt(d);
          if (!inRange(when, dateFrom, dateTo)) return null;

          const docName = pickDoctor(d);
          if (doctorFilter && docName.toLowerCase() !== doctorFilter) return null;

          const bed = pickRoom(d, dept);

          return {
            date: when.toISOString().slice(0, 10),
            datetime: when.toLocaleString(),
            patient: pickPatient(d),
            room: bed,
            doctor: docName,
            department: dept,
            rating: nps,
            category: categoryFromRating(nps),
            comment: pick(d.comments, d.comment, ""),
          };
        })
        .filter(Boolean);
    };

    let recs = [];
    if (wantOPD) recs = recs.concat(project(rawOpd, "OPD"));
    if (wantIPD) recs = recs.concat(project(rawIpd, "IPD"));

    return recs.sort((a, b) => a.date.localeCompare(b.date) || a.datetime.localeCompare(b.datetime));
  }, [rawOpd, rawIpd, department, doctor, dateFrom, dateTo]);


  // Room options from current dataset
  // const roomOptions = useMemo(() => {
  //   const rooms = Array.from(new Set(baseRecords.map((r) => r.room))).sort((a, b) => a.localeCompare(b))
  //   return ["All Rooms", ...rooms.slice(0, 200)]
  // }, [baseRecords])
  // useEffect(() => {
  //   if (!roomOptions.includes(room)) setRoom("All Rooms")
  // }, [roomOptions, room])

  // Apply room + query + category filters
  const filteredRecords = useMemo(() => {
    return baseRecords.filter((r) => {
      if (room && room !== "All Rooms" && r.room !== room) return false;
      if (doctor && doctor !== "All Doctors" && r.doctor !== doctor) return false;
      if (department && department !== "Both" && r.department !== department) return false;
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

  // Trends & KPIs (unchanged)
  const dates = useMemo(() => getDateRange(dateFrom, dateTo), [dateFrom, dateTo])
  const { areaData, lineData } = useMemo(() => aggregateTrends(filteredRecords, dates), [filteredRecords, dates])
  const kpi = useMemo(() => {
    const total = filteredRecords.length || 1
    const detractors = filteredRecords.filter((r) => r.category === "Detractor").length
    const passives = filteredRecords.filter((r) => r.category === "Passive").length
    const promoters = filteredRecords.filter((r) => r.category === "Promoter").length

    const detrPercent = Math.round((detractors / total) * 100)
    const passPercent = Math.round((passives / total) * 100)
    const promPercent = Math.round((promoters / total) * 100)
    const nps = promPercent - detrPercent

    console.log('detrPercent', detrPercent)
    console.log('passPercent', passPercent)

    return { detrPercent, passPercent, promPercent, nps }
  }, [filteredRecords])


  console.log('areaData', areaData)


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

  // ---------------- render (unchanged design) ----------------
  return (
    <>
      <section className="flex w-[100%] h-[100%] select-none  overflow-hidden">
        <div className="flex w-[100%] flex-col gap-[0px] h-[100vh]">
          <Header
            pageName="Nps Trends"
            onDateRangeChange={({ from, to, range, department, doctor, room }) => {
              setDateFrom(from || dateFrom);
              setDateTo(to || dateTo);
              setDepartment(department || "Both");
              setDoctor(doctor || "All Doctors");
              setRoom(room || "All Rooms");
            }}
            doctorOptions={doctorOptions}   // ✅ now passing data
            roomOptions={roomOptions}       // ✅ now passing data
            selectedRange="7 Days"
          />



          <div className="flex w-[100%] h-[100%]">
            <SideBar />
            <div className="flex flex-col relative  w-[100%] overflow-x-hidden max-h-[90%] py-[10px] px-[10px]  overflow-y-auto gap-[10px] ">
              <Preloader />
              <div className="">
                <main className="">
                  {/* optional lightweight state messages */}
                  {loading && <div className="text-sm text-gray-500 px-2 pb-1">Loading NPS…</div>}
                  {error && <div className="text-sm text-red-600 px-2 pb-1">{error}</div>}

                  {/* Filters */}
                  {/* <div className="bg-white rounded-lg shadow-sm border h-fit border-gray-100  px-3 pt-3 pb-3 mb-3">
                      <div className="grid grid-cols-2 md77:!grid-cols-3  md11:!grid-cols-5 h-fit gap-x-4">
                        <div className="relative md11:!mb-[0px] md34:!mb-[14px]">
            


                          <ModernDatePicker />
                        </div>
                        <div className="relative  md11:!mb-[0px] md34:!mb-[14px]">
      

                          <ModernDatePicker />



                        </div>
                        <div className="  md11:!mb-[0px] md34:mb-[14px]  w-[100%]">
                          <AnimatedDropdown label="Department" options={deptOptions} selected={department} onSelect={setDepartment} icon={Hospital} />
                        </div>
                        <div className="  md11:!mb-[0px] w-[100%]">
                          <AnimatedDropdown label="Doctor Name" options={doctorOptions} selected={doctor} onSelect={setDoctor} icon={User} />
                        </div>

                        <div className="  md:11!mb-[0px]   w-[100%]">
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
                    </div> */}
                  <div className="bg-white rounded-xl  dashShadow border-gray-100 py-2 px-[10px] mb-3">
                    <div className="flex flex-col md:flex-row  items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <label className="inline-flex   !mb-0 items-center gap-2">
                          <input type="checkbox" className="rounded border-gray-300 text-red-600 focus:ring-red-500" checked={showDetractors} onChange={(e) => setShowDetractors(e.target.checked)} />
                          <span className="text-sm text-gray-700">Detractors</span>
                        </label>
                        <label className="inline-flex !mb-0  items-center gap-2">
                          <input type="checkbox" className="rounded border-gray-300 text-amber-600 focus:ring-amber-500" checked={showPassives} onChange={(e) => setShowPassives(e.target.checked)} />
                          <span className="text-sm text-gray-700">Passives</span>
                        </label>
                        <label className="inline-flex !mb-0 items-center gap-2">
                          <input type="checkbox" className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" checked={showPromoters} onChange={(e) => setShowPromoters(e.target.checked)} />
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
                          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none  focus:ring-sky-500"
                        />
                      </div>
                    </div>
                  </div>
                  <div className=" flex md11:!flex-row flex-col  gap-[15px] ">


                    <div className="grid grid-cols-2 md11:!grid-cols-1 md11:!w-[300px] md34:!gap-x-[15px]  mb-[-4px] mt -[-4px]  ">
                      <Widgets1
                        data={{
                          title: "Detractors",
                          gros: `${kpi.detrPercent}%`,
                          total: `${kpi.detrPercent}%`,
                          color: "warning",
                          icon: <i className="fa-solid fa-face-frown !text-[24px] text-orange-600"></i>,
                        }}
                      />

                      <Widgets1
                        data={{
                          title: "Passives",
                          gros: `${kpi.passPercent}%`,
                          total: `${kpi.passPercent}%`,
                          color: "warning",
                          icon: <i className="fa-solid fa-minus !text-[24px] text-amber-600"></i>,
                        }}
                      />

                      <Widgets1
                        data={{
                          title: "Promoters",
                          gros: `${kpi.promPercent}%`,
                          total: `${kpi.promPercent}%`,
                          color: "success",
                          icon: <i className="fa-regular fa-heart-pulse !text-[24px] text-emerald-600"></i>,
                        }}
                      />

                      <Widgets1
                        data={{
                          title: "Overall NPS",
                          gros: `${kpi.nps}`,
                          total: `${kpi.nps}%`,
                          color: "secondary",
                          icon: <i className="fa-regular fa-chart-line !text-[20px] text-gray-600"></i>,
                        }}
                      />

                    </div>
                    <div className=" flex md11:!flex-row flex-col gap-[20px]  md11:!gap-x-[15px]  mb-3">
                      <div className="bg-white rounded-xl dashShadow  md11:!min-w-[400px] 2xl:!w-[550px]  p-[13px]">
                        <div className=" flex mb-[10px] items-center gap-[10px]">
                          <div className="w-[35px] h-[35px]  bg-gradient-to-br from-blue-500 to-indigo-500 rounded-md flex items-center justify-center">
                            <i className="fa-regular fa-chart-line text-[#fff] text-[15px]"></i>
                          </div>
                          <h3 className="text-[13px] font-[500] text-gray-900">Distribution Over Time</h3>
                        </div>
                        <div className="h-[350px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={areaData} key={areaKey} margin={{ left: -25, right: 8, top: 8, bottom: 0 }}>
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

                              {/* ❌ Remove <div className="flex"> — this breaks the SVG rendering */}
                              {/* ✅ Keep only the <Area> components inside <AreaChart> */}
                              <Area
                                type="monotone"
                                dataKey="Detractors"
                                stackId="1"
                                stroke="#ef4444"
                                fill="url(#gradDetractors)"
                                isAnimationActive={true}
                                animationDuration={600}
                              />
                              <Area
                                type="monotone"
                                dataKey="Passives"
                                stackId="1"
                                stroke="#f59e0b"
                                fill="url(#gradPassives)"
                                isAnimationActive={true}
                                animationDuration={600}
                              />
                              <Area
                                type="monotone"
                                dataKey="Promoters"
                                stackId="1"
                                stroke="#10b981"
                                fill="url(#gradPromoters)"
                                isAnimationActive={true}
                                animationDuration={600}
                              />
                            </AreaChart>
                          </ResponsiveContainer>

                        </div>
                      </div>

                      <div className="bg-white rounded-xl dashShadow   md11:!w-[500px] p-[13px]">
                        <div className=" flex mb-[10px] items-center gap-[10px]">
                          <div className="w-[35px] h-[35px]  bg-gradient-to-br from-blue-500 to-indigo-500 rounded-md flex items-center justify-center">
                            <i className="fa-regular fa-arrow-trend-up text-[#fff] text-[15px]"></i>

                          </div>
                          <h3 className="text-[13px] font-[500] text-gray-900">Overall NPS Trend</h3>
                        </div>
                        <div className="h-[350px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={lineData} key={lineKey} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                              <CartesianGrid stroke="#f3f4f6" vertical={false} />
                              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                              <YAxis domain={[-100, 100]} tick={{ fontSize: 12 }} />
                              <Tooltip contentStyle={{ fontSize: 12 }} />
                              <Legend />
                              <Line type="monotone" dataKey="NPS" stroke="#374151" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 5 }} isAnimationActive animationDuration={600} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Charts */}


                  {/* Table Controls */}


                  {/* Table */}
                  <div className="bg-white rounded-lg shadow-sm border md34:!mb-[100px] md11:!mb-[0px] border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="md34:!min-w-[1200px] md11:!min-w-full table-auto divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SR No</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Name</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room No</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor Name</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NPS Rating</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comment</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                          {filteredRecords
                            .slice() // clone
                            .sort((a, b) => new Date(b.datetime) - new Date(a.datetime)) // latest first
                            .slice(0, 5) // ✅ latest 5
                            .map((rec, idx) => (
                              <tr key={`${rec.datetime}-${idx}`} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3 text-sm text-gray-700">{idx + 1}</td>
                                <td className="px-4 py-3 text-sm text-gray-900">{rec.datetime}</td>
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">{rec.patient}</td>
                                <td className="px-4 py-3 text-sm text-gray-900">{rec.room}</td>
                                <td className="px-4 py-3 text-sm text-gray-900">{rec.doctor}</td>
                                <td className="px-4 py-3 text-sm font-semibold text-gray-900">{rec.rating}</td>
                                <td className="px-4 py-3 text-sm">
                                  <span
                                    className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${rec.category === "Promoter"
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
                    <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 text-sm text-gray-600 flex items-center justify-between">
                      <div></div>
                      <button

                        className="flex items-center px-3 py-[6px] h-[35px] w-fit gap-[8px] bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        onClick={handlenavigate}
                      >
                        <Eye className="w-5 h-5 " />
                        View All
                      </button>
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
