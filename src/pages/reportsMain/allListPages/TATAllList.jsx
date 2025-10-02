import Header from '../../../Component/header/Header'
import CubaSidebar from '../../../Component/sidebar/CubaSidebar'
import Preloader from '../../../Component/loader/Preloader'
import React, { useState, useEffect } from "react"
import { Clock, User, Bed, Eye } from "lucide-react"
import { useNavigate } from 'react-router-dom'
import { ApiGet } from '../../../helper/axios'

const MODULE_TO_BLOCK = {
    doctor_service: "doctorServices",
    billing_service: "billingServices",
    housekeeping: "housekeeping",
    maintenance: "maintenance",
    diagnostic_service: "diagnosticServices",
    dietetics: "dietitianServices",
    nursing: "nursing",
    security: "security",
};

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

    const allowedBlocks = isAdmin
        ? Object.values(MODULE_TO_BLOCK)
        : permsArray.map((p) => MODULE_TO_BLOCK[p.module]).filter(Boolean);

    return { isAdmin, allowedBlocks };
}

async function getConcerns() {
    const res = await ApiGet(`/admin/ipd-concern`);
    return Array.isArray(res?.data) ? res.data : [res?.data].filter(Boolean);
}

const getStatusColor = (status = "") => {
    const normalized = status.toLowerCase().replace("_", " ");
    switch (normalized) {
        case "forwarded": return "bg-yellow-100 text-yellow-800";
        case "resolved": return "bg-green-100 text-green-800";
        case "in progress": return "bg-blue-100 text-blue-800";
        case "escalated": return "bg-red-200 text-red-800";
        default: return "bg-gray-100 text-gray-800";
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
        .map((k) => DEPT_LABEL[k] || k)
        .join(", ");

const formatStatus = (status = "") => {
    const normalized = status.toLowerCase().replace("_", " ");
    return normalized.replace(/\b\w/g, (char) => char.toUpperCase());
};

export default function TATAllList() {
    const [rows, setRows] = useState([]);
    const [rawConcerns, setRawConcerns] = useState([]);
    const { allowedBlocks } = resolvePermissions();
    const navigate = useNavigate();

    const handlenavigate = (complaintRow, fullDoc) => {
        navigate("/complaint-details", { state: { complaint: complaintRow, doc: fullDoc } });
    };

    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                const docs = await getConcerns();
                if (!alive) return;

                // ✅ Only resolved complaints
                const resolvedDocs = docs.filter((d) => d.resolution?.resolvedAt);

                setRawConcerns(resolvedDocs);

                const mapped = resolvedDocs.map((d) => {
                    // compute TAT
                    let totalTime = null;
                    if (d.resolution?.resolvedAt && d.createdAt) {
                        const diffMs = new Date(d.resolution.resolvedAt) - new Date(d.createdAt);
                        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                        totalTime = `${diffHours}h ${diffMinutes}m`;
                    }

                    return {
                        id: d._id,
                        complaintId: d.complaintId,
                        patient: d.patientName || "-",
                        doctor: d.consultantDoctorName?.name || "-",
                        bedNo: d.bedNo || "-",
                        status: d.status || "Pending",
                        createdAt: d.createdAt,
                        stampIn: d.createdAt,
                        stampOut: d.resolution?.resolvedAt || null,
                        totalTimeTaken: totalTime,
                    };
                });

                setRows(mapped);
            } catch (e) {
                if (!alive) return;
                console.error("Failed to load concerns", e);
                setRawConcerns([]);
            }
        })();
        return () => { alive = false; };
    }, []);

    function getAllowedDepartments(departments = [], allowedBlocks = []) {
        if (!departments.length) return [];

        // Normalize both for matching
        const allowed = allowedBlocks.map((b) => b.toLowerCase());

        return departments.filter((dep) =>
            allowed.some((block) => block.includes(dep.department.toLowerCase()))
        );
    }


    return (
        <section className="flex w-full h-full select-none overflow-hidden">
            <div className="flex w-full flex-col h-[100vh]">
                <Header pageName="TAT List" />
                <div className="flex w-full h-full">
                    <CubaSidebar />
                    <div className="flex flex-col w-full relative max-h-[93%] py-3 px-2 overflow-y-auto gap-3 rounded-[10px]">
                        <Preloader />
                        <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
                            <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
                                    <div className="px-3 py-3 border-b flex  gap-[10px] items-center border-gray-200">
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-md flex items-center justify-center">
                                            <i className="fa-regular fa-users-medical text-[17px] text-[#fff] "></i>
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900">TAT Details</h3>
                                    </div>
                                                  
                                </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">Complaint ID</th>
                                            <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                                            <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">Departments</th>
                                            <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">Created At</th>
                                            <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">Resolved At</th>
                                            <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">TAT</th>
                                            {/* <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th> */}
                                            <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white">
                                        {rows.map((complaint, index) => {
                                            const fullDoc = rawConcerns.find((d) => d._id === complaint.id);
                                            return (
                                                <tr key={complaint.id}
                                                    className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50 transition-colors`}>
                                                    <td className="px-6 py-2 text-sm font-medium text-blue-600">{complaint.complaintId}</td>
                                                    <td className="px-6 py-2 text-sm text-gray-900">{complaint.patient}</td>
                                                    <td className="px-6 py-2 text-sm text-gray-900">
                                                        {getAllowedDepartments(fullDoc?.departments || [], allowedBlocks).length > 0
                                                            ? getAllowedDepartments(fullDoc.departments, allowedBlocks)
                                                                .map((d) => d.department)
                                                                .join(", ")
                                                            : "-"}
                                                    </td>
                                                    <td className="px-6 py-2 text-sm text-gray-900">
                                                        {complaint.stampIn ? new Date(complaint.stampIn).toLocaleString("en-GB", {
                                                            day: "2-digit", month: "2-digit", year: "numeric",
                                                            hour: "2-digit", minute: "2-digit"
                                                        }) : "-"}
                                                    </td>
                                                    <td className="px-6 py-2 text-sm text-gray-900">
                                                        {complaint.stampOut ? new Date(complaint.stampOut).toLocaleString("en-GB", {
                                                            day: "2-digit", month: "2-digit", year: "numeric",
                                                            hour: "2-digit", minute: "2-digit"
                                                        }) : "-"}
                                                    </td>
                                                    <td className="px-6 py-2 text-sm text-gray-900">{complaint.totalTimeTaken || "-"}</td>
                                                    {/* <td className="px-6 py-2 text-sm">
                            <span className={`flex items-center px-2 py-1 justify-center w-[90px] rounded-full text-[13px] font-[500] ${getStatusColor(complaint.status)}`}>
                              {formatStatus(complaint.status)}
                            </span>
                          </td> */}
                                                    <td className="px-6 py-2 text-sm text-gray-900">
                                                        <button onClick={() => handlenavigate(complaint, fullDoc)}
                                                            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
                                                            <Eye className="w-4 h-4 mr-1" /> View
                                                        </button>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                        {rows.length === 0 && (
                                            <tr>
                                                <td colSpan={8} className="px-6 py-6 text-center text-gray-500">
                                                    No resolved complaints found.
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
        </section>
    );
}
