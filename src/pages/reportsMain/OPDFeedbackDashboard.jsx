import React, { useEffect, useState } from 'react'
import Header from '../../Component/header/Header'
import SideBar from '../../Component/sidebar/SideBar'
import { Calendar,FileText, Download, Search, Filter, Users, Star, ThumbsUp, Award, Phone, User, Clock } from "lucide-react"



export default function OPDFeedbackDashboard() {
  const [dateFrom, setDateFrom] = useState("2024-01-01")
  const [dateTo, setDateTo] = useState("2024-01-31")
  const [selectedService, setSelectedService] = useState("All Services")
  const [selectedDoctor, setSelectedDoctor] = useState("All Doctors")
  const [searchTerm, setSearchTerm] = useState("")

  // Sample data
  const kpiData = {
    totalFeedback: 113,
    averageRating: 4.3,
    npsRating: 78,
    overallScore: "Good",
  }

  const chartData = [
    { label: "Excellent", count: 28, percentage: 39, color: "#10B981" },
    { label: "Very Good", count: 18, percentage: 25, color: "#3B82F6" },
    { label: "Good", count: 12, percentage: 17, color: "#06B6D4" },
    { label: "Average", count: 8, percentage: 11, color: "#EAB308" },
    { label: "Poor", count: 3, percentage: 4, color: "#F97316" },
    { label: "Very Poor", count: 2, percentage: 3, color: "#EF4444" },
  ]



  const defaultColors = [
    '#3b82f6', // blue
    '#ef4444', // red
    '#10b981', // green
    '#f59e0b', // amber
    '#8b5cf6', // violet
    '#ec4899', // pink
  ]

  // Line chart data
  const lineChartData = [
    { month: "OCT", value: 45 },
    { month: "NOV", value: 65 },
    { month: "DEC", value: 42 },
    { month: "JAN", value: 40 },
    { month: "FEB", value: 55 },
    { month: "MAR", value: 15 },
    { month: "APR", value: 35 },
    { month: "MAY", value: 62 },
    { month: "JUN", value: 75 },
  ]

  const serviceData = [
    { service: "Appointment", excellent: 35, good: 30, average: 20, poor: 10, veryPoor: 5 },
    { service: "Reception Staff", excellent: 40, good: 35, average: 15, poor: 7, veryPoor: 3 },
    { service: "Diagnostic Services", excellent: 45, good: 25, average: 18, poor: 8, veryPoor: 4 },
    { service: "Lab / Radio", excellent: 38, good: 32, average: 16, poor: 9, veryPoor: 5 },
    { service: "Doctor Service", excellent: 50, good: 28, average: 12, poor: 7, veryPoor: 3 },
    { service: "Security", excellent: 42, good: 30, average: 18, poor: 6, veryPoor: 4 },
  ]

  const patientFeedback = [
    {
      id: 1,
      date: "2024-01-15 10:30",
      patient: "John Smith",
      contact: "+91 9876543210",
      doctor: "Dr. Sharma",
      rating: 5,
      comment: "Excellent service, very professional staff",
    },
    {
      id: 2,
      date: "2024-01-15 11:45",
      patient: "Mary Johnson",
      contact: "+91 9876543211",
      doctor: "Dr. Patel",
      rating: 4,
      comment: "Good experience, waiting time was reasonable",
    },
    {
      id: 3,
      date: "2024-01-15 14:20",
      patient: "Robert Brown",
      contact: "+91 9876543212",
      doctor: "Dr. Kumar",
      rating: 3,
      comment: "Average service, room for improvement",
    },
    {
      id: 4,
      date: "2024-01-15 15:30",
      patient: "Sarah Davis",
      contact: "+91 9876543213",
      doctor: "Dr. Singh",
      rating: 5,
      comment: "Outstanding care and attention",
    },
    {
      id: 5,
      date: "2024-01-16 09:15",
      patient: "Michael Wilson",
      contact: "+91 9876543214",
      doctor: "Dr. Sharma",
      rating: 4,
      comment: "Professional staff, clean facilities",
    },
    {
      id: 6,
      date: "2024-01-16 10:45",
      patient: "Emily Taylor",
      contact: "+91 9876543215",
      doctor: "Dr. Patel",
      rating: 2,
      comment: "Long waiting time, staff could be more helpful",
    },
    {
      id: 7,
      date: "2024-01-16 12:30",
      patient: "David Anderson",
      contact: "+91 9876543216",
      doctor: "Dr. Kumar",
      rating: 5,
      comment: "Excellent diagnosis and treatment",
    },
    {
      id: 8,
      date: "2024-01-16 14:15",
      patient: "Lisa Martinez",
      contact: "+91 9876543217",
      doctor: "Dr. Singh",
      rating: 4,
      comment: "Good overall experience",
    },
    {
      id: 9,
      date: "2024-01-17 08:30",
      patient: "James Garcia",
      contact: "+91 9876543218",
      doctor: "Dr. Sharma",
      rating: 3,
      comment: "Satisfactory service",
    },
    {
      id: 10,
      date: "2024-01-17 11:20",
      patient: "Jennifer Lopez",
      contact: "+91 9876543219",
      doctor: "Dr. Patel",
      rating: 5,
      comment: "Highly recommend this hospital",
    },
  ]

  const filteredFeedback = patientFeedback.filter(
    (feedback) =>
      feedback.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.comment.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getRatingStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < rating ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
    ))
  }

  const exportToExcel = () => {
    alert("Export functionality would be implemented here")
  }

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
          <Header pageName="OPD Feedback" />
          <div className="flex gap-[10px] w-[100%] h-[100%]">
            <SideBar />
            <div className="flex flex-col w-[100%] max-h-[90%] pb-[50px] pr-[15px] bg-[#fff] overflow-y-auto gap-[30px] rounded-[10px]">
              <div className="">
                <div className=" mx-auto">
                  {/* Header */}
       

                  {/* KPI Cards - Non-box style */}
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
                        <LineChart data={lineChartData} />
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
                  <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 sm:mb-0">Patient Feedback Details</h3>
                      <div className="flex flex-col sm:flex-row gap-2">
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
                        <button
                          onClick={exportToExcel}
                          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Export to Excel
                        </button>
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
                              Contact
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                              Doctor
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
                              className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50 transition-colors`}
                            >
                              <td className="px-4 py-2 text-sm text-gray-900 border-r border-gray-200">
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
