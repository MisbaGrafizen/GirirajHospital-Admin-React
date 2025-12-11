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
    nursing: "nursing",
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
    let allowedBlocks = [];

    if (isAdmin) {
        Object.entries(MODULE_TO_BLOCK).forEach(([module, block]) => {
            permissionsByBlock[block] = ["view", "forward", "escalate", "resolve"];
            allowedBlocks.push(block);
        });
    } else {
        permsArray.forEach((p) => {
            const blockKey = MODULE_TO_BLOCK[p.module];
            if (blockKey) {
                permissionsByBlock[blockKey] = p.permissions.map((x) => x.toLowerCase());
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
    // Convert camelCase → words with space
    const spaced = str.replace(/([a-z])([A-Z])/g, "$1 $2");

    // Capitalize every word
    return spaced
        .split(" ")
        .map(word => word.toUpperCase().length <= 3
            ? word.toUpperCase()            // IT, HR, QA
            : word.charAt(0).toUpperCase() + word.slice(1)
        )
        .join(" ");
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
    const [status, setStatus] = useState("IN-PROGRESS")
    const [isEditing, setIsEditing] = useState(false)
    const [selectedDepartment, setSelectedDepartment] = useState("");
    const [selectedType, setSelectedType] = useState("CA");
    const [note, setNote] = useState("");
    // NOTES for each type
    const [rcaNote, setRcaNote] = useState("");
    const [caNote, setCaNote] = useState("");
    const [paNote, setPaNote] = useState("");
    const [fromDepartment, setFromDepartment] = useState("");
    const [isFromDeptDropdownOpen, setIsFromDeptDropdownOpen] = useState(false);
const [previewImage, setPreviewImage] = useState(null);

const openImage = (src) => setPreviewImage(src);
const closeImage = () => setPreviewImage(null);



    // return the correct note value based on type
    const getCurrentNote = () => {
        if (selectedType === "RCA") return rcaNote;
        if (selectedType === "CA") return caNote;
        if (selectedType === "PA") return paNote;
        return "";
    };

    // change the correct note value based on type
    const handleNoteChange = (value) => {
        if (selectedType === "RCA") setRcaNote(value);
        if (selectedType === "CA") setCaNote(value);
        if (selectedType === "PA") setPaNote(value);
    };




    // Button styles
    const getBtnStyles = (type) =>
        `px-4 py-2 rounded-lg text-sm font-semibold border transition 
  ${selectedType === type
            ? "bg-green-600 text-white border-green-600"
            : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
        }`;

    const [isOpen, setIsOpen] = useState(false)

    const escalationLevels = ["PGRO", "CEO", "Board of Directors", "Medical Director"]

    const { isAdmin, permissionsByBlock, allowedBlocks } = resolvePermissions();

    const { state } = useLocation();
    const row = state?.complaint || {};
    const fullDoc = state?.doc || row;




    console.log('CONCERN_KEYS', fullDoc)

    const [fullDocState, setFullDocState] = useState(fullDoc);

    // 1️⃣ Departments present in this complaint (text or attachments exist)
    const activeDepartments = Object.keys(DEPT_LABEL).filter((deptKey) =>
        blockHasContent(fullDocState[deptKey])
    );

    // 2️⃣ Departments user has rights for
    const allowedForwardDepartments = activeDepartments.filter((deptKey) =>
        permissionsByBlock[deptKey]?.includes("forward")
    );

    const allowedEscalateDepartments = activeDepartments.filter((deptKey) =>
        permissionsByBlock[deptKey]?.includes("escalate")
    );

    // 1️⃣ Departments in complaint
    const activeForwardDepartments = Object.keys(DEPT_LABEL).filter((deptKey) =>
        blockHasContent(fullDocState[deptKey])
    );

    // 2️⃣ User allowed to forward from these departments
    const userForwardableDepartments = activeForwardDepartments.filter(
        (deptKey) => permissionsByBlock[deptKey]?.includes("forward")
    );

    // 3️⃣ Auto-select FROM department if only one
    useEffect(() => {
        if (userForwardableDepartments.length === 1) {
            setFromDepartment(DEPT_LABEL[userForwardableDepartments[0]]);
        }
    }, [fullDocState]);


    // 3️⃣ Auto-select department when only one is allowed
    useEffect(() => {
        if (allowedEscalateDepartments.length === 1) {
            setSelectedDepartment(DEPT_LABEL[allowedEscalateDepartments[0]]);
        }
    }, [fullDocState]);


    // 🔹 Departments allowed for resolve only
    const resolveDepartments = Object.keys(DEPT_LABEL).filter((deptKey) => {
        const hasContent = blockHasContent(fullDocState[deptKey]); // Complaint exists for this department
        const canResolve = permissionsByBlock[deptKey]?.includes("resolve"); // User has resolve permission
        return hasContent && canResolve;
    });

    const CONCERN_KEYS = React.useMemo(() => {
        if (!fullDocState || typeof fullDocState !== "object") return [];
        return Object.keys(fullDocState).filter((key) => {
            const block = fullDocState[key];
            return blockHasContent(block);
        });
    }, [fullDocState]);


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


    // 🔹 Auto-select if only one
    const autoResolveDepartment =
        resolveDepartments.length === 1 ? DEPT_LABEL[resolveDepartments[0]] : null;

    const presentLabels = collectPresentModuleLabels(fullDocState);
    const categoryText =
        presentLabels.length
            ? presentLabels.join(", ")
            : (row.category || "—");

    const moduleAttachments = collectAllModuleAttachments(fullDocState);
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
        doctorName: row.doctor || row.doctorName || fullDoc?.consultantDoctorName?.name || "—",
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

    console.log('complaint.date', complaint.date)


    const forwardDepartments = Object.values(DEPT_LABEL);

    // ---------------- ACTIONABLE DEPARTMENT LOGIC ----------------

    // 1️⃣ Departments included in this complaint (have text/attachments)
    const complaintDepartments = Object.keys(DEPT_LABEL).filter((deptKey) =>
        blockHasContent(fullDocState[deptKey])
    );

    // 2️⃣ User only has access to these departments
    const userDepartments = complaintDepartments.filter(
        (deptKey) => permissionsByBlock[deptKey]
    );

    // 3️⃣ A department is actionable ONLY when status is NOT resolved or resolved_by_admin
    const actionableDepartment = userDepartments.find((deptKey) => {
        const status = fullDocState[deptKey]?.status?.toLowerCase();
        return status !== "resolved" && status !== "resolved_by_admin";
    });

    console.log("actionableDepartment FIXED:", actionableDepartment);

    // in handleForwardSubmit
    const handleForwardSubmit = async () => {
        if (!forwardDepartment || !forwardReason.trim()) {
            alert("Please select a department and enter forward reason.");
            return;
        }

        try {
            const loginType = localStorage.getItem("loginType");
            const isAdmin = loginType === "admin";

            // Active departments
            const activeDepartments = Object.keys(DEPT_LABEL).filter((deptKey) =>
                blockHasContent(fullDocState[deptKey])
            );

            // User allowed forward departments
            const userForwardable = userForwardableDepartments;

            // ----------------------------- FROM Department -----------------------------
            const fromDeptKey =
                userForwardable.length === 1
                    ? userForwardable[0]
                    : Object.keys(DEPT_LABEL).find((k) => DEPT_LABEL[k] === fromDepartment);

            if (!fromDeptKey) {
                alert("Please select a valid FROM Department.");
                return;
            }

            // ----------------------------- TO Department -----------------------------
            const toDeptKey = Object.keys(DEPT_LABEL).find(
                (k) => DEPT_LABEL[k] === forwardDepartment
            );

            if (!toDeptKey) {
                alert("Invalid target department selected.");
                return;
            }

            // ----------------------------- Attachment Upload -----------------------------
            let uploadedURL = "";
            if (uploadedFile) {
                const uploadRes = await uploadToHPanel(uploadedFile);
                uploadedURL = uploadRes.url;
            }

            // ----------------------------- PAYLOADS -----------------------------
            const fullForwardPayload = {
                department: toDeptKey,
                topic: "Forwarded Complaint",
                text: forwardReason.trim(),
                attachments: uploadedURL ? [uploadedURL] : [],
                mode: "text",
                note: forwardReason.trim(),
            };

            const partialForwardPayload = {
                fromDepartment: fromDeptKey,
                toDepartment: toDeptKey,
                note: forwardReason.trim(),
            };

            // ----------------------------- SELECT ENDPOINT -----------------------------
            let endpoint = "";
            let body = {};

            const isSingleDept = activeDepartments.length === 1;

            if (isAdmin) {
                endpoint = isSingleDept
                    ? `/admin/${complaint.id}/admin-forward`
                    : `/admin/${complaint.id}/admin-partial-forward`;

                body = isSingleDept ? fullForwardPayload : partialForwardPayload;
            } else {
                endpoint = isSingleDept
                    ? `/admin/${complaint.id}/forward`
                    : `/admin/${complaint.id}/partial-forward`;

                body = isSingleDept ? fullForwardPayload : partialForwardPayload;
            }

            // ----------------------------- API CALL -----------------------------
            const res = await ApiPost(endpoint, body);

            alert(res.message || "Complaint forwarded successfully.");

            await refreshComplaint();
            const history = await fetchConcernHistory(complaint.id);
            setHistoryData(history);

            closeAllModals();

        } catch (err) {
            console.error("Forward Error:", err);
            alert(err?.response?.data?.error || "Something went wrong.");
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

    //Department-level escalation API
    async function escalateDepartmentComplaint(complaintId, department, { level, note, userId }) {
        try {
            const response = await ApiPost(`/admin/${complaintId}/partial-escalate`, {
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
        if (!escalationLevel || !escalationNote.trim()) {
            alert("Please select escalation level and provide a note.");
            return;
        }

        try {
            const loginType = localStorage.getItem("loginType"); // admin / staff
            const userId = localStorage.getItem("userId");

            // Decide FROM department
            const fromDeptKey =
                selectedDepartment
                    ? Object.keys(DEPT_LABEL).find((k) => DEPT_LABEL[k] === selectedDepartment)
                    : allowedEscalateDepartments[0]; // auto-select

            if (!fromDeptKey) {
                alert("No valid department for escalation.");
                return;
            }

            const isSingleDept = activeDepartments.length === 1;

            // Build payload used by all 4 APIs
            const payload = {
                department: fromDeptKey,
                level: escalationLevel,
                note: escalationNote.trim(),
                userId
            };

            // FINAL endpoint selection (IDENTICAL to forward logic)
            let endpoint = "";

            if (loginType === "admin") {
                endpoint = isSingleDept
                    ? `/admin/${complaint.id}/admin-escalate`
                    : `/admin/${complaint.id}/admin-partial-escalate`;
            } else {
                endpoint = isSingleDept
                    ? `/admin/${complaint.id}/escalate`
                    : `/admin/${complaint.id}/partial-escalate`;
            }

            console.log("➡ Escalate API:", endpoint);
            console.log("➡ Payload:", payload);

            const res = await ApiPost(endpoint, payload);

            alert(
                `Complaint ${selectedDepartment ? `(${selectedDepartment}) ` : ""
                }escalated to ${escalationLevel}`
            );

            await refreshComplaint();

            const newHistory = await fetchConcernHistory(complaint.id);
            setHistoryData(newHistory);

            closeAllModals();
        } catch (error) {
            console.error("Escalation Error:", error);
            alert(error?.response?.data?.message || "Escalation failed.");
        }
    };



    // 🔹 Allowed departments based on permissions & blocks with content
    const allowedDepartmentsList = Object.keys(DEPT_LABEL).filter((deptKey) => {
        // Must have block content (text or attachments)
        const hasContent = blockHasContent(fullDocState[deptKey]);

        // Must be permitted for this user
        const hasPermission = permissionsByBlock[deptKey]?.includes("resolve");

        return hasContent && hasPermission;
    });

    // 🔹 Auto-select if only ONE permitted department
    const autoDepartment =
        allowedDepartmentsList.length === 1 ? DEPT_LABEL[allowedDepartmentsList[0]] : null;

    const handleResolveSubmit = async () => {
        if (!selectedType) {
            alert("Please select RCA / CA / PA");
            return;
        }

        // Selected note validation
        const currentNote =
            selectedType === "RCA" ? rcaNote :
                selectedType === "CA" ? caNote :
                    selectedType === "PA" ? paNote : "";

        if (!currentNote.trim()) {
            alert(`Please enter a note for ${selectedType}`);
            return;
        }

        // ⭐ NEW: Validate all 3 notes BEFORE sending to API
        if (!rcaNote.trim() || !caNote.trim() || !paNote.trim()) {
            alert("Please enter RCA, CA, and PA — all three notes are required.");
            return;
        }

        try {
            // 1️⃣ Upload file
            let proofUrl = "";
            if (uploadedFile) {
                const uploadRes = await uploadToHPanel(uploadedFile);
                proofUrl = uploadRes.url;
            }

            // 2️⃣ User type
            const loginType = localStorage.getItem("loginType");
            const isAdmin = loginType === "admin";

            // 3️⃣ Active departments
            const activeDepartments = Object.keys(DEPT_LABEL).filter((deptKey) =>
                blockHasContent(fullDocState[deptKey])
            );

            // 4️⃣ Determine departments the user can resolve
            const userResolvable = activeDepartments.filter((deptKey) =>
                permissionsByBlock[deptKey]?.includes("resolve")
            );

            // 5️⃣ Determine selected department
            let deptKey = null;

            if (userResolvable.length === 1) {
                deptKey = userResolvable[0];
            } else {
                deptKey = Object.keys(DEPT_LABEL).find(
                    (k) => DEPT_LABEL[k] === selectedDepartment
                );
            }

            if (!deptKey) {
                alert("Please select department");
                return;
            }

            // 6️⃣ Build payload — ⭐ UPDATED TO MATCH BACKEND ⭐
            const payload = {
                rcaNote,
                caNote,
                paNote,
                actionType: selectedType,
                note: currentNote,
                proof: proofUrl ? [proofUrl] : [],
                department: deptKey,
                userId: localStorage.getItem("userId"),
            };
            console.log('payload', payload)

            // 7️⃣ Decide API endpoint (admin / staff + full / partial)
            let endpoint = "";

            if (isAdmin) {
                endpoint =
                    activeDepartments.length === 1
                        ? `/admin/${complaint.id}/admin-resolve`
                        : `/admin/${complaint.id}/admin-partial-resolve`;
            } else {
                endpoint =
                    activeDepartments.length === 1
                        ? `/admin/${complaint.id}/resolve`
                        : `/admin/${complaint.id}/partial-resolve`;
            }

            // 8️⃣ Submit request
            const res = await ApiPost(endpoint, payload);
            console.log("Resolve Result:", res);

            await refreshComplaint();

            // Refresh history too
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
            const response = await ApiGet(`/admin/${complaintId}/history`);

            // ✅ Safely handle your current backend format
            if (response?.history?.timeline) return response.history.timeline;

            // ✅ Also handle future-compatible structures
            if (response?.timeline) return response.timeline;
            if (response?.data?.timeline) return response.data.timeline;

            console.warn("Unexpected history response format:", response);
            return [];
        } catch (error) {
            console.error("Failed to fetch complaint history:", error);
            alert(error.message || "Failed to fetch complaint history");
            return [];
        }
    }



    async function updateProgressRemarkAPI(complaintId, note) {
        try {
            const response = await ApiPut(`/admin/update-progress/${complaintId}`, {
                updateNote: note,
                userId: localStorage.getItem("userId") || "",
                userModel: getUserModel(), // added
            });

            return response; // keep full response for status
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

            const response = await ApiPost(`/admin/${complaintId}/partial-inprogress`, {
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
                setSelectedDepartment(autoResolveDepartment || "");
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

    // FILTER HISTORY BASED ON USER PERMISSIONS
    const filteredHistory = useMemo(() => {
        if (!Array.isArray(historyData)) return [];

        // Admin sees everything
        if (isAdmin) return historyData;

        return historyData.filter((h) => {
            // ⭐ Always show "created" event
            if (h.type === "created") return true;

            // Detect department key variations
            let deptKey = "";

            if (h.department) deptKey = h.department;
            else if (h.label) deptKey = h.label;
            else if (h.module) deptKey = h.module;
            else if (h.details?.department) deptKey = h.details.department;

            deptKey = String(deptKey).toLowerCase();

            // ⭐ Only allow if matches permitted blocks
            return allowedBlocks.some((allowed) =>
                deptKey.includes(String(allowed).toLowerCase())
            );
        });
    }, [historyData, allowedBlocks, isAdmin]);


    console.log('filteredHistory', filteredHistory)

    useEffect(() => {
        setFullDocState(fullDoc);
    }, [fullDoc]);

    async function refreshComplaint() {
        try {
            const updatedDoc = await ApiGet(`/admin/ipd-concern/${complaint.id}`);
            console.log('updatedDoc', updatedDoc)

            if (updatedDoc?.data) {
                // normalize structure
                const doc = updatedDoc.data;

                setFullDocState(doc);                                // 🔥 UI updates department status
                setStatus(doc.status || doc.data?.status || "");     // Update main status
            }
        } catch (err) {
            console.error("Refresh error:", err);
        }
    }


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
            <section className="flex w-[100%] h-[100%] select-none     md11:pr-[0px] overflow-hidden">
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
                        <div className="flex  relative flex-col w-[100%] max-h-[94%]  pt-[10px] pb-[110px] md:!pb-[30px] px-[10px] bg-[#fff] overflow-y-auto   gap-[10px] rounded-[10px]">
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
                                                <div className="grid md:!grid-cols-3  gap-[10px] md:!gap-x-3">
                                                    <div className="flex  shadow-sm mb-[10px] border !border-[#eaeaea] md11:!p-2 md13:!p-3 p-2 bg-gray-50 rounded-lg">
                                                        <User className="w-5 h-5 text-gray-400 mr-3" />
                                                        <div>
                                                            <p className="text-sm text-gray-600">Patient Name</p>
                                                            <p className="font-medium text-gray-900">{complaint.patient}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex mb-[10px] md11:!p-2 md13:!p-3 p-2 flex-shrink-0 bg-gray-50 rounded-lg shadow-sm border !border-[#eaeaea] ">
                                                        <Phone className="w-5 h-5 text-gray-400 mr-3" />
                                                        <div>
                                                            <p className="text-sm text-gray-600">Contact</p>
                                                            <p className="font-medium text-gray-900">{complaint.contact}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex md11:!p-2 md13:!p-3 p-2 flex-shrink-0 bg-gray-50 rounded-lg mb-[10px]  shadow-sm border !border-[#eaeaea] ">
                                                        <Bed className="w-5 h-5 text-gray-400 mr-3" />
                                                        <div>
                                                            <p className="text-sm text-gray-600">Bed Number</p>
                                                            <p className="font-medium text-gray-900">{complaint.bedNo}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex md11:!p-2 md13:!p-3 p-2 flex-shrink-0 bg-gray-50 rounded-lg shadow-sm border !border-[#eaeaea] ">
                                                        <User className="w-5 flex-shrink-0 h-5 text-gray-400 mr-3" />
                                                        <div>
                                                            <p className="text-sm text-gray-600">Doctor</p>
                                                            <p className="font-medium text-gray-900">{complaint.doctorName}</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex md11:!p-2 md13:!p-3 p-2 flex-shrink-0 bg-gray-50 rounded-lg shadow-sm border !border-[#eaeaea] ">
                                                        <MapPin className="w-5 h-5 flex-shrink-0 text-gray-400 mr-3" />
                                                        <div>
                                                            <p className="text-sm text-gray-600">Department</p>
                                                            <p className="font-medium leading-4 text-gray-900">{complaint.department}</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex md11:!p-2 md13:!p-3 p-2 flex-shrink-0 bg-gray-50 rounded-lg shadow-sm border !border-[#eaeaea] ">
                                                        <Calendar className="w-5 h-5 flex-shrink-0 text-gray-400 mr-3" />
                                                        <div>
                                                            <p className="text-sm text-gray-600">Date & Time</p>
                                                            <p className="font-medium text-gray-900">
                                                                {complaint.date}
                                                            </p>

                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Complaint Details */}
                                            <div className="bg-white rounded-xl shadow-sm  overflow-y-auto  border p-3">
                                                <h2 className="text-[19px] font-semibold text-gray-900 mb-2">Complaint Details</h2>
                                                <div className="space-y-3">

                                                    <div className="space-y-4">
                                                        {Object.keys(fullDocState).map((key) => {
                                                            if (!DEPT_LABEL[key]) return null;
                                                            if (!permissionsByBlock[key]) return null;
                                                            const block = fullDocState[key];
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


                                                                    {/* {block?.topic && (
                                                                        <p className="text-sm text-gray-700">
                                                                            <span className="font-medium  text-[10px] ">Department:</span> {block.topic}
                                                                        </p>
                                                                    )} */}
                                                                    {block?.text && (
                                                                        <p className="text-sm text-gray-700">
                                                                            <span className="font-medium">Details:</span> {block.text}
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
                                                                                            <img
                                                                                                src={att}
                                                                                                alt="attachment"
                                                                                                onClick={() => openImage(att)}
                                                                                                className="w-48 h-auto rounded-md border cursor-pointer hover:opacity-80"
                                                                                            />
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


                                            {complaint.status !== "resolved" && (
                                                <div className="bg-white rounded-xl border  scrollba shadow-sm p-3">
                                                    <h2 className="text-[18px] font-semibold text-gray-900 mb-2">Recent Activity</h2>
                                                    <div className="space-y-4  max-h-[500px]  overflow-y-auto">
                                                        {filteredHistory.map((h, index) => (
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
                                                                            <p className="text-sm font-medium text-green-700">
                                                                                {formatDepartment(h.department || h.label)}
                                                                            </p>

                                                                            <p className="text-xs text-gray-600">
                                                                                Resolution Note: {h.note || "—"}
                                                                            </p>

                                                                            {/* Show proof if exists */}
                                                                            {Array.isArray(h.proof) && h.proof.length > 0 && (
                                                                                <div className="mt-1 space-y-1">
                                                                                    {h.proof.map((url, idx) => (
                                                                                        <a
                                                                                            key={idx}
                                                                                            href={url}
                                                                                            target="_blank"
                                                                                            rel="noreferrer"
                                                                                            className="text-xs text-blue-600 underline"
                                                                                        >
                                                                                            View Proof
                                                                                        </a>
                                                                                    ))}
                                                                                </div>
                                                                            )}

                                                                            <p className="text-xs text-gray-500">
                                                                                {new Date(h.at).toLocaleString()}
                                                                            </p>
                                                                        </>
                                                                    )}


                                                                    {h.type === "created" && (
                                                                        <>
                                                                            <p className="text-sm text-gray-700">{h.label}</p>
                                                                            <p className="text-xs text-gray-600">{h.details?.patientName} - {h.details?.complaintId}</p>
                                                                        </>

                                                                    )}

                                                                    <p className="text-xs text-gray-500">
                                                                        <p className="text-xs text-gray-500">
                                                                            {formatDate(h.at)}
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

                                                {/* CASE 1: Complaint fully resolved → show only history */}
                                                {complaint.status === "resolved" ? (
                                                    <div className="space-y-4 max-h-96 overflow-y-auto">
                                                        {loadingHistory ? (
                                                            <p className="text-center text-gray-500">Loading history...</p>
                                                        ) : filteredHistory.length === 0 ? (
                                                            <p className="text-center text-gray-500">No history found.</p>
                                                        ) : (
                                                            Array.isArray(filteredHistory) &&
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
                                                                    </div>
                                                                </motion.div>
                                                            ))
                                                        )}
                                                    </div>
                                                ) : (

                                                    /* CASE 2: User has NO actionable department → show ONLY full history + history button */
                                                    !actionableDepartment ? (
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

                                                        /* CASE 3: User CAN take action → show all action buttons */
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

                                                            {/* Always show history button */}
                                                            <button
                                                                onClick={() => openModal("history")}
                                                                className="w-full flex items-center justify-center px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                                                            >
                                                                <Clock className="w-5 h-5 mr-2" />
                                                                View Full History
                                                            </button>
                                                        </div>
                                                    )
                                                )}
                                            </div>

                                        </motion.div>
                                    </div>


                                    {previewImage && (
                                        <div
                                            className="fixed inset-0 bg-[#000000b9] bg-opacity-70 flex items-center top- justify-center z-[9999]"
                                            onClick={closeImage}
                                        >
                                            <div className="relative max-w-[90%]  h-[70vh]">
                                                <img
                                                    src={previewImage}
                                                    className="max-w-full max-h-full rounded-lg shadow-xl"
                                                    alt="Preview"
                                                />

                                                {/* Close Button */}
                                                <button
                                                    className="absolute top-2 right-2 bg-white text-black rounded-full px-3 py-1 text-sm font-semibold shadow"
                                                    onClick={closeImage}
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    {/* Modal 1: Forward to Another Department */}
                                    <AnimatePresence>
                                        {isForwardModalOpen && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="fixed inset-0 z-50 bg-black bg-opacity-50"
                                                onClick={closeAllModals}
                                            >
                                                <div className="flex items-center justify-center min-h-screen px-4">
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                                        className="bg-white rounded-xl shadow-xl sm:max-w-lg w-full p-6"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <div className="flex justify-between items-center mb-6">
                                                            <h3 className="text-xl font-bold text-gray-900">Forward Complaint</h3>
                                                            <button onClick={closeAllModals}>
                                                                <X className="w-6 h-6 text-gray-500 hover:text-gray-700" />
                                                            </button>
                                                        </div>

                                                        <div className="space-y-6">

                                                            {/* From Department - only when >1 available */}
                                                            {userForwardableDepartments.length > 1 && (
                                                                <div>
                                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                        From Department <span className="text-red-500">*</span>
                                                                    </label>

                                                                    <AnimatedDropdown
                                                                        isOpen={isFromDeptDropdownOpen}
                                                                        setIsOpen={setIsFromDeptDropdownOpen}
                                                                        selected={fromDepartment || "Select Department"}
                                                                        setSelected={setFromDepartment}
                                                                        options={userForwardableDepartments.map((k) => DEPT_LABEL[k])}
                                                                        icon={MapPin}
                                                                    />
                                                                </div>
                                                            )}

                                                            {/* Hidden input when auto-selected */}
                                                            {userForwardableDepartments.length === 1 && (
                                                                <input type="hidden" value={fromDepartment} />
                                                            )}

                                                            {/* To Department */}
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                    To Department <span className="text-red-500">*</span>
                                                                </label>

                                                                <AnimatedDropdown
                                                                    isOpen={isForwardDeptDropdownOpen}
                                                                    setIsOpen={setIsForwardDeptDropdownOpen}
                                                                    selected={forwardDepartment || "Select Department"}
                                                                    setSelected={setForwardDepartment}
                                                                    options={Object.values(DEPT_LABEL).filter(
                                                                        (d) => d !== fromDepartment
                                                                    )}
                                                                    icon={MapPin}
                                                                />
                                                            </div>

                                                            {/* Forward Reason */}
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                    Reason for Forwarding <span className="text-red-500">*</span>
                                                                </label>
                                                                <textarea
                                                                    value={forwardReason}
                                                                    onChange={(e) => setForwardReason(e.target.value)}
                                                                    rows={4}
                                                                    className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
                                                                    placeholder="Explain why you're forwarding this complaint..."
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="flex justify-end gap-3 mt-6">
                                                            <button
                                                                onClick={closeAllModals}
                                                                className="px-6 py-2 border rounded-lg"
                                                            >
                                                                Cancel
                                                            </button>

                                                            <button
                                                                onClick={handleForwardSubmit}
                                                                disabled={!forwardDepartment || !forwardReason.trim()}
                                                                className="px-6 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
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

                                                        {/* HEADER */}
                                                        <div className="bg-white px-6 pt-6 pb-4">
                                                            <div className="flex justify-between items-center mb-6">
                                                                <h3 className="text-xl font-bold text-gray-900">Resolve Complaint</h3>
                                                                <button
                                                                    onClick={closeAllModals}
                                                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                                                >
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
                                                                    <div className="flex gap-3 mb-2">
                                                                        {["RCA", "CA", "PA"].map((type) => (
                                                                            <button
                                                                                key={type}
                                                                                className={`px-4 py-2 text-sm font-medium rounded-lg border transition
                        ${selectedType === type
                                                                                        ? "bg-green-100 text-green-700 border-green-500"
                                                                                        : "bg-gray-100 text-gray-700 border-gray-300"
                                                                                    }`}
                                                                                onClick={() => setSelectedType(type)}
                                                                                type="button"
                                                                            >
                                                                                {type}
                                                                            </button>
                                                                        ))}
                                                                    </div>

                                                                    <div>
                                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                            {selectedType} Note <span className="text-red-500">*</span>
                                                                        </label>

                                                                        <textarea
                                                                            value={
                                                                                selectedType === "RCA"
                                                                                    ? rcaNote
                                                                                    : selectedType === "CA"
                                                                                        ? caNote
                                                                                        : paNote
                                                                            }
                                                                            onChange={(e) => {
                                                                                if (selectedType === "RCA") setRcaNote(e.target.value);
                                                                                if (selectedType === "CA") setCaNote(e.target.value);
                                                                                if (selectedType === "PA") setPaNote(e.target.value);
                                                                            }}
                                                                            rows={4}
                                                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg 
                               focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                                                                            placeholder={`Enter ${selectedType} details...`}
                                                                        />
                                                                    </div>
                                                                </div>

                                                                <div>
                                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                        Upload Proof (Optional)
                                                                    </label>

                                                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-400 transition-colors">
                                                                        <input
                                                                            type="file"
                                                                            onChange={handleFileUpload}
                                                                            className="hidden"
                                                                            id="file-upload"
                                                                            accept="image/*,.pdf,.doc,.docx"
                                                                        />
                                                                        <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center justify-center">
                                                                            <Upload className="w-10 h-10 text-gray-400 mb-3" />
                                                                            <span className="text-sm text-gray-600 mb-1">Click to upload</span>
                                                                            <span className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</span>
                                                                            {uploadedFile && (
                                                                                <span className="text-sm text-green-600 mt-2 font-medium">
                                                                                    File: {uploadedFile.name}
                                                                                </span>
                                                                            )}
                                                                        </label>
                                                                    </div>
                                                                </div>

                                                                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                                                    <div className="flex items-center">
                                                                        <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                                                                        <span className="text-sm text-green-800">
                                                                            Employee will receive an SMS on resolution.
                                                                        </span>
                                                                    </div>
                                                                </div>

                                                            </div>
                                                        </div>
                                                        {/* <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="bg-white px-6 pt-6 pb-4">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900">
                                Resolve Complaint
                            </h3>
                            <button onClick={closeAllModals} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-5">

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
                                <div className="flex gap-3 mb-2">
                                    <button
                                        className={getBtnStyles("RCA")}
                                        onClick={() => setSelectedType("RCA")}
                                        type="button"
                                    >
                                        RCA
                                    </button>

                                    <button
                                        className={getBtnStyles("CA")}
                                        onClick={() => setSelectedType("CA")}
                                        type="button"
                                    >
                                        CA
                                    </button>

                                    <button
                                        className={getBtnStyles("PA")}
                                        onClick={() => setSelectedType("PA")}
                                        type="button"
                                    >
                                        PA
                                    </button>
                                </div>

                                {selectedType && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            {selectedType} Note <span className="text-red-500">*</span>
                                        </label>

                                        <textarea
                                            value={getCurrentNote()}
                                            onChange={(e) => handleNoteChange(e.target.value)}
                                            rows={4}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg 
                                                focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                                            placeholder={`Please provide details for ${selectedType} ...`}
                                        />
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Upload Proof (Optional)
                                </label>

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
                                            <span className="text-sm text-green-600 mt-2 font-medium">
                                                File: {uploadedFile.name}
                                            </span>
                                        )}
                                    </label>
                                </div>
                            </div>

                            </div>
                            </div>
                            

          {/* FOOTER BUTTONS */}
                                                        {/* <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
            <button
              onClick={closeAllModals}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>

            <button
              onClick={handleResolveSubmit}
              disabled={
                !rcaNote.trim() ||
                !caNote.trim() ||
                !paNote.trim()
              }
              className="px-6 py-2 bg-green-600 text-white rounded-lg 
                        hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Resolve Complaint
            </button>
          </div> */}
                                                        <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
                                                            <button
                                                                onClick={closeAllModals}
                                                                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                                            >
                                                                Cancel
                                                            </button>

                                                            <button
                                                                onClick={handleResolveSubmit}
                                                                disabled={!selectedType || !getCurrentNote()}
                                                                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 
                                disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                            >
                                                                Resolve Complaint
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                </div>

                                            </motion.div>
                                            //   </div>
                                            // </motion.div>
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
                                                                {/* Show dropdown ONLY if multiple departments available */}
                                                                {allowedEscalateDepartments.length > 1 && (
                                                                    <AnimatedDropdown
                                                                        isOpen={isForwardDeptDropdownOpen}
                                                                        setIsOpen={setIsForwardDeptDropdownOpen}
                                                                        selected={selectedDepartment || "Select Department"}
                                                                        setSelected={setSelectedDepartment}
                                                                        options={allowedEscalateDepartments.map((d) => DEPT_LABEL[d])}
                                                                        placeholder="Select Department"
                                                                        icon={MapPin}
                                                                    />
                                                                )}

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
                                                                                        <p className="text-sm font-medium text-gray-900">{h.label}</p>
                                                                                        <p className="text-xs text-gray-600">
                                                                                            {h.details.patientName} - ({h.details.complaintId})
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
