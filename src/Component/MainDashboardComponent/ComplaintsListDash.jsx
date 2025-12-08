import React, { useEffect, useState } from "react";
import { Eye, Calendar, User,CalendarClock, Bed, Download, Search, Stethoscope } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as XLSX from "xlsx";
import { ApiGet } from "../../helper/axios";
import { useNavigate } from "react-router-dom";

const MODULE_TO_BLOCK = {
  doctor_service: "doctorServices",
  billing_service: "billingServices",
  housekeeping: "housekeeping",
  maintenance: "maintenance",
  diagnostic_service: "diagnosticServices",
  dietitian: "dietitianServices",
  nursing: "nursing",
  security: "security",
};

/* ---------- Resolve Permissions ---------- */
function resolvePermissions() {
  const loginType = localStorage.getItem("loginType");
  const isAdmin = loginType === "admin";

  let permsArray = [];
  try {
    const parsed = JSON.parse(localStorage.getItem("rights"));
    if (parsed?.permissions && Array.isArray(parsed.permissions)) {
      permsArray = parsed.permissions;
    } else if (Array.isArray(parsed)) permsArray = parsed;
  } catch {
    permsArray = [];
  }

  const allowedBlocks = isAdmin
    ? Object.values(MODULE_TO_BLOCK)
    : permsArray.map((p) => MODULE_TO_BLOCK[p.module]).filter(Boolean);

  return { isAdmin, allowedBlocks };
}


const DEPT_LABEL = {
    doctorServices: "Doctor Services",
    billingServices: "Billing Services",
    housekeeping: "Housekeeping",
    maintenance: "Maintenance",
    diagnosticServices: "Diagnostic Services",
    dietitianServices: "Dietitian",
    security: "Security",
    nursing: "Nursing",
}

function getDepartmentsString(doc, allowedBlocks = []) {
  if (!doc || !allowedBlocks.length) return "-";

  const departments = [];

  allowedBlocks.forEach((block) => {
    // normalize block names (doctorServices → doctor_service)
    const snake = block
      .replace(/([A-Z])/g, "_$1")
      .toLowerCase();

    // Try all possible key names
    const possibleKeys = [
      block,                       // doctorServices
      snake,                       // doctor_services
      snake.replace("_services", ""), // doctor
      snake.replace("_service", "")   // doctor
    ];

    let foundKey = null;
    for (const key of possibleKeys) {
      if (doc[key]) {
        foundKey = key;
        break;
      }
    }

    if (!foundKey) return;

    const blockData = doc[foundKey];
    const hasText = blockData.text && blockData.text.trim();
    const hasAttachments =
      Array.isArray(blockData.attachments) && blockData.attachments.length > 0;

    if (hasText || hasAttachments) {
      const label =
        DEPT_LABEL[block] ||
        foundKey.replace(/_/g, " ").replace(/\b\w/g, (t) => t.toUpperCase());

      departments.push(label);
    }
  });

  return departments.length > 0 ? departments.join(", ") : "-";
}

function complaintMatchesAllowedDept(complaint, allowedBlocks) {
  if (!allowedBlocks || allowedBlocks.length === 0) return false;

  for (const block of allowedBlocks) {
    const snake = block.replace(/([A-Z])/g, "_$1").toLowerCase();

    const possibleKeys = [
      block,            // doctorServices
      snake,            // doctor_services
      snake.replace("_services", ""),
      snake.replace("_service", "")
    ];

    for (const key of possibleKeys) {
      const section = complaint[key];
      if (!section) continue;

      const hasText = section.text && section.text.trim();
      const hasFiles =
        Array.isArray(section.attachments) &&
        section.attachments.length > 0;

      if (hasText || hasFiles) return true;
    }
  }

  return false;
}


export default function ComplaintsListDash() {
  const [searchTerm, setSearchTerm] = useState("");
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { allowedBlocks } = resolvePermissions();
  const navigate = useNavigate();

  // 🔹 Fetch Complaints
useEffect(() => {
  const fetchComplaints = async () => {
    try {
      setLoading(true);

      const res = await ApiGet("/admin/ipd-concern");
      const allComplaints = res?.data || [];

      let filtered = [];

      if (allowedBlocks.length === 0) {
        // If somehow no rights → show none
        filtered = [];
      } else {
        filtered = allComplaints.filter((c) =>
          isAdmin ? true : complaintMatchesAllowedDept(c, allowedBlocks)
        );
      }

      const sorted = filtered.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setComplaints(sorted.slice(0, 5)); // ⭐ Latest 5 only

    } catch (err) {
      console.error("Failed to fetch complaints:", err);
      setError("Failed to fetch complaints");
    } finally {
      setLoading(false);
    }
  };

  const { isAdmin, allowedBlocks } = resolvePermissions();
  fetchComplaints();
}, []);


// 🔍 Filter by search
const filteredComplaints = complaints.filter((c) => {
  const q = searchTerm.toLowerCase();
  return (
    c.patientName?.toLowerCase().includes(q) ||
    c.consultantDoctorName?.name?.toLowerCase().includes(q) ||
    c.department?.toLowerCase().includes(q) ||
    c.complaintId?.toLowerCase().includes(q)
  );
});

// 🔥 Add this filter to hide unauthorized complaints
const visibleComplaints = filteredComplaints.filter((c) => {
  const deptString = getDepartmentsString(c, allowedBlocks);
  return deptString && deptString !== "-";
});



  // 📅 Format Date
  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${d.getFullYear()} ${d
      .getHours()
      .toString()
      .padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  };

  // 📤 Export to Excel
  const exportToExcel = () => {
    try {
      const ws = XLSX.utils.json_to_sheet(complaints);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Complaints");
      XLSX.writeFile(wb, "Complaints_List.xlsx");
    } catch {
      setError("Failed to export data");
    }
  };

  // 👁 Open Complaint Details (persistent + full doc)
const openComplaintDetails = (complaint) => {
  // ✅ Store last opened complaint in sessionStorage for reload persistence
  sessionStorage.setItem(
    "ipdComplaint:last",
    JSON.stringify({ id: complaint._id })
  );

  // ✅ Navigate and pass both lightweight and full document
  navigate("/complaint-details", {
    state: {
      complaint,     // minimal data (row)
      doc: complaint // full document if already available
    },
  });
};

// 🎨 Status Badge Colors
const getStatusBadge = (status) => {
  const base = "px-2 py-[3px] rounded-full text-[10px] font-semibold inline-block";

  switch (status?.toLowerCase()) {
    case "resolved":
      return `${base} bg-green-100 text-green-700 border border-green-200`;
    case "pending":
      return `${base} bg-yellow-100 text-yellow-800 border border-yellow-200`;
    case "escalated":
      return `${base} bg-gray-100 text-gray-700 border border-gray-200`;
    case "in progress":
    case "progress":
      return `${base} bg-blue-100 text-blue-700 border border-blue-200`;
    case "partial":
    case "partially resolved":
      return `${base} bg-purple-100 text-purple-700 border border-purple-200`;
    case "closed":
      return `${base} bg-red-100 text-red-700 border border-red-200`;
    default:
      return `${base} bg-slate-100 text-slate-700 border border-slate-200`;
  }
};
  const handlenavigate = () => {
      navigate("/complain-list")
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className=" overflow-hidden  mb-[40px] md:!mb-0  border-gray-200"
      >
        {/* ---------- Header ---------- */}
        <div className=" px-2 py-[8px] border-gray-200 flex  sm:flex-row justify-between sm:items-center">
          <div className="flex gap-[10px]  items-center">
            <div className="w-[35px] h-[35px] bg-gradient-to-br from-blue-500 to-pink-500 rounded-md flex items-center justify-center">
              <i className="fa-regular fa-clipboard-list text-[15px] text-white"></i>
            </div>
            <h3 className="text-[15px] font-[400] text-gray-900">Complaint List</h3>
          </div>

          <div className="flex flex-row items-center gap-3 mt-2 sm:mt-0">
            <div className="relative md:!flex md34:!hidden">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search complaints..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-3 py-[6px] border border-gray-300 rounded-md focus:outline-none focus:ring-[1.3px] focus:ring-blue-500"
              />
            </div>
        <div className="flex gap-[10px] items-center">
   
                  <button
                    onClick={handlenavigate}
                    className="flex items-center  justify-center h-[35px] w-[35px] bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
          </div>
        </div>

        {/* ---------- Table ---------- */}
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.2 }}
  className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200"
>
  
  <div className="overflow-x-auto">
    <table className="w-full min-w-[1100px]">
      {/* 🔹 Header */}
      <thead>
        <tr className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
          <th className="px-2 py-[13px] text-left text-[11px] w-[100px] font-[600] text-white">
            COMPLAINT ID
          </th>
          <th className="px-2 py-[13px] text-left  w-[140px] text-[11px] font-[600] text-white">
            DATE & TIME
          </th>
          <th className="px-3 py-[13px] text-left text-[11px] font-[600] text-white">
            PATIENT NAME
          </th>
          <th className="px-3 py-[13px] text-left text-[11px] font-[600] text-white">
            DOCTOR NAME
          </th>
          <th className="px-6 py-[13px] text-left text-[11px] font-[600] text-white">
            BED NO
          </th>
          <th className="px-3 py-[13px] text-left text-[11px] font-[600] text-white">
            DEPARTMENT
          </th>
          <th className="px-3 py-[13px] text-left text-[11px] font-[600] text-white">
            STATUS
          </th>
          <th className="px-6 py-[13px] text-center text-[11px] font-[600] text-white">
            ACTIONS
          </th>
        </tr>
      </thead>

      {/* 🔹 Body */}
      <tbody>
        <AnimatePresence>
          {loading ? (
            <tr>
              <td colSpan="8" className="text-center py-6 text-gray-500 text-sm">
                Loading...
              </td>
            </tr>
          ) : visibleComplaints.length > 0 ? (
            visibleComplaints.map((row, index) => (
              
              <motion.tr
                key={row._id || index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.05 }}
                className={`border-b border-gray-200 hover:shadow-md cursor-pointer transition-all ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                }`}
              >
                {/* 🆔 Complaint ID */}
                <td className="px-2 py-2">
                  <div className="flex items-center gap-2 text-blue-600 font-[500]">
                    <i className="fa-regular fa-ticket text-[14px] text-blue-500"></i>
                    <button
                      onClick={() => openComplaintDetails(row)}
                      className="hover:underline text-[13px]"
                    >
                      {row.complaintId || "-"}
                    </button>
                  </div>
                </td>

                {/* 🕒 Date & Time */}
                <td className="px-2 w-[120px] py-2">
                  <div className="flex items-center gap-2 text-gray-700">
                    <CalendarClock size={16} className="text-blue-500" />

                    
                    <span className="text-[11px] font-[500]">
                      {formatDate(row.createdAt)}
                    </span>
                  </div>
                </td>

      
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <div className="w-[26px] h-[26px] rounded-full flex-shrink-0 text-[10px] bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-[600] shadow-md">
                      {row.patientName?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <span className="text-gray-900 font-[500] text-[14px] leading-[16px]">
                      {row.patientName || "-"}
                    </span>
                  </div>
                </td>

                {/* 🩺 Doctor Name */}
                <td className="px-3 w-[150px] py-2">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Stethoscope size={15} className="text-purple-500 flex-shrink-0" />
                    <span className="font-medium text-[12px] flex-shrink-0">
                      {row.consultantDoctorName?.name || "-"}
                    </span>
                  </div>
                </td>

      
                <td className="px-6 w-[100px] py-2">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Bed size={16} className="text-orange-500" />
                    <span className="font-medium text-[13px]">
                      {row.bedNo || "-"}
                    </span>
                  </div>
                </td>

                {/* 🏥 Department */}
<td className="px-3 py-2 text-gray-700 text-[12px] font-[500]">
 {row
  ? getDepartmentsString(row, allowedBlocks) || "-"
  : "-"
}
</td>


   {/* 📊 Status */}
<td className="px-3 py-2">
  <div className="flex items-center gap-2">
    {/* <i className="fa-solid fa-circle text-[8px]" 
       style={{
         color:
           row.status?.toLowerCase() === "resolved"
             ? "#16a34a"
             : row.status?.toLowerCase() === "pending"
             ? "#facc15"
             : row.status?.toLowerCase() === "in progress" || row.status?.toLowerCase() === "progress"
             ? "#3b82f6"
             : row.status?.toLowerCase() === "partial" || row.status?.toLowerCase() === "partially resolved"
             ? "#8b5cf6"
             : "#9ca3af"
       }}>
    </i> */}
    <span className={getStatusBadge(row.status)}>
      {row.status || "Open"}
    </span>
  </div>
</td>


                {/* ⚙️ Actions */}
                <td className="px-6 py-2">
                  <div className="flex items-center justify-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        openComplaintDetails(row)
                      }}
                      className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      <Eye size={18} className="text-blue-500" />
                    </motion.button>
                  </div>
                </td>
              </motion.tr>
            ))
          ) : (
            <tr>
              <td
                colSpan="8"
                className="text-center py-6 text-gray-500 text-sm"
              >
                No complaints found.
              </td>
            </tr>
          )}
        </AnimatePresence>
      </tbody>
    </table>
  </div>
</motion.div>


      </motion.div>

      {error && <div className="text-red-600 text-sm mt-3 px-6">{error}</div>}
    </>
  );
}
