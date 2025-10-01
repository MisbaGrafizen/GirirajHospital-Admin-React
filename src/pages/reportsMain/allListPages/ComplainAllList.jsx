
import Header from '../../../Component/header/Header'
import CubaSidebar from '../../../Component/sidebar/CubaSidebar'
import Preloader from '../../../Component/loader/Preloader'
import React, { useState, useEffect, useMemo, useCallback } from "react"
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
import { useNavigate } from 'react-router-dom'
import { ApiGet } from '../../../helper/axios'

const MODULE_TO_BLOCK = {
    doctor_service: "doctorServices",
    billing_service: "billingServices",
    housekeeping: "housekeeping",
    maintenance: "maintenance",
    diagnostic_service: "diagnosticServices",
    dietetics: "dietitianServices",
    nursing: "nursing", // if you have it
    security: "security",
    nursing: "nursing",
};

const SERVICE_NORMALIZATION_MAP = {
  Doctor: "Doctor Services",
  "Doctor Service": "Doctor Services",
  Billing: "Billing Services",
  Diagnostic: "Diagnostic Services",
  "Diagnostic Service": "Diagnostic Services",
  Dietitian: "Dietitian Services",
  Security: "Security Services",
  Maintenance: "Maintenance Services",
  Housekeeping: "Housekeeping Services",
  Nursing: "Nursing Services",
};

function normalizeServiceName(name = "") {
  return SERVICE_NORMALIZATION_MAP[name] || name;
}



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


const DEPT_LABEL = {
    doctorServices: "Doctor",
    billingServices: "Billing",
    housekeeping: "Housekeeping",
    maintenance: "Maintenance",
    diagnosticServices: "Diagnostic",
    dietitianServices: "Dietitian",
    security: "Security",
    nursing: "Nursing",
}

async function getConcerns(from, to) {
    const res = await ApiGet(`/admin/ipd-concern`)
    return Array.isArray(res?.data) ? res.data : [res?.data].filter(Boolean)
}

const getStatusColor = (status = "") => {
  const normalized = status.toLowerCase().replace("_", " ");

  switch (normalized) {
    case "forwarded":
      return "bg-yellow-100 text-yellow-800";
    case "resolved":
      return "bg-green-100 text-green-800";
    case "in progress":
      return "bg-blue-100 text-blue-800";
    case "escalated":
      return "bg-red-200 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const hasConcernContent = (b) => {
    if (!b || typeof b !== "object") return false;
    const hasText = typeof b.text === "string" && b.text.trim().length > 0;
    const hasFiles = Array.isArray(b.attachments) && b.attachments.length > 0;
    return hasText || hasFiles;
};


const getDepartmentsString = (doc, allowedBlocks) =>
  allowedBlocks
    .filter((k) => hasConcernContent(doc?.[k]))
    .map((k) => normalizeServiceName(DEPT_LABEL[k] || k))
    .join(", ");


export default function ComplainAllList() {
        const [rows, setRows] = useState([])
        const [searchTerm, setSearchTerm] = useState("")
        const [selectedStatus, setSelectedStatus] = useState("All Status")
        const [rawConcerns, setRawConcerns] = useState([]);
        const { isAdmin, allowedBlocks } = resolvePermissions();
        const [filters, setFilters] = useState({
        from: '',                 // "YYYY-MM-DD"
        to: '',                   // "YYYY-MM-DD"
        service: 'All Services',  // matches your UI labels
        doctor: '',               // blank means All Doctors
    });



        const navigate = useNavigate()
    const handlenavigate = (complaintRow, fullDoc) => {
        navigate("/complaint-details", { state: { complaint: complaintRow, doc: fullDoc } });
    };

    const formatStatus = (status = "") => {
  const normalized = status.toLowerCase().replace("_", " ");
  // Capitalize each word
  return normalized.replace(/\b\w/g, (char) => char.toUpperCase());
};



useEffect(() => {
  let alive = true;
  (async () => {
    try {
      const docs = await getConcerns();
      if (!alive) return;

      setRawConcerns(Array.isArray(docs) ? docs : []);

      // ✅ Transform docs into "rows" for table display
      const mapped = docs.map((d) => ({
        id: d._id,
        complaintId: d.complaintId,
        createdAt: d.createdAt,
        date: new Date(d.createdAt).toLocaleString(), // format for display
        patient: d.patientName || "-",
        doctor: d.consultantDoctorName?.name || "-",
        bedNo: d.bedNo || "-",
        department: d.department || "-",
        status: d.status || "Pending",
        details: d.details || "",
      }));
      setRows(mapped);
    } catch (e) {
      if (!alive) return;
      console.error("Failed to load concerns", e);
      setRawConcerns([]);
    }
  })();
  return () => {
    alive = false;
  };
}, []);
      
    
    
    
        // Parse YYYY-MM-DD into local midnight
        const parseLocalDate = (str) => {
            if (!str) return null;
            const [y, m, d] = str.split("-").map(Number);
            return new Date(y, m - 1, d);
        };
    
        // Apply filters to raw docs
        function applyFilters(docs, filters, allowedBlocks) {
            const q = (filters.searchTerm || "").toLowerCase();
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
                if (!filters.doctor) return true;
                return (c.doctor || "")
                    .toLowerCase()
                    .includes(filters.doctor.toLowerCase());
            });
    }, [rows, searchTerm, selectedStatus, filters]);

    console.log('filteredComplaisdfghjnts', filteredComplaints)



    return (
        <>
            <section className="flex w-[100%] h-[100%] select-none   md11:pr-[15px] overflow-hidden">
                <div className="flex w-[100%] flex-col gap-[0px] h-[100vh]">
                    <Header pageName="Ipd Feedback List" />
                    <div className="flex  w-[100%] h-[100%]">
                        <CubaSidebar />
                        <div className="flex flex-col w-[100%]  relative max-h-[93%]  md34:!pb-[120px] m md11:!pb-[20px] py-[10px] pr-[10px]  overflow-y-auto gap-[10px] rounded-[10px]">
                            <Preloader />
                            <div>
                                <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
                                    <div className="px-3 py-3 border-b flex  gap-[10px] items-center border-gray-200">
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-md flex items-center justify-center">
                                            <i className="fa-regular fa-users-medical text-[17px] text-[#fff] "></i>
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900">Complaint Details</h3>
                                    </div>
                                                  
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
                                            {filteredComplaints
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
                                                                    <Clock className="w-4 h-4 text-gray-400 mr-2" />
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
                                                                    {formatStatus(complaint.status)}
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

                        </div>
                    </div>

                </div>
        </section >
 </>
  )
}
