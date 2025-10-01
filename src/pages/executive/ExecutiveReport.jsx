"use client"

import { useEffect, useMemo, useState } from "react"
import SideBar from "../../Component/sidebar/CubaSidebar"
import Header from "../../Component/header/Header"
import { ApiGet } from "../../helper/axios"
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  AlertTriangle,
  Circle,
} from "lucide-react"
import Preloader from "../../Component/loader/Preloader"
import ModernDatePicker from "../../Component/MainInputFolder/ModernDatePicker"


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
    findPerm("executive_report") || // 👈 Executive module
    findPerm("reports") ||
    null

  const has = (perm) => isAdmin || modulePerm?.permissions?.includes(perm)

  return {
    isAdmin,
    canView: has("View"),
    canExport: has("Download") || has("Export"),
  }
}

// ---------------- Permission Denied ----------------
function PermissionDenied() {
  return (
    <div className="flex items-center justify-center h-[70vh]">
      <div className="bg-white border rounded-xl p-8 shadow-sm text-center max-w-md">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Permission required
        </h2>
        <p className="text-gray-600">
          You don’t have access to view the Executive Report. Please contact an
          administrator.
        </p>
      </div>
    </div>
  )
}


// ---------- Date helpers (local-time safe) ----------
const toLocalISO = (d) => {
  const tz = d.getTimezoneOffset() * 60000
  return new Date(d.getTime() - tz).toISOString().slice(0, 10)
}
const todayLocalISO = () => toLocalISO(new Date())
const monthStartLocalISO = () => {
  const now = new Date()
  return toLocalISO(new Date(now.getFullYear(), now.getMonth(), 1))
}

// ---------- Normalizers ----------
const normId = (v) =>
  typeof v === "object" && v !== null
    ? (v.$oid ?? v._id ?? v.toString?.() ?? "")
    : (v ?? "")

const normDate = (v) =>
  typeof v === "object" && v !== null && "$date" in v ? v.$date : v

// ---------- Calculations ----------
const clamp1to5 = (x) => {
  const n = Number(x)
  if (!Number.isFinite(n)) return null
  if (n < 1 || n > 5) return null
  return n
}
const round1 = (n) => Math.round((Number(n) || 0) * 10) / 10

const OPD_KEYS = ["appointment", "receptionStaff", "diagnosticServices", "doctorServices", "security"]
const IPD_KEYS = [
  "doctorServices",
  "billingServices",
  "housekeeping",
  "maintenance",
  "diagnosticServices",
  "dietitianServices",
  "security",
]

function avgRating(doc, keys) {
  const r = doc?.ratings || {}
  const vals = []
  keys.forEach((k) => {
    const v = clamp1to5(r[k])
    if (v != null) vals.push(v)
  })
  if (!vals.length) return 0
  return round1(vals.reduce((a, b) => a + b, 0) / vals.length)
}

function doctorOnlyRating(doc) {
  const r = doc?.ratings || {}
  const v = clamp1to5(r.doctorServices ?? r.doctor ?? r.doctorService)
  return v ?? null
}

function housekeepingRating(doc) {
  const r = doc?.ratings || {}
  const v = clamp1to5(r.housekeeping)
  return v ?? null
}

function calcNPS(items) {
  const scores = items
    .map((d) => Number(d.overallRecommendation))
    .filter((n) => Number.isFinite(n))
  if (!scores.length) return 0
  const total = scores.length
  const promoters = scores.filter((v) => v >= 9).length
  const detractors = scores.filter((v) => v <= 6).length
  return Math.round(((promoters - detractors) / total) * 100)
}

function countDetractors(items) {
  return items
    .map((d) => Number(d.overallRecommendation))
    .filter((n) => Number.isFinite(n) && n <= 6).length
}

function dateInRange(iso, fromISO, toISO) {
  // inclusive range; inputs are yyyy-mm-dd
  return iso >= fromISO && iso <= toISO
}

function toISODateOnly(any) {
  const d = new Date(any)
  if (Number.isNaN(+d)) return null
  return toLocalISO(d)
}

// ---------- Status mapping ----------
function statusForPercent(pct) {
  if (pct >= 80) return { type: "good", label: "Good" }
  if (pct >= 60) return { type: "stable", label: "Stable" }
  return { type: "attention", label: "Needs Attention" }
}
function statusForNPS(nps) {
  if (nps >= 50) return { type: "good", label: "Good" }
  if (nps >= 0) return { type: "improving", label: "Improving" }
  return { type: "attention", label: "Needs Attention" }
}
function statusForDoctor(avg5) {
  if (avg5 >= 4) return { type: "good", label: "Good" }
  if (avg5 >= 3) return { type: "stable", label: "Stable" }
  return { type: "attention", label: "Needs Attention" }
}
function statusForComplaints(n) {
  if (n === 0) return { type: "good", label: "Good" }
  if (n <= 5) return { type: "stable", label: "Stable" }
  return { type: "attention", label: "Needs Attention" }
}

// ---------- UI helpers ----------
function statusStyles(type) {
  switch (type) {
    case "good":
      return { Icon: CheckCircle, iconClass: "text-emerald-600" }
    case "improving":
      return { Icon: TrendingUp, iconClass: "text-sky-600" }
    case "stable":
      return { Icon: Circle, iconClass: "text-emerald-600" }
    case "attention":
    default:
      return { Icon: AlertTriangle, iconClass: "text-amber-600" }
  }
}
function trendColor(direction) {
  return direction === "down" ? "text-red-700" : "text-emerald-700"
}
function TrendIcon({ direction }) {
  const Icon = direction === "down" ? TrendingDown : TrendingUp
  return <Icon className="w-4 h-4" aria-hidden="true" />
}

// ---------- Component ----------
export default function ExecutiveReport() {
  const { canView } = resolvePermissions()

  // Filters
  const [fromDate, setFromDate] = useState(() => monthStartLocalISO()) // first day of current month
  const [toDate, setToDate] = useState(() => todayLocalISO()) // today

  // Raw data
  const [opd, setOpd] = useState([])
  const [ipd, setIpd] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch OPD + IPD once (or you can refetch on date change if backend supports range)
  useEffect(() => {
    let mounted = true
      ; (async () => {
        try {
          setLoading(true); setError(null)
          const [opdRes, ipdRes] = await Promise.all([
            ApiGet("/admin/opd-patient"),
            ApiGet("/admin/ipd-patient"),
          ])
          const opdData = Array.isArray(opdRes) ? opdRes : (opdRes?.data ?? [])
          const ipdData = Array.isArray(ipdRes) ? ipdRes : (ipdRes?.data?.patients ?? [])
          if (!mounted) return
          setOpd(opdData)
          setIpd(ipdData)
        } catch (e) {
          console.error("ExecutiveReport fetch failed:", e)
          if (mounted) setError("Failed to load data")
        } finally {
          if (mounted) setLoading(false)
        }
      })()
    return () => { mounted = false }
  }, [])

  // Build filtered + previous window slices (based on selected range)
const { opdFiltered, ipdFiltered, opdPrev, ipdPrev } = useMemo(() => {
  if (!fromDate || !toDate) return { opdFiltered: [], ipdFiltered: [], opdPrev: [], ipdPrev: [] }

  const slice = (arr, fromISO, toISO) =>
    Array.isArray(arr)
      ? arr.filter((d) => {
          const dtISO = toISODateOnly(
            normDate(d.createdAt ?? d.date ?? d.dateTime ?? d.createdOn)
          )
          return dtISO ? dateInRange(dtISO, fromISO, toISO) : false
        })
      : []

  // current selected range
  const filteredOpd = slice(opd, fromDate, toDate)
  const filteredIpd = slice(ipd, fromDate, toDate)

  // previous range: same length as current
  const from = new Date(fromDate)
  const to = new Date(toDate)
  const days = Math.max(1, Math.round((to - from) / (1000 * 60 * 60 * 24)) + 1)

  const prevFrom = new Date(from)
  prevFrom.setDate(prevFrom.getDate() - days)
  const prevTo = new Date(to)
  prevTo.setDate(prevTo.getDate() - days)

  return {
    opdFiltered: filteredOpd,
    ipdFiltered: filteredIpd,
    opdPrev: slice(opd, toLocalISO(prevFrom), toLocalISO(prevTo)),
    ipdPrev: slice(ipd, toLocalISO(prevFrom), toLocalISO(prevTo)),
  }
}, [opd, ipd, fromDate, toDate])



  // Compute metrics for a given slice
  function computeFor(opdSlice, ipdSlice) {
    // Overall feedback % (avg rating /5 → %)
    const opdAvg = opdSlice.length ? round1(opdSlice.map((d) => avgRating(d, OPD_KEYS)).reduce((a, b) => a + b, 0) / opdSlice.length) : 0
    const ipdAvg = ipdSlice.length ? round1(ipdSlice.map((d) => avgRating(d, IPD_KEYS)).reduce((a, b) => a + b, 0) / ipdSlice.length) : 0
    const opdPct = Math.round((opdAvg / 5) * 100)
    const ipdPct = Math.round((ipdAvg / 5) * 100)

    // NPS
    const npsOPD = calcNPS(opdSlice)
    const npsIPD = calcNPS(ipdSlice)

    // Complaints (detractors)
    const complaints = countDetractors([...opdSlice, ...ipdSlice])

    // Doctor ratings
    const docVals = [
      ...opdSlice.map(doctorOnlyRating).filter((v) => v != null),
      ...ipdSlice.map(doctorOnlyRating).filter((v) => v != null),
    ]
    const docAvg = docVals.length ? round1(docVals.reduce((a, b) => a + b, 0) / docVals.length) : 0

    // Housekeeping (cleanliness)
    const hkVals = ipdSlice.map(housekeepingRating).filter((v) => v != null)
    const hkAvg = hkVals.length ? round1(hkVals.reduce((a, b) => a + b, 0) / hkVals.length) : null
    const hkPct = hkAvg != null ? Math.round((hkAvg / 5) * 100) : null

    return { opdPct, ipdPct, npsOPD, npsIPD, complaints, docAvg, hkPct }
  }

  const cur = useMemo(() => computeFor(opdFiltered, ipdFiltered), [opdFiltered, ipdFiltered])
const prev = useMemo(() => computeFor(opdPrev, ipdPrev), [opdPrev, ipdPrev])


  // Build table rows with trends + statuses
  const metrics = useMemo(() => {
    const rows = []
    function pctChange(current, previous) {
      if (!previous || previous === 0) return "—"
      const diff = ((current - previous) / previous) * 100
      return diff
    }

    function statusFromChange(diff) {
      if (diff > 5) return { type: "improving", label: "Improving" }
      if (diff >= -5 && diff <= 5) return { type: "stable", label: "Stable" }
      if (diff < -10) return { type: "attention", label: "Needs Attention" }
      return { type: "declining", label: "Declining" }
    }


    // Overall OPD
    const diffOPD = pctChange(cur.opdPct, prev.opdPct)
    rows.push({
      metric: "Overall OPD Feedback",
      value: `${cur.opdPct}%`,
      trend: {
        value: `${diffOPD === "—" ? "—" : diffOPD.toFixed(1) + "%"}`,
        direction: diffOPD < 0 ? "down" : "up"
      },
      status: statusFromChange(diffOPD === "—" ? 0 : diffOPD),
    })


    // Overall IPD
    const diffIPD = cur.ipdPct - (prev.ipdPct ?? 0)
    rows.push({
      metric: "Overall IPD Feedback",
      value: `${cur.ipdPct}%`,
      trend: { value: `${diffIPD >= 0 ? "+" : ""}${diffIPD.toFixed(1)}%`, direction: diffIPD < 0 ? "down" : "up" },
      status: statusForPercent(cur.ipdPct),
    })

    // NPS (OPD)
    const dNpsOPD = (cur.npsOPD ?? 0) - (prev.npsOPD ?? 0)
    rows.push({
      metric: "NPS (OPD)",
      value: `${cur.npsOPD ?? 0}`,
      trend: { value: `${dNpsOPD >= 0 ? "+" : ""}${dNpsOPD}`, direction: dNpsOPD < 0 ? "down" : "up" },
      status: statusForNPS(cur.npsOPD ?? 0),
    })

    // NPS (IPD)
    const dNpsIPD = (cur.npsIPD ?? 0) - (prev.npsIPD ?? 0)
    rows.push({
      metric: "NPS (IPD)",
      value: `${cur.npsIPD ?? 0}`,
      trend: { value: `${dNpsIPD >= 0 ? "+" : ""}${dNpsIPD}`, direction: dNpsIPD < 0 ? "down" : "up" },
      status: statusForNPS(cur.npsIPD ?? 0),
    })

    // Complaints (detractors)
    const dComplaints = (cur.complaints ?? 0) - (prev.complaints ?? 0)
    rows.push({
      metric: "Complaints (Detractors)",
      value: `${cur.complaints ?? 0}`,
      trend: { value: `${dComplaints >= 0 ? "+" : ""}${dComplaints}`, direction: dComplaints > 0 ? "down" : "up" },
      status: statusForComplaints(cur.complaints ?? 0),
    })

    // Avg Doctor Rating
    const dDoc = (cur.docAvg ?? 0) - (prev.docAvg ?? 0)
    rows.push({
      metric: "Avg Doctor Rating",
      value: `${cur.docAvg.toFixed(1)}/5`,
      trend: { value: `${dDoc >= 0 ? "+" : ""}${dDoc.toFixed(1)}`, direction: dDoc < 0 ? "down" : "up" },
      status: statusForDoctor(cur.docAvg ?? 0),
    })

    // Cleanliness (Housekeeping) Score
    if (cur.hkPct != null) {
      const dHk = (cur.hkPct ?? 0) - (prev.hkPct ?? 0)
      rows.push({
        metric: "Cleanliness (Housekeeping) Score",
        value: `${cur.hkPct}%`,
        trend: { value: `${dHk >= 0 ? "+" : ""}${dHk.toFixed(1)}%`, direction: dHk < 0 ? "down" : "up" },
        status: statusForPercent(cur.hkPct ?? 0),
      })
    }

    return rows
  }, [cur, prev])

  const handleFilter = (e) => {
    e.preventDefault()
    // All metrics auto-update on date change
  }

  if (!canView) {
    return (
      <section className="flex w-full h-full select-none pr-[15px] overflow-hidden">
        <div className="flex w-full flex-col gap-0 h-[96vh]">
          <Header pageName="Executive Report" />
          <div className="flex w-full h-full">
            <SideBar />
            <div className="flex flex-col w-full max-h-[90%] pb-[50px] pr-[15px] bg-[#fff] overflow-y-auto gap-[30px] rounded-[10px]">
              <PermissionDenied />
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <>
      <section className="flex w-[100%] h-[100%] select-none pr-[15px] overflow-hidden">
        <div className="flex w-[100%] flex-col gap-[0px] h-[100vh]">
          <Header pageName="Executive Report" />
          <div className="flex w-[100%] h-[100%]">
            <SideBar />
            <div className="flex flex-col relative  w-[100%] max-h-[90%] pb-[50px] py-[10px] px-[10px] bg-[#fff] overflow-y-auto gap-[10px] rounded-[10px]">
             <Preloader />
              <main>
                {/* Filters */}
                <section className="mb-3 border border-gray-200 rounded-md">
                  <form onSubmit={handleFilter} className="p-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 md77:!gap-4">
                      {/* From date */}
                      <div className="relative md34:!mb-[17px] md77:!mb-0">
                        {/* <label className="block text-[10px] font-medium top-[-8px] left-[10px] border-gray-300 bg-white border px-[10px] rounded-[10px] z-[3] absolute text-gray-700 mb-1">
                          From
                        </label>
                        <div className="relative">
                          <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="date"
                            value={fromDate}
                            max={toDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            className="w-full bg-white pl-9 text-[14px] pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                          />
                        </div> */}

                          <ModernDatePicker />
                      </div>
                      {/* To date */}
                      <div className="relative">
                        {/* <label className="block text-[10px] font-medium top-[-8px] left-[10px] border-gray-300 bg-white border px-[10px] rounded-[10px] z-[3] absolute text-gray-700 mb-1">
                          To
                        </label>
                        <div className="relative">
                          <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="date"
                            value={toDate}
                            min={fromDate}
                            onChange={(e) => setToDate(e.target.value)}
                            className="w-full bg-white pl-9 pr-3 py-2 text-[14px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                          />
                        </div> */}
                        <ModernDatePicker />
                      </div>
                    </div>
                  </form>
                </section>

                {/* Table */}
                <section aria-labelledby="metrics-table" className="border border-gray-200 rounded-md overflow-hidden">
                  <h2 id="metrics-table" className="sr-only">Metric Summary Table</h2>

                  {loading && (
                    <div className="p-4 text-sm text-gray-600">Loading…</div>
                  )}
                  {error && (
                    <div className="p-4 text-sm text-red-600">{error}</div>
                  )}

                  <div className="overflow-x-auto">
                    <table className="md11:!min-w-full md34:!min-w-[800px]  md77:!min-w-[1000px] table-fixed">
                      <colgroup>
                        <col className="w-2/5" />
                        <col className="w-1/5" />
                        <col className="w-1/5" />
                        <col className="w-1/5" />
                      </colgroup>
                      <thead className="bg-gray-100 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-2 text-left text-[13px] font-semibold text-gray-700 uppercase tracking-wider">
                            Metric
                          </th>
                          <th className="px-4 py-2 text-center text-[13px] font-semibold text-gray-700 uppercase tracking-wider">
                            Value
                          </th>
                          <th className="px-4 py-2 text-center text-[13px] font-semibold text-gray-700 uppercase tracking-wider">
                            Trend vs Previous
                          </th>
                          <th className="px-4 py-2 text-left text-[13px] font-semibold text-gray-700 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {metrics.map((row, idx) => {
                          const { Icon, iconClass } = statusStyles(row.status.type)
                          return (
                            <tr
                              key={row.metric}
                              className={idx % 2 === 0 ? "bg-white" : "bg-gray-50 hover:bg-gray-100 transition-colors"}
                            >
                              <td className="px-4 py-2 text-sm font-semibold text-gray-900">{row.metric}</td>
                              <td className="px-4 py-2 text-center">
                                <span className="text-base sm:text-sm font-[400] text-gray-900">{row.value}</span>
                              </td>
                              <td className="px-4 py-2 text-center">
                                <span className={`inline-flex items-center gap-2 text-sm font-medium ${trendColor(row.trend.direction)}`}>
                                  <TrendIcon direction={row.trend.direction} />
                                  {row.trend.value}
                                </span>
                              </td>
                              <td className="px-4 py-2">
                                <span className="inline-flex items-center gap-2 text-sm text-gray-800">
                                  <Icon className={`w-4 h-4 ${iconClass}`} aria-hidden="true" />
                                  <span className="font-medium">{row.status.label}</span>
                                </span>
                              </td>
                            </tr>
                          )
                        })}
                        {(!loading && !error && metrics.length === 0) && (
                          <tr>
                            <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                              No data in the selected period.
                            </td>
                          </tr>
                        )}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan={4} className="px-4 py-2 bg-gray-100 border-t border-gray-200 text-xs text-gray-600">
                            Report period: {fromDate} to {toDate}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </section>
              </main>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
