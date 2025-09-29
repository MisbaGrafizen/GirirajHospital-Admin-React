"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
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
    RefreshCw,
    X,
    Phone,
    FileText,
    CalendarIcon,
} from "lucide-react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faTriangleExclamation,
    faClock,
    faCircleCheck,
    faArrowTrendUp,
    faSpinner,
    faStopwatch,
} from "@fortawesome/free-solid-svg-icons";
import Header from "../../Component/header/Header"
import Sidebar from "../../Component/sidebar/CubaSideBar"
import { useNavigate } from "react-router-dom"
import OpdFilter from "../../Component/ReportFilter/OpdFilter"
import { ApiGet } from "../../helper/axios"
import Widgets1 from "../../Component/DashboardFiles/Components/Common/CommonWidgets/Widgets1"
import AnalyticsBarChart from "../../Component/AnalyticsBarChart";
import SimpleBarChart from "../../Component/AnalyticsBarChart";
import Preloader from "../../Component/loader/Preloader";

const MODULE_TO_BLOCK = {
    doctor_service: "doctorServices",
    billing_service: "billingServices",
    housekeeping: "housekeeping",
    maintenance: "maintenance",
    diagnostic_service: "diagnosticServices",
    dietetics: "dietitianServices",
    nursing: "nursing", // if you have it
    security: "security",
    overall: "overall",
};


function resolvePermissions() {
    const loginType = localStorage.getItem("loginType");
    const isAdmin = loginType === "admin";

    let permsArray = [];
    try {
        const parsed = JSON.parse(localStorage.getItem("rights"));
        if (parsed?.permissions && Array.isArray(parsed.permissions)) {
            permsArray = parsed.permissions;
        } else if (Array.isArray(parsed)) {
            permsArray = parsed;
        }
    } catch {
        permsArray = [];
    }

    // 🔑 collect allowed department blocks
    const allowedBlocks = isAdmin
        ? Object.values(MODULE_TO_BLOCK)
        : permsArray.map((p) => MODULE_TO_BLOCK[p.module]).filter(Boolean);

    return {
        isAdmin,
        allowedBlocks,
    };
}



function PermissionDenied() {
    return (
        <div className="flex items-center justify-center h-[70vh]">
            <div className="bg-white border rounded-xl p-8 shadow-sm text-center max-w-md">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Permission required
                </h2>
                <p className="text-gray-600">
                    You don’t have access to view Complaint Dashboard. Please contact an
                    administrator.
                </p>
            </div>
        </div>
    )
}

// ===================== CONSTANTS / LABELS =====================
const CONCERN_KEYS = [
    "doctorServices",
    "billingServices",
    "housekeeping",
    "maintenance",
    "diagnosticServices",
    "dietitianServices",
    "security",
    "overall",
]

const DEPT_LABEL = {
    doctorServices: "Doctor",
    billingServices: "Billing",
    housekeeping: "Housekeeping",
    maintenance: "Maintenance",
    diagnosticServices: "Diagnostic",
    dietitianServices: "Dietitian",
    security: "Security",
    overall: "Overall",
}

const DEPT_COLORS = {
    "Doctor Services": "#3B82F6",
    "Billing Services": "#EAB308",
    "Housekeeping": "#10B981",
    "Maintenance": "#EF4444",
    "Diagnostic Services": "#8B5CF6",
    "Dietitian Services": "#F59E0B",
    "Security": "#22C55E",
    "Overall": "#6B7280",
}

const SERVICE_NORMALIZATION_MAP = {
  Doctor: "Doctor Services",
  "Doctor Service": "Doctor Services",
  Billing: "Billing Services",
  Diagnostic: "Diagnostic Services",
  "Diagnostic Service": "Diagnostic Services",
  Dietitian: "Dietitian Services",
};


function normalizeServiceName(name = "") {
  return SERVICE_NORMALIZATION_MAP[name] || name;
}



// ===================== DATE HELPERS =====================
const pad2 = (n) => String(n).padStart(2, "0")
const ymd = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
const firstDayOfThisMonth = () => {
    const d = new Date()
    return ymd(new Date(d.getFullYear(), d.getMonth(), 1))
}
const today = () => ymd(new Date())
const fmtDateLabel = (iso) => {
    const d = new Date(iso)
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" })
}

// ===================== STATUS / PRIORITY UI =====================
const mapStatusUI = (status) => {
    switch (status) {
        case "resolved":
            return "Resolved";
        case "in_progress":
            return "In Progress";
        case "escalated":
            return "Escalated";
        case "open":
            return "Open";
        default:
            return "Pending";
    }
};

const getStatusColor = (status) => {
    switch (status) {
        case "Pending":
            return "bg-yellow-100 text-yellow-800"
        case "Resolved":
            return "bg-green-100 text-green-800"
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
        case "Urgent":
            return "bg-orange-100 text-orange-800"
        case "Medium":
            return "bg-yellow-100 text-yellow-800"
        case "Low":
            return "bg-green-100 text-green-800"
        default:
            return "bg-gray-100 text-gray-800"
    }
}

function flattenConcernDoc(doc, allowedBlocks) {
    const createdAt = doc?.createdAt || doc?.updatedAt || new Date().toISOString();
    const dateStr = new Date(createdAt).toISOString().slice(0, 16).replace("T", " ");

    const departments = [];
    allowedBlocks.forEach((k) => {
        const block = doc?.[k];
        if (!block) return;
        const hasText = block.text && String(block.text).trim().length > 0;
        const hasAttachments = Array.isArray(block.attachments) && block.attachments.length > 0;
        if (hasText || hasAttachments) {
            departments.push(DEPT_LABEL[k]);
        }
    });

    if (departments.length === 0) return [];

    return [{
        id: doc._id,
        complaintId: doc.complaintId,
        date: dateStr,
        department: departments.join(", "),  // 👈 one row with joined departments
        doctor: doc.consultantDoctorName?.name || "-",
        bedNo: doc.bedNo || "-",
        patient: doc.patientName || "-",
        contact: doc.contact || "-",
        status: mapStatusUI(doc.status),
        priority: doc.priority || "Normal",
        assignedTo: "-",
        details: "-",
        actions: [],
        category: "Multiple",
        expectedResolution: "-",
        createdAt,
    }];

}

function flattenConcernDocForStats(doc) {
    const results = [];

    CONCERN_KEYS.forEach((k) => {
        const block = doc?.[k];
        if (!block) return;

        const hasText = block.text && String(block.text).trim().length > 0;
        const hasAttachments = Array.isArray(block.attachments) && block.attachments.length > 0;

        if (hasText || hasAttachments) {
            results.push({
                department: DEPT_LABEL[k],          // 👈 one per department
                resolutionTime: doc.status === "resolved" ? 1 : 0, // fake example
                escalated: doc.stauts === "escalated",
                createdAt: doc.createdAt || doc.updatedAt || new Date().toISOString(), // 👈 needed for trend
            });
        }
    });

    return results;
}


const hasConcernContent = (b) => {
    if (!b || typeof b !== "object") return false;
    const hasText = typeof b.text === "string" && b.text.trim().length > 0;
    const hasFiles = Array.isArray(b.attachments) && b.attachments.length > 0;
    return hasText || hasFiles;
};

function getDepartmentsString(doc, allowedBlocks) {
  const departments = [];
  allowedBlocks.forEach((k) => {
    const block = doc?.[k];
    if (!block) return;
    const hasText = block.text && String(block.text).trim().length > 0;
    const hasAttachments = Array.isArray(block.attachments) && block.attachments.length > 0;
    if (hasText || hasAttachments) {
      let label = DEPT_LABEL[k] || k;
      departments.push(normalizeServiceName(label));  // ✅ normalize here
    }
  });
  return departments.join(", ");
}


// Build multi-line chart series from rows
function buildTrendData(rows) {
    const byDay = {};
    // ✅ ensure all departments always exist in chart
    const presentDepartments = new Set(CONCERN_KEYS.map((k) => DEPT_LABEL[k]));

    rows.forEach((r) => {
        const day = fmtDateLabel(r.createdAt || r.date);
        byDay[day] ||= {};
        byDay[day][r.department] = (byDay[day][r.department] || 0) + 1;
    });

    let days = Object.keys(byDay);
    days.sort((a, b) => Date.parse(a + " 2020") - Date.parse(b + " 2020"));

    if (days.length === 1) {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        const prev = fmtDateLabel(d.toISOString());
        byDay[prev] ||= {};
        days = [prev, ...days];
    }

    const result = days.map((day) => {
        const obj = { date: day };
        presentDepartments.forEach((dept) => {
            obj[dept] = byDay[day]?.[dept] || 0;
        });
        return obj;
    });

    const colors = {};
    presentDepartments.forEach((d) => {
        colors[d] = DEPT_COLORS[d] || "#6B7280";
    });

    return { data: result, colors };
}


// KPIs from rows
function computeKpis(rows) {
    const total = rows.length
    const pending = rows.filter((r) => r.status === "Pending").length
    const inProgress = rows.filter((r) => r.status === "In Progress").length
    const resolved = rows.filter((r) => r.status === "Resolved").length
    const escalated = rows.filter((r) => r.status === "Escalated").length

    // Fake average resolution time (needs backend duration to be accurate)
    const resolvedRows = rows.filter((r) => r.status === "Resolved")
    let avgResolutionStr = "—"
    if (resolvedRows.length) {
        const mins = Math.round(
            resolvedRows.reduce((acc, r) => {
                const start = new Date(r.createdAt).getTime()
                const end = new Date().getTime()
                return acc + Math.max(0, end - start) / 60000
            }, 0) / resolvedRows.length,
        )
        const h = Math.floor(mins / 60)
        const m = mins % 60
        avgResolutionStr = `${h}/${m} `
    }

    return {
        totalComplaints: total,
        pending,
        resolved,
        escalated,
        avgResolutionTime: avgResolutionStr,
        inProgress,
    }
}

// Safe JSON fetch (avoids the "<!doctype" crash and ignores AbortError)
async function getConcerns(from, to) {
    const res = await ApiGet(`/admin/ipd-concern`)
    return Array.isArray(res?.data) ? res.data : [res?.data].filter(Boolean)
}

// Reverse map: "Doctor Services" -> "doctorServices"
const LABEL_TO_KEY = Object.fromEntries(
    Object.entries(DEPT_LABEL).map(([k, v]) => [v, k])
);

// pick a date field from a concern doc
const getDocDate = (d) => d?.createdAt || d?.updatedAt || d?.date || null;


// ===================== COMPONENT =====================
export default function ComplaintManagementDashboard() {
    const [dateFrom, setDateFrom] = useState(firstDayOfThisMonth())
    const [dateTo, setDateTo] = useState(today())
    const { isAdmin, allowedBlocks } = resolvePermissions();
    console.log('isAdmin', isAdmin)


    const [selectedStatus, setSelectedStatus] = useState("All Status")
    const [selectedDepartment, setSelectedDepartment] = useState("All Departments")
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedComplaint, setSelectedComplaint] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [chartAnimated, setChartAnimated] = useState(false)
    const [top5Departments, setTop5Departments] = useState([]);
    const [rawConcerns, setRawConcerns] = useState([]);
    const [filters, setFilters] = useState({
        from: '',                 // "YYYY-MM-DD"
        to: '',                   // "YYYY-MM-DD"
        service: 'All Services',  // matches your UI labels
        doctor: '',               // blank means All Doctors
    });
    const [doctorOptions, setDoctorOptions] = useState([]);

useEffect(() => {
  if (!rawConcerns || !rawConcerns.length) {
    setDoctorOptions([]);
    return;
  }

  const uniqueDoctors = Array.from(
    new Set(
      rawConcerns
        .map(d => d.consultantDoctorName?.name)
        .filter(Boolean)
    )
  );

  setDoctorOptions(uniqueDoctors);
}, [rawConcerns]);



    console.log('top5Departments', top5Departments)


    const [rows, setRows] = useState([])
    const [kpiData, setKpiData] = useState({
        totalComplaints: 0,
        pending: 0,
        resolved: 0,
        escalated: 0,
        avgResolutionTime: "—",
        inProgress: 0,
    })
    const [trendData, setTrendData] = useState([])
    const [departmentColors, setDepartmentColors] = useState({})

    const navigate = useNavigate()
    const handlenavigate = (complaintRow, fullDoc) => {
        navigate("/complaint-details", { state: { complaint: complaintRow, doc: fullDoc } });
    };

    const handleAllPageNavigate = () => {
        navigate("/dashboards/complain-all-list");
    };


    useEffect(() => {
        const t = setTimeout(() => setChartAnimated(true), 500)
        return () => clearTimeout(t)
    }, [])


    // Parse YYYY-MM-DD into local midnight
    const parseLocalDate = (str) => {
        if (!str) return null;
        const [y, m, d] = str.split("-").map(Number);
        return new Date(y, m - 1, d);
    };

    // Apply filters to raw docs
function applyFilters(docs, filters, allowedBlocks, selectedStatus, searchTerm) {
    const q = (searchTerm || "").toLowerCase();
    const from = parseLocalDate(filters.from);
    const to = parseLocalDate(filters.to);

    return docs.filter((doc) => {
        const createdAt = new Date(doc.createdAt || doc.updatedAt || Date.now());

        // Date range
        if (from && createdAt < from) return false;
        if (to) {
            const endOfDay = new Date(to);
            endOfDay.setDate(endOfDay.getDate() + 1);
            if (createdAt >= endOfDay) return false;
        }

        // Service filter
        if (filters.service && filters.service !== "All Services") {
            const depts = getDepartmentsString(doc, allowedBlocks).toLowerCase();
            if (!depts.includes(filters.service.toLowerCase())) return false;
        }

        // Doctor filter
        if (filters.doctor && filters.doctor !== "All Doctors") {
            const doctor = (doc.consultantDoctorName?.name || "").toLowerCase();
            if (!doctor.includes(filters.doctor.toLowerCase())) return false;
        }

        // Status filter
        if (selectedStatus && selectedStatus !== "All Status") {
            if (mapStatusUI(doc.status) !== selectedStatus) return false;
        }

        // Search term filter
        if (q) {
            const combined = [
                doc.patientName,
                doc.consultantDoctorName?.name,
                doc.complaintId,
                getDepartmentsString(doc, allowedBlocks),
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();
            if (!combined.includes(q)) return false;
        }

        return true;
    });
}



    // ====== DERIVED ======
    const filteredComplaints = useMemo(() => {
        const q = (searchTerm || "").toLowerCase();

        return rows
            // 🔍 Search filter
            .filter((c) =>
                [c.patient, c.department, c.details, c.id]
                    .some((v) => String(v || "").toLowerCase().includes(q))
            )
            // 📌 Status filter
            .filter((c) =>
                selectedStatus === "All Status" ? true : c.status === selectedStatus
            )
            // 📅 Date filter (use createdAt ISO, not formatted date string)
            .filter((c) => {
                if (!filters.from && !filters.to) return true;

                const d = new Date(c.createdAt);

                const from = parseLocalDate(filters.from);
                const to = parseLocalDate(filters.to);

                if (from && d < from) return false;
                if (to) {
                    // include the full day, so add 1 day to "to"
                    const endOfDay = new Date(to);
                    endOfDay.setDate(endOfDay.getDate() + 1);
                    if (d >= endOfDay) return false;
                }

                return true;
            })

            // 🏥 Service/Department filter
            .filter((c) => {
                if (!filters.service || filters.service === "All Services") return true;
                return (c.department || "")
                    .toLowerCase()
                    .includes(filters.service.toLowerCase());
            })
            // 👨‍⚕️ Doctor filter
            .filter((c) => {
  if (!filters.doctor || filters.doctor === "All Doctors") return true;
  return (c.doctor || "").toLowerCase().includes(filters.doctor.toLowerCase());
})

    }, [rows, searchTerm, selectedStatus, filters]);


    console.log('filteredComplaints', filteredComplaints)


    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                const docs = await getConcerns();
                if (!alive) return;
                setRawConcerns(Array.isArray(docs) ? docs : []);
            } catch (e) {
                if (!alive) return;
                console.error("Failed to load concerns", e);
                setRawConcerns([]);
            }
        })();
        return () => { alive = false; };
    }, []);



    useEffect(() => {
    if (!Array.isArray(rawConcerns) || !rawConcerns.length) {
        setRows([]);
        setKpiData(computeKpis([]));
        setTrendData([]);
        setDepartmentColors({});
        setTop5Departments([]);
        return;
    }

    // ✅ Apply all filters here
    const docs = applyFilters(rawConcerns, filters, allowedBlocks, selectedStatus, searchTerm);

    // Table rows
    const list = docs.flatMap((d) => flattenConcernDoc(d, allowedBlocks));
    setRows(list);

    // Stats docs for chart & top-5
    const statsDocs = docs.flatMap((d) => flattenConcernDocForStats(d));

    // KPIs
    setKpiData(computeKpis(list));

    // Trend chart
    const { data: tData, colors } = buildTrendData(statsDocs);
    setTrendData(tData);
    setDepartmentColors(colors);

    // Top-5 departments
    const deptStats = {};
    statsDocs.forEach((d) => {
        if (!deptStats[d.department]) {
            deptStats[d.department] = { complaints: 0, totalResolution: 0, escalations: 0 };
        }
        deptStats[d.department].complaints += 1;
        deptStats[d.department].totalResolution += d.resolutionTime || 0;
        if (d.escalated) deptStats[d.department].escalations += 1;
    });

    const top = Object.entries(deptStats)
        .map(([department, s]) => ({
            department,
            complaints: s.complaints,
            avgResolution: s.complaints ? (s.totalResolution / s.complaints).toFixed(1) + " days" : "-",
            escalations: s.escalations,
        }))
        .sort((a, b) => b.complaints - a.complaints)
        .slice(0, 5)
        .map((x, i) => ({ rank: i + 1, ...x }));

    setTop5Departments(top);
}, [rawConcerns, allowedBlocks, filters, selectedStatus, searchTerm]);





    const handleFilterChange = useCallback((next) => {
        setFilters((prev) => ({ ...prev, ...next }));
    }, []);


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

    // ===================== CHARTS (design preserved) =====================
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
                <div className="mt-4 flex flex-wrap justify-center   gap-2 text-sm">
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

    const AnimatedMultiLineChart = ({ data, colors }) => {
        const width = 500
        const height = 250
        const padding = 30

        const departments = Object.keys(colors)
        if (departments.length === 0) {
            return (
                <div className="w-full">
                    <svg width={width} height={height} className="w-full"></svg>
                </div>
            )
        }

        const allValues = data.flatMap((d) => departments.map((dept) => d[dept] ?? 0))
        const maxValue = Math.max(1, ...allValues)
        const minValue = Math.min(0, ...allValues)
        const valueRange = Math.max(1, maxValue - minValue)

        const getPoints = (department) =>
            data.map((item, index) => {
                const x = padding + (index * (width - 2 * padding)) / Math.max(1, data.length - 1)
                const y = height - padding - ((item[department] - minValue) / valueRange) * (height - 2 * padding)
                return { x, y, value: item[department], date: item.date }
            })

        return (
            <div className="w-full">
                <svg width={width} height={height} className="w-full">
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
                                style={{ strokeDasharray: chartAnimated ? "none" : "5,5", opacity: chartAnimated ? 1 : 0.3 }}
                            />
                        )
                    })}

                    {[0, 1, 2, 3, 4].map((i) => {
                        const y = padding + (i * (height - 2 * padding)) / 4
                        const value = Math.round(maxValue - (i * valueRange) / 4)
                        return (
                            <text
                                key={i}
                                x={padding - 10}
                                y={y + 5}
                                textAnchor="end"
                                className={`text-xs fill-gray-500 transition-all duration-500 ${chartAnimated ? "opacity-100" : "opacity-0"}`}
                                style={{ transitionDelay: `${i * 100}ms` }}
                            >
                                {value}
                            </text>
                        )
                    })}

                    {departments.map((department, deptIndex) => {
                        const points = getPoints(department)
                        const pathData = points.map((pt, idx) => `${idx === 0 ? "M" : "L"} ${pt.x} ${pt.y}`).join(" ")
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
                                {points.map((pt, idx) => (
                                    <circle
                                        key={idx}
                                        cx={pt.x}
                                        cy={pt.y}
                                        r="4"
                                        fill={colors[department]}
                                        stroke="white"
                                        strokeWidth="2"
                                        className="transition-all duration-500 ease-out"
                                        style={{
                                            transform: chartAnimated ? "scale(1)" : "scale(0)",
                                            transitionDelay: `${deptIndex * 300 + idx * 100}ms`,
                                        }}
                                    />
                                ))}
                            </g>
                        )
                    })}

                    {data.map((item, index) => {
                        const x = padding + (index * (width - 2 * padding)) / Math.max(1, data.length - 1)
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

                <div className="md11:!grid grid-cols-4 flex flex-wrap gap-[10px] justify-center  mt-4 space-x-2">
                    {departments.map((dept, index) => (
                        <div
                            key={dept}
                            className={`flex items-center transition-all duration-500 ${chartAnimated ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                                }`}
                            style={{ transitionDelay: `${index * 200 + 1000}ms` }}
                        >
                            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: colors[dept] }}></div>
                            <span className="text-sm flex-shrink-0 text-gray-700">{dept}</span>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    // ===================== UI (design unchanged) =====================
    return (
        <>
            <section className="flex w-[100%] h-[100%] select-none   md11:pr-[15px] overflow-hidden">
                <div className="flex w-[100%] overflow-hidden flex-col  h-[100vh]">
                    <Header pageName="Complaint Management " />
                    <div className="flex overflow-hidden  w-[100%] h-[100%]">
                        <Sidebar />
                        <div className="flex relative flex-col w-[100%] max-h-[97%] md34:!pb-[80px] md11:!pb-0 py-[10px] px-[10px] overflow-y-auto gap-[10px] rounded-[10px]">
                            <Preloader />
                            <div className="">
                                <div className="">
                                    <div className="bg-white rounded-lg shadow-sm p-[13px]  mb-[10px] border border-gray-100  ">
                                        <OpdFilter
                                            value={filters}
                                            onChange={handleFilterChange}
                                            serviceVariant="concern"
                                            doctors={doctorOptions} 
                                            isAdmin={isAdmin}
                                        />
                                    </div>

                                    <div className="grid md34:!grid-cols-2  md11:!grid-cols-4 mt-[10px] lg:grid-cols-6 gap-2 mb-2">
                                        <Widgets1
                                            data={{
                                                title: "Total Complaints",
                                                gros: kpiData.totalComplaints,
                                                total: kpiData.totalComplaints,
                                                color: "",
                                                icon: <FontAwesomeIcon icon={faTriangleExclamation} className="w-6 h-6 text-blue-600" />,
                                            }}
                                        />

                                        <Widgets1
                                            data={{
                                                title: "Pending",
                                                gros: kpiData.pending,
                                                total: kpiData.pending,
                                                color: "warning",
                                                icon: <FontAwesomeIcon icon={faClock} className="w-6 h-6 text-yellow-600" />,
                                            }}
                                        />

                                        <Widgets1
                                            data={{
                                                title: "Resolved",
                                                gros: kpiData.resolved,
                                                total: kpiData.resolved,
                                                color: "success",
                                                icon: <FontAwesomeIcon icon={faCircleCheck} className="w-6 h-6 text-green-600" />,
                                            }}
                                        />

                                        <Widgets1
                                            data={{
                                                title: "Escalated",
                                                gros: kpiData.escalated,
                                                total: kpiData.escalated,
                                                color: "danger",
                                                icon: <FontAwesomeIcon icon={faArrowTrendUp} className="w-6 h-6 text-red-600" />,
                                            }}
                                        />
                                        <div className=" mt-[-10px]">
                                            <Widgets1
                                                data={{
                                                    title: "Avg Resolution",
                                                    gros: kpiData.avgResolutionTime,
                                                    total: kpiData.avgResolutionTime,
                                                    color: "purple",
                                                    icon: <FontAwesomeIcon icon={faStopwatch} className="w-6 h-6 text-purple-600" />,
                                                }}
                                            />
                                        </div>
                                        <div className=" mt-[-10px]">


                                            <Widgets1
                                                data={{
                                                    title: "In Progress",
                                                    gros: kpiData.inProgress,
                                                    total: kpiData.inProgress,
                                                    color: "purple",
                                                    icon: <FontAwesomeIcon icon={faSpinner} className="w-6 h-6 text-purple-600" spin />,
                                                }}
                                            />
                                        </div>
                                    </div>


                                    {/* Charts Row */}
                                    <div className=" flex  md11:!flex-row md34:!flex-col  md11:!min-w-[600px]  gap-6 mb-3">
                                        <div className="bg-white border rounded-lg shadow-sm p-4">
                                            <div className=" flex gap-[10px]">



                                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-md flex items-center justify-center">
                                                    <i className=" text-[#fff] text-[17px] fa-solid fa-star-sharp-half-stroke"></i>
                                                </div>
                                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Complaint Trend by Department</h3>
                                            </div>
                                            <div className="flex justify-center">

                                                <SimpleBarChart trendData={trendData} />

                                            </div>
                                        </div>

                                        <div className="bg-white  rounded-lg  border shadow-sm p-4">
                                            <div className="flex gap-[10px]">


                                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-md flex items-center justify-center">
                                                    <i className="fa-regular fa-hospitals text-[#fff] text-[19px]"></i>
                                                </div>
                                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Floor-wise Complaints Distribution</h3>
                                            </div>
                                            <div className="flex justify-center  max-w-[400px]">
                                                <AnimatedDonutChart
                                                    data={[
                                                        { label: "General", count: 45, percentage: 35, color: "#3B82F6" },
                                                        { label: "ICU", count: 32, percentage: 25, color: "#EF4444" },
                                                        { label: "Special", count: 25, percentage: 20, color: "#10B981" },
                                                        { label: "Deluxe", count: 18, percentage: 14, color: "#F59E0B" },
                                                        { label: "Emergency", count: 8, percentage: 6, color: "#8B5CF6" },
                                                    ]}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className=" flex md11:!flex-row md34:!flex-col w-[100%] items-start gap-[10px]">
                                        <div className="bg-white border md34:!w-[100%] md11:!w-[70%] shadow-sm rounded-lg overflow-hidden mb-6">
                                            <div className=" px-3 py-3 items-center gap-[10px] flex   border-b border-gray-200">
                                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-md flex items-center justify-center">
                                                    <i className="fa-solid  text-[17px] text-[#fff] fa-keyboard-brightness"></i>
                                                </div>
                                                <h3 className="text-[15px] font-semibold text-gray-900">
                                                    Top 5 Departments with Most Complaints
                                                </h3>
                                            </div>
                                            <div className="w-full overflow-x-auto">
                                                <table className="md34:!min-w-[1000px] md11:!min-w-[500px]">
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
                                                        {top5Departments.map((dept) => (
                                                            <tr
                                                                key={dept.rank}
                                                                className={`${dept.rank % 2 === 1 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50 transition-colors`}
                                                            >
                                                                <td className="px-6 py-2 text-sm font-[600] text-gray-900">
                                                                    <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full">
                                                                        {dept.rank}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-2 text-sm font-medium text-gray-900">{dept.department || ""}</td>
                                                                <td className="px-6 py-2 text-sm text-gray-900">
                                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[14px] font-[500] bg-red-100 text-red-800">
                                                                        {dept.complaints}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-2 text-sm text-gray-900">{dept.avgResolution || ""}</td>
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
                                        <div className="bg-white border  md34min-h-[348px]  rounded-lg  mb-[20px] md11:!h-[200px] shadow-sm md11:!w-[400px]">
                                            <div className="flex ml-[19px] py-3 items-center  gap-[10px]">


                                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-md flex items-center justify-center">
                                                    <i className="fa-solid  text-[17px] text-[#fff] fa-keyboard-brightness"></i>
                                                </div>
                                                <h3 className="text-lg font-semibold text-gray-900 mb-1">Frequent Complaint Keywords</h3>

                                            </div>
                                            <div className="flex border-t flex-wrap gap-2 p-[20px] ">
                                                {[
                                                    "Food",
                                                    // "Discharge",
                                                    // "AC",
                                                    // "Spicy",
                                                    // "Fan",
                                                    // "Mosquito",
                                                    "Cleaning",
                                                    "Staff",
                                                    // "Waiting",
                                                    // "Billing",
                                                    // "Medicine",
                                                    // "Nurse",
                                                    // "Doctor",
                                                    // "Room",
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
                                        <div className="px-3 py-3 border-b flex  gap-[10px] items-center border-gray-200">
                                            <div className=" w-[100%]  flex  items-center gap-[10px] ">


                                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-md flex items-center justify-center">
                                                    <i className="fa-regular fa-users-medical text-[17px] text-[#fff] "></i>
                                                </div>
                                                <h3 className="text-lg font-semibold text-gray-900">Complaint Details</h3>
                                            </div>
                                            <button

                                                className="flex items-center flex-shrink-0  px-3 py-[6px] h-[35px] w-fit gap-[8px] bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                                onClick={handleAllPageNavigate}
                                            >
                                                <Eye className="w-5 h-5 " />
                                                View All
                                            </button>

                                        </div>

                                        <div className="overflow-x-auto">
                                            <table className=" md34:!min-w-[1350px]  md11:!min-w-full">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Complaint ID
                                                        </th>
                                                        <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Date & Time
                                                        </th>
                                                        <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Patient Name
                                                        </th>
                                                        <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Doctor Name
                                                        </th>
                                                        <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Bed No.
                                                        </th>
                                                        <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Department
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
                                                    {rows
                                                        .slice()
                                                        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                                                        .slice(0, 5)
                                                        .map((complaint, index) => {
                                                            const fullDoc = rawConcerns.find(d => d._id === complaint.id);
                                                            return (
                                                                <tr
                                                                    key={complaint.id}
                                                                    // onClick={handlenavigate}
                                                                    className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50 transition-colors`}
                                                                >
                                                                    <td className="px-6 py-2 text-sm font-medium text-blue-600">{complaint.complaintId}</td>
                                                                    <td className="px-6 py-2 text-sm text-gray-900">
                                                                        <div className="flex items-center">
                                                                           
                                                                            {complaint.date}
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-6 py-2 text-sm font-medium text-gray-900">{complaint.patient}</td>
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
                                                                    <td className="px-6 py-2 text-sm text-gray-900">
                                                                        {fullDoc ? getDepartmentsString(fullDoc, allowedBlocks) : "-"}
                                                                    </td>

                                                                    <td className="px-3 py-2 text-sm">
                                                                        <span
                                                                            className={`flex items-center px-2 py-1   !flex-shrink-0 justify-center  w-[90px] rounded-full text-[13px] font-[500] ${getStatusColor(
                                                                                complaint.status,
                                                                            )}`}
                                                                        >
                                                                            {complaint.status}
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-6 py-2 text-sm text-gray-900">
                                                                        <button
                                                                            onClick={() => handlenavigate(complaint, fullDoc)}
                                                                            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                                                                        >
                                                                            <Eye className="w-4 h-4 mr-1" />
                                                                            View
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            )
                                                        })}
                                                    {filteredComplaints.length === 0 && (
                                                        <tr>
                                                            <td colSpan={8} className="px-6 py-6 text-center text-gray-500">
                                                                No complaints found for the selected range.
                                                            </td>
                                                        </tr>
                                                    )}
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
                                                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[14px] font-[500] ${getStatusColor(
                                                                                    selectedComplaint.status,
                                                                                )}`}
                                                                            >
                                                                                {selectedComplaint.status}
                                                                            </span>
                                                                        </div>
                                                                        <div className="flex items-center">
                                                                            <span className="text-sm text-gray-600 mr-3">Priority:</span>
                                                                            <span
                                                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[14px] font-[500] ${getPriorityColor(
                                                                                    selectedComplaint.priority,
                                                                                )}`}
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
                                                                    <p className="text-gray-600 leading-[21px] text-[14px] ">{selectedComplaint.details}</p>
                                                                </div>

                                                                <div className="bg-gray-50 p-3 border rounded-lg">
                                                                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Action History</h4>
                                                                    <div className="space-y-3">
                                                                        {(selectedComplaint.actions || []).map((action, index) => (
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
