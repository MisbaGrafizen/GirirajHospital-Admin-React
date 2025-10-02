
import React, { Fragment, useEffect, useState } from "react";
import { Container, Row } from "reactstrap";
import { Breadcrumbs } from "../../AbstractElements";
import { motion } from "framer-motion"
import {
  ResponsiveContainer,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Line,
  ComposedChart,
} from "recharts"
import {
  Star,
  AlertTriangle,
  Calendar,
  Clock,
  ChevronDown,
  BarChart3,
  PieChartIcon,
  LineChartIcon,
  Zap,
  Target,
  Award,
  Activity,
  Shield,
  Timer,
  MapPin,
  Phone,
  User,
} from "lucide-react"
import SideBar from '../../Component/sidebar/CubaSidebar';
import Header from '../../Component/header/Header';
import GreetingCard from "../../Component/DashboardFiles/Components/Dashboard/Default/GreetingCard";
import WidgetsWrapper from "../../Component/DashboardFiles/Components/Dashboard/Default/WidgetsWraper";
import OverallBalance from "../../Component/DashboardFiles/Components/Dashboard/Default/OverallBalance";
import RecentOrders from "../../Component/DashboardFiles/Components/Dashboard/Default/RecentOrders";
import ActivityCard from "../../Component/DashboardFiles/Components/Dashboard/Default/ActivityCard";
import RecentSales from "../../Component/DashboardFiles/Components/Dashboard/Default/RecentSales";
import TimelineCard from "../../Component/DashboardFiles/Components/Dashboard/Default/TimelineCard";
import PreAccountCard from "../../Component/DashboardFiles/Components/Dashboard/Default/PreAccountCard";
import TotalUserAndFollower from "../../Component/DashboardFiles/Components/Dashboard/Default/TotalUserAndFollower";
import PaperNote from "../../Component/DashboardFiles/Components/Dashboard/Default/PaperNote";
import '../../assets/scss/app.css'
import '../../assets/scss/style.css'
import { ApiGet } from "../../helper/axios";
import dayjs from "dayjs";
import ConcernSummaryDonutChart from "../../Component/MainInputFolder/ConcernSummaryDonutChart";
import Preloader from "../../Component/loader/Preloader";
// import CryptoAnnotations from "../../Component/DashboardFiles/Components/Widgets/Chart/CryptoAnnotations";

// import 'react-clock/dist/Clock.css';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

function dataSafePercent(concern) {
  const total = concern.reduce((a, c) => a + Number(c.value || 0), 0)
  const resolved = (concern.find((x) => x.name === "Resolved") || {}).value || 0
  if (!total) return 0
  return Math.round((resolved * 100) / total)
}

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star key={star} className={`w-4 h-4 ${star <= Number(rating) ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
      ))}
    </div>
  )
}

const OPD_COLORS = {
  Excellent: "#10b981",
  Good: "#3b82f6",
  Average: "#f59e0b",
  Poor: "#ef4444",
  "Very Poor": "#f97316",
}
const CONCERN_COLORS = { Open: "#ef4444", "In Progress": "#f59e0b", Resolved: "#10b981" }


export default function DashBoard() {

  const [dashboardData, setDashboardData] = useState(null);
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [ipdFeedbackTrend, setIpdFeedbackTrend] = useState([])
  const [opdFeedbackData, setOpdFeedbackData] = useState([])
  const [opdSummary, setOpdSummary] = useState({ avgRating: 0, positivePercent: 0, responses: 0 })
  const [departmentData, setDepartmentData] = useState([])
  const [allowedModules, setAllowedModules] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [concernData, setConcernData] = useState([])
  const [kpis, setKpis] = useState({
    totalFeedback: 0,
    averageRatixng: { value: 0 },
    npsRating: { value: 0 },
    openIssues: 0,
    resolvedIssues: 0,
    totalConcern: 0,
    earning: { weeklyAverage: 0, series: [], labels: [] },
    expense: { weeklyAverage: 0, series: [], labels: [] },
  });


  const [recentFeedbacks, setRecentFeedbacks] = useState([])

  console.log('concernData', concernData)


  useEffect(() => {
    let mounted = true
      ; (async () => {
        try {
          setLoading(true)
          setError(null)

          const query = [];
          if (dateRange.from) query.push(`from=${dateRange.from}`);
          if (dateRange.to) query.push(`to=${dateRange.to}`);

          const rights = JSON.parse(localStorage.getItem("rights") || "{}");
          const modules = (rights?.permissions || []).map(p => p.module);
          const loginType = localStorage.getItem("loginType") || "user";

          if (modules.length) {
            query.push(`modules=${modules.join(",")}`);
          }

          query.push(`loginType=${loginType}`);

          const qs = query.length ? `?${query.join("&")}` : "";

          console.log('qs', qs)

          const res = await ApiGet(`/admin/dashboard${qs}`);
          console.log('res', res)
          const data = res?.data?.data || res?.data || {}

          if (!mounted) return

          // KPIs
          setKpis(data.kpis || kpis)

          const series = Array.isArray(data?.ipdTrends?.series) ? data.ipdTrends.series : []
          const ipdTrendMapped = series.map((row) => {
            const avg = Number(row.value || 0)
            const pct = Math.round((avg / 5) * 100)
            return {
              month: row.date,
              nursing: Math.max(0, Math.min(100, pct)),
              doctor: Math.max(0, Math.min(100, Math.round(pct * 0.97 + 2))),
              satisfaction: pct,
              totalFeedbacks: 0,
              avgRating: avg.toFixed(1),
              complaints: 0,
              resolved: 0,
            }
          })

          setIpdFeedbackTrend(ipdTrendMapped)

          // ----- OPD donut + header -----
          const opd = data?.opdSatisfaction || {}
          setOpdSummary({
            avgRating: Number(opd.avgRating || 0),
            positivePercent: Number(opd.positivePercent || 0),
            responses: Number(opd.responses || 0),
          })
          const donut = Array.isArray(opd?.donut) ? opd.donut : []
          setOpdFeedbackData(
            donut.map((d) => ({
              name: d.label,
              value: Number(d.value || 0),
              color: OPD_COLORS[d.label] || "#8b5cf6",
              count: Number(d.value || 0),
              percentage: `${Number(d.percent || 0)}%`,
              trend: "",
            }))
          )


          // ----- Concerns (Admin vs Non-admin) -----
// ----- Concerns (Admin vs Non-admin) -----
let statusCounts = { Open: 0, "In Progress": 0, Resolved: 0 };
let totalForThisWeek = 0;

if (loginType === "admin") {
  // ✅ For admins, trust KPI values
  statusCounts = {
    Open: Number(data.kpis?.openIssues || 0),
    "In Progress": Number(data.kpis?.inProgressIssues || 0),
    Resolved: Number(data.kpis?.resolvedIssues || 0),
  };
  totalForThisWeek = Number(data.kpis?.totalConcern || 0);

} else {
  // ✅ For non-admin, fallback to concerns array
  const latestWeek = (data.concerns || [])[0] || { countsByModule: {}, total: 0 };
  totalForThisWeek = latestWeek.total || 0;

  // sum across modules
  Object.values(latestWeek.countsByModule || {}).forEach(mod => {
    statusCounts.Open += mod.Open || 0;
    statusCounts["In Progress"] += mod["In Progress"] || 0;
    statusCounts.Resolved += mod.Resolved || 0;
  });

  // normalize to backend's deduped total
  if (totalForThisWeek > 0) {
    const sum = statusCounts.Open + statusCounts["In Progress"] + statusCounts.Resolved;
    const factor = totalForThisWeek / sum;
    Object.keys(statusCounts).forEach(k => {
      statusCounts[k] = Math.round(statusCounts[k] * factor);
    });
  }
}

// finally set donut data
setConcernData(
  ["Open", "In Progress", "Resolved"].map(k => ({
    name: k,
    value: Number(statusCounts[k] || 0),
    color: CONCERN_COLORS[k],
    details: `This week's total: ${totalForThisWeek}`,
  }))
);

// sync total concerns in KPIs as well
setKpis(prev => ({
  ...(data.kpis || prev),
  totalConcern: totalForThisWeek,
}));



          setConcernData(
            ["Open", "In Progress", "Resolved"].map(k => ({
              name: k,
              value: Number(statusCounts[k] || 0),
              color: CONCERN_COLORS[k],
              details: `This week's total: ${totalForThisWeek}`,
            }))
          );

          setKpis(prev => ({
            ...(data.kpis || prev),
            totalConcern: totalForThisWeek,
          }));

          // ----- Department bars -----
   // Define readable names
const DEPT_LABEL = {
  doctorServices: "Doctor Services",
  billingServices: "Billing Services",
  housekeeping: "Housekeeping",
  maintenance: "Maintenance",
  diagnosticServices: "Diagnostic Services",
  dietitianServices: "Dietitian Services",
  security: "Security",
  nursing: "Nursing",
  frontDesk: "Front Desk",
};

const dept = Array.isArray(data?.departmentAnalysis) ? data.departmentAnalysis : []

// Map backend keys into readable department names
setDepartmentData(
  dept.map((d) => {
    const deptName = DEPT_LABEL[d.department] || d.department || "Other";
    return {
      department: deptName,  // ✅ show "Housekeeping" not "general"
      concerns: Number(d.value || 0),
    };
  })
)



          // ----- Recent feedbacks -----
          const rec = Array.isArray(data?.recentFeedbacks) ? data.recentFeedbacks : []
          setRecentFeedbacks(
            rec.map((r, i) => ({
              id: i + 1,
              name: r.patientName || "-",
              type: r.type || "-",
              rating: Number(r.rating || 0),
              department: "-", // not provided
              time: new Date(r.createdAt || Date.now()).toLocaleTimeString(),
              room: r.bedNo, // not provided
              doctor: r.doctor || "-",
              age: "-", // not provided
              contact: r.contact || "-",
              complaint: "-", // not provided
              duration: "-", // not provided
              feedback: r.comment || "-",
            }))
          )
        } catch (e) {
          console.error("Dashboard fetch failed:", e)
          setError("Failed to load dashboard")
        } finally {
          setLoading(false)
        }
      })()
    return () => {
      mounted = false
    }
  }, [dateRange])


  console.log('ipdTrendFeedback', ipdFeedbackTrend)


  return (
    <>

      <section className="flex w-[100%] h-[100%] select-none   md11:pr-[15px] overflow-hidden">
        <div className="flex w-[100%] flex-col gap-[0px] h-[100vh]">
          <Header pageName="Dashboard" onDateRangeChange={setDateRange} />
          <div className="flex  w-[100%] h-[100%]">
            <SideBar />
            <div className="flex flex-col w-[100%]  relative max-h-[93%]  md34:!pb-[120px] m md11:!pb-[20px] py-[10px] pr-[10px]  overflow-y-auto gap-[10px] rounded-[10px]">
              <Preloader />
              <Fragment>
                <Breadcrumbs mainTitle="Default" parent="Dashboard" title="Default" />
                <Container fluid={true}>
                  {/* <Row className="widget-grid"> */}
                  {/* <Row className=""> */}

                  <div className=" ">


                    <WidgetsWrapper kpis={kpis} />
                    <div className=" flex md11:!flex-row flex-col  gap-[25px] w-[100%]">

                      <div className=" md11:!w-[850px] max-w-[900px]">


                        <OverallBalance kpis={kpis} opdSummary={opdSummary} />
                      </div>
                      <div className=" md34:hidden md11:!flex w-[400px]">
                        <RecentOrders
                          overallNps={kpis?.npsRating?.value}
                        />
                      </div>
                    </div>
          

                    <>


                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 ">
                    
                        <div className=" flex md77:flex-row md34:flex-col md77:!gap-[20px] ">

                          <div className=" md11:!hidden  ">
                            <RecentOrders
                              overallNps={kpis?.npsRating?.value}
                            />
                          </div>
                          <ConcernSummaryDonutChart data={concernData} />

                        </div>
                        {/* Department Analysis */}
                        <motion.div variants={itemVariants}>
                          <motion.div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-sm p-3 border border-white/50" whileHover={{ scale: 1.01 }} transition={{ duration: 0.3 }}>
                            <div className="flex items-center justify-between mb-6">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                                  <BarChart3 className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <h3 className="text-xl font-bold text-gray-900">Department Analysis</h3>
                                  <p className="text-sm text-gray-600">{departmentData.length} departments</p>
                                </div>
                              </div>
                            </div>
                            <div className="h-72">
                              <ResponsiveContainer width="100%" height="100%">
                                {/* keep your original 'concerns' key */}
                                <BarChart data={departmentData} margin={{ top: 10, right: 20, left: 10, bottom: 60 }}>
                                  <defs>
                                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.9} />
                                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.9} />
                                    </linearGradient>
                                  </defs>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                  <XAxis dataKey="department" tick={{ fontSize: 11, fill: "#6b7280" }} angle={-45} textAnchor="end" height={80} />
                                  <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} />
                                  <Tooltip />
                                  <Bar dataKey="concerns" fill="url(#barGradient)" radius={[6, 6, 0, 0]} animationDuration={800} />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </motion.div>
                        </motion.div>
                      </div>



                      <motion.div variants={itemVariants}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center">
                              <Clock className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h2 className="text-xl font-bold text-gray-900">Recent Feedbacks</h2>
                              <p className="text-[10px] text-gray-600">Latest patient responses and ratings</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className=" md11:!flex md34:!hidden text-sm text-blue-600 font-semibold">{recentFeedbacks.length} recent entries</p>
                          </div>
                        </div>

                        <motion.div className="bg-white/90. md34:!hidden md11:!block backdrop-blur-sm rounded-xl shadow-xl border border-white/50 overflow-hidden" whileHover={{ scale: 1.002 }} transition={{ duration: 0.3 }}>
                          <div className="overflow-x-auto">
                            <table className="w-full min-w-[1000px]">
                              <thead className=" bg-gray-100">
                                <tr>
                                  <th className="px-6 py-3 text-left text-sm flex-shrink-0 font-bold text-gray-900">Patient Details</th>
                                  <th className="px-6 py-3 text-left text-sm  flex-shrink-0 font-bold text-gray-900">Visit Info</th>
                                  <th className="px-6 py-3 text-left text-sm flex-shrink-0 font-bold text-gray-900">Medical Details</th>
                                  <th className="px-6 py-3 text-left text-sm flex-shrink-0 font-bold text-gray-900">Rating</th>
                                  <th className="px-6 py-3 text-left text-sm font-bold flex-shrink-0 text-gray-900">Feedback</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                {recentFeedbacks.map((feedback, index) => (
                                  <motion.tr
                                    key={feedback.id}
                                    className="hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-blue-50/50 transition-all duration-200"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                  >
                                    <td className="px-6 py-2">
                                      <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                                          {String(feedback.name || "-").charAt(0)}
                                        </div>
                                        <div>
                                          <div className="font-semibold text-gray-900">{feedback.name}</div>
                                          {/* <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <User className="w-3 h-3" />
                                            <span>Age: {feedback.age}</span>
                                          </div> */}
                                          <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <Phone className="w-3 h-3" />
                                            <span>{feedback.contact}</span>
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-6 py-2">
                                      <div className="space-y-1">
                                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${feedback.type === "IPD" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"}`}>
                                          {feedback.type}
                                        </span>
                                        {/* <div className="text-sm text-gray-600">{feedback.department}</div> */}
                                        {/* <div className="flex items-center gap-2 text-xs text-gray-500">
                                          <MapPin className="w-3 h-3" />
                                          <span>{feedback.room}</span>
                                        </div> */}
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                          <Timer className="w-3 h-3" />
                                          <span>{feedback.time}</span>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-6 py-2">
                                      <div className="space-y-1">
                                        <div className="text-sm font-medium text-gray-900">{feedback.doctor}</div>
                                        {/* <div className="text-sm text-gray-600">Complaint: {feedback.complaint}</div> */}
                                        {/* <div className="text-xs text-gray-500">Duration: {feedback.duration}</div> */}
                                      </div>
                                    </td>
                                    <td className="px-6 py-2">
                                      <div className="flex flex-col items-left justify-center gap-2">
                                        <StarRating rating={Math.round(feedback.rating || 0)} />
                                        <span className="text-sm font-semibold text-gray-900">{Number(feedback.rating || 0).toFixed(1)}/5</span>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4">
                                      <div className="max-w-xs">
                                        <p className="text-sm text-gray-700 line-clamp-3">{feedback.feedback}</p>
                                      </div>
                                    </td>
                                  </motion.tr>
                                ))}
                              </tbody>
                            </table>
                          </div>








                          <div className="px-6 py-4 bg-gray-50/50 border-top border-gray-200">
                            <div className="flex items-center justify-between text-sm text-gray-600">
                              <span>Showing {recentFeedbacks.length} recent feedbacks</span>
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                                  <span>IPD</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                  <span>OPD</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>




                        <div className="   md11:!hidden md34:!flex flex-col pb-[70px] gap-[10px]">
                          <div className=" grid grid-cols-2 mt-[10px] gap-[15px]">
                            {recentFeedbacks.map((feedback, index) => (
                              <>
                                <div key={feedback.id} className="  bg-white overflow-hidden relative flex px-[10px] shadow-sm py-[10px] border-[1.3px]  rounded-[10px] border-[#dcdcdc] flex-col gap-[7px]">
                                  <div className=" flex gap-[10px] items-start border-b-[1.8px] border-blue-200 border-dashed pb-[10px]">


                                    {/* <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                                      {String(feedback.name || "-").charAt(0)}
                                    </div> */}
                                    <div>
                                      <div className="font-semibold text-gray-900">{feedback.name}</div>

                                      <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <Phone className="w-3 h-3" />
                                        <span>{feedback.contact}</span>
                                      </div>

                                      <span className={`inline-flex absolute top-[6px] right-[6px] px-3 py-1 rounded-full text-xs font-semibold ${feedback.type === "IPD" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"}`}>
                                        {feedback.type}
                                      </span>

                                    </div>
                                  </div>

                                  <div className="space-y-1 flex items-center justify-between">


                                    <div className="space-y-1">
                                      <div className="text-sm font-medium text-gray-900">{feedback.doctor}</div>
                                    </div>

                                  </div>


                                  <div className="flex  items-center gap-2">
                                    <StarRating rating={Math.round(feedback.rating || 0)} />
                                    <span className="text-sm font-semibold text-gray-900">{Number(feedback.rating || 0).toFixed(1)}/5</span>
                                  </div>
                                  <div className="max-w-xs">
                                    <p className="text-sm text-gray-700 line-clamp-3">{feedback.feedback}</p>
                                  </div>

                                </div>
                              </>
                            ))}
                          </div>


                        </div>

                        {error && <div className="text-red-600 text-sm mt-3">{error}</div>}
                      </motion.div>


                    </>

                  </div>
                </Container>
              </Fragment>
            </div>

          </div>
        </div>
      </section>





    </>
  )
}
