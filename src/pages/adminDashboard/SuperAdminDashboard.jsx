"use client"

import { useState, useEffect } from "react"
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
  Heart,
  Shield,
  Timer,
  MapPin,
  Phone,
  User,
} from "lucide-react"
import Header from "../../Component/header/Header"
import SideBar from "../../Component/sidebar/SideBar"

// Enhanced mock data with more details
const ipdFeedbackTrend = [
  {
    month: "Jan",
    nursing: 85,
    doctor: 92,
    pharmacy: 78,
    cleanliness: 88,
    food: 75,
    totalFeedbacks: 234,
    avgRating: 4.1,
    satisfaction: 82,
    complaints: 12,
    resolved: 10,
  },
  {
    month: "Feb",
    nursing: 88,
    doctor: 94,
    pharmacy: 82,
    cleanliness: 90,
    food: 78,
    totalFeedbacks: 267,
    avgRating: 4.3,
    satisfaction: 85,
    complaints: 8,
    resolved: 7,
  },
  {
    month: "Mar",
    nursing: 90,
    doctor: 96,
    pharmacy: 85,
    cleanliness: 92,
    food: 82,
    totalFeedbacks: 289,
    avgRating: 4.4,
    satisfaction: 88,
    complaints: 6,
    resolved: 6,
  },
  {
    month: "Apr",
    nursing: 87,
    doctor: 93,
    pharmacy: 80,
    cleanliness: 89,
    food: 79,
    totalFeedbacks: 245,
    avgRating: 4.2,
    satisfaction: 84,
    complaints: 10,
    resolved: 8,
  },
  {
    month: "May",
    nursing: 92,
    doctor: 97,
    pharmacy: 88,
    cleanliness: 94,
    food: 85,
    totalFeedbacks: 312,
    avgRating: 4.6,
    satisfaction: 91,
    complaints: 4,
    resolved: 4,
  },
  {
    month: "Jun",
    nursing: 94,
    doctor: 98,
    pharmacy: 90,
    cleanliness: 96,
    food: 88,
    totalFeedbacks: 334,
    avgRating: 4.7,
    satisfaction: 94,
    complaints: 3,
    resolved: 3,
  },
]

const opdFeedbackData = [
  { name: "Excellent", value: 45, color: "#10b981", count: 562, percentage: "45%", trend: "+5%" },
  { name: "Good", value: 35, color: "#3b82f6", count: 437, percentage: "35%", trend: "+2%" },
  { name: "Average", value: 15, color: "#f59e0b", count: 187, percentage: "15%", trend: "-3%" },
  { name: "Poor", value: 5, color: "#ef4444", count: 62, percentage: "5%", trend: "-1%" },
]

const concernData = [
  {
    name: "Open",
    value: 23,
    color: "#ef4444",
    details: "Urgent: 8, Normal: 15",
    avgResolutionTime: "2.5 days",
    priority: { high: 8, medium: 10, low: 5 },
  },
  {
    name: "In Progress",
    value: 15,
    color: "#f59e0b",
    details: "Assigned: 12, Pending: 3",
    avgResolutionTime: "1.8 days",
    priority: { high: 3, medium: 8, low: 4 },
  },
  {
    name: "Resolved",
    value: 62,
    color: "#10b981",
    details: "This Month: 45, Last Week: 17",
    avgResolutionTime: "1.2 days",
    priority: { high: 20, medium: 25, low: 17 },
  },
]

const departmentData = [
  {
    department: "Front Desk",
    concerns: 12,
    resolved: 8,
    pending: 4,
    avgTime: "2.3 days",
    satisfaction: 78,
    staff: 15,
    workload: "High",
  },
  {
    department: "Nursing",
    concerns: 8,
    resolved: 6,
    pending: 2,
    avgTime: "1.8 days",
    satisfaction: 92,
    staff: 45,
    workload: "Medium",
  },
  {
    department: "Housekeeping",
    concerns: 15,
    resolved: 10,
    pending: 5,
    avgTime: "3.1 days",
    satisfaction: 65,
    staff: 25,
    workload: "High",
  },
  {
    department: "Maintenance",
    concerns: 6,
    resolved: 4,
    pending: 2,
    avgTime: "4.2 days",
    satisfaction: 70,
    staff: 12,
    workload: "Medium",
  },
  {
    department: "Pharmacy",
    concerns: 9,
    resolved: 7,
    pending: 2,
    avgTime: "1.5 days",
    satisfaction: 88,
    staff: 18,
    workload: "Low",
  },
  {
    department: "Laboratory",
    concerns: 4,
    resolved: 3,
    pending: 1,
    avgTime: "2.0 days",
    satisfaction: 85,
    staff: 20,
    workload: "Low",
  },
]

const recentFeedbacks = [
  {
    id: 1,
    name: "Rajesh Kumar",
    type: "IPD",
    rating: 5,
    department: "Cardiology",
    time: "10:30 AM",
    room: "A-201",
    doctor: "Dr. Sharma",
    age: 45,
    contact: "+91 98765 43210",
    complaint: "Chest pain",
    duration: "3 days",
    feedback: "Excellent care and attention from nursing staff. Very satisfied with the treatment.",
  },
  {
    id: 2,
    name: "Priya Sharma",
    type: "OPD",
    rating: 4,
    department: "Orthopedics",
    time: "11:15 AM",
    room: "OPD-12",
    doctor: "Dr. Patel",
    age: 32,
    contact: "+91 98765 43211",
    complaint: "Knee pain",
    duration: "1 day",
    feedback: "Good service but waiting time was a bit long. Overall positive experience.",
  },
  {
    id: 3,
    name: "Amit Patel",
    type: "IPD",
    rating: 5,
    department: "Neurology",
    time: "12:00 PM",
    room: "B-105",
    doctor: "Dr. Singh",
    age: 58,
    contact: "+91 98765 43212",
    complaint: "Headache",
    duration: "2 days",
    feedback: "Outstanding medical care. Doctors were very professional and caring.",
  },
  {
    id: 4,
    name: "Sunita Devi",
    type: "OPD",
    rating: 3,
    department: "General",
    time: "12:45 PM",
    room: "OPD-8",
    doctor: "Dr. Gupta",
    age: 41,
    contact: "+91 98765 43213",
    complaint: "Fever",
    duration: "1 day",
    feedback: "Average experience. Room cleanliness could be improved.",
  },
  {
    id: 5,
    name: "Vikram Singh",
    type: "IPD",
    rating: 4,
    department: "Pediatrics",
    time: "1:20 PM",
    room: "C-302",
    doctor: "Dr. Mehta",
    age: 8,
    contact: "+91 98765 43214",
    complaint: "Fever",
    duration: "1 day",
    feedback: "Good facilities and staff behavior. Food quality was satisfactory.",
  },
  {
    id: 6,
    name: "Anita Roy",
    type: "OPD",
    rating: 5,
    department: "Dermatology",
    time: "2:10 PM",
    room: "OPD-15",
    doctor: "Dr. Joshi",
    age: 29,
    contact: "+91 98765 43215",
    complaint: "Skin rash",
    duration: "3 days",
    feedback: "Excellent consultation and treatment. Very happy with the service.",
  },
]

const performanceMetrics = [
  { metric: "Patient Satisfaction", current: 87, target: 90, trend: "+3%", status: "improving" },
  { metric: "Response Time", current: 2.3, target: 2.0, trend: "-0.2", status: "improving", unit: "min" },
  { metric: "Resolution Rate", current: 94, target: 95, trend: "+1%", status: "stable" },
  { metric: "Staff Efficiency", current: 82, target: 85, trend: "+2%", status: "improving" },
]

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
    },
  },
}

// Enhanced Custom Tooltip with more details
function EnhancedTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/95 backdrop-blur-sm p-5 rounded-2xl shadow-2xl border border-gray-200 min-w-[280px]"
      >
        <div className="border-b border-gray-200 pb-3 mb-3">
          <p className="font-bold text-gray-900 text-lg text-center">{label}</p>
        </div>
        <div className="space-y-2">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-sm font-medium capitalize">{entry.name}:</span>
              </div>
              <span className="font-bold text-lg" style={{ color: entry.color }}>
                {entry.value}
                {entry.name === "satisfaction" ? "%" : ""}
              </span>
            </div>
          ))}
        </div>
        {payload[0]?.payload && (
          <div className="mt-4 pt-3 border-t border-gray-200 space-y-1">
            <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
              <div>
                <span className="font-medium">Total Feedbacks:</span>
                <br />
                <span className="text-purple-600 font-bold">{payload[0].payload.totalFeedbacks}</span>
              </div>
              <div>
                <span className="font-medium">Avg Rating:</span>
                <br />
                <span className="text-blue-600 font-bold">{payload[0].payload.avgRating}/5</span>
              </div>
              <div>
                <span className="font-medium">Satisfaction:</span>
                <br />
                <span className="text-green-600 font-bold">{payload[0].payload.satisfaction}%</span>
              </div>
              <div>
                <span className="font-medium">Complaints:</span>
                <br />
                <span className="text-red-600 font-bold">{payload[0].payload.complaints}</span>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    )
  }
  return null
}

// Date Filter Component
function DateFilter({ selectedRange, onRangeChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const ranges = [
    { label: "Last 7 Days", value: "7d" },
    { label: "Last 30 Days", value: "30d" },
    { label: "Last 3 Months", value: "3m" },
    { label: "Last 6 Months", value: "6m" },
    { label: "This Year", value: "1y" },
  ]

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-6 py-3 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 text-sm font-medium text-gray-700 hover:bg-white transition-all"
      >
        <Calendar className="w-5 h-5 text-purple-600" />
        {ranges.find((r) => r.value === selectedRange)?.label || "Select Range"}
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </motion.button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 py-2 z-50"
        >
          {ranges.map((range) => (
            <button
              key={range.value}
              onClick={() => {
                onRangeChange(range.value)
                setIsOpen(false)
              }}
              className={`w-full text-left px-4 py-3 text-sm hover:bg-purple-50 transition-colors ${
                selectedRange === range.value ? "bg-purple-100 text-purple-700 font-medium" : "text-gray-700"
              }`}
            >
              {range.label}
            </button>
          ))}
        </motion.div>
      )}
    </div>
  )
}

// Progress Bar Component
function ProgressBar({ value, max = 100, color = "purple" }) {
  const percentage = (value / max) * 100
  const colorClasses = {
    purple: "bg-purple-500",
    blue: "bg-blue-500",
    green: "bg-green-500",
    red: "bg-red-500",
    yellow: "bg-yellow-500",
  }

  return (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <motion.div
        className={`h-2 rounded-full ${colorClasses[color]}`}
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
    </div>
  )
}

// Star Rating Component
function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star key={star} className={`w-4 h-4 ${star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
      ))}
    </div>
  )
}

// Loading Spinner
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <motion.div
        className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
      />
    </div>
  )
}

export default function SuperAdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState("30d")

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }
  return (
    <>
             <section className="flex w-[100%] h-[100%] select-none p-[15px] overflow-hidden">
                <div className="flex w-[100%] flex-col gap-[14px] h-[96vh]">
                  <Header pageName="Dashboard" />
                  <div className="flex gap-[10px] w-[100%] h-[100%]">
                    <SideBar />
                    <div className="flex flex-col w-[100%] max-h-[90%] pb-[50px] pr-[15px] overflow-y-auto gap-[30px] rounded-[10px]">
                    
          

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-4 sm:p-6 lg:p-8">
      <motion.div className="max-w-7xl mx-auto" variants={containerVariants} initial="hidden" animate="visible">
        {/* Header with Date Filter */}
        {/* <motion.div variants={itemVariants} className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 bg-clip-text text-transparent mb-2">
              Super Admin Dashboard
            </h1>
            <p className="text-gray-600 text-lg">Comprehensive hospital analytics and insights</p>
          </div>
          <DateFilter selectedRange={dateRange} onRangeChange={setDateRange} />
        </motion.div> */}

        {/* Enhanced Top Stats Grid */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              className="bg-gradient-to-br from-purple-500 via-purple-600 to-blue-600 rounded-xl shadow-xl p-3 text-white relative overflow-hidden"
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-8 -translate-x-8"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <Zap className="w-8 h-8 text-white/90" />
                  <div className="text-right">
                    <span className="text-xs text-white/70 bg-white/20 px-2 py-1 rounded-full">↗ 12%</span>
                  </div>
                </div>
                <p className="text-4xl font-bold mb-1">1,247</p>
                <p className="text-white/90 text-sm mb-2">Total Feedbacks</p>
                <div className="flex items-center gap-2 text-xs text-white/80">
                  <Activity className="w-3 h-3" />
                  <span>+156 this week</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-3 border border-white/50"
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">↗ 0.3</span>
                </div>
              </div>
              <p className="text-4xl font-bold text-gray-900 mb-1">4.2</p>
              <p className="text-gray-600 text-sm mb-2">Average Rating</p>
              <ProgressBar value={84} color="yellow" />
              <p className="text-xs text-gray-500 mt-1">84% satisfaction rate</p>
            </motion.div>

            <motion.div
              className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-3 border border-white/50"
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-2xl flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded-full">↗ 5</span>
                </div>
              </div>
              <p className="text-4xl font-bold text-gray-900 mb-1">23</p>
              <p className="text-gray-600 text-sm mb-2">Open Issues</p>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>8 Urgent</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span>15 Normal</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-3 border border-white/50"
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">↗ 5%</span>
                </div>
              </div>
              <p className="text-4xl font-bold text-gray-900 mb-1">87%</p>
              <p className="text-gray-600 text-sm mb-2">Response Rate</p>
              <ProgressBar value={87} color="green" />
              <p className="text-xs text-gray-500 mt-1">Target: 90%</p>
            </motion.div>
          </div>
        </motion.div>

        {/* Performance Metrics */}
        {/* <motion.div variants={itemVariants} className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Heart className="w-6 h-6 text-red-500" />
            Performance Metrics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {performanceMetrics.map((metric, index) => (
              <motion.div
                key={metric.metric}
                className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-5 border border-white/50"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-700">{metric.metric}</h3>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      metric.status === "improving"
                        ? "bg-green-100 text-green-700"
                        : metric.status === "stable"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-red-100 text-red-700"
                    }`}
                  >
                    {metric.trend}
                  </span>
                </div>
                <div className="flex items-end gap-2 mb-2">
                  <span className="text-2xl font-bold text-gray-900">
                    {metric.current}
                    {metric.unit || "%"}
                  </span>
                  <span className="text-sm text-gray-500">/ {metric.target}</span>
                </div>
                <ProgressBar value={metric.current} max={metric.target} color="purple" />
              </motion.div>
            ))}
          </div>
        </motion.div> */}

        {/* Enhanced Charts Grid */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* IPD Trends - Enhanced */}
            <motion.div
              className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-3 border border-white/50"
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center">
                    <LineChartIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">IPD Feedback Trends</h3>
                    <p className="text-sm text-gray-600">Monthly performance analysis</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-green-600 font-semibold">↗ 12% improvement</p>
                  <p className="text-xs text-gray-500">vs last period</p>
                </div>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={ipdFeedbackTrend}>
                    <defs>
                      <linearGradient id="nursing" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
                      </linearGradient>
                      <linearGradient id="doctor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                      </linearGradient>
                      <linearGradient id="satisfaction" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#6b7280" }} />
                    <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} />
                    <Tooltip content={<EnhancedTooltip />} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="nursing"
                      stroke="#8b5cf6"
                      fillOpacity={1}
                      fill="url(#nursing)"
                      strokeWidth={3}
                    />
                    <Area
                      type="monotone"
                      dataKey="doctor"
                      stroke="#3b82f6"
                      fillOpacity={1}
                      fill="url(#doctor)"
                      strokeWidth={3}
                    />
                    <Line
                      type="monotone"
                      dataKey="satisfaction"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* OPD Distribution - Enhanced */}
            <motion.div
              className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-3 border border-white/50"
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-teal-500 rounded-2xl flex items-center justify-center">
                    <PieChartIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">OPD Satisfaction</h3>
                    <p className="text-sm text-gray-600">Patient feedback distribution</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-green-600 font-semibold">94% positive</p>
                  <p className="text-xs text-gray-500">1,248 responses</p>
                </div>
              </div>
              <div className="h-80 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={opdFeedbackData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={3}
                      dataKey="value"
                      animationBegin={0}
                      animationDuration={1000}
                    >
                      {opdFeedbackData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload
                          return (
                            <div className="bg-white/95 backdrop-blur-sm p-4 rounded-2xl shadow-xl border border-gray-200">
                              <p className="font-bold text-gray-900 text-lg">{data.name}</p>
                              <div className="mt-2 space-y-1">
                                <p className="text-sm text-gray-600">Count: {data.count}</p>
                                <p className="text-sm text-gray-600">Percentage: {data.percentage}</p>
                                <p className="text-sm text-gray-600">Trend: {data.trend}</p>
                              </div>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-gray-900">4.2</p>
                    <p className="text-sm text-gray-600">Avg Rating</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-center gap-6 mt-4">
                {opdFeedbackData.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <div className="text-center">
                      <span className="text-sm font-medium text-gray-700">{item.name}</span>
                      <p className="text-xs text-gray-500">{item.percentage}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Concerns and Departments - Enhanced */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div variants={itemVariants}>
            <motion.div
              className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-3 border border-white/50"
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Concerns Status</h3>
                    <p className="text-sm text-gray-600">Issue tracking and resolution</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-green-600 font-semibold">62% resolved</p>
                  <p className="text-xs text-gray-500">100 total issues</p>
                </div>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={concernData}
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      innerRadius={40}
                      paddingAngle={5}
                      dataKey="value"
                      animationBegin={0}
                      animationDuration={800}
                    >
                      {concernData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload
                          return (
                            <div className="bg-white/95 backdrop-blur-sm p-4 rounded-2xl shadow-xl border border-gray-200 min-w-[200px]">
                              <p className="font-bold text-gray-900 text-lg mb-2">
                                {data.name}: {data.value}
                              </p>
                              <div className="space-y-1 text-sm text-gray-600">
                                <p>{data.details}</p>
                                <p>Avg Resolution: {data.avgResolutionTime}</p>
                                <div className="mt-2 pt-2 border-t border-gray-200">
                                  <p className="font-medium">Priority Breakdown:</p>
                                  <div className="flex gap-4 text-xs mt-1">
                                    <span>High: {data.priority.high}</span>
                                    <span>Med: {data.priority.medium}</span>
                                    <span>Low: {data.priority.low}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value, entry) => (
                        <span style={{ color: entry.color, fontSize: "14px", fontWeight: "500" }}>{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <motion.div
              className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-3 border border-white/50"
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Department Analysis</h3>
                    <p className="text-sm text-gray-600">Performance by department</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-blue-600 font-semibold">6 departments</p>
                  <p className="text-xs text-gray-500">135 total staff</p>
                </div>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={departmentData} margin={{ top: 10, right: 20, left: 10, bottom: 60 }}>
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.9} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.9} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="department"
                      tick={{ fontSize: 11, fill: "#6b7280" }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload
                          return (
                            <div className="bg-white/95 backdrop-blur-sm p-4 rounded-2xl shadow-xl border border-gray-200 min-w-[220px]">
                              <p className="font-bold text-gray-900 text-lg mb-3">{label}</p>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Total Issues:</span>
                                  <span className="font-semibold">{data.concerns}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Resolved:</span>
                                  <span className="font-semibold text-green-600">{data.resolved}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Pending:</span>
                                  <span className="font-semibold text-red-600">{data.pending}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Avg Time:</span>
                                  <span className="font-semibold">{data.avgTime}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Satisfaction:</span>
                                  <span className="font-semibold">{data.satisfaction}%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Staff Count:</span>
                                  <span className="font-semibold">{data.staff}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Workload:</span>
                                  <span
                                    className={`font-semibold ${
                                      data.workload === "High"
                                        ? "text-red-600"
                                        : data.workload === "Medium"
                                          ? "text-yellow-600"
                                          : "text-green-600"
                                    }`}
                                  >
                                    {data.workload}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Bar dataKey="concerns" fill="url(#barGradient)" radius={[6, 6, 0, 0]} animationDuration={800} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Enhanced Recent Feedbacks Table */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Recent Feedbacks</h2>
                <p className="text-sm text-gray-600">Latest patient responses and ratings</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-600 font-semibold">{recentFeedbacks.length} recent entries</p>
              <p className="text-xs text-gray-500">Last updated: 2 min ago</p>
            </div>
          </div>
          <motion.div
            className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 overflow-hidden"
            whileHover={{ scale: 1.002 }}
            transition={{ duration: 0.3 }}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-teal-500/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Patient Details</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Visit Info</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Medical Details</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Rating</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Feedback</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentFeedbacks.map((feedback, index) => (
                    <motion.tr
                      key={feedback.id}
                      className="hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-blue-50/50 transition-all duration-200"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {feedback.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{feedback.name}</div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <User className="w-3 h-3" />
                              <span>Age: {feedback.age}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Phone className="w-3 h-3" />
                              <span>{feedback.contact}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                              feedback.type === "IPD" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {feedback.type}
                          </span>
                          <div className="text-sm text-gray-600">{feedback.department}</div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <MapPin className="w-3 h-3" />
                            <span>{feedback.room}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Timer className="w-3 h-3" />
                            <span>{feedback.time}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-gray-900">{feedback.doctor}</div>
                          <div className="text-sm text-gray-600">Complaint: {feedback.complaint}</div>
                          <div className="text-xs text-gray-500">Duration: {feedback.duration}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col items-center gap-2">
                          <StarRating rating={feedback.rating} />
                          <span className="text-sm font-semibold text-gray-900">{feedback.rating}/5</span>
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
            <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Showing {recentFeedbacks.length} of 1,247 total feedbacks</span>
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
        </motion.div>
      </motion.div>
    </div>
    
                    </div>
        
                  </div>
                </div>
              </section>
       </>
  )
}
