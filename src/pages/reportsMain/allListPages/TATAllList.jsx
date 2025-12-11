// --- imports same as before ---
import Header from '../../../Component/header/Header'
import CubaSidebar from '../../../Component/sidebar/CubaSidebar'
import Preloader from '../../../Component/loader/Preloader'
import React, { useState, useEffect } from "react"
import { Eye, Search, Download, User, Bed, ClockArrowDown, ClockArrowUp, AlarmClockCheck } from "lucide-react"
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
  } catch { }

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
  // Doctor
  "doctorservices": "doctorServices",
  "doctor services": "doctorServices",
  "doctor_service": "doctorServices",
  "doctorservices": "doctorServices",

  // Billing
  "billingservices": "billingServices",
  "billing services": "billingServices",
  "billing_service": "billingServices",

  // Diagnostic
  "diagnosticservices": "diagnosticServices",
  "diagnostic services": "diagnosticServices",
  "diagnostic_service": "diagnosticServices",

  // Housekeeping
  "housekeeping": "housekeeping",

  // Maintenance
  "maintenance": "maintenance",

  // Dietitian
  "dietitianservices": "dietitianServices",
  "dietitian services": "dietitianServices",

  // Security
  "security": "security",

  // Nursing
  "nursing": "nursing",
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

          // ---------------- FIXED DEPARTMENT UI DISPLAY ----------------
          let uiDepartments = [];

          if (Array.isArray(d.departments) && d.departments.length > 0) {
            uiDepartments = d.departments
              .map((item) => {
                const deptKey = item.department
                  ?.toLowerCase()
                  ?.replace(/\s+/g, "")
                  ?.replace(/_/g, "")
                  ?.trim();
                const mapped = DEPT_MAP[deptKey];

                if (!mapped) return null;
                if (!allowedBlocks.includes(mapped)) return null;
                if (!hasConcernContent(item)) return null;

                return DEPT_LABEL[mapped] || item.department;
              })
              .filter(Boolean);
          } else {
            const backendKeys = [
              "doctorServices",
              "billingServices",
              "housekeeping",
              "maintenance",
              "diagnosticServices",
              "dietitianServices",
              "security",
              "nursing",
            ];

            backendKeys.forEach((key) => {
              if (d[key] && hasConcernContent(d[key])) {
                uiDepartments.push(DEPT_LABEL[key]);
              }
            });
          }

          const departmentsDisplay =
            uiDepartments.length > 0 ? uiDepartments.join(", ") : "-";

          return {
            ...d,
            id: d._id,
            complaintId: d.complaintId,
            patient: d.patientName || "-",
            doctor: d.consultantDoctorName?.name || "-",
            createdAt: d.stampIn,
            resolvedAt: d.stampOut,
            totalTimeTaken: totalTime,
            departments: departmentsDisplay,

            // FULL DEPT DATA (unchanged)
            fullDepartments:
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

  // ---------------- EXCEL EXPORT (FULL TABLE EXPORT + CLEAN DEPT NAMES) ------------------
  // const exportToExcel = (data) => {
  //     if (!Array.isArray(data) || data.length === 0) {
  //         alert("No data available to export.");
  //         return;
  //     }

  //     let exportData = [];

  //     data.forEach((item, index) => {
  //         let tatDays = "-";
  //         let tatHours = "-";
  //         let tatTotal = item.totalTimeTaken || "-";

  //         if (item.stampIn && item.stampOut) {
  //             const diffMs = new Date(item.stampOut) - new Date(item.stampIn);
  //             tatDays = Math.floor(diffMs / 86400000);
  //             tatHours = Math.floor((diffMs % 86400000) / 3600000);
  //         }

  //         // Base row — matches table columns
  //         const baseRow = {
  //             "Sr No": index + 1,
  //             "Complaint ID": item.complaintId,
  //             "Patient Name": item.patient || "-",
  //             "Departments (UI Display)": item.departments || "-", // 🔥 EXACT table value
  //             "Created At": item.createdAt ? new Date(item.createdAt).toLocaleString("en-GB") : "-",
  //             "Resolved At": item.resolvedAt ? new Date(item.resolvedAt).toLocaleString("en-GB") : "-",
  //             "TAT (Readable)": tatTotal,
  //             "TAT Days": tatDays,
  //             "TAT Hours": tatHours,
  //         };

  //         // If multiple dept rows exist — export them one by one
  //         if (Array.isArray(item.fullDepartments) && item.fullDepartments.length > 0) {
  //             item.fullDepartments.forEach((dep) => {
  //                 const deptRaw = dep.department || "-";

  //                 // Normalize and map correct readable label
  //                 const deptKey = deptRaw
  //                     ?.toLowerCase()
  //                     ?.replace(/\s+/g, "")
  //                     ?.replace(/_/g, "")
  //                     ?.trim();

  //                 const mapped = DEPT_MAP[deptKey];
  //                 const readableDept = mapped ? DEPT_LABEL[mapped] : deptRaw;

  //                 exportData.push({
  //                     ...baseRow,
  //                     "Department": readableDept,     // 🔥 Clean readable dept
  //                     "Complaints / Suggestions": dep.text || "-",
  //                     "RCA": dep.rca || "NA",
  //                     "CA": dep.ca || "NA",
  //                     "PA": dep.pa || "NA",
  //                 });
  //             });
  //         } else {
  //             // No department data
  //             exportData.push({
  //                 ...baseRow,
  //                 "Department": "-",
  //                 "Complaints / Suggestions": "-",
  //                 "RCA": "NA",
  //                 "CA": "NA",
  //                 "PA": "NA",
  //             });
  //         }
  //     });

  //     const worksheet = XLSX.utils.json_to_sheet(exportData);
  //     const workbook = XLSX.utils.book_new();
  //     XLSX.utils.book_append_sheet(workbook, worksheet, "TAT_Report");
  //     XLSX.writeFile(workbook, "TAT_Report.xlsx");
  // };

  // ---------------- EXCEL EXPORT (ONLY TABLE COLUMNS + DEPARTMENT NAME) ------------------
  const exportToExcel = (data) => {
    if (!Array.isArray(data) || data.length === 0) {
      alert("No data available to export.");
      return;
    }

    let exportData = [];

    data.forEach((item, index) => {

      // ------------- TAT Calculation -------------
      let tatDays = "-";
      let tatHours = "-";
      let tatTotal = item.totalTimeTaken || "-";

      if (item.stampIn && item.stampOut) {
        const diffMs = new Date(item.stampOut) - new Date(item.stampIn);
        tatDays = Math.floor(diffMs / 86400000);
        tatHours = Math.floor((diffMs % 86400000) / 3600000);
      }

      // ------------- Base Row (Matches Table UI Columns) -------------
      const baseRow = {
        "Sr No": index + 1,
        "Complaint ID": item.complaintId,
        "Patient Name": item.patient || "-",
        "Departments": item.departments || "-",       // 🔥 Readable Dept same as UI
        "Created At": item.createdAt ? new Date(item.createdAt).toLocaleString("en-GB") : "-",
        "Resolved At": item.resolvedAt ? new Date(item.resolvedAt).toLocaleString("en-GB") : "-",
        "TAT (Readable)": tatTotal,
        "TAT Days": tatDays,
        "TAT Hours": tatHours,
      };

      // ------------- If Multiple Departments -------------
      if (Array.isArray(item.fullDepartments) && item.fullDepartments.length > 0) {

        item.fullDepartments.forEach((dep) => {
          const rawDept = dep.department || "-";

          // normalize to match DEPT_MAP
          const deptKey = rawDept
            ?.toLowerCase()
            ?.replace(/\s+/g, "")
            ?.replace(/_/g, "")
            ?.trim();

          const mapped = DEPT_MAP[deptKey];
          const readableDept = mapped ? DEPT_LABEL[mapped] : rawDept;

          exportData.push({
            ...baseRow,
            "Department": readableDept,   // 🔥 Only dept name
          });
        });

      } else {
        // If no department data
        exportData.push({
          ...baseRow,
          "Department": "-",
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

          <div className="flex flex-col w-full relative max-h-[90%] py-3 px-2 overflow-y-auto gap-3 ">
            <Preloader />

            <div className="bg-white border rounded-lg shadow-sm overflow-hidden ">





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
                    {filteredRows
                      .slice()
                      .sort((a, b) => {
                        const aTime = new Date(a.resolvedAt || a.createdAt).getTime();
                        const bTime = new Date(b.resolvedAt || b.createdAt).getTime();
                        return bTime - aTime;
                      })
                      .map((r, idx) => (
                        <tr key={r.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                          <td className="px-3 py-2 border-r">
                            <div className=" flex  items-center gap-[8px]">
                              <i className="fa-regular fa-ticket text-[14px] text-blue-500"></i>{r.complaintId}
                            </div>
                          </td>
                          <td className="px-3 py-2 border-r">
                            <div className="flex items-center">
                              <User className="w-4 h-4 flex-shrink-0 text-gray-400 mr-2" />
                              {r.patient}
                            </div>
                          </td>
                          <td className="px-3 py-2 border-r">
                            <div className="flex items-center">
                              {r.departments}
                            </div>
                          </td>
                          <td className="px-3 py-2 border-r">
                            <div className="flex items-center">
                              <ClockArrowDown className="w-4 h-4 text-gray-400 mr-2" />


                              {r.createdAt ? new Date(r.createdAt).toLocaleString("en-GB") : "-"}
                            </div>
                          </td>
                          <td className="px-3 py-2 border-r">
                                                      <div className="flex items-center">
                              <ClockArrowUp className="w-4 h-4 text-gray-400 mr-2" />
                            {r.resolvedAt ? new Date(r.resolvedAt).toLocaleString("en-GB") : "-"}
                                      </div>
                          </td>
                          <td className="px-3 py-2 border-r">
                                                                                                
                                                                               <div className={`flex items-center min-w-[130px]  !flex-shrink-0  rounded-full text-[13px] font-[500]`}

                                                                            >

                                                                      <AlarmClockCheck className="w-4 h-4 text-gray-400 mr-2" />
                          {r.totalTimeTaken}
                          </div>
                          </td>
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
