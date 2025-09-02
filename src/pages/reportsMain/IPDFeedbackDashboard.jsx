"use client"

import { useEffect, useState } from "react"
import {
  Calendar,
  Download,
  Search,
  Filter,
  Star,
  ThumbsUp,
  Award,
  Phone,
  User,
  Clock,
  Bed,
  FileText,
} from "lucide-react"
import Header from "../../Component/header/Header"
import SideBar from "../../Component/sidebar/SideBar"
import { ApiGet, ApiPost } from "../../helper/axios"


export default function IPDFeedbackDashboard() {
  const [dateFrom, setDateFrom] = useState("2024-01-01")
  const [dateTo, setDateTo] = useState("2024-01-31")
  const [selectedService, setSelectedService] = useState("All Services")
  const [selectedDoctor, setSelectedDoctor] = useState("All Doctors")
  const [searchTerm, setSearchTerm] = useState("");
  const [lineData, setLineData] = useState([])
  const [trendBucket, setTrendBucket] = useState("day") // day | week | month
  const [chartData, setChartData] = useState([])
  const [serviceData, setServiceData] = useState([])

  const [feedback, setFeedback] = useState([])
  const [loading, setLoading] = useState(true)

  // Sample data
  // const kpiData = {
  //   totalFeedback: 71,
  //   averageRating: 4.2,
  //   npsRating: 78,
  //   overallScore: "Good",
  // }

  // const chartData = [
  //   { label: "Excellent", count: 28, percentage: 39, color: "#10B981" },
  //   { label: "Very Good", count: 18, percentage: 25, color: "#3B82F6" },
  //   { label: "Good", count: 12, percentage: 17, color: "#06B6D4" },
  //   { label: "Average", count: 8, percentage: 11, color: "#EAB308" },
  //   { label: "Poor", count: 3, percentage: 4, color: "#F97316" },
  //   { label: "Very Poor", count: 2, percentage: 3, color: "#EF4444" },
  // ]



  const defaultColors = [
    '#3b82f6', // blue
    '#ef4444', // red
    '#10b981', // green
    '#f59e0b', // amber
    '#8b5cf6', // violet
    '#ec4899', // pink
  ]

  // Line chart data for IPD ratings over time
  const lineChartData = [
    { date: "Jan 15", value: 4.1 },
    { date: "Jan 16", value: 4.3 },
    { date: "Jan 17", value: 4.0 },
    { date: "Jan 18", value: 4.2 },
    { date: "Jan 19", value: 4.5 },
    { date: "Jan 20", value: 4.1 },
    { date: "Jan 21", value: 4.4 },
    { date: "Jan 22", value: 4.6 },
    { date: "Jan 23", value: 4.2 },
  ]

const SERVICE_KEYS = [
    "appointmentBooking",
    "attendantStaff",
    "receptionStaff",
    "cleanliness",
    "labServices",
    "radiologyServices",
    "doctorServices",
    "physiotherapyServices",
  ]

  const SERVICE_LABELS = {
    appointmentBooking: "Appointment Booking",
    attendantStaff: "Attendant Staff",
    receptionStaff: "Reception Staff",
    cleanliness: "Cleanliness",
    labServices: "Lab Services",
    radiologyServices: "Radiology Services",
    doctorServices: "Doctor Services",
    physiotherapyServices: "Physiotherapy Services",
  }

  const avg = (arr) => arr.reduce((a, b) => a + b, 0) / (arr.length || 1)
  const pad2 = (n) => String(n).padStart(2,"0")

  // Overall rating 0..5 for a row
  function overallOutOf5(row) {
    const vals = SERVICE_KEYS
      .map((k) => Number(row?.ratings?.[k]))
      .filter((n) => !Number.isNaN(n) && n > 0)
    if (vals.length) return avg(vals)
    const nps = Number(row?.overallRecommendation) // 0..10 -> 0..5
    if (!Number.isNaN(nps)) return Math.max(0, Math.min(10, nps)) / 2
    const r = Number(row?.rating)
    if (!Number.isNaN(r) && r > 0) return Math.max(0, Math.min(5, r))
    return 0
  }

  // Donut: rating distribution
  function buildDistribution(list = []) {
    const buckets = { 5:0,4:0,3:0,2:0,1:0 }
    let ratedCount = 0
    for (const row of list) {
      const r = overallOutOf5(row)
      if (r > 0) {
        const rounded = Math.max(1, Math.min(5, Math.round(r)))
        buckets[rounded] += 1
        ratedCount += 1
      }
    }
    const denom = ratedCount || 1
    return [
      { label: "Excellent", count: buckets[5], percentage: Math.round((buckets[5] / denom) * 100), color: "#10B981" },
      { label: "Very Good", count: buckets[4], percentage: Math.round((buckets[4] / denom) * 100), color: "#3B82F6" },
      { label: "Good",      count: buckets[3], percentage: Math.round((buckets[3] / denom) * 100), color: "#06B6D4" },
      { label: "Average",   count: buckets[2], percentage: Math.round((buckets[2] / denom) * 100), color: "#EAB308" },
      { label: "Poor",      count: buckets[1], percentage: Math.round((buckets[1] / denom) * 100), color: "#F97316" },
    ]
  }

   function buildServiceSummary(list = []) {
    const out = []
    for (const key of SERVICE_KEYS) {
      const counts = { 5:0,4:0,3:0,2:0,1:0 }
      let total = 0
      for (const row of list) {
        const val = Number(row?.ratings?.[key])
        if (!Number.isNaN(val) && val >= 1 && val <= 5) {
          counts[val] += 1
          total += 1
        }
      }
      const d = total || 1
      out.push({
        service: SERVICE_LABELS[key] || key,
        excellent: Math.round((counts[5]/d)*100),
        good:      Math.round((counts[4]/d)*100),
        average:   Math.round((counts[3]/d)*100),
        poor:      Math.round((counts[2]/d)*100),
        veryPoor:  Math.round((counts[1]/d)*100),
      })
    }
    return out
  }

  // Auto day/week/month bucketing for line chart
  function weekOfYear(d) {
    const a = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
    const day = a.getUTCDay() || 7
    a.setUTCDate(a.getUTCDate() + 4 - day)
    const y0 = new Date(Date.UTC(a.getUTCFullYear(),0,1))
    return Math.ceil((((a - y0) / 86400000) + 1) / 7)
  }
  function pickBucket(from, to) {
    const days = Math.ceil(Math.max(1, to - from) / 86400000)
    if (days <= 31) return "day"
    if (days <= 180) return "week"
    return "month"
  }
  function bucketKeyAndLabel(d, bucket) {
    const y = d.getFullYear(), m = d.getMonth()+1, day = d.getDate()
    if (bucket === "day")  return { key:`${y}-${pad2(m)}-${pad2(day)}`, label:`${pad2(day)}/${pad2(m)}` }
    if (bucket === "week"){ const w=weekOfYear(d); return { key:`${y}-W${pad2(w)}`, label:`W${pad2(w)} ${y}` } }
    return { key:`${y}-${pad2(m)}`, label:`${pad2(m)}/${y}` }
  }
  function getRangeFromRows(list) {
    let min=Infinity,max=-Infinity
    for (const r of list) {
      const t=+new Date(r.createdAt || r.date)
      if (!isNaN(t)){ if (t<min) min=t; if (t>max) max=t }
    }
    const now = Date.now()
    return { from:new Date(isFinite(min)?min:now), to:new Date(isFinite(max)?max:now) }
  }
  function buildAutoTrend(list, fromStr, toStr) {
    let from = fromStr ? new Date(fromStr) : null
    let to   = toStr   ? new Date(toStr)   : null
    if (!from || !to || isNaN(+from) || isNaN(+to)) {
      const r = getRangeFromRows(list); from = r.from; to = r.to
    }
    const bucket = pickBucket(+from, +to)
    const map = new Map() // key -> {sum,count,label}

    for (const row of list) {
      const d = new Date(row.createdAt || row.date)
      if (isNaN(+d)) continue
      const v = overallOutOf5(row); if (v <= 0) continue
      const { key, label } = bucketKeyAndLabel(d, bucket)
      if (!map.has(key)) map.set(key, { sum:0, count:0, label })
      const b = map.get(key); b.sum += v; b.count += 1
    }

    let trend = Array.from(map.entries())
      .sort((a,b)=>a[0].localeCompare(b[0]))
      .map(([,v])=>({ date:v.label, value:Number((v.sum/v.count).toFixed(1)) }))

    const MAX_POINTS = 40
    if (trend.length > MAX_POINTS) {
      const step = Math.ceil(trend.length / MAX_POINTS)
      trend = trend.filter((_, i) => i % step === 0)
    }
    return { trend, bucket }
  }

  // Pick a usable date from many possible fields; fallback to array order
function getFeedbackDate(row, index) {
  const candidates = [
    row?.createdAt,
    row?.created_at,
    row?.date,
    row?.feedbackDate,
    row?.timestamp,
    row?.updatedAt,
    row?.createdOn,
  ];

  for (const c of candidates) {
    const d = new Date(c);
    if (Number.isFinite(+d)) return { date: d, isReal: true };
  }

  // Fallback: synthesize a stable sequence so line still works
  const base = new Date("2000-01-01T00:00:00Z");
  base.setMinutes(base.getMinutes() + index);
  return { date: base, isReal: false };
}


function buildRawFeedbackTrend(list = [], fromStr, toStr) {
  const from = fromStr ? new Date(fromStr) : null;
  const to   = toStr   ? new Date(toStr)   : null;

  const rows = list
    .map(r => {
      const raw = r.createdAt || r.date || r.created_at || r.feedbackDate;
      const d = new Date(raw || Date.now());
      return { row: r, t: +d, d };
    })
    .filter(x => Number.isFinite(x.t))
    .filter(x => {
      if (from && x.t < +from) return false;
      if (to   && x.t > +to)   return false;
      return true;
    })
    .sort((a,b) => a.t - b.t);

  const points = [];
  for (const x of rows) {
    const v = Number(overallOutOf5(x.row)); // 0..5
    if (!Number.isFinite(v) || v <= 0) continue;

    const day = String(x.d.getDate()).padStart(2,"0");
    const mon = String(x.d.getMonth()+1).padStart(2,"0");
    const hh  = String(x.d.getHours()).padStart(2,"0");
    const mm  = String(x.d.getMinutes()).padStart(2,"0");
    const label = `${day}/${mon} ${hh}:${mm}`;

    points.push({ date: label, value: Number(v.toFixed(1)) });
  }
  return points;
}


// useEffect(() => {
//   const { trend, bucket } = buildAutoTrend(feedback, dateFrom, dateTo)
//   setLineData(trend)
//   setTrendBucket(bucket)
// }, [feedback, dateFrom, dateTo])


  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const res = await ApiGet("/admin/ipd-patient");
        console.log('res', res)
        const data = res.data || [];
        setFeedback(data);
      } catch (err) {
        console.error("Error fetching IPD feedback:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeedback();
  }, []);

useEffect(() => {
  setChartData(buildDistribution(feedback));
  setServiceData(buildServiceSummary(feedback));
  const raw = buildRawFeedbackTrend(feedback, dateFrom, dateTo);
  setLineData(raw);
  setTrendBucket("day");

  console.log('lineData sample:', raw.slice(0,5)); // [{date:"15/01 10:30", value:3.9}, ...]
}, [feedback, dateFrom, dateTo]);


  function formatDate(dateStr) {
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}


  const totalFeedback = feedback.length;
  const averageRating =
    totalFeedback > 0
      ? (feedback.reduce((sum, f) => sum + (f.rating || 0), 0) / totalFeedback).toFixed(1)
      : 0;

  // NPS (example: assume each record has `overallRecommendation` 0–10)
  const promoters = feedback.filter(f => f.overallRecommendation >= 9).length;
  const detractors = feedback.filter(f => f.overallRecommendation <= 6).length;
  const npsRating =
    totalFeedback > 0
      ? Math.round(((promoters - detractors) / totalFeedback) * 100)
      : 0;

  const kpiData = {
    totalFeedback,
    averageRating,
    npsRating,
    overallScore:
      averageRating >= 4.5
        ? "Excellent"
        : averageRating >= 4.0
          ? "Good"
          : "Average",
  };

  const filteredFeedback = feedback.filter(
    (feedback) =>
      feedback.patient?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      feedback.doctor?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      feedback.comment?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      feedback.bedNo?.toLowerCase().includes(searchTerm?.toLowerCase()),
  )

  const getRatingStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < rating ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
    ))
  }

  const exportToExcel = () => {
    alert("Export functionality would be implemented here")
  }

  // Donut Chart Component
  // const DonutChart = ({ data }) => {
  //   const size = 220
  //   const strokeWidth = 45
  //   const radius = (size - strokeWidth) / 2
  //   const circumference = radius * 2 * Math.PI

  //   let cumulativePercentage = 0

  //   return (
  //     <div className="flex flex-col items-center">
  //       <svg width={size} height={size} className="transform -rotate-90">
  //         <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#f3f4f6" strokeWidth={strokeWidth} />
  //         {data.map((item, index) => {
  //           const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`
  //           const strokeDashoffset = (-cumulativePercentage * circumference) / 100
  //           cumulativePercentage += item.percentage

  //           return (
  //             <circle
  //               key={index}
  //               cx={size / 2}
  //               cy={size / 2}
  //               r={radius}
  //               fill="none"
  //               stroke={item.color}
  //               strokeWidth={strokeWidth}
  //               strokeDasharray={strokeDasharray}
  //               strokeDashoffset={strokeDashoffset}
  //               className="transition-all duration-300"
  //             />
  //           )
  //         })}
  //       </svg>
  //       <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
  //         {data.map((item, index) => (
  //           <div key={index} className="flex items-center">
  //             <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
  //             <span className="text-gray-700">
  //               {item.label}: {item.count} ({item.percentage}%)
  //             </span>
  //           </div>
  //         ))}
  //       </div>
  //     </div>
  //   )
  // }


  const DonutChart = ({ data }) => {
    const size = 220
    const strokeWidth = 45
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius

    const [animated, setAnimated] = useState(false)
    const [hoverIndex, setHoverIndex] = useState(null)

    useEffect(() => {
      const timeout = setTimeout(() => setAnimated(true), 100) // delay for animation
      return () => clearTimeout(timeout)
    }, [])

    let cumulativePercentage = 0

    return (
      <div className="flex flex-col items-center">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Base Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
          />
          {/* Donut Segments */}
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

        {/* Info Grid */}
        <div className="mt-6 w-full grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          {data.map((item, index) => {
            const color = item.color || defaultColors[index % defaultColors.length]
            return (
              <div
                key={index}
                className={`flex items-center transition-all duration-200 ${hoverIndex === index ? 'scale-[1.02]' : ''
                  }`}
                onMouseEnter={() => setHoverIndex(index)}
                onMouseLeave={() => setHoverIndex(null)}
              >
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: color }}
                />
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

  // Line Chart Component
  const LineChart = ({ data }) => {
    const width = 650
    const height = 290
    const padding = 50

    const maxValue = Math.max(...data.map((d) => d.value))
    const minValue = Math.min(...data.map((d) => d.value))
    const valueRange = maxValue - minValue || 1

    const points = data.map((item, index) => {
      const x = padding + (index * (width - 2 * padding)) / (data.length - 1)
      const y = height - padding - ((item.value - minValue) / valueRange) * (height - 2 * padding)
      return { x, y, value: item.value, date: item.date }
    })

    const pathData = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ")

    return (
      <div className="w-full">
        <svg width={width} height={height} className="w-full h-auto">
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map((i) => {
            const y = padding + (i * (height - 2 * padding)) / 4
            return <line key={i} x1={padding} y1={y} x2={width - padding} y2={y} stroke="#f3f4f6" strokeWidth="1" />
          })}

          {/* Y-axis labels */}
          {[0, 1, 2, 3, 4].map((i) => {
            const y = padding + (i * (height - 2 * padding)) / 4
            const value = (maxValue - (i * valueRange) / 4).toFixed(1)
            return (
              <text key={i} x={padding - 10} y={y + 5} textAnchor="end" className="text-xs fill-gray-500">
                {value}
              </text>
            )
          })}

          {/* Line */}
          <path
            d={pathData}
            fill="none"
            stroke="#3B82F6"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Points */}
          {points.map((point, index) => (
            <circle key={index} cx={point.x} cy={point.y} r="5" fill="#3B82F6" stroke="white" strokeWidth="2" />
          ))}

          {/* X-axis labels */}
          {points.map((point, index) => (
            <text key={index} x={point.x} y={height - 15} textAnchor="middle" className="text-xs fill-gray-500">
              {point.date}
            </text>
          ))}
        </svg>
      </div>
    )
  }

  return (


    <>
      <section className="flex  font-Poppins w-[100%] h-[100%] select-none p-[15px] overflow-hidden">
        <div className="flex w-[100%] flex-col gap-[14px] h-[96vh]">
          <Header pageName="IPD Feedback" />
          <div className="flex gap-[10px] w-[100%] h-[100%]">
            <SideBar />
            <div className="flex flex-col w-[100%] max-h-[90%] pb-[50px] pr-[15px] bg-[#fff] overflow-y-auto gap-[30px] rounded-[10px]">
              <div className="">
                <div className="">

                  {/* KPI Cards */}
                  <div className="  pt-[5px] flex gap-6  mb-4">
                    <div className="bg-white rounded-lg min-w-[240px] border-[#cacaca66] shadow-md border p-6 border-l-4 border-l-blue-500">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <FileText className="w-8 h-8 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Total Feedback</p>
                          <p className="text-2xl font-[600] text-gray-900">{kpiData.totalFeedback}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white  min-w-[240px] rounded-lg  border-[#cacaca66] shadow-md border p-6 border-l-4 border-l-yellow-500">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <Star className="w-8 h-8 text-yellow-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Average Rating</p>
                          <p className="text-2xl font-[600] text-gray-900">{kpiData.averageRating} / 5</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white  min-w-[240px] rounded-lg border-[#cacaca66] shadow-md border p-6  border-l-4 border-l-green-500">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <ThumbsUp className="w-8 h-8 text-green-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">NPS Rating</p>
                          <p className="text-2xl font-[600] text-gray-900">{kpiData.npsRating}%</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white  min-w-[240px] rounded-lg border-[#cacaca66] shadow-md border p-6 border-l-4 border-l-purple-500">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <Award className="w-8 h-8 text-purple-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Overall Score</p>
                          <p className="text-2xl font-[600] text-gray-900">{kpiData.overallScore}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Charts Row */}
                  <div className=" flex justify-between  items-center gap-6 mb-6">
                    {/* Rating Distribution Donut Chart */}
                    <div className="bg-white  rounded-lg shadow-md p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Rating Distribution</h3>
                      <div className="flex ">
                        <DonutChart data={chartData} />
                      </div>
                    </div>

                    {/* Average Rating Trend Line Chart */}
                    <div className="bg-white rounded-lg  p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Average Rating Trend</h3>
                      <div className="flex justify-center">
                        <LineChart data={lineData} />
                      </div>
                    </div>
                  </div>

                  {/* Word Cloud */}
                  <div className="bg-white  border-b-[1.7px] border-dashed p-3 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Feedback Keywords</h3>
                    <div className="flex flex-wrap gap-3 ">
                      {[
                        "Excellent",
                        "Nurse",
                        "Professional",
                        "Clean",
                        "Comfortable",
                        "Doctor",
                        "Care",
                        "Staff",
                        "Treatment",
                        "Service",
                        "Billing",
                        "Food",
                        "Room",
                        "Pharmacy",
                        "Housekeeping",
                      ].map((word, index) => (
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
                      ))}
                    </div>
                  </div>
                  <div className=" flex w-[100%]  mb-[40px] gap-[30px]">


                    {/* Service-Wise Summary Table */}
                    <div className="bg-white rounded-xl border  w-[60%]  shadow-lg overflow-hidden ">
                      <div className="px-6 py-2 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Service-Wise Summary</h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="min-w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                                Service
                              </th>
                              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                                Excellent %
                              </th>
                              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                                Good %
                              </th>
                              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                                Average %
                              </th>
                              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                                Poor %
                              </th>
                              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Very Poor %
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white">
                            {serviceData.map((service, index) => (
                              <tr
                                key={index}
                                className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50 transition-colors`}
                              >
                                <td className="px-6 py-3 text-sm font-medium text-gray-900 border-r border-gray-200">
                                  {service.service}
                                </td>
                                <td className="px-6 py-3 text-center text-sm border-r border-gray-200">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    {service.excellent}%
                                  </span>
                                </td>
                                <td className="px-6 py-3 text-center text-sm border-r border-gray-200">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {service.good}%
                                  </span>
                                </td>
                                <td className="px-6 py-3 text-center text-sm border-r border-gray-200">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                    {service.average}%
                                  </span>
                                </td>
                                <td className="px-6 py-3 text-center text-sm border-r border-gray-200">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                    {service.poor}%
                                  </span>
                                </td>
                                <td className="px-6 py-3 text-center text-sm">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                    {service.veryPoor}%
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="flex ">
                      <div className="bg-white  w-[100%] rounded-lg shadow-md p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4"> Service-Wise Chart</h3>
                        <div className="flex ">
                          <DonutChart data={chartData} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Patient-Wise Feedback Table */}
                  <div className="bg-white border rounded-lg shadow-md overflow-hidden">
                    <div className="px-6 py-2 border-b border-gray-200 flex flex-col sm:flex-row gap-[50px] items-start sm:items-center">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 sm:mb-0">Patient Feedback Details</h3>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
                        <input
                          type="text"
                          placeholder="Search feedback..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-7 pr-3 w-[150px] py-1 text-[12px] font-[400] border border-gray-300 rounded-md focus:outline-none "
                        />
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                              Date & Time
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                              Patient Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                              Contact No.
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                              Bed No.
                            </th>
                            {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                              Doctor Name
                            </th> */}
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                              Rating
                            </th>
                            {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Comment
                            </th> */}
                          </tr>
                        </thead>
                        <tbody className="bg-white">
                          {filteredFeedback.map((feedback, index) => (
                            <tr
                              key={feedback.id}
                              className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"
                                } hover:bg-blue-50 transition-colors cursor-pointer`}
                              onClick={() => alert(`Viewing details for ${feedback.patient}`)}
                            >
                              <td className="px-4 py-2 text-sm text-gray-900 border-r border-gray-200">
                                <div className="flex items-center">
                                  <Clock className="w-4 h-4 text-gray-400 mr-2" />
                                  {formatDate(feedback.createdAt)}
                                </div>
                              </td>
                              <td className="px-6 py-3 text-sm font-medium text-gray-900 border-r border-gray-200">
                                <div className="flex items-center">
                                  <User className="w-4 h-4 text-gray-400 mr-2" />
                                  {feedback.patientName}
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
                                  <Bed className="w-4 h-4 text-gray-400 mr-2" />
                                  {feedback.bedNo}
                                </div>
                              </td>
                              {/* <td className="px-4 py-2 text-sm text-gray-900 border-r border-gray-200">{feedback.doctor}</td> */}
                              {/* <td className="px-4 py-2 text-sm text-gray-900 border-r border-gray-200">
                                <div className="flex items-center">
                                  {getRatingStars(feedback.rating)}
                                  <span className="ml-2 text-sm font-medium">{feedback.rating}/5</span>
                                </div>
                              </td> */}
                              <td className="px-4 py-2 text-sm text-gray-900 border-r border-gray-200">
                                {(() => {
                                  const avg5 = overallOutOf5(feedback);     // float 0..5
                                  const stars = Math.round(avg5);           // for star icons

                                  return (
                                    <div className="flex items-center">
                                      {getRatingStars(stars)}
                                      <span className="ml-2 text-sm font-medium">{avg5.toFixed(1)}/5</span>
                                    </div>
                                  );
                                })()}
                              </td>

                              <td className="px-6 py-3 text-sm text-gray-900 max-w-xs">
                                {/* <div className="truncate" title={feedback.comment}>
                                  {feedback.comment}
                                </div> */}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
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
