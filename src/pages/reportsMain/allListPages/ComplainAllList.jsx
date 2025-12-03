import Header from '../../../Component/header/Header'
import CubaSidebar from '../../../Component/sidebar/CubaSidebar'

import React, { useState, useEffect, useMemo } from "react"
import {
    Download,
    Search,
    Eye,
    User,
    Bed,
    Clock,
} from "lucide-react"
import { useNavigate } from 'react-router-dom'
import { ApiGet } from '../../../helper/axios'
import NewDatePicker from '../../../Component/MainInputFolder/NewDatePicker'
import Preloader from '../../../Component/loader/Preloader'

/* ------------------ MODULE MAPPING ------------------ */
const MODULE_TO_BLOCK = {
    doctor_service: "doctorServices",
    billing_service: "billingServices",
    housekeeping: "housekeeping",
    maintenance: "maintenance",
    diagnostic_service: "diagnosticServices",
    dietitian: "dietitianServices",
    security: "security",
    nursing: "nursing",
};

/* ------------------ DEPT NAME LABELS ------------------ */
const DEPT_LABEL = {
    doctorServices: "Doctor",
    billingServices: "Billing",
    housekeeping: "Housekeeping",
    maintenance: "Maintenance",
    diagnosticServices: "Diagnostic",
    dietitianServices: "Dietitian",
    security: "Security",
    nursing: "Nursing",
};

/* ------------------ USER PERMISSION RESOLVE ------------------ */
function resolvePermissions() {
    const loginType = localStorage.getItem("loginType");
    const isAdmin = loginType === "admin";

    let permsArray = [];
    try {
        const parsed = JSON.parse(localStorage.getItem("rights"));
        if (parsed?.permissions) {
            permsArray = parsed.permissions;
        }
    } catch { }

    const allowedBlocks = isAdmin
        ? Object.values(MODULE_TO_BLOCK)
        : permsArray.map((p) => MODULE_TO_BLOCK[p.module]).filter(Boolean);

    return { isAdmin, allowedBlocks };
}

/* ------------------ HELPERS ------------------ */
const hasConcernContent = (b) => {
    if (!b) return false;
    return (b.text && b.text.trim()) || (b.attachments?.length > 0);
};

const getDepartmentsString = (doc, allowedBlocks) =>
    allowedBlocks
        .filter((k) => hasConcernContent(doc?.[k]))
        .map((k) => DEPT_LABEL[k] || k)
        .join(", ") || "-";

/* ------------------ READ RESOLUTION FROM ARRAY ------------------ */
const getResolvedDepartment = (doc) => {
    if (!doc?.resolvedDepartments) return "-";
    const resolved = doc.resolvedDepartments.find(r => r.status === "resolved");
    if (!resolved) return "-";
    return DEPT_LABEL[resolved.department] || resolved.department;
};

const getResolutionNote = (doc) => {
    if (!doc?.resolvedDepartments) return "-";
    const resolved = doc.resolvedDepartments.find(r => r.status === "resolved");
    if (!resolved) return "-";
    return resolved.note || "-";
};

const getStatusColor = (status = "") => {
    const s = status.toLowerCase();
    if (s === "resolved") return "bg-green-100 text-green-800";
    if (s === "forwarded") return "bg-yellow-100 text-yellow-800";
    if (s === "in progress") return "bg-blue-100 text-blue-800";
    if (s === "escalated") return "bg-red-200 text-red-800";
    return "bg-gray-100 text-gray-800";
};

/* ------------------ API ------------------ */
async function getConcerns() {
    const res = await ApiGet(`/admin/ipd-concern`);
    return Array.isArray(res?.data) ? res.data : [];
}

/* ======================================================
                MAIN COMPONENT
====================================================== */
export default function ComplainAllList() {

    const [rows, setRows] = useState([]);
    const [rawConcerns, setRawConcerns] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("All Status");
    const [dateFrom1, setDateFrom1] = useState(null);
    const [dateTo1, setDateTo1] = useState(null);

    const navigate = useNavigate();
    const { isAdmin, allowedBlocks } = resolvePermissions();

    /* ------------------ Load Data ------------------ */
    useEffect(() => {
        (async () => {
            try {
                const docs = await getConcerns();
                setRawConcerns(docs);

                const visibleDocs = isAdmin
                    ? docs
                    : docs.filter((d) =>
                        allowedBlocks.some((b) => hasConcernContent(d[b]))
                    );

                const mapped = visibleDocs.map((d) => ({
                    id: d._id,
                    complaintId: d.complaintId,
                    patient: d.patientName || "-",
                    doctor: d.consultantDoctorName?.name || "-",
                    createdAt: d.createdAt,
                    date: new Date(d.createdAt).toLocaleString(),
                    bedNo: d.bedNo || "-",
                    status: d.status || "Pending",

                    // NEW
                    resolvedDepartment: getResolvedDepartment(d),
                    resolutionNote: getResolutionNote(d),
                }));

                setRows(mapped);
            } catch (e) {
                console.error("Failed loading concerns", e);
            }
        })();
    }, []);

    /* ------------------ DATE RANGE FILTER ------------------ */
    const isWithinDateRange = (createdAt) => {
        if (!dateFrom1 && !dateTo1) return true;

        const entryDate = new Date(createdAt);

        if (dateFrom1) {
            const from = new Date(dateFrom1);
            if (entryDate < from) return false;
        }

        if (dateTo1) {
            const to = new Date(dateTo1);
            to.setHours(23, 59, 59, 999);
            if (entryDate > to) return false;
        }

        return true;
    };

    /* ------------------ Filters ------------------ */
    const filteredComplaints = useMemo(() => {
        const q = searchTerm.toLowerCase();

        return rows
            .filter((c) =>
                [c.patient, c.complaintId, c.doctor]
                    .some((v) => String(v || "").toLowerCase().includes(q))
            )
            .filter((c) =>
                selectedStatus === "All Status" ? true : c.status === selectedStatus
            )
            .filter((c) => isWithinDateRange(c.createdAt));
    }, [rows, searchTerm, selectedStatus, dateFrom1, dateTo1]);

    /* ------------------ Navigate ------------------ */
    const handlenavigate = (row, fullDoc) => {
        navigate("/complaint-details", { state: { complaint: row, doc: fullDoc } });
    };

    /* ------------------ EXPORT TO EXCEL ------------------ */
    const exportToExcel = async () => {
        const XLSX = await import("xlsx");

        const excelRows = filteredComplaints.map((c) => {
            const fullDoc = rawConcerns.find((d) => d._id === c.id);

            return {
                "Complaint ID": c.complaintId,
                "Date & Time": c.date,
                "Patient Name": c.patient,
                "Doctor Name": c.doctor,
                "Bed No": c.bedNo,
                "Departments": getDepartmentsString(fullDoc, allowedBlocks),
                "Status": c.status,

                // NEW
                // "Resolved Department": c.resolvedDepartment,
                // "Resolution Note": c.resolutionNote,
            };
        });

        const ws = XLSX.utils.json_to_sheet(excelRows);

        ws["!cols"] = Object.keys(excelRows[0] || {}).map((key) => ({
            wch: Math.max(15, key.length + 5)
        }));

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Complaints");

        XLSX.writeFile(
            wb,
            `IPD_Complaints_${new Date().toISOString().slice(0, 10)}.xlsx`
        );
    };

    /* ------------------ EXPORT CAPA TO EXCEL (FINAL LOGIC) ------------------ */
    const exportCAPA = async () => {
        const XLSX = await import("xlsx");

        const excelRows = [];

        filteredComplaints.forEach((c) => {
            const doc = rawConcerns.find((d) => d._id === c.id);
            if (!doc) return;

            const deptBlocks = [
                "doctorServices",
                "billingServices",
                "housekeeping",
                "maintenance",
                "diagnosticServices",
                "dietitianServices",
                "security",
                "nursing",
            ];

            deptBlocks.forEach((block) => {
                const dep = doc?.[block];
                if (!dep) return;

                const hasText = dep?.text?.trim();
                const hasFiles = Array.isArray(dep?.attachments) && dep.attachments.length > 0;

                // ❌ Skip inactive (no text/attachment)
                if (!hasText && !hasFiles) return;

                // ❌ Skip if not resolved
                if (dep?.status?.toLowerCase() !== "resolved_by_admin" &&
                    dep?.status?.toLowerCase() !== "resolved") return;

                // ❌ Skip if no resolution object
                if (!dep?.resolution) return;

                const action = dep.resolution.actionType || "";
                const note = dep.resolution.note || "-";

                excelRows.push({
                    "Complaint ID": c.complaintId,
                    "Date & Time": c.date,
                    "Patient Name": c.patient,
                    "Doctor Name": c.doctor,
                    "Bed No": c.bedNo,
                    "Department": DEPT_LABEL[block] || block,
                    "Complaint Text": dep.text || "-",

                    // ✅ ONLY THE MATCHED ACTIONTYPE GETS THE NOTE
                    "RCA": action === "RCA" ? note : "NA",
                    "CA": action === "CA" ? note : "NA",
                    "PA": action === "PA" ? note : "NA",
                });
            });
        });

        if (excelRows.length === 0) {
            alert("No CAPA data found for export.");
            return;
        }

        const ws = XLSX.utils.json_to_sheet(excelRows);
        ws["!cols"] = Object.keys(excelRows[0]).map((k) => ({ wch: Math.max(15, k.length + 6) }));

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "CAPA_Report");

        XLSX.writeFile(wb, `CAPA_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };


    /* ======================================================
                        UI  (UNCHANGED)
    ====================================================== */
    return (
        <>
            <section className="flex w-[100%] h-[100%] select-none md11:pr-[0px] overflow-hidden">
                <div className="flex w-[100%] flex-col h-[100vh]">
                    <Header pageName="Complaint List" />
                    <div className="flex w-[100%] h-[100%]">
                        <CubaSidebar />
                        <div className="flex flex-col w-[100%]  pl-[10px] relative max-h-[93%]  md34:!pb-[120px] m md11:!pb-[20px] py-[10px] pr-[10px]  overflow-y-auto gap-[10px] ">
                            <Preloader />


                            {/* --- TOP FILTER BAR (UNCHANGED UI) --- */}
                            <div className="flex justify-between items-center  px-2">
                                <div className="flex gap-[20px]">
                                    <NewDatePicker
                                        label="From Date"
                                        selectedDate={dateFrom1}
                                        setSelectedDate={setDateFrom1}
                                    />
                                    <NewDatePicker
                                        label="To Date"
                                        selectedDate={dateTo1}
                                        setSelectedDate={setDateTo1}
                                    />
                                </div>

                                <div className="flex gap-2 items-center">
                                    <div className="relative">
                                        <Search className="absolute left-2 top-[8px] text-gray-400 w-4 h-4" />
                                        <input
                                            type="text"
                                            placeholder="Search feedback..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-8 pr-2 py-1 w-[200px] border border-gray-300 rounded-md"
                                        />
                                    </div>

                                    <button
                                        onClick={exportToExcel}
                                        className="flex items-center px-2 py-1 bg-blue-600 text-white rounded-md"
                                    >
                                        <Download className="w-4 h-4 mr-2" />
                                        Excel
                                    </button>
                                    {isAdmin && (
                                        <button
                                            onClick={exportCAPA}
                                            className="flex items-center px-2 py-1 bg-blue-600 text-white rounded-md"
                                        >
                                            <Download className="w-4 h-4 mr-2" />
                                            CAPA
                                        </button>
                                    )}

                                </div>
                            </div>

                            {/* --- TABLE (UNCHANGED UI EXCEPT ADDED COLUMN) --- */}
                            <div className="w-full overflow-x-auto border rounded-lg shadow-sm">
                                <table className="min-w-[1350px]">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="px-3 py-2 border-r text-xs">Comp. ID</th>
                                            <th className="px-3 py-2 border-r text-xs">Date & Time</th>
                                            <th className="px-3 py-2 border-r text-xs">Patient Name</th>
                                            <th className="px-3 py-2 border-r text-xs">Doctor Name</th>
                                            <th className="px-3 py-2 border-r text-xs">Bed No</th>
                                            <th className="px-3 py-2 border-r text-xs">Departments</th>
                                            <th className="px-3 py-2 border-r text-xs">Status</th>

                                            {/* NEW COLUMN */}
                                            <th className="px-3 py-2 border-r text-xs">Resolution Note</th>

                                            <th className="px-3 py-2 border-r text-xs">Details</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {filteredComplaints.map((c, index) => {
                                            const fullDoc = rawConcerns.find((d) => d._id === c.id);

                                            return (
                                                <tr
                                                    key={c.id}
                                                    className={`${index % 2 ? "bg-gray-50" : "bg-white"} hover:bg-blue-50`}
                                                >
                                                    <td className="px-3 py-2 border-r text-blue-600">{c.complaintId}</td>

                                                    <td className="px-3 py-2 border-r">
                                                        <Clock className="w-4 h-4 inline mr-2 text-gray-400" />
                                                        {c.date}
                                                    </td>

                                                    <td className="px-3 py-2 border-r">{c.patient}</td>

                                                    <td className="px-3 py-2 border-r">
                                                        <User className="w-4 h-4 inline mr-2 text-gray-400" />
                                                        {c.doctor}
                                                    </td>

                                                    <td className="px-3 py-2 border-r">
                                                        <Bed className="w-4 h-4 inline mr-2 text-gray-400" />
                                                        {c.bedNo}
                                                    </td>

                                                    <td className="px-3 py-2 border-r">
                                                        {getDepartmentsString(fullDoc, allowedBlocks)}
                                                    </td>

                                                    <td className="px-3 py-2 border-r">
                                                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(c.status)}`}>
                                                            {c.status}
                                                        </span>
                                                    </td>

                                                    {/* NEW RESOLUTION NOTE CELL */}
                                                    <td className="px-3 py-2 border-r">
                                                        {c.resolutionNote}
                                                    </td>

                                                    <td className="px-3 py-2 border-r">
                                                        <button
                                                            onClick={() => handlenavigate(c, fullDoc)}
                                                            className="text-blue-600 flex items-center"
                                                        >
                                                            <Eye className="w-4 h-4 mr-1" />
                                                            View
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}

                                        {filteredComplaints.length === 0 && (
                                            <tr>
                                                <td colSpan={9} className="px-3 py-4 text-center text-gray-500">
                                                    No complaints found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>

                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
