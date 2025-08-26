"use client"

import { useState } from "react"
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

export default function IPDFeedbackDashboard() {
  const [dateFrom, setDateFrom] = useState("2024-01-01")
  const [dateTo, setDateTo] = useState("2024-01-31")
  const [selectedService, setSelectedService] = useState("All Services")
  const [selectedDoctor, setSelectedDoctor] = useState("All Doctors")
  const [searchTerm, setSearchTerm] = useState("")

  // Sample data
  const kpiData = {
    totalFeedback: 71,
    averageRating: 4.2,
    npsRating: 78,
    overallScore: "Good",
  }

  const ratingData = [
    { label: "Excellent", count: 28, percentage: 39, color: "#10B981" },
    { label: "Very Good", count: 18, percentage: 25, color: "#3B82F6" },
    { label: "Good", count: 12, percentage: 17, color: "#06B6D4" },
    { label: "Average", count: 8, percentage: 11, color: "#EAB308" },
    { label: "Poor", count: 3, percentage: 4, color: "#F97316" },
    { label: "Very Poor", count: 2, percentage: 3, color: "#EF4444" },
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

  const serviceData = [
    { service: "Doctor Experience", excellent: 78, good: 30, average: 12, poor: 15, veryPoor: 10 },
    { service: "Billing Services", excellent: 65, good: 25, average: 18, poor: 8, veryPoor: 4 },
    { service: "Nursing Care", excellent: 82, good: 35, average: 15, poor: 5, veryPoor: 3 },
    { service: "Housekeeping", excellent: 70, good: 28, average: 20, poor: 12, veryPoor: 5 },
    { service: "Food Services", excellent: 60, good: 32, average: 25, poor: 18, veryPoor: 8 },
    { service: "Pharmacy", excellent: 75, good: 30, average: 16, poor: 9, veryPoor: 5 },
  ]

  const patientFeedback = [
    {
      id: 1,
      date: "2024-01-15 10:30",
      patient: "John Smith",
      contact: "+91 9876543210",
      bedNo: "A-101",
      doctor: "Dr. Sharma",
      rating: 5,
      comment: "Excellent care during my stay, very professional nursing staff",
    },
    {
      id: 2,
      date: "2024-01-15 14:45",
      patient: "Mary Johnson",
      contact: "+91 9876543211",
      bedNo: "B-205",
      doctor: "Dr. Patel",
      rating: 4,
      comment: "Good overall experience, room was clean and comfortable",
    },
    {
      id: 3,
      date: "2024-01-16 09:20",
      patient: "Robert Brown",
      contact: "+91 9876543212",
      bedNo: "C-301",
      doctor: "Dr. Kumar",
      rating: 3,
      comment: "Average service, food quality could be improved",
    },
    {
      id: 4,
      date: "2024-01-16 16:30",
      patient: "Sarah Davis",
      contact: "+91 9876543213",
      bedNo: "A-102",
      doctor: "Dr. Singh",
      rating: 5,
      comment: "Outstanding medical care and attention from all staff",
    },
    {
      id: 5,
      date: "2024-01-17 11:15",
      patient: "Michael Wilson",
      contact: "+91 9876543214",
      bedNo: "B-206",
      doctor: "Dr. Sharma",
      rating: 4,
      comment: "Professional staff, clean facilities, prompt service",
    },
    {
      id: 6,
      date: "2024-01-17 13:45",
      patient: "Emily Taylor",
      contact: "+91 9876543215",
      bedNo: "C-302",
      doctor: "Dr. Patel",
      rating: 2,
      comment: "Billing process was confusing, staff could be more helpful",
    },
    {
      id: 7,
      date: "2024-01-18 08:30",
      patient: "David Anderson",
      contact: "+91 9876543216",
      bedNo: "A-103",
      doctor: "Dr. Kumar",
      rating: 5,
      comment: "Excellent diagnosis and treatment, highly recommend",
    },
    {
      id: 8,
      date: "2024-01-18 15:15",
      patient: "Lisa Martinez",
      contact: "+91 9876543217",
      bedNo: "B-207",
      doctor: "Dr. Singh",
      rating: 4,
      comment: "Good nursing care, comfortable stay",
    },
    {
      id: 9,
      date: "2024-01-19 10:30",
      patient: "James Garcia",
      contact: "+91 9876543218",
      bedNo: "C-303",
      doctor: "Dr. Sharma",
      rating: 3,
      comment: "Satisfactory service, room maintenance needs improvement",
    },
    {
      id: 10,
      date: "2024-01-19 12:20",
      patient: "Jennifer Lopez",
      contact: "+91 9876543219",
      bedNo: "A-104",
      doctor: "Dr. Patel",
      rating: 5,
      comment: "Highly recommend this hospital, excellent care throughout",
    },
    {
      id: 11,
      date: "2024-01-20 09:45",
      patient: "William Johnson",
      contact: "+91 9876543220",
      bedNo: "B-208",
      doctor: "Dr. Kumar",
      rating: 4,
      comment: "Good medical care, staff was attentive",
    },
    {
      id: 12,
      date: "2024-01-20 14:30",
      patient: "Amanda White",
      contact: "+91 9876543221",
      bedNo: "C-304",
      doctor: "Dr. Singh",
      rating: 5,
      comment: "Exceptional service, felt well cared for",
    },
    {
      id: 13,
      date: "2024-01-21 11:00",
      patient: "Christopher Lee",
      contact: "+91 9876543222",
      bedNo: "A-105",
      doctor: "Dr. Sharma",
      rating: 3,
      comment: "Average experience, pharmacy service was slow",
    },
    {
      id: 14,
      date: "2024-01-21 16:45",
      patient: "Michelle Brown",
      contact: "+91 9876543223",
      bedNo: "B-209",
      doctor: "Dr. Patel",
      rating: 4,
      comment: "Good overall care, housekeeping was excellent",
    },
    {
      id: 15,
      date: "2024-01-22 08:15",
      patient: "Daniel Wilson",
      contact: "+91 9876543224",
      bedNo: "C-305",
      doctor: "Dr. Kumar",
      rating: 5,
      comment: "Outstanding medical team, very professional",
    },
    {
      id: 16,
      date: "2024-01-22 13:30",
      patient: "Jessica Davis",
      contact: "+91 9876543225",
      bedNo: "A-106",
      doctor: "Dr. Singh",
      rating: 4,
      comment: "Good experience, nursing staff was caring",
    },
    {
      id: 17,
      date: "2024-01-23 10:00",
      patient: "Matthew Taylor",
      contact: "+91 9876543226",
      bedNo: "B-210",
      doctor: "Dr. Sharma",
      rating: 2,
      comment: "Food quality was poor, room was not properly cleaned",
    },
    {
      id: 18,
      date: "2024-01-23 15:20",
      patient: "Ashley Martinez",
      contact: "+91 9876543227",
      bedNo: "C-306",
      doctor: "Dr. Patel",
      rating: 5,
      comment: "Excellent care from admission to discharge",
    },
    {
      id: 19,
      date: "2024-01-24 09:30",
      patient: "Joshua Anderson",
      contact: "+91 9876543228",
      bedNo: "A-107",
      doctor: "Dr. Kumar",
      rating: 4,
      comment: "Professional staff, good medical care",
    },
    {
      id: 20,
      date: "2024-01-24 14:15",
      patient: "Stephanie Garcia",
      contact: "+91 9876543229",
      bedNo: "B-211",
      doctor: "Dr. Singh",
      rating: 3,
      comment: "Average service, billing process needs improvement",
    },
    {
      id: 21,
      date: "2024-01-25 11:45",
      patient: "Andrew Lopez",
      contact: "+91 9876543230",
      bedNo: "C-307",
      doctor: "Dr. Sharma",
      rating: 5,
      comment: "Exceptional care, highly satisfied with treatment",
    },
    {
      id: 22,
      date: "2024-01-25 16:00",
      patient: "Nicole Johnson",
      contact: "+91 9876543231",
      bedNo: "A-108",
      doctor: "Dr. Patel",
      rating: 4,
      comment: "Good overall experience, staff was helpful",
    },
  ]

  const filteredFeedback = patientFeedback.filter(
    (feedback) =>
      feedback.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.bedNo.toLowerCase().includes(searchTerm.toLowerCase()),
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
  const DonutChart = ({ data }) => {
    const size = 220
    const strokeWidth = 45
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI

    let cumulativePercentage = 0

    return (
      <div className="flex flex-col items-center">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#f3f4f6" strokeWidth={strokeWidth} />
          {data.map((item, index) => {
            const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`
            const strokeDashoffset = (-cumulativePercentage * circumference) / 100
            cumulativePercentage += item.percentage

            return (
              <circle
                key={index}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={item.color}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-300"
              />
            )
          })}
        </svg>
        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
          {data.map((item, index) => (
            <div key={index} className="flex items-center">
              <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
              <span className="text-gray-700">
                {item.label}: {item.count} ({item.percentage}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Line Chart Component
  const LineChart = ({ data }) => {
    const width = 450
    const height = 220
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
                <Header pageName="OPD Feedback" />
                <div className="flex gap-[10px] w-[100%] h-[100%]">
                  <SideBar />
                  <div className="flex flex-col w-[100%] max-h-[90%] pb-[50px] pr-[15px] bg-[#fff] overflow-y-auto gap-[30px] rounded-[10px]">
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold text-gray-900">IPD Feedback Analytics</h1>
            <button
              onClick={exportToExcel}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Export to Excel
            </button>
          </div>

          {/* Filter Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>All Services</option>
                  <option>Doctor Services</option>
                  <option>Nursing</option>
                  <option>Housekeeping</option>
                  <option>Billing</option>
                  <option>Food Services</option>
                  <option>Pharmacy</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Doctor Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={selectedDoctor}
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>All Doctors</option>
                  <option>Dr. Sharma</option>
                  <option>Dr. Patel</option>
                  <option>Dr. Kumar</option>
                  <option>Dr. Singh</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Feedback</p>
                <p className="text-2xl font-bold text-gray-900">{kpiData.totalFeedback}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-yellow-500">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Star className="w-8 h-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold text-gray-900">{kpiData.averageRating} / 5</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ThumbsUp className="w-8 h-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">NPS Rating</p>
                <p className="text-2xl font-bold text-gray-900">{kpiData.npsRating}%</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-500">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Award className="w-8 h-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Overall Score</p>
                <p className="text-2xl font-bold text-gray-900">{kpiData.overallScore}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Rating Distribution Donut Chart */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Rating Distribution</h3>
            <div className="flex justify-center">
              <DonutChart data={ratingData} />
            </div>
          </div>

          {/* Average Rating Trend Line Chart */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Average Rating Trend</h3>
            <div className="flex justify-center">
              <LineChart data={lineChartData} />
            </div>
          </div>
        </div>

        {/* Word Cloud */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Feedback Keywords</h3>
          <div className="flex flex-wrap gap-3 justify-center">
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
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  index % 6 === 0
                    ? "bg-blue-100 text-blue-800"
                    : index % 6 === 1
                      ? "bg-green-100 text-green-800"
                      : index % 6 === 2
                        ? "bg-yellow-100 text-yellow-800"
                        : index % 6 === 3
                          ? "bg-purple-100 text-purple-800"
                          : index % 6 === 4
                            ? "bg-red-100 text-red-800"
                            : "bg-indigo-100 text-indigo-800"
                }`}
                style={{ fontSize: `${Math.random() * 0.4 + 0.9}rem` }}
              >
                {word}
              </span>
            ))}
          </div>
        </div>

        {/* Service-Wise Summary Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Service-Wise Summary</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                    Service
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                    Excellent %
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                    Good %
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                    Average %
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                    Poor %
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 border-r border-gray-200">
                      {service.service}
                    </td>
                    <td className="px-6 py-4 text-center text-sm border-r border-gray-200">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {service.excellent}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-sm border-r border-gray-200">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {service.good}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-sm border-r border-gray-200">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        {service.average}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-sm border-r border-gray-200">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        {service.poor}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-sm">
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

        {/* Patient-Wise Feedback Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 sm:mb-0">Patient Feedback Details</h3>
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
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                    Date & Time
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                    Patient Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                    Contact No.
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                    Bed No.
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                    Doctor Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                    Rating
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Comment
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {filteredFeedback.map((feedback, index) => (
                  <tr
                    key={feedback.id}
                    className={`${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-blue-50 transition-colors cursor-pointer`}
                    onClick={() => alert(`Viewing details for ${feedback.patient}`)}
                  >
                    <td className="px-6 py-4 text-sm text-gray-900 border-r border-gray-200">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 text-gray-400 mr-2" />
                        {feedback.date}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 border-r border-gray-200">
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-gray-400 mr-2" />
                        {feedback.patient}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 border-r border-gray-200">
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 text-gray-400 mr-2" />
                        {feedback.contact}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 border-r border-gray-200">
                      <div className="flex items-center">
                        <Bed className="w-4 h-4 text-gray-400 mr-2" />
                        {feedback.bedNo}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 border-r border-gray-200">{feedback.doctor}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 border-r border-gray-200">
                      <div className="flex items-center">
                        {getRatingStars(feedback.rating)}
                        <span className="ml-2 text-sm font-medium">{feedback.rating}/5</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                      <div className="truncate" title={feedback.comment}>
                        {feedback.comment}
                      </div>
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
