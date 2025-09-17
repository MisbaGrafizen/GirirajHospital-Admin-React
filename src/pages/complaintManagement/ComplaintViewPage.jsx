import React, { useEffect, useState } from 'react'
import Header from '../../Component/header/Header'
import SideBar from '../../Component/sidebar/CubaSideBar'
import { motion, AnimatePresence } from "framer-motion"
import {
    Calendar,
    X,
    AlertTriangle,
    CheckCircle,
    User,
    Bed,
    Phone,
    Upload,
    ChevronDown,
    Forward,
    TrendingUp,
    MapPin,
    Paperclip,
    Clock,
    ArrowLeft,
} from "lucide-react"
import { useLocation, useNavigate } from 'react-router-dom'
import { ApiGet, ApiPost } from '../../helper/axios'
import uploadToHPanel from '../../helper/hpanelUpload'


const DEPT_LABEL = {
    doctorServices: "Doctor Services",
    billingServices: "Billing Services",
    housekeeping: "Housekeeping",
    maintenance: "Maintenance",
    diagnosticServices: "Diagnostic Services",
    dietitianServices: "Dietitian Services",
    security: "Security",
    overall: "Overall",
};

// a block is "present" if it has any content (topic/mode/text/attachments)
function blockHasContent(block) {
  if (!block) return false;

  const hasText = block.text && block.text.trim() !== "";
  const hasAttachments = Array.isArray(block.attachments) && block.attachments.length > 0;

  return hasText || hasAttachments;
}



function mapStatusUI(status) {
    const s = String(status || "").toLowerCase();
    if (s === "open") return "Open";
    if (s === "in_progress") return "In Progress";
    if (s === "resolved") return "Resolved";
    if (s === "escalated") return "Escalated";
    return "Pending"; // fallback for unexpected status
}


const ServiceBlock = ({ label, block }) => {
    return (
        <div className="bg-gray-50 rounded-lg p-4 mb-3">
            {/* Service Name */}
            <h3 className="text-md font-semibold text-gray-900 mb-2">{label}</h3>

            {/* Topic */}
            {block?.topic ? (
                <p className="text-sm text-gray-700 mb-1">
                    <span className="font-medium">Topic:</span> {block.topic}
                </p>
            ) : (
                <p className="text-sm text-gray-400 italic">No topic provided</p>
            )}

            {/* Text */}
            {block?.text ? (
                <p className="text-gray-800 mb-2">
                    <span className="font-medium">Details:</span> {block.text}
                </p>
            ) : (
                <p className="text-sm text-gray-400 italic">No details provided</p>
            )}

            {/* Attachments */}
            {Array.isArray(block?.attachments) && block.attachments.length > 0 ? (
                <div className="space-y-2 mt-2">
                    {block.attachments.map((att, i) => {
                        const isAudio = att.endsWith(".mp3") || att.endsWith(".wav");
                        const isImage =
                            att.endsWith(".jpg") || att.endsWith(".jpeg") || att.endsWith(".png");

                        return (
                            <div key={i} className="p-2 bg-white border rounded-md">
                                {isAudio ? (
                                    <audio controls className="w-full">
                                        <source src={att} type="audio/mpeg" />
                                        Your browser does not support audio playback.
                                    </audio>
                                ) : isImage ? (
                                    <img
                                        src={att}
                                        alt="attachment"
                                        className="w-48 h-auto rounded-md border"
                                    />
                                ) : (
                                    <a
                                        href={att}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 underline"
                                    >
                                        {att}
                                    </a>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <p className="text-sm text-gray-400 italic">No attachments</p>
            )}
        </div>
    );
};



export default function ComplaintViewPage() {
    // Modal states
    const [isForwardModalOpen, setIsForwardModalOpen] = useState(false)
    const [isResolveModalOpen, setIsResolveModalOpen] = useState(false)
    const [isEscalateModalOpen, setIsEscalateModalOpen] = useState(false)
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)

    // Dropdown states
    const [isForwardDeptDropdownOpen, setIsForwardDeptDropdownOpen] = useState(false)
    const [isEscalationDropdownOpen, setIsEscalationDropdownOpen] = useState(false)

    // Form states
    const [forwardDepartment, setForwardDepartment] = useState("")
    const [forwardReason, setForwardReason] = useState("")
    const [escalationLevel, setEscalationLevel] = useState("")
    const [escalationNote, setEscalationNote] = useState("")
    const [resolutionNote, setResolutionNote] = useState("")
    const [uploadedFile, setUploadedFile] = useState(null)
    const [historyData, setHistoryData] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);


    const escalationLevels = ["PGRO", "CEO", "Board of Directors", "Medical Director"]

    const { state } = useLocation();
    const row = state?.complaint || {};
    const fullDoc = state?.doc || row;


    const CONCERN_KEYS = React.useMemo(() => {
        if (!fullDoc || typeof fullDoc !== "object") return [];
        return Object.keys(fullDoc).filter((key) => {
            const block = fullDoc[key] || row[key] || fullDoc?.doc?.[key] || row?.doc?.[key];
            return blockHasContent(block);
        });
    }, [fullDoc, row]);

    function collectPresentModuleLabels(src) {
        if (!src || typeof src !== "object") return [];
        const labels = [];
        CONCERN_KEYS.forEach((k) => {
            if (blockHasContent(src[k])) labels.push(DEPT_LABEL[k]);
        });
        return labels;
    }

    function collectAllModuleAttachments(src) {
        if (!src || typeof src !== "object") return [];
        const out = [];
        CONCERN_KEYS.forEach((k) => {
            const atts = src?.[k]?.attachments;
            if (Array.isArray(atts) && atts.length) out.push(...atts);
        });
        return out;
    }


    console.log('CONCERN_KEYS', fullDoc)

    const presentLabels = collectPresentModuleLabels(fullDoc);
    const categoryText =
        presentLabels.length
            ? presentLabels.join(", ")
            : (row.category || "—");

    const moduleAttachments = collectAllModuleAttachments(fullDoc);
    const attachments =
        moduleAttachments.length
            ? moduleAttachments
            : (Array.isArray(row.attachments) ? row.attachments : []);

    const complaint = {
        id: row.id || row._id || fullDoc?._id || "—",
        complaintId: row.complaintId || fullDoc?.complaintId || "—",
        date: row.date || row.createdAt || fullDoc?.createdAt || "—",
        patient: row.patient || fullDoc?.patientName || "—",
        bedNo: row.bedNo || fullDoc?.bedNo || "—",
        department: row.department || categoryText || "—",
        status: mapStatusUI(row.status || fullDoc?.status),
        priority: row.priority || fullDoc?.priority || "Normal",
        category: categoryText,
        details: row.details || "",
        contact: row.contact || fullDoc?.contact || "—",
        doctorName: row.doctor || row.doctorName || fullDoc?.consultantDoctorName || "—",
        assignedTo: row.assignedTo || "—",
        expectedResolution: row.expectedResolution || "—",
        attachments,
        escalationRemarks: row.escalationRemarks || "",
        activityLog: Array.isArray(row.actions)
            ? row.actions.map(a => ({
                date: a.date || "—",
                action: a.action || "—",
                by: a.by || "—",
                status: a.status || "—",
            }))
            : [],
    };


    // const complaint = {
    //     id: "TKT001",
    //     date: "2024-01-15 10:30",
    //     patient: "John Smith",
    //     bedNo: "A-101",
    //     department: "Nursing",
    //     status: "Pending",
    //     priority: "High",
    //     category: "Service Quality",
    //     details:
    //         "Staff response time is slow during night shift. Patient had to wait 45 minutes for assistance when calling for help. This is affecting patient satisfaction and recovery. The patient pressed the call button multiple times but no one responded promptly. This has happened on multiple occasions during the night shift.",
    //     contact: "+91 9876543210",
    //     doctorName: "Dr. Sharma",
    //     assignedTo: "Nurse Manager - Sarah Johnson",
    //     expectedResolution: "2024-01-17 18:00",
    //     attachments: ["audio_complaint.mp3", "incident_photo.jpg"],
    //     escalationRemarks: "Initial complaint registered - requires immediate attention",
    //     activityLog: [
    //         { date: "2024-01-15 10:30", action: "Complaint registered", by: "Reception", status: "New" },
    //         { date: "2024-01-15 11:00", action: "Assigned to Nursing Manager", by: "Admin", status: "Assigned" },
    //         { date: "2024-01-15 14:30", action: "Investigation started", by: "Sarah Johnson", status: "In Progress" },
    //         { date: "2024-01-15 16:45", action: "Patient interviewed", by: "Sarah Johnson", status: "Under Review" },
    //         { date: "2024-01-16 09:00", action: "Staff meeting conducted", by: "Sarah Johnson", status: "Action Taken" },
    //     ],
    // }


    // Add reverse mapping at the top
    const DEPT_KEY = Object.fromEntries(
        Object.entries(DEPT_LABEL).map(([k, v]) => [v, k])
    );

    const forwardDepartments = presentLabels;

    // forwardComplaint using ApiPost
    async function forwardComplaint(complaintId, departmentKey, data) {
        try {
            const response = await ApiPost(`/admin/${complaintId}/forward`, {
                department: departmentKey, // must be schema key
                topic: data.topic || "Forwarded Complaint",
                text: data.text || data.reason || "",
                attachments: data.attachments || [],
            });

            return response;
        } catch (error) {
            throw new Error(error.message || "Failed to forward complaint");
        }
    }

    // in handleForwardSubmit
    const handleForwardSubmit = async () => {
        if (!forwardDepartment || !forwardReason) {
            alert("Please select a department and provide a reason.");
            return;
        }

        try {
            // Convert label (e.g. "Billing Services") → key (e.g. "billingServices")
            const departmentKey = DEPT_KEY[forwardDepartment];
            if (!departmentKey) {
                alert("Invalid department selected");
                return;
            }

            const payload = {
                text: forwardReason,
                attachments: uploadedFile ? [uploadedFile.name] : [],
            };

            const res = await forwardComplaint(complaint.id, departmentKey, payload);

            alert(res.message || `Complaint forwarded to ${forwardDepartment}`);
            closeAllModals();
        } catch (error) {
            console.error("Forward Error:", error);
            alert(error.message || "Something went wrong while forwarding");
        }
    };

    async function escalateComplaint(complaintId, { level, note, userId }) {
        try {
            const response = await ApiPost(`/admin/${complaintId}/escalate`, {
                level,
                note,
                userId, // you can get current logged-in user id from context or state
            });
            return response;
        } catch (error) {
            throw new Error(error.message || "Failed to escalate complaint");
        }
    }
    const handleEscalateSubmit = async () => {
        if (!escalationLevel || !escalationNote) {
            alert("Please select escalation level and provide a note.");
            return;
        }

        try {
            // replace this with your auth/user context
            const currentUserId = "12345";

            const res = await escalateComplaint(complaint.id, {
                level: escalationLevel,
                note: escalationNote,
                userId: currentUserId,
            });

            alert(res.message || `Complaint escalated to ${escalationLevel}`);
            closeAllModals();
        } catch (error) {
            console.error("Escalation Error:", error);
            alert(error.message || "Something went wrong while escalating");
        }
    };

    async function resolveComplaintAPI(complaintId, { note, proof }) {
        try {
            const response = await ApiPost(`/admin/${complaintId}/resolve`, {
                note,
                proof, // url string or empty
            });
            return response;
        } catch (error) {
            throw new Error(error.message || "Failed to resolve complaint");
        }
    }

    const handleResolveSubmit = async () => {
        if (!resolutionNote) {
            alert("Please provide a resolution note.");
            return;
        }

        try {
            let proofUrl = "";
            if (uploadedFile) {
                const uploadRes = await uploadToHPanel(uploadedFile);
                proofUrl = uploadRes.url; // must match backend expectation
            }

            const res = await resolveComplaintAPI(complaint.id, {
                note: resolutionNote,
                proof: proofUrl,
            });

            alert(res.message || "Complaint resolved successfully.");
            closeAllModals();
        } catch (error) {
            console.error("Resolve Error:", error);
            alert(error.message || "Something went wrong while resolving complaint");
        }
    };

    async function fetchConcernHistory(complaintId) {
        try {
            const response = await ApiGet(`/admin/${complaintId}/history`);
            return response.history.timeline;
        } catch (error) {
            throw new Error(error.message || "Failed to fetch complaint history");
        }
    }



    const getStatusColor = (status) => {
        switch (status) {
            case "Pending":
                return "bg-yellow-100 text-yellow-800 border-yellow-200"
            case "In Progress":
                return "bg-blue-100 text-blue-800 border-blue-200"
            case "Closed":
                return "bg-green-100 text-green-800 border-green-200"
            case "Escalated":
                return "bg-red-100 text-red-800 border-red-200"
            default:
                return "bg-gray-100 text-gray-800 border-gray-200"
        }
    }

    const getPriorityColor = (priority) => {
        switch (priority) {
            case "Critical":
                return "bg-red-100 text-red-800 border-red-200"
            case "High":
                return "bg-orange-100 text-orange-800 border-orange-200"
            case "Medium":
                return "bg-yellow-100 text-yellow-800 border-yellow-200"
            case "Low":
                return "bg-green-100 text-green-800 border-green-200"
            default:
                return "bg-gray-100 text-gray-800 border-gray-200"
        }
    }

    const closeAllModals = () => {
        setIsForwardModalOpen(false)
        setIsResolveModalOpen(false)
        setIsEscalateModalOpen(false)
        setIsHistoryModalOpen(false)
        setForwardDepartment("")
        setForwardReason("")
        setEscalationLevel("")
        setEscalationNote("")
        setResolutionNote("")
        setUploadedFile(null)
        document.body.style.overflow = ""
    }

    const openModal = async (modalType) => {
        document.body.style.overflow = "hidden";
        switch (modalType) {
            case "forward":
                setIsForwardModalOpen(true);
                break;
            case "resolve":
                setIsResolveModalOpen(true);
                break;
            case "escalate":
                setIsEscalateModalOpen(true);
                break;
            case "history":
                setIsHistoryModalOpen(true);
                setLoadingHistory(true);
                try {
                    const data = await fetchConcernHistory(complaint.id);
                    console.log('data', data)
                    setHistoryData(data);
                } catch (err) {
                    console.error("History Error:", err);
                    alert("Failed to load history");
                } finally {
                    setLoadingHistory(false);
                }
                break;
        }
    };

    useEffect(() => {
        if (!complaint.id) return;
        (async () => {
            try {
                setLoadingHistory(true);
                const data = await fetchConcernHistory(complaint.id);
                setHistoryData(data);
            } catch (err) {
                console.error("History Error:", err);
            } finally {
                setLoadingHistory(false);
            }
        })();
    }, [complaint.id]);

    // Get latest forwarded department
    const latestForward = React.useMemo(() => {
        if (!Array.isArray(historyData)) return null;
        const last = [...historyData].reverse().find(h => h.type === "forwarded");
        return last ? DEPT_LABEL[last.department] || last.department : null;
    }, [historyData]);

    // Get latest escalation
    const latestEscalation = React.useMemo(() => {
        if (!Array.isArray(historyData)) return null;
        const last = [...historyData].reverse().find(h => h.type === "escalated");
        return last ? last.level : null;
    }, [historyData]);


    const handleFileUpload = (event) => {
        const file = event.target.files[0]
        if (file) {
            setUploadedFile(file)
        }
    }

    // Animated Dropdown Component
    const AnimatedDropdown = ({ isOpen, setIsOpen, selected, setSelected, options, placeholder, icon: Icon }) => {
        return (
            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                    <div className="flex items-center">
                        {Icon && <Icon className="w-5 h-5 text-gray-400 mr-3" />}
                        <span className={selected === placeholder ? "text-gray-500" : "text-gray-900"}>{selected}</span>
                    </div>
                    <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                    </motion.div>
                </button>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="absolute z-10 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto"
                        >
                            {options.map((option, index) => (
                                <motion.button
                                    key={option}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() => {
                                        setSelected(option)
                                        setIsOpen(false)
                                    }}
                                    className="w-full text-left px-4 py-3 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none transition-colors first:rounded-t-lg last:rounded-b-lg"
                                >
                                    {option}
                                </motion.button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        )
    }

    return (
        <>



            <section className="flex w-[100%] h-[100%] select-none   pr-[15px] overflow-hidden">
                <div className="flex w-[100%] flex-col gap-[0px] h-[96vh]">
                    <Header pageName="Complaint Details" />
                    <div className="flex w-[100%] h-[100%]">
                        <SideBar />
                        <div className="flex flex-col w-[100%] max-h-[90%] pb-[50px] py-[10px] px-[10px] bg-[#fff] overflow-y-auto gap-[10px] rounded-[10px]">
                            <div className="">
                                <div className="">
                                    {/* Header */}
                                    <motion.div
                                        initial={{ opacity: 0, y: -20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-white shadow-sm  px-[20px] pb-[10px] pt-[10px] border-b mb-6"
                                    >
                                        <div className="flex items-center justify-between ">


                                            <p className="text-gray-600 mt-1">Complaint ID: {complaint.complaintId}</p>

                                            <div className="flex items-center space-x-3">
                                                <span
                                                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(complaint.status)}`}
                                                >
                                                    {complaint.status}
                                                </span>
                                                <span
                                                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(complaint.priority)}`}
                                                >
                                                    {complaint.priority} Priority
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>

                                    {/* Main Content */}
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        {/* Left Column - Patient & Complaint Info */}
                                        <motion.div
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.1 }}
                                            className="lg:col-span-2 space-y-6"
                                        >
                                            {/* Patient Information */}
                                            <div className="bg-white  border rounded-xl shadow-sm p-4">
                                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Patient Information</h2>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                                                        <User className="w-5 h-5 text-gray-400 mr-3" />
                                                        <div>
                                                            <p className="text-sm text-gray-600">Patient Name</p>
                                                            <p className="font-medium text-gray-900">{complaint.patient}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                                                        <Bed className="w-5 h-5 text-gray-400 mr-3" />
                                                        <div>
                                                            <p className="text-sm text-gray-600">Bed Number</p>
                                                            <p className="font-medium text-gray-900">{complaint.bedNo}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                                                        <Phone className="w-5 h-5 text-gray-400 mr-3" />
                                                        <div>
                                                            <p className="text-sm text-gray-600">Contact</p>
                                                            <p className="font-medium text-gray-900">{complaint.contact}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                                                        <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                                                        <div>
                                                            <p className="text-sm text-gray-600">Department</p>
                                                            <p className="font-medium text-gray-900">{complaint.department}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                                                        <User className="w-5 h-5 text-gray-400 mr-3" />
                                                        <div>
                                                            <p className="text-sm text-gray-600">Doctor</p>
                                                            <p className="font-medium text-gray-900">{complaint.doctorName}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                                                        <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                                                        <div>
                                                            <p className="text-sm text-gray-600">Date & Time</p>
                                                            <p className="font-medium text-gray-900">{complaint.date}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Complaint Details */}
                                            <div className="bg-white rounded-xl shadow-sm border p-5">
                                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Complaint Details</h2>
                                                <div className="space-y-4">
                                                    {/* Service Feedback Section */}
                                                    <div className="space-y-4">
                                                        {Object.keys(fullDoc).map((key) => {
                                                            if (!DEPT_LABEL[key]) return null;
                                                            const block = fullDoc[key];
                                                            if (!blockHasContent(block)) return null;

                                                            return (
                                                                <div key={key} className="bg-gray-50 rounded-lg p-4 mb-3">
                                                                    <h3 className="text-md font-semibold text-gray-900 mb-2">{DEPT_LABEL[key]}</h3>

                                                                    {block?.topic && (
                                                                        <p className="text-sm text-gray-700">
                                                                            <span className="font-medium">Topic:</span> {block.topic}
                                                                        </p>
                                                                    )}
                                                                    {block?.text && (
                                                                        <p className="text-sm text-gray-700">
                                                                            <span className="font-medium">Details:</span> {block.text}
                                                                        </p>
                                                                    )}

                                                                    {Array.isArray(block?.attachments) && block.attachments.length > 0 && (
                                                                        <div className="mt-2 space-y-2">
                                                                            {block.attachments.map((att, i) => {
                                                                                const url = att.trim().toLowerCase();
                                                                                const isImage = /\.(jpg|jpeg|png|gif)$/i.test(url);
                                                                                const isAudio = /\.(mp3|wav|ogg)$/i.test(url) || att.endsWith(".");
                                                                                const isPDF = /\.pdf$/i.test(url);

                                                                                return (
                                                                                    <div key={i} className="p-2 bg-white border rounded-md">
                                                                                        {isImage ? (
                                                                                            <img src={att} alt="attachment" className="w-48 h-auto rounded-md border" />
                                                                                        ) : isAudio ? (
                                                                                            <audio controls className="w-full">
                                                                                                <source src={att} type="audio/mpeg" />
                                                                                                Your browser does not support audio playback.
                                                                                            </audio>
                                                                                        ) : isPDF ? (
                                                                                            <embed src={att} type="application/pdf" className="w-full h-64 border rounded-md" />
                                                                                        ) : (
                                                                                            <a href={att} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                                                                                                {att}
                                                                                            </a>
                                                                                        )}
                                                                                    </div>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}




                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            {latestForward && (
                                                                <div className="p-3 bg-blue-50 rounded-lg">
                                                                    <p className="text-sm text-blue-600 font-medium">Assigned To</p>
                                                                    <p className="text-blue-900">{latestForward}</p>
                                                                </div>
                                                            )}
                                                            {latestEscalation && (
                                                                <div className="p-3 bg-orange-50 rounded-lg">
                                                                    <p className="text-sm text-orange-600 font-medium">Expected Resolution</p>
                                                                    <p className="text-orange-900">{latestEscalation}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                        {complaint.escalationRemarks && (
                                                            <div className="p-4 bg-yellow-50 rounded-lg">
                                                                <h3 className="font-medium text-yellow-900 mb-2">Escalation Remarks</h3>
                                                                <p className="text-yellow-800">{complaint.escalationRemarks}</p>
                                                            </div>
                                                        )}
                                                    </div>


                                                    {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="p-3 bg-blue-50 rounded-lg">
                                                            <p className="text-sm text-blue-600 font-medium">Assigned To</p>
                                                            <p className="text-blue-900">{complaint.assignedTo}</p>
                                                        </div>
                                                        <div className="p-3 bg-orange-50 rounded-lg">
                                                            <p className="text-sm text-orange-600 font-medium">Expected Resolution</p>
                                                            <p className="text-orange-900">{complaint.expectedResolution}</p>
                                                        </div>
                                                    </div>

                                                    <div className="p-4 bg-yellow-50 rounded-lg">
                                                        <h3 className="font-medium text-yellow-900 mb-2">Escalation Remarks</h3>
                                                        <p className="text-yellow-800">{complaint.escalationRemarks}</p>
                                                    </div> */}
                                                </div>
                                            </div>

                                            {/* Attachments */}
                                            {/* {complaint.attachments.length > 0 && (
                                                <div className="bg-white rounded-xl border  shadow-sm p-4">
                                                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Attachments</h2>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        {complaint.attachments.map((attachment, index) => (
                                                            <div
                                                                key={index}
                                                                className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                                                            >
                                                                <Paperclip className="w-5 h-5 text-gray-400 mr-3" />
                                                                <div>
                                                                    <p className="font-medium text-blue-600">{attachment}</p>
                                                                    <p className="text-sm text-gray-500">Click to view/download</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )} */}
                                        </motion.div>

                                        {/* Right Column - Actions & Activity */}
                                        <motion.div
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.2 }}
                                            className="space-y-6"
                                        >
                                            {/* Action Buttons */}
                                            <div className="bg-white border rounded-xl shadow-sm p-4">
                                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Actions</h2>
                                                <div className="space-y-3">
                                                    <button
                                                        onClick={() => openModal("forward")}
                                                        className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                                    >
                                                        <Forward className="w-5 h-5 mr-2" />
                                                        Forward to Another Department
                                                    </button>
                                                    <button
                                                        onClick={() => openModal("escalate")}
                                                        className="w-full flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                                    >
                                                        <TrendingUp className="w-5 h-5 mr-2" />
                                                        Escalate to Higher Authority
                                                    </button>
                                                    <button
                                                        onClick={() => openModal("resolve")}
                                                        className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                                    >
                                                        <CheckCircle className="w-5 h-5 mr-2" />
                                                        Mark as Resolved
                                                    </button>
                                                    <button
                                                        onClick={() => openModal("history")}
                                                        className="w-full flex items-center justify-center px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                                                    >
                                                        <Clock className="w-5 h-5 mr-2" />
                                                        View Full History
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Recent Activity */}
                                            {/* <div className="bg-white rounded-xl border shadow-sm p-4">
                                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
                                                <div className="space-y-4">
                                                    {complaint.activityLog.slice(-3).map((activity, index) => (
                                                        <div key={index} className="flex items-start space-x-3">
                                                            <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-3"></div>
                                                            <div className="flex-1">
                                                                <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                                                                <p className="text-xs text-gray-600">by {activity.by}</p>
                                                                <p className="text-xs text-gray-500">{activity.date}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div> */}
                                            <div className="bg-white rounded-xl border shadow-sm p-4">
                                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
                                                <div className="space-y-4">
                                                    {historyData.slice(-3).reverse().map((h, index) => (
                                                        <div key={index} className="flex items-start space-x-3">
                                                            <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-3"></div>
                                                            <div className="flex-1">
                                                                {h.type === "forwarded" && (
                                                                    <>
                                                                        <p className="text-sm font-medium text-gray-900">
                                                                            Forwarded to {DEPT_LABEL[h.department] || h.department}
                                                                        </p>
                                                                        {h.details?.topic && (
                                                                            <p className="text-xs text-gray-600">Topic: {h.details.topic}</p>
                                                                        )}
                                                                    </>
                                                                )}
                                                                {h.type === "escalated" && (
                                                                    <>
                                                                        <p className="text-sm font-medium text-red-700">
                                                                            Escalated to {h.level}
                                                                        </p>
                                                                        <p className="text-xs text-gray-600">Note: {h.note}</p>
                                                                    </>
                                                                )}
                                                                {h.type === "resolved" && (
                                                                    <>
                                                                        <p className="text-sm font-medium text-green-700">Resolved</p>
                                                                        <p className="text-xs text-gray-600">Note: {h.note}</p>
                                                                    </>
                                                                )}
                                                                {h.type === "created" && (
                                                                    <p className="text-sm text-gray-700">Complaint Created</p>
                                                                )}
                                                                <p className="text-xs text-gray-500">
                                                                    {new Date(h.at || h.createdAt).toLocaleString()}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                        </motion.div>
                                    </div>

                                    {/* Modal 1: Forward to Another Department */}
                                    <AnimatePresence>
                                        {isForwardModalOpen && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50"
                                                onClick={closeAllModals}
                                            >
                                                <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                                        className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <div className="bg-white px-6 pt-6 pb-4">
                                                            <div className="flex justify-between items-center mb-6">
                                                                <h3 className="text-xl font-bold text-gray-900">Forward to Another Department</h3>
                                                                <button onClick={closeAllModals} className="text-gray-400 hover:text-gray-600 transition-colors">
                                                                    <X className="w-6 h-6" />
                                                                </button>
                                                            </div>

                                                            <div className="space-y-6">
                                                                <div>
                                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Department</label>
                                                                    <AnimatedDropdown
                                                                        isOpen={isForwardDeptDropdownOpen}
                                                                        setIsOpen={setIsForwardDeptDropdownOpen}
                                                                        selected={forwardDepartment || "Select Department"}
                                                                        setSelected={setForwardDepartment}
                                                                        options={forwardDepartments}
                                                                        placeholder="Select Department"
                                                                        icon={MapPin}
                                                                    />
                                                                </div>

                                                                <div>
                                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                        Reason for Forwarding <span className="text-red-500">*</span>
                                                                    </label>
                                                                    <textarea
                                                                        value={forwardReason}
                                                                        onChange={(e) => setForwardReason(e.target.value)}
                                                                        rows={4}
                                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                                                        placeholder="Please provide reason for forwarding this complaint..."
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
                                                            <button
                                                                onClick={closeAllModals}
                                                                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button
                                                                onClick={handleForwardSubmit}
                                                                disabled={!forwardDepartment || !forwardReason}
                                                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                            >
                                                                Forward Complaint
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Modal 2: Resolve Complaint */}
                                    <AnimatePresence>
                                        {isResolveModalOpen && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50"
                                                onClick={closeAllModals}
                                            >
                                                <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                                        className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <div className="bg-white px-6 pt-6 pb-4">
                                                            <div className="flex justify-between items-center mb-6">
                                                                <h3 className="text-xl font-bold text-gray-900">Resolve Complaint</h3>
                                                                <button onClick={closeAllModals} className="text-gray-400 hover:text-gray-600 transition-colors">
                                                                    <X className="w-6 h-6" />
                                                                </button>
                                                            </div>

                                                            <div className="space-y-6">
                                                                <div>
                                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                        Resolution Note <span className="text-red-500">*</span>
                                                                    </label>
                                                                    <textarea
                                                                        value={resolutionNote}
                                                                        onChange={(e) => setResolutionNote(e.target.value)}
                                                                        rows={4}
                                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                                                                        placeholder="Please provide details about how the complaint was resolved..."
                                                                    />
                                                                </div>

                                                                <div>
                                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Upload Proof (Optional)</label>
                                                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-400 transition-colors">
                                                                        <input
                                                                            type="file"
                                                                            onChange={handleFileUpload}
                                                                            className="hidden"
                                                                            id="file-upload"
                                                                            accept="image/*,.pdf,.doc,.docx"
                                                                        />
                                                                        <label
                                                                            htmlFor="file-upload"
                                                                            className="cursor-pointer flex flex-col items-center justify-center"
                                                                        >
                                                                            <Upload className="w-10 h-10 text-gray-400 mb-3" />
                                                                            <span className="text-sm text-gray-600 mb-1">Click to upload file</span>
                                                                            <span className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</span>
                                                                            {uploadedFile && (
                                                                                <span className="text-sm text-green-600 mt-2 font-medium">File: {uploadedFile.name}</span>
                                                                            )}
                                                                        </label>
                                                                    </div>
                                                                </div>

                                                                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                                                    <div className="flex items-center">
                                                                        <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                                                                        <span className="text-sm text-green-800">
                                                                            Patient will receive an SMS notification about the resolution.
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
                                                            <button
                                                                onClick={closeAllModals}
                                                                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button
                                                                onClick={handleResolveSubmit}
                                                                disabled={!resolutionNote}
                                                                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                            >
                                                                Resolve Complaint
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Modal 3: Escalate to Higher Authority */}
                                    <AnimatePresence>
                                        {isEscalateModalOpen && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50"
                                                onClick={closeAllModals}
                                            >
                                                <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                                        className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <div className="bg-white px-6 pt-6 pb-4">
                                                            <div className="flex justify-between items-center mb-6">
                                                                <h3 className="text-xl font-bold text-gray-900">Escalate to Higher Authority</h3>
                                                                <button onClick={closeAllModals} className="text-gray-400 hover:text-gray-600 transition-colors">
                                                                    <X className="w-6 h-6" />
                                                                </button>
                                                            </div>

                                                            <div className="space-y-6">
                                                                <div>
                                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                        Select Escalation Level <span className="text-red-500">*</span>
                                                                    </label>
                                                                    <AnimatedDropdown
                                                                        isOpen={isEscalationDropdownOpen}
                                                                        setIsOpen={setIsEscalationDropdownOpen}
                                                                        selected={escalationLevel || "Select Escalation Level"}
                                                                        setSelected={setEscalationLevel}
                                                                        options={escalationLevels}
                                                                        placeholder="Select Escalation Level"
                                                                        icon={TrendingUp}
                                                                    />
                                                                </div>

                                                                <div>
                                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                        Escalation Note <span className="text-red-500">*</span>
                                                                    </label>
                                                                    <textarea
                                                                        value={escalationNote}
                                                                        onChange={(e) => setEscalationNote(e.target.value)}
                                                                        rows={4}
                                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                                                                        placeholder="Please provide reason for escalation and any additional context..."
                                                                    />
                                                                </div>

                                                                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                                                                    <div className="flex items-center">
                                                                        <AlertTriangle className="w-5 h-5 text-red-500 mr-3" />
                                                                        <span className="text-sm text-red-800">
                                                                            Higher authority will be notified via email and system notification.
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
                                                            <button
                                                                onClick={closeAllModals}
                                                                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button
                                                                onClick={handleEscalateSubmit}
                                                                disabled={!escalationLevel || !escalationNote}
                                                                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                            >
                                                                Escalate Complaint
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Modal 4: Full History */}
                                    <AnimatePresence>
                                        {isHistoryModalOpen && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50"
                                                onClick={closeAllModals}
                                            >
                                                <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                                        className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <div className="bg-white px-6 pt-6 pb-4">
                                                            <div className="flex justify-between items-center mb-6">
                                                                <h3 className="text-xl font-bold text-gray-900">Complete Activity History</h3>
                                                                <button onClick={closeAllModals} className="text-gray-400 hover:text-gray-600 transition-colors">
                                                                    <X className="w-6 h-6" />
                                                                </button>
                                                            </div>

                                                            {/* <div className="space-y-4 max-h-96 overflow-y-auto">
                                                                {complaint.activityLog.map((activity, index) => (
                                                                    <motion.div
                                                                        key={index}
                                                                        initial={{ opacity: 0, x: -20 }}
                                                                        animate={{ opacity: 1, x: 0 }}
                                                                        transition={{ delay: index * 0.1 }}
                                                                        className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg"
                                                                    >
                                                                        <div className="flex-shrink-0 w-3 h-3 bg-blue-500 rounded-full mt-2"></div>
                                                                        <div className="flex-1">
                                                                            <div className="flex justify-between items-start mb-1">
                                                                                <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                                                                                <span className="text-xs text-gray-500">{activity.date}</span>
                                                                            </div>
                                                                            <p className="text-xs text-gray-600 mb-1">by {activity.by}</p>
                                                                            <span
                                                                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}
                                                                            >
                                                                                {activity.status}
                                                                            </span>
                                                                        </div>
                                                                    </motion.div>
                                                                ))}
                                                            </div> */}
                                                            <div className="space-y-4 max-h-96 overflow-y-auto">
                                                                {loadingHistory ? (
                                                                    <p className="text-center text-gray-500">Loading history...</p>
                                                                ) : historyData.length === 0 ? (
                                                                    <p className="text-center text-gray-500">No history found.</p>
                                                                ) : (
                                                                    Array.isArray(historyData) && historyData.map((h, index) => (
                                                                        <motion.div
                                                                            key={index}
                                                                            initial={{ opacity: 0, x: -20 }}
                                                                            animate={{ opacity: 1, x: 0 }}
                                                                            transition={{ delay: index * 0.05 }}
                                                                            className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg"
                                                                        >
                                                                            <div className="flex-shrink-0 w-3 h-3 bg-blue-500 rounded-full mt-2"></div>
                                                                            <div className="flex-1">
                                                                                {h.type === "created" && (
                                                                                    <>
                                                                                        <p className="text-sm font-medium text-gray-900">Complaint Created</p>
                                                                                        <p className="text-xs text-gray-600">
                                                                                            {h.details.patientName} ({h.details.complaintId})
                                                                                        </p>
                                                                                        <p className="text-xs text-gray-500">
                                                                                            {new Date(h.createdAt).toLocaleString()}
                                                                                        </p>
                                                                                    </>
                                                                                )}
                                                                                {h.type === "forwarded" && (
                                                                                    <>
                                                                                        <p className="text-sm font-medium text-gray-900">
                                                                                            Forwarded to {DEPT_LABEL[h.department] || h.department}
                                                                                        </p>
                                                                                        {h.details?.topic && (
                                                                                            <p className="text-xs text-gray-600">Topic: {h.details.topic}</p>
                                                                                        )}
                                                                                    </>
                                                                                )}
                                                                                {h.type === "escalated" && (
                                                                                    <>
                                                                                        <p className="text-sm font-medium text-gray-900">
                                                                                            Escalated to {h.level}
                                                                                        </p>
                                                                                        <p className="text-xs text-gray-600">Note: {h.note}</p>
                                                                                        <p className="text-xs text-gray-500">
                                                                                            {new Date(h.at).toLocaleString()}
                                                                                        </p>
                                                                                    </>
                                                                                )}
                                                                                {h.type === "resolved" && (
                                                                                    <>
                                                                                        <p className="text-sm font-medium text-green-700">Resolved</p>
                                                                                        <p className="text-xs text-gray-600">Note: {h.note}</p>
                                                                                        {h.proof && (
                                                                                            <a
                                                                                                href={h.proof}
                                                                                                target="_blank"
                                                                                                rel="noreferrer"
                                                                                                className="text-xs text-blue-600 underline"
                                                                                            >
                                                                                                View Proof
                                                                                            </a>
                                                                                        )}
                                                                                        <p className="text-xs text-gray-500">
                                                                                            {new Date(h.at).toLocaleString()}
                                                                                        </p>
                                                                                    </>
                                                                                )}
                                                                            </div>
                                                                        </motion.div>
                                                                    ))
                                                                )}
                                                            </div>

                                                        </div>

                                                        <div className="bg-gray-50 px-6 py-4 flex justify-end">
                                                            <button
                                                                onClick={closeAllModals}
                                                                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                                                            >
                                                                Close
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                        </div>

                    </div>
                </div>
            </section>
        </>
    )
}
