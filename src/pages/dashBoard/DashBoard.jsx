
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
import IpdList from "../../Component/MainDashboardComponent/IpdList";
import OpdFeedBackDetails from "../../Component/MainDashboardComponent/OpdFeedBackDetails";
import ComplaintsListDash from "../../Component/MainDashboardComponent/ComplaintsListDash";
import FeedbackTable from "../../Component/DashboardFiles/Components/TestingDesign/FeedbackTable";
import AutoPopup from "../../Component/MainDashboardComponent/AutoPopup";
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
// ✅ Normalize date range to be inclusive of "7 full days" (same as Header dropdown)
const today = dayjs().endOf("day");
const [dateRange, setDateRange] = useState({
  from: today.subtract(6, "day").format("YYYY-MM-DD"),
  to: today.format("YYYY-MM-DD"),
  range: "7 Days",
  isDefault: true, // ✅ mark as default
});


  const [ipdFeedbackTrend, setIpdFeedbackTrend] = useState([])
  const [opdFeedbackData, setOpdFeedbackData] = useState([])
  const [opdSummary, setOpdSummary] = useState({ avgRating: 0, positivePercent: 0, responses: 0 })
  const [departmentData, setDepartmentData] = useState([])
  const [allowedModules, setAllowedModules] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [concernData, setConcernData] = useState([])
  // ✅ keep KPIs clean and separate from totals
  const [kpis, setKpis] = useState({
    totalFeedback: 0,
    averageRating: { value: 0 },
    npsRating: { value: 0 },
    openIssues: 0,
    resolvedIssues: 0,
    totalConcern: 0,
    earning: { weeklyAverage: 0, series: [], labels: [] },
    expense: { weeklyAverage: 0, series: [], labels: [] },
  });

  // ✅ separate totals
  const [totals, setTotals] = useState({
    totalUsers: 0,
    totalRoleUsers: 0,
    totalAdmins: 0,
    totalTAT: 0,
  });




  const [recentFeedbacks, setRecentFeedbacks] = useState([])

  console.log('concernData', concernData)


  useEffect(() => {
    let mounted = true
      ; (async () => {
        // ✅ Always fetch if default (7 days) or user applied filter
if (!dateRange.from || !dateRange.to) {
  // fallback to last 7 days if missing
  const fallbackTo = dayjs().endOf("day");
  const fallbackFrom = fallbackTo.subtract(6, "day");
  setDateRange({
    from: fallbackFrom.format("YYYY-MM-DD"),
    to: fallbackTo.format("YYYY-MM-DD"),
    range: "7 Days",
    isDefault: true,
  });
  return;
}
        try {
          setLoading(true)
          setError(null)

          const query = [];
          if (dateRange.from) query.push(`from=${dayjs(dateRange.from).format("YYYY-MM-DD")}`);
          if (dateRange.to) query.push(`to=${dayjs(dateRange.to).format("YYYY-MM-DD")}`);
          if (dateRange.range) query.push(`range=${encodeURIComponent(dateRange.range)}`);


          const rights = JSON.parse(localStorage.getItem("rights") || "{}");
          const modules = (rights?.permissions || []).map(p => p.module);
          const loginType = localStorage.getItem("loginType") || "user";

          if (modules.length) {
            query.push(`modules=${modules.join(",")}`);
          }

          query.push(`loginType=${loginType}`);

          const qs = query.length ? `?${query.join("&")}` : "";

          console.log('qs', qs)

          const [res] = await Promise.all([
  ApiGet(`/admin/dashboard${qs}`),
  new Promise((resolve) => setTimeout(resolve, 0)),
]);

const data = res?.data?.data || res.data || {};

// 🏎️ free JS thread before heavy calculations
await new Promise((resolve) => setTimeout(resolve, 0))
          

          if (!mounted) return

if (data.kpis || data.totals) {
  const kpiData = data.kpis || {};
  console.log('kpiData', kpiData)
  const totalsData = data.totals || {};

  // ✅ Earnings and Expense Safety
  const earning = {
    weeklyAverage: kpiData.earning?.weeklyAverage ?? 0,
    series: Array.isArray(kpiData.earning?.series) ? kpiData.earning.series : [],
    labels: Array.isArray(kpiData.earning?.labels) ? kpiData.earning.labels : [],
  };

  const expense = {
    weeklyAverage: kpiData.expense?.weeklyAverage ?? 0,
    series: Array.isArray(kpiData.expense?.series) ? kpiData.expense.series : [],
    labels: Array.isArray(kpiData.expense?.labels) ? kpiData.expense.labels : [],
  };

  // ✅ Handle latest totalResolvedTAT object
  const tatData = kpiData.totalResolvedTAT || {};
  const totalResolvedTAT = {
    hours: tatData.hours ?? 0,
    display: tatData.display || `${tatData.hours ?? 0}h`,
  };

  // ✅ Final KPI Mapping
  setKpis({
    totalFeedback: kpiData.totalFeedback ?? 0,
    averageRating: { value: kpiData.averageRating?.value ?? 0 },
    npsRating: { value: kpiData.npsRating?.value ?? 0 },
    openIssues: kpiData.openIssues ?? 0,
    resolvedIssues: kpiData.resolvedIssues ?? 0,
    totalConcern: kpiData.totalConcern ?? 0,
    totalResolvedTAT,
    earning,
    expense,
  });

  // ✅ Totals Section (used for top widgets)
  setTotals({
    totalUsers: totalsData.totalUsers ?? 0,
    totalRoleUsers: totalsData.totalRoleUsers ?? 0,
    totalAdmins: totalsData.totalAdmins ?? 0,
    totalTAT: totalResolvedTAT.display ?? "—",
  });
}

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
          let statusCounts = { Open: 0, "In Progress": 0, Resolved: 0 };
          let totalForThisWeek = 0;

          if (loginType === "admin") {
            // ✅ For admins, trust KPI values (supports both inProgressIssues & in_progressIssues)
            statusCounts = {
              Open: Number(data.kpis?.openIssues || 0),
              "In Progress": Number(data.kpis?.inProgressIssues || data.kpis?.in_progressIssues || 0),
              Resolved: Number(data.kpis?.resolvedIssues || 0),
            };
            totalForThisWeek = Number(data.kpis?.totalConcern || 0);

          } else {
            // ✅ For non-admin, fallback to concerns array (supports in_progress key)
            const latestWeek = (data.concerns || [])[0] || { countsByModule: {}, total: 0 };
            console.log('latestWeek', latestWeek)
            totalForThisWeek = latestWeek.total || 0;

            // sum across modules
            Object.values(latestWeek.countsByModule || {}).forEach(mod => {
              statusCounts.Open += mod.Open || 0;
              // ✅ use in_progress if present, fallback to "In Progress"
              statusCounts["In Progress"] += mod.in_progress || mod["In Progress"] || 0;
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

          // ✅ finally set donut data
          setConcernData(
            ["Open", "In Progress", "Resolved"].map(k => ({
              name: k,
              value: Number(statusCounts[k] || 0),
              color: CONCERN_COLORS[k],
              details: `This week's total: ${totalForThisWeek}`,
            }))
          );

          // ✅ sync total concerns in KPIs as well
          setKpis(prev => ({
            ...(data.kpis || prev),
            totalConcern: totalForThisWeek,
          }));


         const DEPT_LABEL = {
  doctorServices: "Doctor",
  billingServices: "Front Desk",
  housekeeping: "Housekeeping",
  maintenance: "Maintenance",
  diagnosticServices: "Diagnostic",
  dietitianServices: "Dietitian",
  security: "Security",
  nursing: "Nursing",
};

// ⭐ Normalize backend value before matching
const normalizeDept = (name = "") => {
  const n = name.toLowerCase().trim();

  if (n.includes("doctor")) return "Doctor";
  if (n.includes("billing")) return "Front Desk";
  if (n.includes("front")) return "Front Desk";
  if (n.includes("house")) return "Housekeeping";
  if (n.includes("maint")) return "Maintenance";
  if (n.includes("diag")) return "Diagnostic";
  if (n.includes("diet")) return "Dietitian";
  if (n.includes("secur")) return "Security";
  if (n.includes("nurs")) return "Nursing";

  return name; // fallback
};

const dept = Array.isArray(data?.departmentAnalysis)
  ? data.departmentAnalysis
  : [];

// 🔥 Convert backend array into normalized lookup
const backendDeptMap = {};

dept.forEach((d) => {
  const cleanName = normalizeDept(d.department);
  backendDeptMap[cleanName] = {
    concerns: d.concerns || 0,
    resolved: d.resolved || 0,
    pending: d.pending || 0,
  };
});

// 🔥 Build final unified list
const fullDeptList = Object.values(DEPT_LABEL).map((label) => {
  const match = backendDeptMap[label] || {};

  return {
    department: label,
    concerns: Number(match.concerns || 0),
    resolved: Number(match.resolved || 0),
    pending: Number(match.pending || 0),
  };
});

setDepartmentData(fullDeptList);
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

      <section className="flex w-[100%] h-[100%] select-none  overflow-hidden">
        <div className="flex w-[100%] flex-col gap-[0px] h-[100vh]">

          <Header
  pageName="Dashboard"
  onDateRangeChange={setDateRange}
  selectedRange={dateRange.range} 
/>

          <div className="flex  w-[100%] h-[100%]">
            <SideBar />
            <div className="flex flex-col w-[100%]  relative max-h-[93%]  md34:!pb-[100px] m md11:!pb-[40px] py-[10px] overflow-x-hidden   overflow-y-auto gap-[10px] ">
              <Preloader />
              <Fragment>
                <Breadcrumbs mainTitle="Default" parent="Dashboard" title="Default" />
                <Container fluid={true}>
                  {/* <Row className="widget-grid"> */}
                  {/* <Row className=""> */}

                  <div className=" ">
                    <div className="">
                      <WidgetsWrapper kpis={kpis} totals={totals} />
                    </div>


                    <div className=" flex md11:!flex-row flex-col mt-[3px]  md11:!gap-[18px] w-[100%]">

                      <div className=" w-fit">


                        <OverallBalance
                          kpis={kpis}
                          opdSummary={opdSummary}
                          dateRange={dateRange}
                        />

                      </div>
                      <div className=" md11:!w-[300px]">
                        <RecentOrders
                          overallNps={kpis?.npsRating?.value}
                        />
                      </div>
                      <ConcernSummaryDonutChart data={concernData} />

                    </div>


                    <>


                      <div className="flex  md11:!mt-[-11px] mt-[20px] w-[100%]  gap-6 ">


                        {/* Department Analysis */}
                        <motion.div className=" w-[100%]" variants={itemVariants}>
                          <motion.div className=" md11:!w-[500px] md34:!w-[100%] bg-white/90 backdrop-blur-sm rounded-xl  p-[15px] dashShadow border-white/50" whileHover={{ scale: 1.01 }} transition={{ duration: 0.3 }}>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <div className="w-[35px] h-[35px] bg-gradient-to-br from-blue-500 to-indigo-500 rounded-md flex items-center justify-center">
                                  <BarChart3 className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                  <h3 className="text-md font-[400] text-gray-900">Department Analysis</h3>
                                  <p className="text-[10px] text-gray-600">{departmentData.length} departments</p>
                                </div>
                              </div>
                            </div>
                            <div className="  md11:!ml-[0px] w-[100%]  h-[250px]">
                              <ResponsiveContainer className=" " width="100%" height="100%">
                                {/* keep your original 'concerns' key */}
                                <BarChart data={departmentData} margin={{ top: 10, right: 0, left: -30, bottom: 30 }}>
                                  <defs>
                                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.9} />
                                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.9} />
                                    </linearGradient>
                                  </defs>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                  <XAxis dataKey="department" tick={{ fontSize: 11, fill: "#6b7280" }} angle={-25} textAnchor="end" height={20} />
                                  <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} />
                                  <Tooltip />
                                  <Bar dataKey="concerns" fill="url(#barGradient)" radius={[6, 6, 0, 0]} animationDuration={800} />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </motion.div>
                        </motion.div>
                      </div>

                      {/* <FeedbackTable /> */}
                      <div className=" mt-[10px]">
                        <IpdList />
                      </div>

                      <div className=" mt-[10px]">
                        <OpdFeedBackDetails />
                      </div>
                      <div className=" mt-[7px] pb-[40px] md11:!pb-0">
                        <ComplaintsListDash />
                      </div>


                    </>

                  </div>
                </Container>
              </Fragment>
            </div>

          </div>
        </div>
      </section>
      <AutoPopup 
        title="Last 7 Days Summary" 
        message="Your dashboard data has been refreshed and shows the latest 7-day insights."
      />




    </>
  )
}
