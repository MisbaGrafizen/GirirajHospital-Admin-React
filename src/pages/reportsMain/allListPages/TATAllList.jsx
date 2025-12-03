// --- imports same as before ---
import Header from '../../../Component/header/Header'
import CubaSidebar from '../../../Component/sidebar/CubaSidebar'
import Preloader from '../../../Component/loader/Preloader'
import React, { useState, useEffect } from "react"
import { Eye ,Search ,Download } from "lucide-react"
import { useNavigate } from 'react-router-dom'
import { ApiGet } from '../../../helper/axios'
import NewDatePicker from '../../../Component/MainInputFolder/NewDatePicker'
import * as XLSX from "xlsx";

// date formatting helper
const formatDate = (d) => {
  if (!d) return null;
  try {
    return new Date(d).toISOString().slice(0, 10);  // yyyy-mm-dd
  } catch { return null; }
};


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
  const loginType = localStorage.getItem("loginType")
  const isAdmin = loginType === "admin"

  let permsArray = []
  try {
    const parsed = JSON.parse(localStorage.getItem("rights"))
    if (parsed?.permissions) permsArray = parsed.permissions
    else if (Array.isArray(parsed)) permsArray = parsed
  } catch {}

  const allowedBlocks = isAdmin
    ? Object.values(MODULE_TO_BLOCK)
    : permsArray.map((p) => MODULE_TO_BLOCK[p.module]).filter(Boolean)

  return { isAdmin, allowedBlocks }
}

async function getConcerns() {
  const res = await ApiGet(`/admin/complaint-details`)
  return Array.isArray(res) ? res : [res].filter(Boolean)
}

const hasConcernContent = (item) => {
  if (!item) return false;
  const hasText = item.text?.trim() !== "";
  const hasFiles = Array.isArray(item.attachments) && item.attachments.length > 0;
  return hasText || hasFiles;
};

const DEPT_MAP = {
  "doctor services": "doctorServices",
  "doctor service": "doctorServices",
  "billing services": "billingServices",
  "billing service": "billingServices",
  "housekeeping": "housekeeping",
  "maintenance": "maintenance",
  "diagnostic services": "diagnosticServices",
  "diagnostic service": "diagnosticServices",
  "dietetics": "dietitianServices",
  "dietitian services": "dietitianServices",
  "dietitian service": "dietitianServices",
  "nursing": "nursing",
  "security": "security",
};


export default function TATAllList() {
  const [rows, setRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);

  const [dateFrom1, setDateFrom1] = useState(null);
  const [dateTo1, setDateTo1] = useState(null);

  const navigate = useNavigate()
  const { allowedBlocks } = resolvePermissions()


  // ---------------- FETCH DATA ------------------
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const docs = await getConcerns();
        if (!alive) return;

        const resolvedDocs = docs.filter((d) => d.stampOut);

        const mapped = resolvedDocs.map((d) => {
          // TAT calculation
          let totalTime = null;
          if (d.stampOut && d.stampIn) {
            const diffMs = new Date(d.stampOut) - new Date(d.stampIn);
            const diffDays = Math.floor(diffMs / 86400000);
            const diffHours = Math.floor((diffMs % 86400000) / 3600000);
            const diffMinutes = Math.floor((diffMs % 3600000) / 60000);

            totalTime =
              diffDays > 0
                ? `${diffDays}day ${diffHours}hrs`
                : `${diffHours}hrs ${diffMinutes}mins`;
          }

          return {
            ...d,
            id: d._id,
            complaintId: d.complaintId,
            patient: d.patientName || "-",
            doctor: d.consultantDoctorName?.name || "-",
            createdAt: d.stampIn,
            resolvedAt: d.stampOut,
            totalTimeTaken: totalTime,

            // 🔥 Full data for Excel
            fullDepartments:
  // CASE 1: backend gives d.departments array (your earlier structure)
  Array.isArray(d.departments) && d.departments.length > 0
    ? d.departments.map((dep) => {
        const action = dep?.resolution?.actionType || "";
        const note = dep?.resolution?.note || "";

        return {
          department: dep.department || "-",
          text: dep.text || "-",
          rca: action === "RCA" ? note : "NA",
          ca: action === "CA" ? note : "NA",
          pa: action === "PA" ? note : "NA",
        };
      })

    // CASE 2: backend gives department blocks like: housekeeping, nursing, maintenance, etc.
    : Object.keys(d)
        .filter((key) =>
          [
            "doctorServices",
            "billingServices",
            "housekeeping",
            "maintenance",
            "diagnosticServices",
            "dietitianServices",
            "security",
            "nursing",
          ].includes(key)
        )
        .map((key) => {
          const depData = d[key];
          if (!depData) return null;

          const action = depData?.resolution?.actionType || "";
          const note = depData?.resolution?.note || "";

          return {
            department: key,
            text: depData.text || "-",
            rca: action === "RCA" ? note : "NA",
            ca: action === "CA" ? note : "NA",
            pa: action === "PA" ? note : "NA",
          };
        })
        .filter(Boolean),


            // UI display (unchanged)
            departments: Array.isArray(d.departments)
              ? d.departments
                  .map((item) => {
                    const key = DEPT_MAP[item.department?.toLowerCase()?.trim()];
                    if (!key) return null;
                    if (!allowedBlocks.includes(key)) return null;
                    if (!hasConcernContent(item)) return null;
                    return DEPT_LABEL[key] || item.department;
                  })
                  .filter(Boolean)
                  .join(", ") || "-"
              : "-",
          };
        });

        setRows(mapped);
        setFilteredRows(mapped);
      } catch (e) {
        console.error("ERROR FETCHING", e);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);


  // ---------------- DATE FILTER ------------------
  useEffect(() => {
    if (!dateFrom1 && !dateTo1) {
      setFilteredRows(rows);
      return;
    }

    const from = formatDate(dateFrom1);
    const to = formatDate(dateTo1);

    const filtered = rows.filter((r) => {
      const created = formatDate(r.createdAt);
      if (!created) return false;

      if (from && created < from) return false;
      if (to && created > to) return false;

      return true;
    });

    setFilteredRows(filtered);
  }, [dateFrom1, dateTo1, rows]);


  // ---------------- EXCEL EXPORT ------------------
const exportToExcel = (data) => {
    if (!Array.isArray(data) || data.length === 0) {
        alert("No data available to export.");
        return;
    }

    let exportData = [];

    data.forEach((item, index) => {
        const baseRow = {
            "Sr No": index + 1,
            "Complaint ID": item.complaintId,
            "Date": item.stampIn ? new Date(item.stampIn).toLocaleString("en-GB") : "-",
            "Patient Name": item.patient || "-",
            "Consultant": item.doctor || "-",
            "Bed No": item.bedNo || "-",
        };

        // If multiple dept rows exist
        if (Array.isArray(item.fullDepartments) && item.fullDepartments.length > 0) {
            item.fullDepartments.forEach((deptObj) => {
                exportData.push({
                    ...baseRow,
                    "Department": deptObj.department,
                    "Complaints / Suggestions": deptObj.text,
                    "Root Cause Analysis (RCA)": deptObj.rca,
                    "Corrective Actions (CA)": deptObj.ca,
                    "Preventive Actions (PA)": deptObj.pa,
                });
            });
        } else {
            // If no dept found
            exportData.push({
                ...baseRow,
                "Department": "-",
                "Complaints / Suggestions": "-",
                "Root Cause Analysis (RCA)": "NA",
                "Corrective Actions (CA)": "NA",
                "Preventive Actions (PA)": "NA",
            });
        }
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "TAT_Report");

    XLSX.writeFile(workbook, "TAT_Report.xlsx");
};



  // ---------------- UI (UNCHANGED) ------------------
  return (
    <section className="flex w-full h-full select-none overflow-hidden">
      <div className="flex w-full flex-col h-[100vh]">
        <Header pageName="TAT List " />
        <div className="flex w-full h-full">
          <CubaSidebar />

          <div className="flex flex-col w-full relative max-h-[93%] py-3 px-2 overflow-y-auto gap-3 ">
            <Preloader />

            <div className="bg-white border rounded-lg shadow-sm overflow-hidden">

              {/* --- DATE FILTER UI --- */}
              <div className="flex justify-between px-3 pt-3">
                <div className="flex gap-4">
                  <NewDatePicker label="From Date" selectedDate={dateFrom1} setSelectedDate={setDateFrom1} />
                  <NewDatePicker label="To Date" selectedDate={dateTo1} setSelectedDate={setDateTo1} />
                </div>

                <button
                  onClick={() => exportToExcel(filteredRows)}
                  className="flex items-center px-2 py-1 bg-blue-600 text-white rounded-md"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Excel
                </button>
              </div>


              {/* --- TABLE UI (UNCHANGED) --- */}
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-3 py-2 border-r text-left text-xs">Complaint ID</th>
                      <th className="px-3 py-2 border-r text-left text-xs">Patient</th>
                      <th className="px-3 py-2 border-r text-left text-xs">Departments</th>
                      <th className="px-3 py-2 border-r text-left text-xs">Created At</th>
                      <th className="px-3 py-2 border-r text-left text-xs">Resolved At</th>
                      <th className="px-3 py-2 border-r text-left text-xs">TAT</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredRows.map((r, idx) => (
                      <tr key={r.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="px-3 py-2 border-r">{r.complaintId}</td>
                        <td className="px-3 py-2 border-r">{r.patient}</td>
                        <td className="px-3 py-2 border-r">{r.departments}</td>
                        <td className="px-3 py-2 border-r">
                          {r.createdAt ? new Date(r.createdAt).toLocaleString("en-GB") : "-"}
                        </td>
                        <td className="px-3 py-2 border-r">
                          {r.resolvedAt ? new Date(r.resolvedAt).toLocaleString("en-GB") : "-"}
                        </td>
                        <td className="px-3 py-2 border-r">{r.totalTimeTaken}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredRows.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    No records found.
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
