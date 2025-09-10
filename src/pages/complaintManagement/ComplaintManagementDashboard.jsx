"use client"

import { useState, useEffect } from "react"
import {
    Calendar,
    Download,
    Search,
    Filter,
    AlertTriangle,
    Clock,
    CheckCircle,
    TrendingUp,
    User,
    Bed,
    Eye,
    MapPin,
    X,
    Phone,
    FileText,
    CalendarIcon,
} from "lucide-react"
import Header from "../../Component/header/Header"
import Sidebar from "../../Component/sidebar/CubaSideBar"
import { useNavigate } from "react-router-dom"
// import CubaSidebar from "../../Component/sidebar/CubaSidebar"

export default function ComplaintManagementDashboard() {
    const [dateFrom, setDateFrom] = useState("2024-01-01")
    const [dateTo, setDateTo] = useState("2024-01-31")
    const [selectedStatus, setSelectedStatus] = useState("All Status")
    const [selectedDepartment, setSelectedDepartment] = useState("All Departments")
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedComplaint, setSelectedComplaint] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [chartAnimated, setChartAnimated] = useState(false)
const navigate = useNavigate()


const handlenavigate =()=>{
    navigate("/complaint-details")
}
    // Trigger chart animation on mount
    useEffect(() => {
        const timer = setTimeout(() => setChartAnimated(true), 500)
        return () => clearTimeout(timer)
    }, [])

    // Sample data
    const kpiData = {
        totalComplaints: 35,
        pending: 5,
        resolved: 17,
        escalated: 11,
        avgResolutionTime: "2 HR 32 MIN",
        inProgress: 3,
    }

    // Line chart data for complaint trends
    const trendData = [
        { date: "Jan 15", OPD: 8, Canteen: 5, HK: 3, Nursing: 6 },
        { date: "Jan 16", OPD: 12, Canteen: 7, HK: 4, Nursing: 8 },
        { date: "Jan 17", OPD: 6, Canteen: 9, HK: 2, Nursing: 5 },
        { date: "Jan 18", OPD: 10, Canteen: 4, HK: 6, Nursing: 7 },
        { date: "Jan 19", OPD: 15, Canteen: 8, HK: 5, Nursing: 9 },
        { date: "Jan 20", OPD: 9, Canteen: 6, HK: 3, Nursing: 4 },
        { date: "Jan 21", OPD: 11, Canteen: 10, HK: 7, Nursing: 8 },
    ]

    const departmentColors = {
        OPD: "#3B82F6",
        Canteen: "#EAB308",
        HK: "#10B981",
        Nursing: "#8B5CF6",
    }

    // Top 5 departments data
    const topDepartments = [
        { rank: 1, department: "Nursing", complaints: 150, avgResolution: "3 HR 15 MIN", escalations: 25 },
        { rank: 2, department: "Canteen", complaints: 115, avgResolution: "1 HR 45 MIN", escalations: 18 },
        { rank: 3, department: "OPD", complaints: 98, avgResolution: "2 HR 30 MIN", escalations: 15 },
        { rank: 4, department: "Housekeeping", complaints: 87, avgResolution: "4 HR 20 MIN", escalations: 22 },
        { rank: 5, department: "Pharmacy", complaints: 65, avgResolution: "1 HR 30 MIN", escalations: 8 },
    ]

    // Floor-wise complaints pie chart data
    const floorData = [
        { label: "General", count: 45, percentage: 35, color: "#3B82F6" },
        { label: "ICU", count: 32, percentage: 25, color: "#EF4444" },
        { label: "Special", count: 25, percentage: 20, color: "#10B981" },
        { label: "Deluxe", count: 18, percentage: 14, color: "#F59E0B" },
        { label: "Emergency", count: 8, percentage: 6, color: "#8B5CF6" },
    ]

    // Enhanced complaint details data with more information
    const complaintDetails = [
        {
            id: "CMP001",
            date: "2024-01-15 10:30",
            department: "Nursing",
            doctor: "Dr. Sharma",
            bedNo: "A-101",
            patient: "John Smith",
            contact: "+91 9876543210",
            status: "Pending",
            priority: "High",
            assignedTo: "Nurse Manager - Sarah Johnson",
            details:
                "Staff response time is slow during night shift. Patient had to wait 45 minutes for assistance when calling for help. This is affecting patient satisfaction and recovery.",
            actions: [
                { date: "2024-01-15 10:30", action: "Complaint registered", by: "Reception" },
                { date: "2024-01-15 11:00", action: "Assigned to Nursing Manager", by: "Admin" },
                { date: "2024-01-15 14:30", action: "Investigation started", by: "Sarah Johnson" },
            ],
            category: "Service Quality",
            expectedResolution: "2024-01-17 18:00",
        },
        {
            id: "CMP002",
            date: "2024-01-15 14:45",
            department: "Canteen",
            doctor: "Dr. Patel",
            bedNo: "B-205",
            patient: "Mary Johnson",
            contact: "+91 9876543211",
            status: "Resolved",
            priority: "Medium",
            assignedTo: "Canteen Manager - Raj Kumar",
            details:
                "Food quality complaint - too spicy. Patient requested mild food but received very spicy curry which caused discomfort. Patient has dietary restrictions due to gastric issues.",
            actions: [
                { date: "2024-01-15 14:45", action: "Complaint registered", by: "Nursing Staff" },
                { date: "2024-01-15 15:00", action: "Assigned to Canteen Manager", by: "Admin" },
                { date: "2024-01-15 16:30", action: "Kitchen staff briefed", by: "Raj Kumar" },
                { date: "2024-01-16 08:00", action: "New meal provided", by: "Kitchen" },
                { date: "2024-01-16 12:00", action: "Patient satisfied - Resolved", by: "Raj Kumar" },
            ],
            category: "Food Service",
            expectedResolution: "2024-01-16 18:00",
        },
        {
            id: "CMP003",
            date: "2024-01-16 09:20",
            department: "Housekeeping",
            doctor: "Dr. Kumar",
            bedNo: "C-301",
            patient: "Robert Brown",
            contact: "+91 9876543212",
            status: "In Progress",
            priority: "High",
            assignedTo: "Housekeeping Supervisor - Priya Sharma",
            details:
                "Room cleaning not done properly, AC not working. Patient reported that bathroom was not cleaned for 2 days and air conditioning unit is making loud noise and not cooling properly.",
            actions: [
                { date: "2024-01-16 09:20", action: "Complaint registered", by: "Patient" },
                { date: "2024-01-16 10:00", action: "Assigned to Housekeeping", by: "Admin" },
                { date: "2024-01-16 11:30", action: "Room inspection done", by: "Priya Sharma" },
                { date: "2024-01-16 14:00", action: "AC technician called", by: "Maintenance" },
            ],
            category: "Facility Management",
            expectedResolution: "2024-01-18 16:00",
        },
        {
            id: "CMP004",
            date: "2024-01-16 16:30",
            department: "OPD",
            doctor: "Dr. Singh",
            bedNo: "A-102",
            patient: "Sarah Davis",
            contact: "+91 9876543213",
            status: "Escalated",
            priority: "Critical",
            assignedTo: "OPD Head - Dr. Mehta",
            details:
                "Long waiting time for consultation. Patient waited for 3 hours despite having an appointment. This caused significant distress as patient had to take time off work.",
            actions: [
                { date: "2024-01-16 16:30", action: "Complaint registered", by: "Patient" },
                { date: "2024-01-16 17:00", action: "Assigned to OPD Manager", by: "Admin" },
                { date: "2024-01-17 09:00", action: "Escalated to OPD Head", by: "OPD Manager" },
                { date: "2024-01-17 11:00", action: "Meeting scheduled with patient", by: "Dr. Mehta" },
            ],
            category: "Appointment Management",
            expectedResolution: "2024-01-19 17:00",
        },
        {
            id: "CMP005",
            date: "2024-01-17 11:15",
            department: "Pharmacy",
            doctor: "Dr. Sharma",
            bedNo: "B-206",
            patient: "Michael Wilson",
            contact: "+91 9876543214",
            status: "Resolved",
            priority: "Medium",
            assignedTo: "Chief Pharmacist - Dr. Gupta",
            details:
                "Medicine not available, had to wait 2 hours. Prescribed medication was out of stock and patient had to wait while alternative was arranged.",
            actions: [
                { date: "2024-01-17 11:15", action: "Complaint registered", by: "Patient" },
                { date: "2024-01-17 11:30", action: "Assigned to Chief Pharmacist", by: "Admin" },
                { date: "2024-01-17 12:00", action: "Alternative medicine arranged", by: "Dr. Gupta" },
                { date: "2024-01-17 13:30", action: "Medicine provided - Resolved", by: "Pharmacy" },
            ],
            category: "Medication Management",
            expectedResolution: "2024-01-17 18:00",
        },
    ]

    const filteredComplaints = complaintDetails.filter(
        (complaint) =>
            complaint.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
            complaint.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
            complaint.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
            complaint.id.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    const getStatusColor = (status) => {
        switch (status) {
            case "Pending":
                return "bg-yellow-100 text-yellow-800"
            case "Resolved":
                return "bg-green-100 text-green-800"
            case "Escalated":
                return "bg-red-100 text-red-800"
            case "In Progress":
                return "bg-blue-100 text-blue-800"
            default:
                return "bg-gray-100 text-gray-800"
        }
    }

    const getPriorityColor = (priority) => {
        switch (priority) {
            case "Critical":
                return "bg-red-100 text-red-800"
            case "High":
                return "bg-orange-100 text-orange-800"
            case "Medium":
                return "bg-yellow-100 text-yellow-800"
            case "Low":
                return "bg-green-100 text-green-800"
            default:
                return "bg-gray-100 text-gray-800"
        }
    }

    const openModal = (complaint) => {
        setSelectedComplaint(complaint)
        setIsModalOpen(true)
        document.body.style.overflow = "hidden"
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setSelectedComplaint(null)
        document.body.style.overflow = ""
    }

    const exportToExcel = () => {
        alert("Export functionality would be implemented here")
    }

    // Animated Donut Chart Component
    const AnimatedDonutChart = ({ data }) => {
        const size = 200
        const strokeWidth = 40
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
                                className="transition-all duration-1000 ease-out"
                                style={{
                                    strokeDasharray: chartAnimated ? strokeDasharray : `0 ${circumference}`,
                                    strokeDashoffset: chartAnimated ? strokeDashoffset : 0,
                                }}
                            />
                        )
                    })}
                </svg>
                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                    {data.map((item, index) => (
                        <div
                            key={index}
                            className={`flex items-center transition-all duration-500 ${chartAnimated ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                                }`}
                            style={{ transitionDelay: `${index * 200}ms` }}
                        >
                            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                            <span className="text-gray-700">
                                {item.label}: {item.percentage}%
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    // Animated Multi-line Chart Component
    const AnimatedMultiLineChart = ({ data, colors }) => {
        const width = 500
        const height = 250
        const padding = 50

        const departments = Object.keys(colors)
        const allValues = data.flatMap((d) => departments.map((dept) => d[dept]))
        const maxValue = Math.max(...allValues)
        const minValue = Math.min(...allValues)
        const valueRange = maxValue - minValue || 1

        const getPoints = (department) => {
            return data.map((item, index) => {
                const x = padding + (index * (width - 2 * padding)) / (data.length - 1)
                const y = height - padding - ((item[department] - minValue) / valueRange) * (height - 2 * padding)
                return { x, y, value: item[department], date: item.date }
            })
        }

        return (
            <div className="w-full">
                <svg width={width} height={height} className="w-full h-auto">
                    {/* Animated Grid lines */}
                    {[0, 1, 2, 3, 4].map((i) => {
                        const y = padding + (i * (height - 2 * padding)) / 4
                        return (
                            <line
                                key={i}
                                x1={padding}
                                y1={y}
                                x2={width - padding}
                                y2={y}
                                stroke="#f3f4f6"
                                strokeWidth="1"
                                className="transition-all duration-1000"
                                style={{
                                    strokeDasharray: chartAnimated ? "none" : "5,5",
                                    opacity: chartAnimated ? 1 : 0.3,
                                }}
                            />
                        )
                    })}

                    {/* Y-axis labels */}
                    {[0, 1, 2, 3, 4].map((i) => {
                        const y = padding + (i * (height - 2 * padding)) / 4
                        const value = Math.round(maxValue - (i * valueRange) / 4)
                        return (
                            <text
                                key={i}
                                x={padding - 10}
                                y={y + 5}
                                textAnchor="end"
                                className={`text-xs fill-gray-500 transition-all duration-500 ${chartAnimated ? "opacity-100" : "opacity-0"
                                    }`}
                                style={{ transitionDelay: `${i * 100}ms` }}
                            >
                                {value}
                            </text>
                        )
                    })}

                    {/* Animated Lines for each department */}
                    {departments.map((department, deptIndex) => {
                        const points = getPoints(department)
                        const pathData = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ")

                        return (
                            <g key={department}>
                                <path
                                    d={pathData}
                                    fill="none"
                                    stroke={colors[department]}
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="transition-all duration-2000 ease-out"
                                    style={{
                                        strokeDasharray: chartAnimated ? "none" : "1000",
                                        strokeDashoffset: chartAnimated ? 0 : 1000,
                                        transitionDelay: `${deptIndex * 300}ms`,
                                    }}
                                />
                                {points.map((point, index) => (
                                    <circle
                                        key={index}
                                        cx={point.x}
                                        cy={point.y}
                                        r="4"
                                        fill={colors[department]}
                                        stroke="white"
                                        strokeWidth="2"
                                        className="transition-all duration-500 ease-out"
                                        style={{
                                            transform: chartAnimated ? "scale(1)" : "scale(0)",
                                            transitionDelay: `${deptIndex * 300 + index * 100}ms`,
                                        }}
                                    />
                                ))}
                            </g>
                        )
                    })}

                    {/* X-axis labels */}
                    {data.map((item, index) => {
                        const x = padding + (index * (width - 2 * padding)) / (data.length - 1)
                        return (
                            <text
                                key={index}
                                x={x}
                                y={height - 15}
                                textAnchor="middle"
                                className={`text-xs fill-gray-500 transition-all duration-500 ${chartAnimated ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                                    }`}
                                style={{ transitionDelay: `${index * 100}ms` }}
                            >
                                {item.date}
                            </text>
                        )
                    })}
                </svg>

                {/* Animated Legend */}
                <div className="flex justify-center mt-4 space-x-6">
                    {departments.map((dept, index) => (
                        <div
                            key={dept}
                            className={`flex items-center transition-all duration-500 ${chartAnimated ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                                }`}
                            style={{ transitionDelay: `${index * 200 + 1000}ms` }}
                        >
                            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: colors[dept] }}></div>
                            <span className="text-sm text-gray-700">{dept}</span>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <>
            <section className="flex w-[100%] h-[100%] select-none py-[15px] pr-[15px] overflow-hidden">
                <div className="flex w-[100%] overflow-hidden flex-col gap-[14px] h-[96vh]">
                    <Header pageName="Complaint Management " />
                    <div className="flex overflow-hidden gap-[10px] w-[100%] h-[100%]">
                        <Sidebar />
                        <div className="flex flex-col w-[100%] max-h-[90%] pb-[50px] pr-[15px] bg-[#fff] overflow-y-auto gap-[30px] rounded-[10px]">

                            <div className="">
                                <div className="">
                                    {/* Header */}
                                    {/* <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4">
                                     
                                            <div className="flex flex-col sm:flex-row gap-3">
                                                <div className="relative">
                                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                                    <input
                                                        type="text"
                                                        placeholder="Search complaints..."
                                                        value={searchTerm}
                                                        onChange={(e) => setSearchTerm(e.target.value)}
                                                        className="pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>
                                                <button
                                                    onClick={exportToExcel}
                                                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                                                >
                                                    <Download className="w-4 h-4 mr-2" />
                                                    Export in Excel Format
                                                </button>
                                            </div>
                                        </div>

                      
                                
                                    </div> */}


                                    <div className="grid grid-cols-1 md:grid-cols-2  mt-[10px] lg:grid-cols-6 gap-4 mb-2">
                                        <div className="bg-white rounded-lg shadow-sm p-3 border   border-l-4 border-l-blue-500">
                                            <div className="flex items-center">
                                                <AlertTriangle className="w-6 h-6 text-blue-600 mr-3" />
                                                <div>
                                                    <p className="text-xs font-medium text-gray-600">Total Complaints</p>
                                                    <p className="text-xl font-[600] text-gray-900">{kpiData.totalComplaints}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-white rounded-lg shadow-sm p-3 border   border-l-4 border-l-yellow-500">
                                            <div className="flex items-center">
                                                <Clock className="w-6 h-6 text-yellow-600 mr-3" />
                                                <div>
                                                    <p className="text-xs font-medium text-gray-600">Pending</p>
                                                    <p className="text-xl font-[600] text-gray-900">{kpiData.pending}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-white rounded-lg shadow-sm p-3 border   border-l-4 border-l-green-500">
                                            <div className="flex items-center">
                                                <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                                                <div>
                                                    <p className="text-xs font-medium text-gray-600">Resolved</p>
                                                    <p className="text-xl font-[600] text-gray-900">{kpiData.resolved}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-white rounded-lg shadow-sm p-3 border   border-l-4 border-l-red-500">
                                            <div className="flex items-center">
                                                <TrendingUp className="w-6 h-6 text-red-600 mr-3" />
                                                <div>
                                                    <p className="text-xs font-medium text-gray-600">Escalated</p>
                                                    <p className="text-xl font-[600] text-gray-900">{kpiData.escalated}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-white rounded-lg shadow-sm p-3 border   border-l-4 border-l-purple-500">
                                            <div className="flex items-center">
                                                <Clock className="w-6 h-6 text-purple-600 mr-3" />
                                                <div>
                                                    <p className="text-xs font-medium text-gray-600">Avg Resolution</p>
                                                    <p className="text-lg font-[600] text-gray-900">{kpiData.avgResolutionTime}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-white rounded-lg shadow-sm p-3 border   border-l-4 border-l-indigo-500">
                                            <div className="flex items-center">
                                                <AlertTriangle className="w-6 h-6 text-indigo-600 mr-3" />
                                                <div>
                                                    <p className="text-xs font-medium text-gray-600">In Progress</p>
                                                    <p className="text-xl font-[600] text-gray-900">{kpiData.inProgress}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Charts Row */}
                                    <div className=" flex mt-[20px]  gap-6 mb-6">
                                        {/* Complaint Trend Graph */}
                                        <div className="bg-white border rounded-lg shadow-sm p-4">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Complaint Trend by Department</h3>
                                            <div className="flex justify-center">
                                                <AnimatedMultiLineChart data={trendData} colors={departmentColors} />
                                            </div>
                                        </div>

                                        {/* Floor-wise Complaints Pie Chart */}
                                        <div className="bg-white  rounded-lg  border shadow-sm p-4">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Floor-wise Complaints Distribution</h3>
                                            <div className="flex justify-center">
                                                <AnimatedDonutChart data={floorData} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className=" flex items-start gap-[10px]">
                                        <div className="bg-white border shadow-sm rounded-lg  overflow-hidden mb-6">
                                            <div className="px-6 py-2 border-b border-gray-200">
                                                <h3 className="text-[15px] font-semibold text-gray-900">Top 5 Departments with Most Complaints</h3>
                                            </div>
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Rank
                                                            </th>
                                                            <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Department
                                                            </th>
                                                            <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                No. of Complaints
                                                            </th>
                                                            <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Avg Resolution
                                                            </th>
                                                            <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                No. of Escalations
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white">
                                                        {topDepartments.map((dept, index) => (
                                                            <tr
                                                
                                                                key={index}
                                                                className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50 transition-colors`}
                                                            >
                                                                <td className="px-6 py-2 text-sm font-[600] text-gray-900">
                                                                    <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full">
                                                                        {dept.rank}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-2 text-sm font-medium text-gray-900">{dept.department}</td>
                                                                <td className="px-6 py-2 text-sm text-gray-900">
                                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[14px] font-[500] bg-red-100 text-red-800">
                                                                        {dept.complaints}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-2 text-sm text-gray-900">{dept.avgResolution}</td>
                                                                <td className="px-6 py-2 text-sm text-gray-900">
                                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[14px] font-[500] bg-orange-100 text-orange-800">
                                                                        {dept.escalations}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        {/* Word Cloud */}
                                        <div className="bg-white border  rounded-lg pt-[6px] h-[312px] shadow-sm w-[400px]">
                                            <h3 className="text-lg ml-[19px] font-semibold text-gray-900 mb-1">Frequent Complaint Keywords</h3>
                                            <div className="flex border-t flex-wrap gap-2 p-[20px] ">
                                                {[
                                                    "Food",
                                                    "Discharge",
                                                    "AC",
                                                    "Spicy",
                                                    "Fan",
                                                    "Mosquito",
                                                    "Cleaning",
                                                    "Staff",
                                                    "Waiting",
                                                    "Billing",
                                                    "Medicine",
                                                    "Nurse",
                                                    "Doctor",
                                                    "Room",
                                                    "Service",
                                                ].map((word, index) => (
                                                    <span
                                                        key={index}
                                                        className={`px-4 py-1 rounded-full text-[12px] font-medium transition-all duration-500 hover:scale-110 ${index % 6 === 0
                                                            ? "bg-blue-100 border border-blue-800 text-blue-800"
                                                            : index % 6 === 1
                                                                ? "bg-red-100 border border-red-800 text-red-800"
                                                                : index % 6 === 2
                                                                    ? "bg-yellow-100 border border-yellow-800 text-yellow-800"
                                                                    : index % 6 === 3
                                                                        ? "bg-green-100 border border-green-800 text-green-800"
                                                                        : index % 6 === 4
                                                                            ? "bg-purple-100 border border-purple-800 text-purple-800"
                                                                            : "bg-indigo-100 border border-indigo-800 text-indigo-800"
                                                            }`}

                                                    >
                                                        {word}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Complaint Details Table */}
                                    <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
                                        <div className="px-6 py-2 border-b border-gray-200">
                                            <h3 className="text-lg font-semibold text-gray-900">Complaint Details</h3>
                                        </div>

                                        <div className="overflow-x-auto">
                                            <table className="min-w-full">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Complaint ID
                                                        </th>
                                                        <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Date & Time
                                                        </th>
                                                        <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Department
                                                        </th>
                                                        <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Doctor Name
                                                        </th>
                                                        <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Bed No.
                                                        </th>
                                                        <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Patient Name
                                                        </th>
                                                        <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Status
                                                        </th>
                                                        <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Details
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white">
                                                    {filteredComplaints.map((complaint, index) => (
                                                        <tr
                                                            key={complaint.id}
                                                                        onClick={handlenavigate}
                                                            className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50 transition-colors`}
                                                        >
                                                            <td className="px-6 py-2 text-sm font-medium text-blue-600">{complaint.id}</td>
                                                            <td className="px-6 py-2 text-sm text-gray-900">
                                                                <div className="flex items-center">
                                                                    <Clock className="w-4 h-4 text-gray-400 mr-2" />
                                                                    {complaint.date}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-2 text-sm text-gray-900">{complaint.department}</td>
                                                            <td className="px-6 py-2 text-sm text-gray-900">
                                                                <div className="flex items-center">
                                                                    <User className="w-4 h-4 text-gray-400 mr-2" />
                                                                    {complaint.doctor}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-2 text-sm text-gray-900">
                                                                <div className="flex items-center">
                                                                    <Bed className="w-4 h-4 text-gray-400 mr-2" />
                                                                    {complaint.bedNo}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-2 text-sm font-medium text-gray-900">{complaint.patient}</td>
                                                            <td className="px-6 py-2 text-sm">
                                                                <span
                                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[14px] font-[500] ${getStatusColor(complaint.status)}`}
                                                                >
                                                                    {complaint.status}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-2 text-sm text-gray-900">
                                                                <button
                                                                    onClick={() => openModal(complaint)}
                                                                    className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                                                                >
                                                                    <Eye className="w-4 h-4 mr-1" />
                                                                    View
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Modal */}
                                    {isModalOpen && selectedComplaint && (
                                        <div className="fixed inset-0 z-50 bg-[#00000097] ">
                                            <div className="flex items-center justify-center  h-[400px] pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                                                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeModal}></div>

                                                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
                                                    &#8203;
                                                </span>

                                                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                                                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                                        <div className="flex justify-between items-start mb-4">
                                                            <h3 className="text-2xl font-[600] text-gray-900">Complaint Details</h3>
                                                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                                                                <X className="w-6 h-6" />
                                                            </button>
                                                        </div>

                                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                                            {/* Left Column - Basic Info */}
                                                            <div className="space-y-4">
                                                                <div className="bg-gray-50 p-3 border rounded-lg">
                                                                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Basic Information</h4>
                                                                    <div className="space-y-2">
                                                                        <div className="flex items-center">
                                                                            <FileText className="w-5 h-5 text-gray-400 mr-3" />
                                                                            <div>
                                                                                <span className="text-sm text-gray-600">Complaint ID:</span>
                                                                                <span className="ml-2 font-medium text-blue-600">{selectedComplaint.id}</span>
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex items-center">
                                                                            <CalendarIcon className="w-5 h-5 text-gray-400 mr-3" />
                                                                            <div>
                                                                                <span className="text-sm text-gray-600">Date & Time:</span>
                                                                                <span className="ml-2 font-medium">{selectedComplaint.date}</span>
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex items-center">
                                                                            <User className="w-5 h-5 text-gray-400 mr-3" />
                                                                            <div>
                                                                                <span className="text-sm text-gray-600">Patient:</span>
                                                                                <span className="ml-2 font-medium">{selectedComplaint.patient}</span>
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex items-center">
                                                                            <Phone className="w-5 h-5 text-gray-400 mr-3" />
                                                                            <div>
                                                                                <span className="text-sm text-gray-600">Contact:</span>
                                                                                <span className="ml-2 font-medium">{selectedComplaint.contact}</span>
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex items-center">
                                                                            <Bed className="w-5 h-5 text-gray-400 mr-3" />
                                                                            <div>
                                                                                <span className="text-sm text-gray-600">Bed No:</span>
                                                                                <span className="ml-2 font-medium">{selectedComplaint.bedNo}</span>
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex items-center">
                                                                            <User className="w-5 h-5 text-gray-400 mr-3" />
                                                                            <div>
                                                                                <span className="text-sm text-gray-600">Doctor:</span>
                                                                                <span className="ml-2 font-medium">{selectedComplaint.doctor}</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="bg-gray-50 p-3 border rounded-lg">
                                                                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Status & Priority</h4>
                                                                    <div className="space-y-3">
                                                                        <div className="flex items-center">
                                                                            <span className="text-sm text-gray-600 mr-3">Status:</span>
                                                                            <span
                                                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[14px] font-[500] ${getStatusColor(selectedComplaint.status)}`}
                                                                            >
                                                                                {selectedComplaint.status}
                                                                            </span>
                                                                        </div>
                                                                        <div className="flex items-center">
                                                                            <span className="text-sm text-gray-600 mr-3">Priority:</span>
                                                                            <span
                                                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[14px] font-[500] ${getPriorityColor(selectedComplaint.priority)}`}
                                                                            >
                                                                                {selectedComplaint.priority}
                                                                            </span>
                                                                        </div>
                                                                        <div className="flex items-center">
                                                                            <span className="text-sm text-gray-600 mr-3">Category:</span>
                                                                            <span className="font-[500] text-[14px]">{selectedComplaint.category}</span>
                                                                        </div>
                                                                        <div className="flex items-center">
                                                                            <span className="text-sm text-gray-600 mr-3">Assigned To:</span>
                                                                            <span className="font-[500] text-[14px]">{selectedComplaint.assignedTo}</span>
                                                                        </div>
                                                                        <div className="flex items-center">
                                                                            <span className="text-sm text-gray-600 mr-3">Expected Resolution:</span>
                                                                            <span className="font-[500] text-[14px]">{selectedComplaint.expectedResolution}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Right Column - Details & Actions */}
                                                            <div className="space-y-4 mb-[15px]">
                                                                <div className="bg-gray-50 border h-[182px] p-3 rounded-lg">
                                                                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Complaint Details</h4>
                                                                    <p className="text-gray-600 leading-[21px] text-[14px] " >{selectedComplaint.details}</p>
                                                                </div>

                                                                <div className="bg-gray-50 p-3 border rounded-lg">
                                                                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Action History</h4>
                                                                    <div className="space-y-3">
                                                                        {selectedComplaint.actions.map((action, index) => (
                                                                            <div key={index} className="flex items-start space-x-3">
                                                                                <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                                                                <div className="flex-1">
                                                                                    <div className="flex justify-between items-start">
                                                                                        <p className="text-sm font-medium text-gray-900">{action.action}</p>
                                                                                        <span className="text-xs text-gray-500">{action.date}</span>
                                                                                    </div>
                                                                                    <p className="text-xs text-gray-600">by {action.by}</p>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
{/* 
                                                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                                        <button
                                                            onClick={closeModal}
                                                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                                                        >
                                                            Close
                                                        </button>
                                                        <button
                                                            onClick={() => alert("Update status functionality would be implemented here")}
                                                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                                                        >
                                                            Update Status
                                                        </button>
                                                    </div> */}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>




        </>
    )
}
