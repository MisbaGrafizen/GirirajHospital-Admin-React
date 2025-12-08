import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Search,
  Mail,
  MailOpen,
  Star,
  Archive,
  Trash2,
  Reply,
  Forward,
  MoreHorizontal,
  Paperclip,
} from "lucide-react";
import Header from "../Component/header/Header";
import SideBar from "../Component/sidebar/SideBar";
import CubaSidebar from "../Component/sidebar/CubaSidebar";
import { ApiGet } from "../helper/axios";
import Preloader from "../Component/loader/Preloader";
import { motion, AnimatePresence } from "framer-motion"
import socket from "../socket/index";

const MODULE_TO_BLOCK = {
  doctor_service: "doctorServices",
  diagnostic_service: "diagnosticServices",
  nursing: "nursing",
  dietitian: "dietitianServices",
  maintenance: "maintenance",
  security: "security",
  billing_service: "billingServices",
  housekeeping: "housekeeping",
};

const DEPT_NAME_MAP = {
  // Doctor
  "doctor service": "doctor_service",
  "doctor services": "doctor_service",

  // Diagnostic
  "diagnostic service": "diagnostic_service",
  "diagnostic services": "diagnostic_service",

  // Dietitian
  "dietitian service": "dietitian",
  "dietitian services": "dietitian",

  // Billing
  "billing service": "billing_service",
  "billing services": "billing_service",

  // Housekeeping
  "housekeeping": "housekeeping",

  // Nursing
  "nursing": "nursing",

  // Security
  "security": "security",

  // Maintenance
  "maintenance": "maintenance",
};

// Reverse map for internal departments → backend keys
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

// Reverse mapping → "Doctor Services" → "doctorServices"
const DEPT_REVERSE_MAP = Object.fromEntries(
  Object.entries(DEPT_LABEL).map(([key, value]) => [
    value.toLowerCase(),
    key,
  ])
);



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
  if (isAdmin) {
    Object.entries(MODULE_TO_BLOCK).forEach(([module, block]) => {
      permissionsByBlock[block] = ["view", "forward", "escalate", "resolve"];
    });
  } else {
    permsArray.forEach((p) => {
      const blockKey = MODULE_TO_BLOCK[p.module];
      if (blockKey) {
        permissionsByBlock[blockKey] = p.permissions.map((x) =>
          x.toLowerCase()
        );
      }
    });
  }

  return { isAdmin, permissionsByBlock };
}


// 🔥 Convert "Doctor Service" → "doctorService"
function toCamelCaseDepartment(dept) {
  if (!dept) return "";
  return dept
    .toLowerCase()
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .split(" ")
    .map((word, index) =>
      index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join("");
}


export default function EmailManagement() {
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobileDetail, setIsMobileDetail] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState([])
  const [allowedFilters, setAllowedFilters] = useState(["OPD", "IPD", "Complain"]);
  const [allowedDepartments, setAllowedDepartments] = useState([]);


  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const loginType = localStorage.getItem("loginType");
        const userId = localStorage.getItem("userId");
        const userModel = loginType === "admin" ? "GIRIRAJUser" : "GIRIRAJRoleUser";

        if (!userId || !userModel) return;

        const res = await ApiGet(
          `/admin/notification-settings?userId=${userId}&userModel=${userModel}`
        );

        const s = res?.data || {};

        const { permissionsByBlock } = resolvePermissions();
        setAllowedDepartments(Object.keys(permissionsByBlock));

        // -------------------------------
        // 1️⃣ ADMIN → Show all filters
        // -------------------------------
        if (loginType === "admin") {
          setAllowedFilters(["OPD", "IPD", "Complaint", "Internal Complaint"]);
          return;
        }

        // -------------------------------
        // 2️⃣ ROLE USER → Show filters based on settings
        // -------------------------------
        const temp = [];
        if (s.opd) temp.push("OPD");
        if (s.ipd) temp.push("IPD");
        if (s.complaint) temp.push("Complaint");
        if (s.internalComplaint) temp.push("Internal Complaint");

        setAllowedFilters(temp.length > 0 ? temp : ["Complaint", "Internal Complaint"]);

      } catch (err) {
        console.error("❌ Failed to fetch notification settings:", err);
        setAllowedFilters(["Complaint", "Internal Complaint"]);
      }
    };

    fetchSettings();
  }, []);


  const getSubjectColor = (subject) => {
    if (!subject) return "bg-gray-100 border-gray-200 text-gray-700"

    const sub = subject.toLowerCase()
    if (sub.includes("ipd")) {
      return "bg-purple-100 text-purple-800"
    }
    if (sub.includes("opd")) {
      return "bg-blue-100 text-blue-800"
    }
    if (sub.includes("complain") || sub.includes("concern")) {
      return "bg-red-100 border-red-100 text-red-800"
    }

    return "bg-gray-100 border-gray-200 text-gray-700" // default
  }

  function formatStatus(value) {
    if (!value) return "";
    return value
      .replace(/_/g, " ")     // convert underscores → spaces
      .replace(/\b\w/g, (c) => c.toUpperCase()); // capitalize each word
  }



  // ✅ Add this new function
  const getStatusColor = (status) => {
    if (!status) return "bg-gray-100 text-gray-600";
    const s = status.toLowerCase();

    if (s.includes("resolved"))
      return "bg-green-100 text-green-700 border border-green-300";
    if (s.includes("in progress"))
      return "bg-yellow-100 text-yellow-800 border border-yellow-300";
    if (s.includes("open"))
      return "bg-blue-100 text-blue-700 border border-blue-300";
    if (s.includes("partial"))
      return "bg-orange-100 text-orange-700 border border-orange-300";
    if (s.includes("escalated"))
      return "bg-red-100 text-red-700 border border-red-300";
    if (s.includes("forward"))
      return "bg-purple-100 text-purple-700 border border-purple-300";

    return "bg-gray-100 text-gray-600 border border-gray-300";
  };

  const fetchEmails = async () => {
    try {
      setLoading(true);
      const data = await ApiGet("/admin/notifications");
      console.log('data', data)
      const mapped = (data?.notifications || []).map((n) => {
        const isInternal =
          n.title?.toLowerCase().includes("internal") ||
          n.body?.toLowerCase().includes("internal") ||
          n.data?.isInternal === true;

        function formatStatus(val) {
          if (!val) return "Unknown";
          return val.replace(/_/g, " ").replace(/\b\w/g, (s) => s.toUpperCase());
        }

        function formatKey(key) {
          return key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
        }

        // ---- INTERNAL DETAILS BUILDER ----
        const buildInternalContent = (data) => `
      <div class="space-y-4">
        <p class="text-gray-800 text-base">${n.body}</p>

        <div class="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm">
          <h4 class="text-blue-600 font-semibold mb-3 flex items-center gap-2">
            🏢 Internal Complaint Details
          </h4>

          <div class="divide-y divide-gray-200">
            ${row("Complaint ID", data.complaintId || data.complaint)}
            ${row("Employee Name", data.employeeName)}
            ${row("Employee ID", data.employeeId)}
            ${row("Floor No", data.floorNo)}
            ${row("Departments", data.departments)}
            ${row("Status", formatStatus(data.status))}
          </div>
        </div>
      </div>
    `;

        function row(label, value) {
          return `
      <div class="flex items-start py-2">
        <div class="w-40 font-medium text-gray-900">${label}</div>
        <div class="flex-1 text-gray-700 break-words">${value || "-"}</div>
      </div>
    `;
        }

        return {
          id: n._id,

          // raw data store
          data: n.data,
          department: n.department,

          // DIFFERENT SENDER FORMAT FOR INTERNAL COMPLAINTS
          sender: isInternal
            ? `${n.data?.floorNo || "-"}/ ${n.data?.employeeName || "Unknown Employee"}`
            : `${n.data?.bedNo || "-"} / ${n.data?.consultantDoctorName || "Unknown Doctor"}`,

          subject: isInternal ? "Internal Complaint" : n.title,
          senderEmail: "",
          preview: n.body,

          status: formatStatus(n.data?.status),

          // DIFFERENT CONTENT FOR INTERNAL COMPLAINT
          content: isInternal
            ? buildInternalContent(n.data)
            : `
        <div class="space-y-4">
          <p class="text-gray-800 text-base">${n.body}</p>

          ${n.data
              ? `<div class="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm">
                  <h4 class="text-blue-600 font-semibold mb-3 flex items-center gap-2">
                    📋 Patient Details
                  </h4>
                  <div class="divide-y divide-gray-200">
                    ${Object.entries(n.data)
                .filter(([key]) => !["complaintid", "_id", "__v"].includes(key.toLowerCase()))
                .map(([key, value]) => {
                  let label = key.toLowerCase() === "complaint" ? "Complaint Id" : formatKey(key);

                  if (key.toLowerCase() === "status") {
                    value = formatStatus(value);
                  }

                  return `
                          <div class="flex items-start py-2">
                            <div class="w-40 font-medium text-gray-900 capitalize">${label}</div>
                            <div class="flex-1 text-gray-700 break-words">${value}</div>
                          </div>
                        `;
                })
                .join("")}
                  </div>
                </div>`
              : ""
            }
        </div>
      `,

          timestamp: new Date(n.createdAt).toLocaleString(),
          isRead: false,
          isStarred: false,
          isNew: true,
          priority: "normal",
          hasAttachment: false,
        };
      });

      // Helper function
      function formatKey(key) {
        return key
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (s) => s.toUpperCase());
      }



      setEmails(mapped);
      if (mapped.length > 0) setSelectedEmail(mapped[0]);
    } catch (error) {
      console.error("Error fetching emails:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
    socket.on("ipd:new", fetchEmails);
    socket.on("opd:new", fetchEmails);
    socket.on("ipd:complaint", fetchEmails);

    return () => {
      socket.off("ipd:new", fetchEmails);
      socket.off("opd:new", fetchEmails);
      socket.off("ipd:complaint", fetchEmails);
    };
  }, []);

  console.log('allowedDepartments', allowedDepartments)

  const filteredEmails = useMemo(() => {
    let list = emails;

    // 🔍 SEARCH FILTER
    if (searchQuery) {
      list = list.filter(
        (email) =>
          email.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          email.sender?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          email.preview?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // ⭐ Unified permission filter (Complaint + Internal Complaint)
    if (allowedDepartments.length > 0) {
      list = list.filter((email) => {
        const backendDept =
          email.data?.departments ||
          email.data?.department ||
          email.department ||
          "";

        if (!backendDept) return false;

        const deptList = backendDept
          .split(",")
          .map((d) => d.trim().toLowerCase());

        return deptList.some((deptLabel) => {
          // Internal dept text → dept key
          const deptKey =
            DEPT_REVERSE_MAP[deptLabel] ||  // internal departments
            DEPT_NAME_MAP[deptLabel];       // complaint departments

          if (!deptKey) return false;

          // doctorServices → doctor_service
          const moduleKey = Object.keys(MODULE_TO_BLOCK).find(
            (k) => MODULE_TO_BLOCK[k] === deptKey
          ) || deptKey;

          const blockName = MODULE_TO_BLOCK[moduleKey] || deptKey;

          return allowedDepartments.includes(blockName);
        });
      });
    }


    if (selectedFilters.length > 0) {
      list = list.filter((email) => {
        const sub = email.subject?.toLowerCase() || "";

        const isInternal = sub.includes("internal");
        const isRegularComplaint = sub.includes("complaint") && !isInternal;

        if (selectedFilters.includes("Internal Complaint") && isInternal) return true;
        if (selectedFilters.includes("Complaint") && isRegularComplaint) return true;

        return false;
      });
    }

    return list;
  }, [emails, searchQuery, selectedFilters, allowedDepartments]);

  useEffect(() => {
    if (!filteredEmails.find(e => e.id === selectedEmail?.id)) {
      setSelectedEmail(null);
    }
  }, [filteredEmails]);


  console.log('filteredEmails', filteredEmails)

  const handleEmailClick = (email) => {
    setSelectedEmail(email);
    if (!email.isRead) {
      setEmails((prev) =>
        prev.map((e) =>
          e.id === email.id ? { ...e, isRead: true, isNew: false } : e
        )
      );
    }
  };

  const toggleStar = (emailId, e) => {
    e.stopPropagation();
    setEmails((prev) =>
      prev.map((email) =>
        email.id === emailId ? { ...email, isStarred: !email.isStarred } : email
      )
    );
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "border-l-red-500";
      case "low":
        return "border-l-green-500";
      default:
        return "border-l-blue-500";
    }
  };

  const modalRef = useRef(null)

  // Close modal if click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setFilterOpen(false)
      }
    }
    if (filterOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [filterOpen])

  const handleCheckboxChange = (item) => {
    setSelectedFilters((prev) =>
      prev.includes(item) ? prev.filter((f) => f !== item) : [...prev, item]
    )
  }


  useEffect(() => {
    const handleMobileBack = (e) => {
      // If mobile detail view is open → BLOCK default browser back
      if (isMobileDetail) {
        e.preventDefault();
        setIsMobileDetail(false);
        return;
      }
    };

    window.addEventListener("popstate", handleMobileBack);

    return () => {
      window.removeEventListener("popstate", handleMobileBack);
    };
  }, [isMobileDetail]);

  return (
    <>


      <section className="flex w-[100%] h-[100%] select-none   md11:pr-[0px] overflow-hidden">
        <div className="flex w-[100%] flex-col gap-[0px] h-[100vh]">
          <Header pageName="Notification Management" />
          <div className="flex  w-[100%] h-[100%]">
            <CubaSidebar />
            <div className="flex w-[100%] max-h-[96%] bg-[#d3d3d34a] md11:!pl-[10px] pb-[50px]  relative    gap-[10px] ">
              <Preloader />
              <div className="flex w-[100%] h-screen">
                {/* Left Sidebar */}
                <div className=" md11:w-[30%] 2xl:!w-[20%] md34:!hidden md11:!flex   max-w-[400px] pr-[10px] border-r border-gray-200  flex-col">
                  {/* Header */}
                  <div className="py-[10px] gap-[10px] border-b flex border-gray-200">
                    {/* Search box */}
                    <div className="relative w-[100%]">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search Notification..."
                        value={searchQuery}

                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-[100%] pl-10 pr-4 py-2 border border-gray-300 rounded-lg  focus:border-transparent outline-none"
                      />
                    </div>

                    {/* Filter button & modal */}
                    <div className="relative" ref={modalRef}>
                      <button
                        onClick={() => setFilterOpen((prev) => !prev)}
                        className={`border flex justify-center items-center rounded-[8px] w-[40px] h-[40px] transition
      ${filterOpen ? "bg-red-500 text-white" : selectedFilters.length > 0 ? "bg-red-500 text-white" : "bg-white hover:bg-gray-100"}`}
                      >
                        <i className="fa-regular fa-filter"></i>
                      </button>

                      <AnimatePresence>
                        {filterOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-0 mt-2 w-44 h-fit bg-white overflow-hidden rounded-lg shadow-lg border border-gray-200 z-50 px-2 py-[5px]"
                          >
                            {["Complaint", "Internal Complaint"].map((item, index, arr) => (
                              <label
                                key={item}
                                className={`flex items-center !mb-[0px] gap-2 px-2 py-1 text-sm cursor-pointer hover:bg-gray-50 
      ${index !== arr.length - 1 ? "border-b-[0.2px] border-[#b6b4b4]" : ""}`}
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedFilters.includes(item)}
                                  onChange={() => handleCheckboxChange(item)}
                                  className="accent-blue-600"
                                />
                                {item}
                              </label>
                            ))}


                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                  </div>
                  {/* Email List */}
                  <div className="flex-1 overflow-y-auto 2xl:!max-h-[84%] md11:!max-h-[79%]">
                    {filteredEmails.map((email) => (
                      <div
                        key={email.id}
                        onClick={() => handleEmailClick(email)}
                        className={`
                p-2 border-b border-gray-100 relative cursor-pointer transition-all mb-[8px]   rounded-[10px] duration-200
                ${selectedEmail?.id === email.id
                            ? "bg-red-50  border-[1px]  !border-red-600   rounded-l-[10px] shadow-sm"
                            : "  bg-white  border-[1px] border-white " +
                            getPriorityColor(email.priority)
                          }
                ${!email.isRead ? "bg-blue-25" : ""}
              `}
                      >
                        {/* ✅ Complaint Status Badge */}
                        {email.status && (
                          <div
                            className={`absolute top-[6px] right-[6px] px-2 py-[2px] text-[10px] font-medium rounded-full ${getStatusColor(email.status)}`}
                          >
                            {email.status}
                          </div>
                        )}

                        <div className="flex items-start justify-between mb-1">
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            {email.isRead ? (
                              <MailOpen className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            ) : (
                              <Mail className="w-4 h-4 text-blue-600 flex-shrink-0" />
                            )}
                            <div className="flex  items-center min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <span
                                  className={`font-[500] truncate ${!email.isRead ? "text-gray-900" : "text-gray-700"
                                    }`}
                                >
                                  {email.sender}
                                </span>
                                {/* {email.isNew && (
                                  <span className="bg-red-500 text-white  absolute text-xs px-2 py-0.5 rounded-full flex-shrink-0">
                                    New 
                                  </span>
                                )} */}
                                {email.hasAttachment && (
                                  <Paperclip className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                )}
                              </div>
                              <span className="text-[8px] absolute right-0  pt-[1px] px-[10px] rounded-b-sm  bottom-[1px] flex-shrink-0 text-gray-500">
                                {email.timestamp}
                              </span>
                            </div>
                          </div>

                        </div>

                        <h3
                          className={`text-sm mb-2 line-clamp-2 ${!email.isRead
                            ? "font-semibold text-gray-900"
                            : "font-medium text-gray-800"
                            }`}
                        >
                          {/* <h3
                            className={`text-sm mb-2 line-clamp-2 ${!email.isRead ? "font-semibold text-gray-900" : "font-medium text-gray-800"
                              }`}
                          >
                            <div
                              className={`
      flex  font-[500] text-[12px] w-fit px-[10px] rounded-[10px]
      ${getSubjectColor(email.subject)}
    `}
                            >
                              {email.subject}
                            </div>
                          </h3> */}


                          {email.data?.type && (
                            <span className="ml-2 text-xs text-blue-500">[{email.data.type}]</span>
                          )}
                        </h3>
                        {/* 
                                                <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                                                    {email.preview}
                                                </p> */}
                      </div>
                    ))}
                  </div>


                </div>

                {/* Right Panel */}
                <div className="w-[100%] md34:!hidden md11:!flex flex-col bg-white">
                  {selectedEmail ? (
                    <>
                      {/* Header */}
                      <div className="p-3 border-b border-gray-200 bg-gray-50">
                        <div className="flex items-start justify-between mb-2">
                          {/* ✅ Complaint Status in Detail View */}
                          {selectedEmail.status && (
                            <span
                              className={`px-3 py-[2px] rounded-full absolute  right-4 top-3 text-sm font-semibold ${getStatusColor(selectedEmail.status)}`}
                            >
                              {selectedEmail.status}
                            </span>
                          )}

                          <div className="flex-1">
                            {/* <h1 className="text-xl font-semibold text-gray-900 mb-3 leading-tight">
                              {selectedEmail.subject}
                            </h1> */}
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                  <span className="text-white font-medium text-sm">
                                    {selectedEmail.sender.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-900">
                                    {selectedEmail.sender}
                                  </span>
                                  {/* <span className="text-gray-500">
                                  <span className="text-gray-500">
                                    {" "}
                                    &lt;{selectedEmail.senderEmail}&gt;
                                  </span> */}
                                </div>
                              </div>
                            </div>
                            <div className="mt-2 text-sm text-gray-500">
                              Received on {selectedEmail.timestamp}
                            </div>
                          </div>
                          {/* <div className="flex items-center space-x-2">
                            <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                              <Reply className="w-5 h-5 text-gray-600" />
                            </button>
                            <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                              <Forward className="w-5 h-5 text-gray-600" />
                            </button>
                            <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                              <Archive className="w-5 h-5 text-gray-600" />
                            </button>
                            <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                              <Trash2 className="w-5 h-5 text-gray-600" />
                            </button>
                     <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                                                            <MoreHorizontal className="w-5 h-5 text-gray-600" />
                                                        </button> 
                          </div> */}
                        </div>


                      </div>

                      {/* Privacy Banner */}
                      {selectedEmail.sender === "GitHub" && (
                        <div className="mx-6 mt-1 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                              <span className="text-white font-bold">!</span>
                            </div>
                            <span className="text-sm text-gray-700">
                              To protect your privacy remote resources have been blocked.
                            </span>
                          </div>
                          <div className="flex space-x-2">
                            <button className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors">
                              Allow
                            </button>
                            <button className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors">
                              Always allow from {selectedEmail.senderEmail}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Content */}
                      <div className="flex-1 overflow-y-auto p-6">
                        <div
                          className="prose max-w-none"
                          dangerouslySetInnerHTML={{ __html: selectedEmail.content }}
                        />
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <Mail className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No Notification Selected
                        </h3>
                        <p className="text-gray-500">
                          Select an Notification from the list to view its contents
                        </p>
                      </div>
                    </div>
                  )}
                </div>



                {/* 📱 Mobile / Tablet */}
                <div className="flex w-full lg:hidden bg-gray-50">
                  {!isMobileDetail ? (
                    // Email List (Cards)
                    <div className="w-full p-3 overflow-y-auto">

                      <div className=" py-[10px] mb-[5px] gap-[10px] border-b flex w-[100%]  border-gray-200 bg-gray-50">

                        <div className="relative w-[100%]">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            type="text"
                            placeholder="Search emails..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-[100%] pl-10  pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                          />
                        </div>

                        <button
                          onClick={() => setFilterOpen((prev) => !prev)}
                          className={`border flex justify-center items-center rounded-[8px] w-[40px] h-[40px] transition
      ${filterOpen ? "bg-red-500 text-white" : selectedFilters.length > 0 ? "bg-red-500 text-white" : "bg-white hover:bg-gray-100"}`}
                        >
                          <i className="fa-regular fa-filter"></i>
                        </button>


                        <AnimatePresence>
                          {filterOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: -10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -10, scale: 0.95 }}
                              transition={{ duration: 0.15 }}
                              className="absolute right-0 mt-10 w-44 h-fit bg-white overflow-hidden rounded-lg shadow-lg border border-gray-200 z-50 px-2 py-[5px]"
                            >
                              {["Complaint", "Internal Complaint"].map((item, index, arr) => (
                                <label
                                  key={item}
                                  className={`flex items-center !mb-[0px] gap-2 px-2 py-1 text-sm cursor-pointer hover:bg-gray-50 
      ${index !== arr.length - 1 ? "border-b-[0.2px] border-[#b6b4b4]" : ""}`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={selectedFilters.includes(item)}
                                    onChange={() => handleCheckboxChange(item)}
                                    className="accent-blue-600"
                                  />
                                  {item}
                                </label>
                              ))}


                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {filteredEmails.map((email) => (
                        <div
                          key={email.id}
                          onClick={() => {
                            handleEmailClick(email);
                            setIsMobileDetail(true);
                          }}
                          className={`
                p-3 border-b border-gray-100 relative cursor-pointer transition-all mb-[8px]   shadow-sm rounded-[10px] duration-200
                ${selectedEmail?.id === email.id
                              ? "  rounded-l-[10px] border shadow-sm"
                              : "  bg-white  border-[1px] border-[#bababa70] " +
                              getPriorityColor(email.priority)
                            }
                ${!email.isRead ? "bg-blue-25" : ""}
              `}
                        >
                          {/* ✅ Complaint Status Badge */}
                          {email.status && (
                            <div
                              className={`absolute top-[6px] right-[6px] px-2 py-[2px] text-[10px] font-medium rounded-full ${getStatusColor(email.status)}`}
                            >
                              {email.status}
                            </div>
                          )}

                          <div className="flex items-start justify-between mb-1">
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                              {email.isRead ? (
                                <MailOpen className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              ) : (
                                <Mail className="w-4 h-4 text-blue-600 flex-shrink-0" />
                              )}
                              <div className="flex  items-center min-w-0">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span
                                    className={`font-[500] truncate ${!email.isRead ? "text-gray-900" : "text-gray-700"
                                      }`}
                                  >
                                    {email.sender}
                                  </span>
                                  {/* {email.isNew && (
                                  <span className="bg-red-500 text-white  absolute text-xs px-2 py-0.5 rounded-full flex-shrink-0">
                                    New 
                                  </span>
                                )} */}
                                  {email.hasAttachment && (
                                    <Paperclip className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                  )}
                                </div>
                                <span className="text-[8px] absolute right-0  pt-[1px] px-[10px] rounded-b-sm  bottom-[1px] flex-shrink-0 text-gray-500">
                                  {email.timestamp}
                                </span>
                              </div>
                            </div>

                          </div>

                          <h3
                            className={`text-sm mb-2 line-clamp-2 ${!email.isRead
                              ? "font-semibold text-gray-900"
                              : "font-medium text-gray-800"
                              }`}
                          >


                            {email.data?.type && (
                              <span className="ml-2 text-xs text-blue-500">[{email.data.type}]</span>
                            )}
                          </h3>
                          {/* 
                                                <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                                                    {email.preview}
                                                </p> */}
                        </div>
                      ))}
                    </div>
                  ) : (
                    // Detail View
                    <div className="w-full flex flex-col bg-white h-screen">
                      <button
                        onClick={() => setIsMobileDetail(false)}
                        className="p-3 text-blue-600 flex items-center gap-2 border-b bg-gray-50"
                      >
                        <i className="fa-solid fa-arrow-left"></i> Back to Notfications
                      </button>
                      {selectedEmail && (
                        <div className="flex-1 overflow-y-auto p-4">
                          <h1 className="text-lg font-semibold text-gray-900 mb-2">
                            {selectedEmail.subject}
                          </h1>
                          {/* <p className="text-sm text-gray-600 mb-1">
                            {selectedEmail.sender};
                          </p> */}
                          <p className="text-xs text-gray-500 mb-3">
                            {selectedEmail.timestamp}
                          </p>
                          <div
                            className="prose max-w-none"
                            dangerouslySetInnerHTML={{ __html: selectedEmail.content }}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>


                {/* Styles */}
                <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .email-content {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            sans-serif;
          line-height: 1.6;
          color: #374151;
        }
        .email-content h2 {
          color: #1f2937;
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 1rem;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 0.5rem;
        }
        .email-content h3 {
          color: #374151;
          font-size: 1.25rem;
          font-weight: 600;
          margin: 1.5rem 0 1rem 0;
        }
        .email-content p {
          margin-bottom: 1rem;
        }
        .email-content ul {
          margin: 1rem 0;
          padding-left: 1.5rem;
        }
        .email-content li {
          margin-bottom: 0.5rem;
        }
        .security-alert {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border: 1px solid #f59e0b;
          border-radius: 12px;
          padding: 2rem;
          margin: 1rem 0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .repository-info {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 1.5rem;
          margin-top: 1.5rem;
          box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.1);
        }
        .feature-highlight {
          background: #f0f9ff;
          border: 1px solid #0ea5e9;
          border-radius: 8px;
          padding: 1.5rem;
          margin: 1.5rem 0;
        }
        .deployment-info {
          background: #f0fdf4;
          border: 1px solid #22c55e;
          border-radius: 8px;
          padding: 1.5rem;
          margin: 1.5rem 0;
        }
        .vulnerability-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 1rem;
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .vulnerability-table th,
        .vulnerability-table td {
          padding: 1rem;
          text-align: left;
          border-bottom: 1px solid #e5e7eb;
        }
        .vulnerability-table th {
          background: #f9fafb;
          font-weight: 600;
          color: #374151;
        }
        .vulnerability-table td {
          color: #6b7280;
        }
        .vulnerability-table code {
          background: #f3f4

          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-family: 'Monaco', 'Menlo', monospace;
          font-size: 0.875rem;
        }
        
        .version-current {
          color: #dc2626;
          font-weight: 600;
        }
        
        .version-upgrade {
          color: #16a34a;
          font-weight: 600;
        }
        
        .severity-high {
          background: #fecaca;
          color: #dc2626;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
        }
        
        .severity-medium {
          background: #fed7aa;
          color: #ea580c;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
        }
        
        .action-buttons {
          margin-top: 2rem;
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }
        
        .btn-primary {
          background: #3b82f6;
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          border: none;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .btn-primary:hover {
          background: #2563eb;
        }
        
        .btn-secondary {
          background: #f3f4f6;
          color: #374151;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          border: 1px solid #d1d5db;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .btn-secondary:hover {
          background: #e5e7eb;
        }
      `}</style>
              </div>
            </div>

          </div>
        </div>
      </section>

    </>
  )
}