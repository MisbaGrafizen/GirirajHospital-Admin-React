import React, { useEffect, useMemo, useState } from 'react'
import Header from '../../Component/header/Header'
import SideBar from '../../Component/sidebar/CubaSidebar'
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
import { ApiGet, ApiPost, ApiPut } from '../../helper/axios'
import uploadToHPanel from '../../helper/hpanelUpload'
import Preloader from '../../Component/loader/Preloader'

// map backend module ids to your DEPT_LABEL keys
const MODULE_TO_BLOCK = {
    doctor_service: "doctorServices",
    diagnostic_service: "diagnosticServices",
    nursing: "nursing",
    dietitian: "dietitianServices",
    maintenance: "maintenance",
    security: "security",
    billing_service: "billingServices",
    housekeeping: "housekeeping",
    it_department: "itDepartment",
    bio_medical: "bioMedicalDepartment",
    medical_admin: "medicalAdmin",
    pharmacy: "pharmacy",
    accounts: "accounts",
    hr: "hr",
    icn: "icn",
    mrd: "mrd",
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

    const permissionsByBlock = {};
    const allowedBlocks = [];

    if (isAdmin) {
        Object.entries(MODULE_TO_BLOCK).forEach(([module, block]) => {
            permissionsByBlock[block] = ["view", "forward", "escalate", "resolve"];
            allowedBlocks.push(block);
        });
    } else {
        permsArray.forEach((p) => {
            const blockKey = MODULE_TO_BLOCK[p.module];
            if (blockKey) {
                permissionsByBlock[blockKey] = p.permissions.map(x => x.toLowerCase());
                allowedBlocks.push(blockKey);
            }
        });
    }

    return { isAdmin, permissionsByBlock, allowedBlocks };
}



const DEPT_LABEL = {
    doctorServices: "Doctor Services",
    billingServices: "Billing Services",
    housekeeping: "Housekeeping",
    maintenance: "Maintenance",
    diagnosticServices: "Diagnostic Services",
    dietitianServices: "Dietitian Services",
    security: "Security",
    nursing: "Nursing",
    itDepartment: "IT Department",
    bioMedicalDepartment: "Bio Medical",
    medicalAdmin: "Medical Admin",
    hr: "HR",
    pharmacy: "Pharmacy",
    icn: "ICN",
    mrd: "MRD",
    accounts: "Accounts",
};

// a block is "present" if it has any content (topic/mode/text/attachments)
function blockHasContent(block) {
    if (!block) return false;

    const hasText = block.text && block.text.trim() !== "";
    const hasAttachments = Array.isArray(block.attachments) && block.attachments.length > 0;

    return hasText || hasAttachments;
}

function getUserModel() {
  const loginType = localStorage.getItem("loginType");
  return loginType === "admin" ? "GIRIRAJUser" : "GIRIRAJRoleUser";
}


function mapStatusUI(status) {
    const s = String(status || "")
        .toLowerCase()
        .replace("-", "_");

    if (s === "open") return "Open";
    if (s === "in_progress") return "In Progress";
    if (s === "resolved") return "Resolved";
    if (s === "escalated") return "Escalated";
    if (s === "forwarded") return "Forwarded";
    if (s === "partial") return "Partial"; // ✅ Add this
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : "Unknown";
}

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const formatDepartment = (str = "") => {
  if (!str) return "";

  // If single word (no camelCase)
  if (!/[A-Z]/.test(str)) {
    if (str.length <= 3) return str.toUpperCase();   // IT, HR, MRD
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  // If camelCase → convert to spaced text
  const spaced = str.replace(/([a-z])([A-Z])/g, "$1 $2");

  return spaced
    .split(" ")
    .map(word =>
      word.length <= 3
        ? word.toUpperCase()
        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join(" ");
};




export default function InternalComplaintsDetails() {
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
    const [status, setStatus] = useState("IN-PROGRESS")
    const [isEditing, setIsEditing] = useState(false)
    const [selectedDepartment, setSelectedDepartment] = useState("");

    const [isOpen, setIsOpen] = useState(false)

    const [priority, setPriority] = useState("");

    const statusConfig = {
        OPEN: { color: "bg-red-100 text-red-800 border-red-200", label: "OPEN" },
        "IN-PROGRESS": { color: "bg-yellow-100 text-yellow-800 border-yellow-200", label: "IN-PROGRESS" },
        RESOLVED: { color: "bg-green-100 text-green-800 border-green-200", label: "RESOLVED" },
    }


    const escalationLevels = ["PGRO", "CEO", "Board of Directors", "Medical Director"]

    // 🔹 FIXED ESCALATION USER MAP
    const ESCALATION_USER_MAP = {
        "CEO": {
            _id: "68ef88c724a8a2a8317e0cb3",
            name: "Jalpa Raichura",
            email: "jr.grj@feedbacks.live",
            mobileNumber: "9924022922",
            fcmTokens: [
                "eUviBDD32z_4IwQ8IZCnVy:APA91bHiaUvm_fG86tZ6IbQnW6RHGxV-O5sAolZAxpfDUP0zOcnDnoDokG2kJkZWk5SH-OUEV0N0EoSULOEPpMY2hynjEdPjBiYFPDzhgFZT-hme8lTDQr4"
            ],
        },
        "Board of Directors": {
            _id: "68ef884624a8a2a8317e0cab",
            name: "Mayank Thakkar",
            email: "mt.grj@feedbacks.live",
            mobileNumber: "9924022911",
            fcmTokens: [
                "eKxt4jNeMDk5akRGDE_hss:APA91bE0y_7-b6Tl1Xa5o6A1fQwnAT05ZHKmVjMdTTTIwvBKFN_geXjVQb20RgUABqPLDIUilflmyl1Ip5c7-ODZ4IEcvXfItJ9g2KDqqIiSNfx7w99tID8",
                "c06WC1uMbylI6YjNx0qRU7:APA91bFOgOALzusK1HWR_rpZ_NbGFkT10q-NeOg-5034YhdYr65JCz7o1f1IUYTpQ9ulL7unXVerGReU5Z6J3kcwUuJjIaFu737Y6glhcTO0YTh2B9sTB-s",
                "cNScS4yueulGgnV7j9fcsr:APA91bE4suE86YiiTnPfpLcbGfwMBS4u1adPHA3aFrvyVb_cjPl4eQBh5IY5LklAFM7hN-k7_wMob1PQZUqiUqbTs6nE9XidMHcMH3-5yQonaqV9o032e4E",
                "c4aaNywdDZj6TRmX90qn6g:APA91bF2RGN3f3JVYqvQm3gpwIyMDqpxoX7TE4KCrEWfte-q3O_aAJrf_8sfDNyMjVrovJuOJEyqj8ILxE9ad_3693ijFE-4MxJix-M28UZyLBmOdPYFfuw",
                "dO9oS8NgqH3fU_b__GQPwb:APA91bH-rUW8e8vdUYGexL2U9r45Nt1aspKgNqpXD4E_9CcL8HOQMSx3jsZph1MtzBwh2wygpuMFIfzbfUPfs0-XRGT1kihhiXIsywQRf3l-3-caXsBc-2k",
                "eKxt4jNeMDk5akRGDE_hss:APA91bGDvdxE5awm0ImycsvRF9yPse7_c1la-wGz828OiatqcAe3_tDUCk35Q1fCwYOdedzPZguc8C5x8rpHg80DtPv4s4uAvZnArCQJul2rGS24oN8Frzs",
                "eKxt4jNeMDk5akRGDE_hss:APA91bHEJcMWaCOG1X3j5Zl8O2HExS3kEqPOlLoHrJgZDMpuIq55l41FiPWnpkrlDWF0LH7FYyxbJ5mhyCH7BSkEp4thz1s62tHObHl4tuAorVIaFCNy-UA"
            ],
        },
        "Medical Director": {
            _id: "68ef88b124a8a2a8317e0caf",
            name: "Shivani Kathrotiya",
            email: "sk.grj@feedbacks.live",
            mobileNumber: "9924022912",
            fcmTokens: [
                "eKxt4jNeMDk5akRGDE_hss:APA91bE0y_7-b6Tl1Xa5o6A1fQwnAT05ZHKmVjMdTTTIwvBKFN_geXjVQb20RgUABqPLDIUilflmyl1Ip5c7-ODZ4IEcvXfItJ9g2KDqqIiSNfx7w99tID8"
            ],
        },
    };


    const { state } = useLocation();
    const row = state?.complaint || {};
    const fullDoc = state?.doc || row;
const { isAdmin, permissionsByBlock, allowedBlocks } = resolvePermissions();



    const CONCERN_KEYS = React.useMemo(() => {
        if (!fullDoc || typeof fullDoc !== "object") return [];
        return Object.keys(fullDoc).filter((key) => {
            const block = fullDoc[key] || row[key] || fullDoc?.doc?.[key] || row?.doc?.[key];
            return blockHasContent(block);
        });
    }, [fullDoc, row]);

    const resolveDepartments = Object.keys(DEPT_LABEL).filter((deptKey) => {
    const hasContent = blockHasContent(fullDoc[deptKey]); // Complaint exists for this department
    const canResolve = permissionsByBlock[deptKey]?.includes("resolve"); // User has resolve permission
    return hasContent && canResolve;
});

// 🔹 Auto-select if only one
const autoResolveDepartment =
    resolveDepartments.length === 1 ? DEPT_LABEL[resolveDepartments[0]] : null;

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
        patient: row.employeeName || fullDoc?.employeeName || "—",
        bedNo: row.floorNo || fullDoc?.bedNo || "—",
        department: row.department || categoryText || "—",
        status: mapStatusUI(row.status || fullDoc?.status),
        priority: row.priority || fullDoc?.priority || "Normal",
        category: categoryText,
        details: row.details || "",
        contact: row.contactNo || fullDoc?.contact || "—",
        doctorName: row.employeeId || row.doctorName || fullDoc?.consultantDoctorName?.name || "—",
        assignedTo: row.assignedTo || "—",
        expectedResolution: row.expectedResolution || "—",
        attachments,
        note: row.note || "-",
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

    const [complaintText, setComplaintText] = useState(complaint.note || "")
    const [tempText, setTempText] = useState(complaint.note || "")


    // Add reverse mapping at the top
    const DEPT_KEY = Object.fromEntries(
        Object.entries(DEPT_LABEL).map(([k, v]) => [v, k])
    );


    // normalize department string to match keys
    const deptKey = Object.keys(DEPT_LABEL).find(
        (k) => DEPT_LABEL[k] === complaint.department
    );

    const currentPerms = permissionsByBlock[deptKey] || [];


    const forwardDepartments = Object.values(DEPT_LABEL);


    const actionableDepartment = useMemo(() => {
    // Admin can act anytime
    if (isAdmin) return true;

    // Allowed blocks from permissions
    if (!allowedBlocks || allowedBlocks.length === 0) return false;

    // Check if ANY allowed department is unresolved
    return allowedBlocks.some((deptKey) => {
        const block = fullDoc[deptKey];
        if (!block) return false;
        if (!blockHasContent(block)) return false;
        return block.status?.toLowerCase() !== "resolved";
    });
}, [allowedBlocks, fullDoc]);


    console.log('forwardDepartment', forwardDepartment)

    async function fetchComplaintDetails(id) {
        try {
            const response = await ApiGet(`/admin/internal-complaint/${id}`);
            return response.data || response; // assumes backend returns updated complaint object
        } catch (error) {
            console.error("Failed to fetch updated complaint:", error);
            return null;
        }
    }



    // in handleForwardSubmit
    const handleForwardSubmit = async () => {
        if (!forwardDepartment || !forwardReason) {
            alert("Please select a department and provide a reason.");
            return;
        }

        try {
            const departmentKey = DEPT_KEY[forwardDepartment];
            if (!departmentKey) {
                alert("Invalid department selected");
                return;
            }

            const payload = {
                department: departmentKey,
                topic: "Forwarded Complaint",
                text: forwardReason,
                attachments: uploadedFile ? [uploadedFile.name] : [],
                mode: "text",
            };

            const res = await ApiPost(`/admin/internal/${complaint.id}/forward`, payload);
            alert(res.message || `Complaint forwarded to ${forwardDepartment}`);

            // ✅ Re-fetch complaint & history to update UI
            const updated = await fetchComplaintDetails(complaint.id);
            if (updated) {
                setStatus(updated.status || updated.data?.status);
            }

            const newHistory = await fetchConcernHistory(complaint.id);
            setHistoryData(newHistory);

            closeAllModals();
        } catch (error) {
            console.error("Forward Error:", error);
            alert(error.message || "Something went wrong while forwarding");
        }
    };



    async function escalateComplaint(complaintId, { level, note, userId }) {
        try {
            const response = await ApiPost(`/admin/internal/${complaintId}/escalate`, {
                level,
                note,
                userId, // you can get current logged-in user id from context or state
            });
            return response;
        } catch (error) {
            throw new Error(error.message || "Failed to escalate complaint");
        }
    }

    // ✅ Department-level escalation API
    async function escalateDepartmentComplaint(complaintId, department, { level, note, userId }) {
        try {
            const response = await ApiPost(`/admin/internal/${complaintId}/partial-escalate`, {
                department, // backend key like "billingServices"
                level,
                note,
                userId,
            });

            return response;
        } catch (error) {
            throw new Error(error.message || "Failed to escalate department complaint");
        }
    }

    const handleEscalateSubmit = async () => {
        if (!escalationLevel || !escalationNote) {
            alert("Please select escalation level and provide a note.");
            return;
        }

        try {
            const currentUserId = localStorage.getItem("userId") || "12345";
            const targetUser = ESCALATION_USER_MAP[escalationLevel] || null;

            const payload = {
  level: escalationLevel,
  note: escalationNote,
  userId: currentUserId,
  userModel: getUserModel(), // ✅ added
  escalatedTo: targetUser?._id || null,
};


            let response;

            if (selectedDepartment) {
                const deptKey = Object.keys(DEPT_LABEL).find(
                    (k) => DEPT_LABEL[k] === selectedDepartment
                );

                if (!deptKey) {
                    alert("Invalid department selected.");
                    return;
                }

                response = await escalateDepartmentComplaint(complaint.id, deptKey, payload);
                alert(`Complaint for ${selectedDepartment} escalated to ${escalationLevel}`);
            } else {
                response = await escalateComplaint(complaint.id, payload);
                alert(`Complaint escalated to ${escalationLevel}`);
            }

            // ✅ Determine and set status
            const newStatus =
                response?.data?.status || response?.data?.data?.status || "escalated";
            setStatus(mapStatusUI(newStatus));

            // ✅ Re-fetch history for timeline
            const newHistory = await fetchConcernHistory(complaint.id);
            setHistoryData(newHistory);

            closeAllModals();
        } catch (error) {
            console.error("Escalation Error:", error);
            alert(error.message || "Something went wrong while escalating complaint");
        }
    };

    const filteredHistory = useMemo(() => {
    if (!Array.isArray(historyData)) return [];

    if (isAdmin) return historyData; // Admin sees all

    return historyData.filter((h) => {
        // Always show complaint created
        if (h.type === "created") return true;

        // Extract department from history entry
        let deptKey = "";
        if (h.department) deptKey = h.department;
        else if (h.label) deptKey = h.label;
        else if (h.module) deptKey = h.module;
        else if (h.details?.department) deptKey = h.details.department;

        deptKey = String(deptKey).toLowerCase();

        // Only show if user has permission for this department
        return allowedBlocks.some((allowed) =>
            deptKey.includes(allowed.toLowerCase())
        );
    });
}, [historyData, allowedBlocks, isAdmin]);


const allowedDepartmentsList = Object.keys(DEPT_LABEL).filter((deptKey) => {
    // Must have block content (text or attachments)
    const hasContent = blockHasContent(fullDoc[deptKey]);

    // Must be permitted for this user
    const hasPermission = permissionsByBlock[deptKey]?.includes("resolve");

    return hasContent && hasPermission;
});

// 🔹 Auto-select if only ONE permitted department
const autoDepartment =
    allowedDepartmentsList.length === 1 ? DEPT_LABEL[allowedDepartmentsList[0]] : null;


    const handleResolveSubmit = async () => {
        // if (!selectedType) {
        //     alert("Please select RCA / CA / PA");
        //     return;
        // }
    
        if (!resolutionNote.trim()) {
            alert("Please enter a note.");
            return;
        }
    
        try {
            // -------------------------------
            // 1️⃣ Upload Proof
            // -------------------------------
            let proofUrl = "";
            if (uploadedFile) {
                const uploadRes = await uploadToHPanel(uploadedFile);
                proofUrl = uploadRes.url;
            }
    
            // -------------------------------
            // 2️⃣ Prepare payload
            // -------------------------------
            const payload = {
                // actionType: selectedType,
                note: resolutionNote,
                proof: proofUrl ? [proofUrl] : [],
                userId: localStorage.getItem("userId") || "",
            };
    
            // -------------------------------
            // 3️⃣ Resolve Department Logic
            // -------------------------------
            let deptKey = null;
    
            // If only ONE department is resolvable → auto assign
            if (resolveDepartments.length === 1) {
                deptKey = resolveDepartments[0];
            }
    
            // If dropdown is visible → use selectedDepartment
            if (selectedDepartment) {
                deptKey = Object.keys(DEPT_LABEL).find(
                    (k) => DEPT_LABEL[k] === selectedDepartment
                );
            }
    
            if (!deptKey) {
                alert("Please select a valid department.");
                return;
            }
    
            payload.department = deptKey;
    
            // -------------------------------
            // 4️⃣ Choose correct API endpoint
            // -------------------------------
            let endpoint = "";
    
            if (resolveDepartments.length === 1) {
                // Only one department → full resolve
                endpoint = `/admin/internal/${complaint.id}/resolve`;
            } else {
                // Multiple departments → partial resolve
                endpoint = `/admin/internal/${complaint.id}/partial-resolve`;
            }
    
            // -------------------------------
            // 5️⃣ API Call
            // -------------------------------
            const res = await ApiPost(endpoint, payload);
    
            const newStatus =
                res?.data?.status ||
                res?.data?.data?.status ||
                "resolved";
    
            setStatus(mapStatusUI(newStatus));
    
            alert(
                newStatus === "partial"
                    ? "Complaint partially resolved."
                    : "Complaint fully resolved."
            );
    
            // -------------------------------
            // 6️⃣ Refresh history & close modal
            // -------------------------------
            const newHistory = await fetchConcernHistory(complaint.id);
            setHistoryData(newHistory);
    
            closeAllModals();
        } catch (err) {
            console.error("Resolve Error:", err);
            alert(err?.response?.data?.message || "Something went wrong.");
        }
    };

    async function fetchConcernHistory(complaintId) {
        try {
            const response = await ApiGet(`/admin/internal/${complaintId}/history`);

            // ✅ Safely handle your current backend format
            if (response?.history?.timeline) return response.history.timeline;

            // ✅ Also handle future-compatible structures
            if (response?.timeline) return response.timeline;
            if (response?.data?.timeline) return response.data.timeline;

            console.warn("Unexpected history response format:", response);
            return [];
        } catch (error) {
            console.error("❌ Failed to fetch complaint history:", error);
            alert(error.message || "Failed to fetch complaint history");
            return [];
        }
    }



    async function updateProgressRemarkAPI(complaintId, note) {
        try {
            const response = await ApiPut(`/admin/internal/update-progress/${complaintId}`, {
  updateNote: note,
  userId: localStorage.getItem("userId") || "",
  userModel: getUserModel(), // ✅ added
});

            return response; // ✅ keep full response for status
        } catch (error) {
            throw new Error(error.message || "Failed to update in_progress remark");
        }
    }


    async function updateDepartmentProgressAPI(complaintId, department, note, proofFile) {
        try {
            let proofUrl = "";
            if (proofFile) {
                const uploadRes = await uploadToHPanel(proofFile);
                proofUrl = uploadRes.url;
            }

            const response = await ApiPost(`/admin/internal/${complaintId}/partial-inprogress`, {
  department,
  note,
  proof: proofUrl ? [proofUrl] : [],
  userId: localStorage.getItem("userId") || "",
  userModel: getUserModel(), // ✅ added
});


            return response; // ✅ keep full response
        } catch (error) {
            throw new Error(error.message || "Failed to update department progress");
        }
    }



    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case "open":
                return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "in_progress":
                return "bg-blue-100 text-blue-800 border-blue-200";
            case "forwarded":
                return "bg-purple-100 text-purple-800 border-purple-200";
            case "resolved":
                return "bg-green-100 text-green-800 border-green-200";
            case "escalated":
                return "bg-red-100 text-red-800 border-red-200";
            case "partial":
                return "bg-orange-100 text-orange-800 border-orange-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };




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
            case "in_progress":
                setIsOpen(true);
                setComplaintText(complaint.details || "");
                setTempText(complaint.details || "");
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
                    className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:outline-none  transition-colors"
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
            <section className="flex w-[100%] h-[100%] select-none   md11:pr-[0px] overflow-hidden">
                <div className="flex w-[100%] flex-col gap-[0px] h-[100vh]">
                    <Header pageName="Complaint Details" complaintInfo={{
                        id: complaint.complaintId,
                        status: complaint.status,
                        patient: complaint.patient,
                        department: complaint.department,
                        bedNo: complaint.bedNo,
                    }} />
                    <div className="flex w-[100%] h-[100%]">
                        <SideBar />
                        <div className="flex  relative flex-col w-[100%] max-h-[94%]  pt-[10px] pb-[30px] px-[10px] bg-[#fff] overflow-y-auto   gap-[10px] rounded-[10px]">
                            <Preloader />
                            <div className="">
                                <div className="">
                                    {/* Header */}
                                    {/* <motion.div
                                        initial={{ opacity: 0, y: -20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-white shadow-sm  px-[20px] pb-[10px] pt-[10px] border  rounded-lg mb-2"
                                    >
                                        <div className="flex items-center justify-between ">


                                            <p className="text-gray-600 mt-1">Complaint ID: {complaint.complaintId}</p>

                                            <div className="flex items-center space-x-3">
                                                <span
                                                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                                                        complaint.status
                                                    )}`}
                                                >
                                                    {complaint.status?.toLowerCase() === "partial"
                                                        ? "🟠 Partial"
                                                        : mapStatusUI(complaint.status)}

                                                </span>
                                            </div>
                                        </div>
                                    </motion.div> */}

                                    {/* Main Content */}
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                                        {/* Left Column - Patient & Complaint Info */}
                                        <motion.div
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.1 }}
                                            className="lg:col-span-2 space-y-4"
                                        >
                                            {/* Patient Information */}
                                            <div className="bg-white  border rounded-xl shadow-sm p-3">
                                                {/* <h2 className="text-xl font-semibold text-gray-900 mb-3">Patient Information</h2> */}
                                                <div className="grid grid-cols-3 gap-x-3">
                                                    <div className="flex  shadow-sm mb-[10px] border !border-[#eaeaea] md11:!p-2 md13:!p-3 bg-gray-50 rounded-lg">
                                                        <User className="w-5 h-5 text-gray-400 mr-3" />
                                                        <div>
                                                            <p className="text-sm text-gray-600">Employee Name</p>
                                                            <p className="font-medium text-gray-900">{complaint.patient}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex mb-[10px] md11:!p-2 md13:!p-3 flex-shrink-0 bg-gray-50 rounded-lg shadow-sm border !border-[#eaeaea] ">
                                                        <Phone className="w-5 h-5 text-gray-400 mr-3" />
                                                        <div>
                                                            <p className="text-sm text-gray-600">Contact</p>
                                                            <p className="font-medium text-gray-900">{complaint.contact}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex md11:!p-2 md13:!p-3 flex-shrink-0 bg-gray-50 rounded-lg mb-[10px]  shadow-sm border !border-[#eaeaea] ">
                                                        <Bed className="w-5 h-5 text-gray-400 mr-3" />
                                                        <div>
                                                            <p className="text-sm text-gray-600">Floor Number</p>
                                                            <p className="font-medium text-gray-900">{complaint.bedNo}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex md11:!p-2 md13:!p-3 flex-shrink-0 bg-gray-50 rounded-lg shadow-sm border !border-[#eaeaea] ">
                                                        <User className="w-5 flex-shrink-0 h-5 text-gray-400 mr-3" />
                                                        <div>
                                                            <p className="text-sm text-gray-600">Employee Id</p>
                                                            <p className="font-medium text-gray-900">{complaint.doctorName}</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex md11:!p-2 md13:!p-3 flex-shrink-0 bg-gray-50 rounded-lg shadow-sm border !border-[#eaeaea] ">
                                                        <MapPin className="w-5 h-5 flex-shrink-0 text-gray-400 mr-3" />
                                                        <div>
                                                            <p className="text-sm text-gray-600">Department</p>
                                                            <p className="font-medium text-gray-900">{complaint.department}</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex md11:!p-2 md13:!p-3 flex-shrink-0 bg-gray-50 rounded-lg shadow-sm border !border-[#eaeaea] ">
                                                        <Calendar className="w-5 h-5 flex-shrink-0 text-gray-400 mr-3" />
                                                        <div>
                                                            <p className="text-sm text-gray-600">Date & Time</p>
<p className="font-medium text-gray-900">
  {complaint.date && complaint.date !== "—"
    ? new Date(complaint.date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }) +
      " - " +
      new Date(complaint.date).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : "—"}
</p>

                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Complaint Details */}
                                            <div className="bg-white rounded-xl shadow-sm  border p-3">
                                                <h2 className="text-[19px] font-semibold text-gray-900 mb-2">Complaint Details</h2>
                                                <div className="space-y-3">

                                                    <div className="space-y-4">
                                                        {Object.keys(fullDoc).map((key) => {
                                                            if (!DEPT_LABEL[key]) return null;
                                                            if (!permissionsByBlock[key]) return null;
                                                            const block = fullDoc[key];
                                                            if (!blockHasContent(block)) return null;

                                                            return (
                                                                <div key={key} className="bg-gray-50 border rounded-lg p-2 md13:!p-3 mb-3">
                                                                    <h3 className="text-md font-semibold text-gray-900 md13:!mb-2 flex items-center justify-between">
                                                                        <span>{DEPT_LABEL[key]}</span>
                                                                        {block?.status && (
                                                                            <span
                                                                                className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(block.status)}`}
                                                                            >
                                                                                {mapStatusUI(block.status)}
                                                                            </span>
                                                                        )}
                                                                    </h3>

{/* 
                                                                    {block?.topic && (
                                                                        <p className="text-sm text-gray-700">
                                                                            <span className="font-medium  text-[10px] ">Department:</span> {block.topic}
                                                                        </p>
                                                                    )} */}
                                                                    {block?.text && (
                                                                        <p className="text-sm text-gray-700">
                                                                            <span className="font-medium"></span> {block.text}
                                                                        </p>
                                                                    )}

                                                                    {Array.isArray(block?.attachments) && block.attachments.length > 0 && (
                                                                        <div className="mt-2 space-y-2">
                                                                            {block.attachments.map((att, i) => {
                                                                                const url = att.trim().toLowerCase();
                                                                                const isImage = /\.(jpg|jpeg|png|gif|webp|avif)$/i.test(url);
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

                                                  
                                                        {complaint.escalationRemarks && (
                                                            <div className="p-4 bg-yellow-50 rounded-lg">
                                                                <h3 className="font-medium text-yellow-900 mb-2">Escalation Remarks</h3>
                                                                <p className="text-yellow-800">{complaint.escalationRemarks}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>

                                        {/* Right Column - Actions & Activity */}
                                        <motion.div
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.2 }}
                                            className="space-y-3"
                                        >
                                            {/* Action Buttons */}




                                            {complaint.status !== "Resolved" && (
                                                <div className="bg-white rounded-xl border overflow-y-auto scrollba shadow-sm p-3">
                                                    <h2 className="text-[18px] font-semibold text-gray-900 mb-2">Recent Activity</h2>
                                                    <div className="space-y-4">
                                                        {filteredHistory.slice(-3).reverse().map((h, index) => (
                                                            <div key={index} className="flex items-start space-x-3">
                                                                <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-3"></div>
                                                                <div className="flex-1">
                                                                    {h.type === "forwarded" && (
                                                                        <>
                                                                            <p className="text-sm font-medium text-gray-900">
                                                                                {formatDepartment(h.label)}
                                                                            </p>
                                                                            {h.note && <p className="text-xs text-gray-600">Reason: {h.note}</p>}
                                                                        </>
                                                                    )}

                                                                    {h.type === "in_progress" && (
                                                                        <>
                                                                            <p className="text-sm font-medium text-blue-700">{formatDepartment(h.label)}</p>
                                                                            <p className="text-xs text-gray-600">Note: {h.note}</p>
                                                                        </>
                                                                    )}


                                                                    {h.type === "escalated" && (
                                                                        <>
                                                                            <p className="text-sm font-medium text-red-700">
                                                                                {formatDepartment(h.label)}
                                                                            </p>
                                                                            <p className="text-xs text-gray-600">Note: {h.note}</p>
                                                                        </>
                                                                    )}

                                                                    {h.type === "resolved" && (
                                                                        <>
                                                                            <p className="text-sm font-medium text-green-700">{formatDepartment(h.label)}</p>
                                                                            <p className="text-xs text-gray-600">Note: {h.note}</p>
                                                                        </>
                                                                    )}

                                                                    {h.type === "created" && (
                                                                        <p className="text-sm text-gray-700">{formatDepartment(h.label)}
</p>
                                                                    )}

                                                                    <p className="text-xs text-gray-500">
                                                                        <p className="text-xs text-gray-500">
  {formatDate(h.at || h.createdAt)}
  {h.byName && ` • ${h.byName}`} {/* 👈 show user name if available */}
</p>

                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}



                                            <div className="bg-white border rounded-xl shadow-sm p-3">

    {/* 🟢 CASE 1 — Complaint fully resolved → only history */}
    {complaint.status === "Resolved" ? (
        <div className="space-y-4 max-h-96 overflow-y-auto">
            {loadingHistory ? (
                <p className="text-center text-gray-500">Loading history...</p>
            ) : filteredHistory.length === 0 ? (
                <p className="text-center text-gray-500">No history found.</p>
            ) : (
                filteredHistory.map((h, index) => (
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
                                    <p className="text-sm font-medium text-gray-900">
                                        {formatDepartment(h.label)}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                        {h.details.employeeName} ({h.details.complaintId})
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {new Date(h.createdAt).toLocaleString()}
                                    </p>
                                </>
                            )}

                            {h.type === "forwarded" && (
                                <>
                                    <p className="text-sm font-medium text-gray-900">
                                        {formatDepartment(h.label)}
                                    </p>
                                    {h.details?.topic && (
                                        <p className="text-xs text-gray-600">
                                            Topic: {h.details.topic}
                                        </p>
                                    )}
                                    <p className="text-xs text-gray-500">
                                        {new Date(h.at).toLocaleString()}
                                    </p>
                                </>
                            )}

                            {h.type === "escalated" && (
                                <>
                                    <p className="text-sm font-medium text-gray-900">
                                        {formatDepartment(h.label)}
                                    </p>
                                    <p className="text-xs text-gray-600">Note: {h.note}</p>
                                    <p className="text-xs text-gray-500">
                                        {new Date(h.at).toLocaleString()}
                                    </p>
                                </>
                            )}

                            {h.type === "resolved" && (
                                <>
                                    <p className="text-sm font-medium text-green-700">
                                        {formatDepartment(h.label)}
                                    </p>
                                    <p className="text-xs text-gray-600">Note: {h.note}</p>

                                    {h.proof &&
                                        /\.(jpg|jpeg|png|gif|webp|avif)$/i.test(h.proof) && (
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

                            {h.type === "in_progress" && (
                                <>
                                    <p className="text-sm font-medium text-blue-700">
                                        {formatDepartment(h.label)}
                                    </p>
                                    <p className="text-xs text-gray-600">Note: {h.note}</p>
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
    ) : (
        <>
            {/* 🟠 CASE 2 — No actionable department (all resolved or no permission) */}
            {!actionableDepartment ? (
                <div className="space-y-3">
                    <button
                        onClick={() => openModal("history")}
                        className="w-full flex items-center justify-center px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        <Clock className="w-5 h-5 mr-2" />
                        View Full History
                    </button>
                </div>
            ) : (
                <>
                    {/* 🔵 CASE 3 — User can take action */}
                    <div className="space-y-3">
                        <button
                            onClick={() => openModal("resolve")}
                            className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            <CheckCircle className="w-5 h-5 mr-2" />
                            Mark as Resolved
                        </button>

                        <button
                            onClick={() => openModal("in_progress")}
                            className="w-full flex items-center justify-center px-4 py-3 bg-[#ff8000] text-white rounded-lg hover:bg-[#df7204] transition-colors"
                        >
                            <TrendingUp className="w-5 h-5 mr-2" />
                            Progress Remark
                        </button>

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
                                            onClick={() => openModal("history")}
                                            className="w-full flex items-center justify-center px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                                        >
                                            <Clock className="w-5 h-5 mr-2" />
                                            View Full History
                                        </button>
                    </div>
                </>
            )}
        </>
    )}
</div>

                                        </motion.div>
                                    </div>

                                    {/* Modal: Forward to Another Department */}
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
                                                            <>
                                                                <div className="flex justify-between items-center mb-6">
                                                                    <h3 className="text-xl font-bold text-gray-900">
                                                                        Forward to Another Department
                                                                    </h3>
                                                                    <button
                                                                        onClick={closeAllModals}
                                                                        className="text-gray-400 hover:text-gray-600 transition-colors"
                                                                    >
                                                                        <X className="w-6 h-6" />
                                                                    </button>
                                                                </div>

                                                                <div className="space-y-6">
                                                                    {/* Select Department */}
                                                                    <div>
                                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                            Select Department <span className="text-red-500">*</span>
                                                                        </label>
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

                                                                    {/* Reason for Forwarding */}
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
                                                            </>
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
                                                                   Select Department <span className="text-red-500">*</span>
                                                               </label>
                                                           
                                                               {resolveDepartments.length > 1 ? (
                                                                   <AnimatedDropdown
                                                                       isOpen={isForwardDeptDropdownOpen}
                                                                       setIsOpen={setIsForwardDeptDropdownOpen}
                                                                       selected={selectedDepartment || "Select Department"}
                                                                       setSelected={setSelectedDepartment}
                                                                       options={resolveDepartments.map((k) => DEPT_LABEL[k])}
                                                                       placeholder="Select Department"
                                                                       icon={MapPin}
                                                                   />
                                                               ) : (
                                                                   <div className="px-4 py-3 bg-gray-100 border rounded-lg text-gray-700">
                                                                       {autoResolveDepartment}
                                                                   </div>
                                                               )}
                                                           </div>
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
                                                                <AnimatedDropdown
                                                                    isOpen={isForwardDeptDropdownOpen}
                                                                    setIsOpen={setIsForwardDeptDropdownOpen}
                                                                    selected={selectedDepartment || "Select Department"}
                                                                    setSelected={setSelectedDepartment}
                                                                    options={forwardDepartments}
                                                                    placeholder="Select Department"
                                                                    icon={MapPin}
                                                                />
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
                                                                ) : filteredHistory.length === 0 ? (
                                                                    <p className="text-center text-gray-500">No history found.</p>
                                                                ) : (
                                                                    Array.isArray(filteredHistory) && filteredHistory.map((h, index) => (
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
                                                                                            {h.details.employeeName} ({h.details.complaintId})
                                                                                        </p>
                                                                                        <p className="text-xs text-gray-500">
                                                                                            {new Date(h.at).toLocaleString()}
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
                                                                                        <div className="flex items-center gap-2">
                                                                                            <TrendingUp className="w-4 h-4 text-red-600" />
                                                                                            <p className="text-sm font-semibold text-red-700">
                                                                                                {h.department
                                                                                                    ? `${DEPT_LABEL[h.department] || h.department} Escalated`
                                                                                                    : "Complaint Escalated"}
                                                                                                {h.level && (
                                                                                                    <span className="ml-1 text-gray-800 font-semibold">
                                                                                                        → {h.level.toUpperCase()}
                                                                                                    </span>
                                                                                                )}
                                                                                            </p>
                                                                                        </div>

                                                                                        {/* Escalation Note */}
                                                                                        {h.note && (
                                                                                            <p className="text-xs text-gray-700 mt-1">
                                                                                                <span className="font-medium text-gray-800">Note:</span>{" "}
                                                                                                {h.note}
                                                                                            </p>
                                                                                        )}

                                                                                        {/* Level name (explicit display below for better visibility) */}
                                                                                        {h.level && (
                                                                                            <p className="text-xs text-gray-700 mt-1">
                                                                                                <span className="font-medium text-gray-800">Escalation Level:</span>{" "}
                                                                                                {h.level}
                                                                                            </p>
                                                                                        )}

                                                                                        {/* Display escalated by user */}
                                                                                        {h.by?.name && (
                                                                                            <p className="text-xs text-gray-500 mt-1">
                                                                                                <span className="font-medium text-gray-700">By:</span>{" "}
                                                                                                {h.by.name}
                                                                                            </p>
                                                                                        )}

                                                                                        {/* Display date/time */}
                                                                                        {h.at && (
                                                                                            <p className="text-xs text-gray-400 mt-1">
                                                                                                {new Date(h.at).toLocaleString()}
                                                                                            </p>
                                                                                        )}

                                                                                        {/* Divider */}
                                                                                        <div className="border-b border-gray-200 mt-2"></div>
                                                                                    </>
                                                                                )}


                                                                                {h.type === "resolved" && (
                                                                                    <>
                                                                                        <p className="text-sm font-medium text-green-700">Resolved</p>
                                                                                        <p className="text-xs text-gray-600">Note: {h.note}</p>

                                                                                        {/* Only show "View Proof" if proof exists AND is an image */}
                                                                                        {h.proof && /\.(jpg|jpeg|png|gif|webp|avif)$/i.test(h.proof) && (
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

                                                                                {h.type === "in_progress" && (
                                                                                    <>
                                                                                        <p className="text-sm font-medium text-blue-700">Progress Update</p>
                                                                                        <p className="text-xs text-gray-600">Note: {h.note}</p>
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


                                    <AnimatePresence>
                                        {isOpen && (
                                            <>
                                                {/* Backdrop */}
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    onClick={() => setIsOpen(false)}
                                                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                                                >
                                                    {/* Modal */}
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                                        transition={{ type: "spring", duration: 0.5 }}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
                                                    >
                                                        {/* Header */}
                                                        <motion.div
                                                            initial={{ opacity: 0, y: -20 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: 0.1 }}
                                                            className="px-6 pt-4 border-b border-gray-100 flex items-center justify-between"
                                                        >
                                                            <div>
                                                                <h2 className="text-2xl font-bold text-gray-900">Progress Remark  </h2>
                                                                <div className="flex items-center gap-4 mt-2   text-sm text-gray-600">
                                                                    <span className="flex items-center gap-1">
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path
                                                                                strokeLinecap="round"
                                                                                strokeLinejoin="round"
                                                                                strokeWidth={2}
                                                                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                                                            />
                                                                        </svg>
                                                                        Complaint ID: {complaint.complaintId}
                                                                    </span>
                                                                    <span className="flex items-center gap-1">
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path
                                                                                strokeLinecap="round"
                                                                                strokeLinejoin="round"
                                                                                strokeWidth={2}
                                                                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                                                            />
                                                                        </svg>
                                                                        {complaint.date}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                                                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                </svg>
                                                            </button>
                                                        </motion.div>

                                                        {/* Content */}
                                                        <div className="px-6 py-4 mb-4 max-h-[calc(90vh-120px)] overflow-y-auto">
                                                            <AnimatedDropdown
                                                                isOpen={isForwardDeptDropdownOpen}
                                                                setIsOpen={setIsForwardDeptDropdownOpen}
                                                                selected={selectedDepartment || "Select Department"}
                                                                setSelected={setSelectedDepartment}
                                                                options={forwardDepartments}
                                                                placeholder="Select Department"
                                                                icon={MapPin}
                                                            />
                                                            {/* Patient Info */}
                                                            <motion.div
                                                                initial={{ opacity: 0, x: -20 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{ delay: 0.2 }}
                                                                className="mb-6 p-4 mt-3 bg-blue-50 rounded-xl border border-blue-100"
                                                            >
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            strokeWidth={2}
                                                                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                                        />
                                                                    </svg>
                                                                    <h3 className="font-semibold text-blue-900">Patient Information</h3>
                                                                </div>
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                                                    <div>
                                                                        <span className="font-medium text-blue-800">Name:</span>{" "}
                                                                        <span className="text-blue-700">{complaint.patient}</span>
                                                                    </div>
                                                                    <div>
                                                                        <span className="font-medium text-blue-800">Contact No:</span>{" "}
                                                                        <span className="text-blue-700">{complaint.contact}</span>
                                                                    </div>
                                                                    <div>
                                                                        <span className="font-medium text-blue-800">Department:</span>{" "}
                                                                        <span className="text-blue-700">{complaint.department}</span>
                                                                    </div>
                                                                    <div>
                                                                        <span className="font-medium text-blue-800">Doctor:</span>{" "}
                                                                        <span className="text-blue-700">{complaint.doctorName}</span>
                                                                    </div>
                                                                </div>
                                                            </motion.div>

                                                            {/* Section 1: Complaint Update */}
                                                            <motion.div
                                                                initial={{ opacity: 0, x: -20 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{ delay: 0.3 }}
                                                                className="mb-6"
                                                            >
                                                                <div className="flex items-center justify-between mb-3">
                                                                    <div className="flex items-center gap-2">

                                                                        <h3 className="text-lg font-semibold text-gray-900">Update about the complaint / action taken</h3>
                                                                    </div>

                                                                    {!isEditing && (
                                                                        <button
                                                                            onClick={() => {
                                                                                setIsEditing(true)
                                                                                setTempText(complaintText)
                                                                            }}
                                                                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 group"
                                                                            title="Edit complaint details"
                                                                        >
                                                                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path
                                                                                    strokeLinecap="round"
                                                                                    strokeLinejoin="round"
                                                                                    strokeWidth={2}
                                                                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                                                />
                                                                            </svg>
                                                                        </button>
                                                                    )}
                                                                </div>

                                                                <div className="border border-gray-200 rounded-xl overflow-hidden">
                                                                    {isEditing ? (
                                                                        <div className="p-4 bg-white">
                                                                            <textarea
                                                                                value={tempText}
                                                                                onChange={(e) => setTempText(e.target.value)}
                                                                                className="w-full min-h-[120px] p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                                                                placeholder="Enter complaint details and actions taken..."
                                                                                autoFocus
                                                                            />
                                                                            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
                                                                                <p className="text-sm text-gray-500">
                                                                                    <span className="font-medium">Last updated:</span> {new Date().toLocaleString()}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="p-4 bg-gray-50 min-h-[120px]">
                                                                            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{complaintText}</p>
                                                                            <div className="mt-4 pt-3 border-t border-gray-200">
                                                                                <p className="text-sm text-gray-500">
                                                                                    <span className="font-medium">Last updated:</span> {new Date().toLocaleString()}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </motion.div>
                                                        </div>

                                                        {/* Footer */}
                                                        <motion.div
                                                            initial={{ opacity: 0, y: 20 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: 0.6 }}
                                                            className="px-6 py-2 border-t mt-[-60px] border-gray-100 justify-end bg-gray-50 flex  gap-3"
                                                        >
                                                            <button
                                                                onClick={() => setIsOpen(false)}
                                                                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                                                            >
                                                                Close
                                                            </button>
                                                            <button
                                                                onClick={async () => {
                                                                    try {
                                                                        let response;

                                                                        if (selectedDepartment) {
                                                                            // 🔹 Partial In-Progress
                                                                            const deptKey = Object.keys(DEPT_LABEL).find(
                                                                                (k) => DEPT_LABEL[k] === selectedDepartment
                                                                            );

                                                                            response = await updateDepartmentProgressAPI(
                                                                                complaint.id,
                                                                                deptKey,
                                                                                tempText,
                                                                                uploadedFile
                                                                            );

                                                                            alert(
                                                                                response?.message ||
                                                                                `Department ${selectedDepartment} marked In-Progress.`
                                                                            );
                                                                        } else {
                                                                            // 🔹 Full In-Progress
                                                                            response = await updateProgressRemarkAPI(complaint.id, tempText);

                                                                            alert(response?.message || "Progress remark updated successfully");
                                                                        }

                                                                        // ✅ Update local text
                                                                        if (response?.data?.note || response?.updatedConcern?.note) {
                                                                            setComplaintText(response.data?.note || response.updatedConcern.note);
                                                                        } else {
                                                                            setComplaintText(tempText);
                                                                        }

                                                                        // ✅ Update complaint status immediately
                                                                        const newStatus =
                                                                            response?.data?.status ||
                                                                            response?.data?.data?.status ||
                                                                            "in_progress";
                                                                        setStatus(mapStatusUI(newStatus));

                                                                        // ✅ Refresh timeline for UI
                                                                        const newHistory = await fetchConcernHistory(complaint.id);
                                                                        setHistoryData(newHistory);

                                                                        setIsEditing(false);
                                                                        setIsOpen(false);
                                                                    } catch (error) {
                                                                        console.error("Progress Remark Error:", error);
                                                                        alert(error.message || "Failed to update progress");
                                                                    }
                                                                }}

                                                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors flex items-center gap-2"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                </svg>
                                                                Save Changes
                                                            </button>

                                                        </motion.div>
                                                    </motion.div>
                                                </motion.div>
                                            </>
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
