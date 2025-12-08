// import React, { useState, useEffect } from "react";
// import { motion } from "framer-motion";
// import {
//   LogIn,
//   LogOut,
//   CheckCircle2,
//   Clock3,
//   User,
//   Activity,
// } from "lucide-react";
// import CubaSidebar from "../../Component/sidebar/CubaSidebar";
// import Preloader from "../../Component/loader/Preloader";
// import Header from "../../Component/header/Header";
// import { ApiGet } from "../../helper/axios";

// export default function LogDetails() {
//   const [logs, setLogs] = useState([]);
//   const [loading, setLoading] = useState(true);

//   /* ---------------------- Date Helpers ---------------------- */
//   const formatDate = (dateString) => {
//     const d = new Date(dateString);
//     return `${String(d.getDate()).padStart(2, "0")}/${String(
//       d.getMonth() + 1
//     ).padStart(2, "0")}/${d.getFullYear()}`;
//   };

//   const formatTime = (dateString) => {
//     const d = new Date(dateString);
//     let hours = d.getHours();
//     const minutes = String(d.getMinutes()).padStart(2, "0");
//     const ampm = hours >= 12 ? "PM" : "AM";
//     hours = hours % 12 || 12;
//     return `${hours}:${minutes} ${ampm}`;
//   };

//   /* ---------------------- Fetch Logs ---------------------- */
//   useEffect(() => {
//     const fetchLogs = async () => {
//       try {
//         const res = await ApiGet("/admin/log-details");
//         console.log('res', res)
//         const data = res?.data || [];

//         // Format frontend log objects
//         const formatted = data.map((log, index) => ({
//           id: log._id || index,
//           doctor:
//             log?.userId?.name ||
//             log?.roleUserId?.name ||
//             "Unknown User",

//           action: log?.action || "unknown",
//           description: log?.description || "No details provided",
//           date: formatDate(log?.createdAt),
//           time: formatTime(log?.createdAt),
//         }));


//         setLogs(formatted.reverse());
//       } catch (err) {
//         console.error("❌ Failed to fetch logs:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchLogs();
//   }, []);

//   /* ---------------------- Color Theme Logic ---------------------- */
//   const getColor = (action) => {
//     action = action.toLowerCase();
//     if (action.includes("login"))
//       return "border-green-500/40 bg-green-50 text-green-700";
//     if (action.includes("logout"))
//       return "border-gray-400/40 bg-gray-50 text-gray-700";
//     if (action.includes("progress"))
//       return "border-yellow-500/40 bg-yellow-50 text-yellow-700";
//     if (action.includes("resolve"))
//       return "border-blue-500/40 bg-blue-50 text-blue-700";
//     if (action.includes("escalate"))
//       return "border-red-500/40 bg-red-50 text-red-700";
//     if (action.includes("forward"))
//       return "border-purple-500/40 bg-purple-50 text-purple-700";

//     return "border-slate-400/40 bg-slate-50 text-slate-700";
//   };

//   /* ---------------------- Icon Logic ---------------------- */
//   const getIcon = (action) => {
//     action = action.toLowerCase();
//     if (action.includes("login"))
//       return <LogIn className="text-green-600 w-5 h-5" />;
//     if (action.includes("logout"))
//       return <LogOut className="text-gray-600 w-5 h-5" />;
//     if (action.includes("progress"))
//       return <Clock3 className="text-yellow-600 w-5 h-5" />;
//     if (action.includes("resolve"))
//       return <CheckCircle2 className="text-blue-600 w-5 h-5" />;

//     return <Activity className="text-slate-600 w-5 h-5" />;
//   };

//   return (
//     <section className="flex w-full h-full select-none overflow-hidden">
//       <div className="flex w-full flex-col h-screen">
//         <Header pageName="Log Details" />
//         <div className="flex w-full h-full">
//           <CubaSidebar />

//           <div className="flex flex-col bg-[#f7f9fb] w-full relative 
//             max-h-[93%] pb-[10px] overflow-y-auto gap-[16px] p-[10px]">

//             {loading && <Preloader />}

//             {!loading && logs.length === 0 && (
//               <div className="flex flex-col items-center justify-center text-gray-500 h-full">
//                 <Activity className="w-10 h-10 mb-3 text-gray-400" />
//                 <p className="text-sm">No activity logs found.</p>
//               </div>
//             )}

//             {/* Logs Grid */}
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
//               {logs.map((log) => (
//                 <motion.div
//                   key={log.id}
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ duration: 0.3 }}
//                   className={`rounded-xl border p-3 shadow-sm hover:shadow-md transition-all ${getColor(
//                     log.action
//                   )}`}
//                 >
//                   <div className="flex items-center justify-between mb-3">
//                     <div className="flex items-center gap-2">
//                       {getIcon(log.action)}
//                       <h3 className="font-semibold text-[15px] capitalize">
//                         {log.action.replace(/_/g, " ")}
//                       </h3>
//                     </div>
//                     <span className="tex  t-  [10px] text-gray-500 font-medium">
//                       {log.date}
//                     </span>
//                   </div>

//                   <div className="flex items-start justify-between">
//                     <div>
//                       <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
//                         <User className="w-4 h-4 text-gray-600" />
//                         {log.doctor}
//                       </div>
//                       <p className="text-[11px] text-gray-600 mt-1 italic">
//                         {log.description}
//                       </p>
//                       <p className="text-xs text-gray-500 mt-1">
//                         Activity Time: {log.time}
//                       </p>
//                     </div>

//                     <div className="text-right text-[12px] mt-1 text-gray-400 italic">
//                       {log.action.includes("resolve") && (
//                         <span className="flex items-center gap-1 text-blue-600">
//                           <CheckCircle2 size={14} /> Closed
//                         </span>
//                       )}
//                       {log.action.includes("progress") && (
//                         <span className="flex items-center gap-1 text-yellow-600">
//                           <Clock3 size={14} /> Ongoing
//                         </span>
//                       )}
//                       {log.action.includes("login") && (
//                         <span className="flex items-center gap-1 text-green-600">
//                           <LogIn size={14} /> Active
//                         </span>
//                       )}
//                       {log.action.includes("logout") && (
//                         <span className="flex items-center gap-1 text-gray-600">
//                           <LogOut size={14} /> Session Ended
//                         </span>
//                       )}
//                     </div>
//                   </div>
//                 </motion.div>
//               ))}
//             </div>

//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  LogIn,
  LogOut,
  CheckCircle2,
  Clock3,
  User,
  Activity,
  List,
  LayoutGrid,
  Edit,
  Trash,
} from "lucide-react";
import CubaSidebar from "../../Component/sidebar/CubaSidebar";
import Preloader from "../../Component/loader/Preloader";
import Header from "../../Component/header/Header";
import { ApiGet } from "../../helper/axios";

export default function LogDetails() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // NEW STATE FOR VIEW MODE
  const [viewMode, setViewMode] = useState("board"); // "board" or "list"

  /* DATE HELPERS */
  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return `${String(d.getDate()).padStart(2, "0")}/${String(
      d.getMonth() + 1
    ).padStart(2, "0")}/${d.getFullYear()}`;
  };

  const formatTime = (dateString) => {
    const d = new Date(dateString);
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
  };

  /* FETCH LOGS */
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await ApiGet("/admin/log-details");
        const data = res?.data || [];

   const formatted = data.map((log, index) => ({
  id: log._id || index,
  doctor: log?.userId?.name || log?.roleUserId?.name || "Unknown User",
  action: log?.action?.toLowerCase() || "unknown",
  description: log?.description || "No details provided",

  // display formats
  date: formatDate(log?.createdAt),
  time: formatTime(log?.createdAt),

  // raw for sorting
  dateRaw: log?.createdAt
}));

        setLogs(formatted);
      } catch (err) {
        console.error("❌ Error fetching logs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  /* ICON LOGIC */
  const getIcon = (action) => {
    if (action.includes("login"))
      return <LogIn className="text-green-600 w-4 h-4" />;
    if (action.includes("logout"))
      return <LogOut className="text-gray-600 w-4 h-4" />;
    if (action.includes("progress"))
      return <Clock3 className="text-yellow-600 w-4 h-4" />;
    if (action.includes("resolve"))
      return <CheckCircle2 className="text-blue-600 w-4 h-4" />;
    return <Activity className="text-slate-600 w-4 h-4" />;
  };

  /* LEFT STRIP COLOR */
  const getStripColor = (action) => {
    if (action.includes("login")) return "bg-green-400";
    if (action.includes("logout")) return "bg-gray-400";
    if (action.includes("progress")) return "bg-yellow-500";
    if (action.includes("resolve")) return "bg-blue-500";
    if (action.includes("forward")) return "bg-purple-500";
    if (action.includes("escalate")) return "bg-red-500";
    return "bg-slate-400";
  };

  const sections = [
    "create",
    "view",
    "update",
    "delete",
    "forward",
    "escalate",
    "resolve",
    "inprogress",
  ];

  return (
    <section className="flex w-full h-full select-none overflow-hidden">
      <div className="flex w-full flex-col h-screen">
        <Header pageName="Log Details" />

        <div className="flex w-full h-full">
          <CubaSidebar />

          <div className="flex flex-col bg-[#f7f9fb] w-full max-h-[97%] overflow-x-auto p-[10px]">

            {loading && <Preloader />}

            {/* TOP RIGHT TOGGLE BUTTONS */}
            <div className="flex justify-end gap-4 pr-4 pb-2">
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg shadow-sm border ${
                  viewMode === "list"
                    ? "bg-gray-900 text-white"
                    : "bg-white text-gray-600"
                }`}
              >
                <List size={18} />
              </button>

              <button
                onClick={() => setViewMode("board")}
                className={`p-2 rounded-lg shadow-sm border ${
                  viewMode === "board"
                    ? "bg-gray-900 text-white"
                    : "bg-white text-gray-600"
                }`}
              >
                <LayoutGrid size={18} />
              </button>
            </div>

            {/* =============== LIST VIEW (NEW) =============== */}
       {viewMode === "list" && (
  <div className="w-full flex flex-col gap-2">

   {logs
  .sort((a, b) => new Date(b.dateRaw) - new Date(a.dateRaw))
  .map((log) => (
      <div
        key={log.id}
        className=" bg-gradient-to-r from-blue-100  to-blue-50 md34:!rounded-[12px] md11:!rounded-sm shadow-sm px-4   flex  md11:!flex-row md34:!flex-col  pt-[10px] md34:!pb-[15px] md11:!pb-[5px] gap-[10px] hover:shadow-md transition-all"
      >
        {/* TOP ICON + ACTION */}
        <div className="flex items-center gap-2 md11:!mb-1">
          {getIcon(log.action)}
          <h3 className="text-[14px] font-semibold capitalize">
            {log.action.replace(/_/g, " ")}
          </h3>
        </div>

        {/* DATE + TIME */}
        <p className="text-[11px] text-gray-500 mb-1">
          {log.date} • {log.time}
        </p>

        {/* DOCTOR */}
        <div className="flex items-center gap-2 text-[13px] font-medium text-gray-800 mb-1">
          <User className="w-4 h-4 text-gray-600" />
          {log.doctor}
        </div>

        {/* DESCRIPTION */}
        <p className="text-[12px] text-gray-600 leading-snug">
          {log.description}
        </p>
      </div>
    ))}

  </div>
)}


            {/* =============== BOARD VIEW (CURRENT DESIGN) =============== */}
            {viewMode === "board" && (
              <div className="flex gap-[20px] overflow-x-auto h-[100%] pb-3 pt-1">
                {sections.map((sectionName) => {
                  const sectionLogs = logs
  .filter((l) => l.action.includes(sectionName))
  .sort((a, b) => new Date(b.dateRaw) - new Date(a.dateRaw)); // latest first


                  return (
                    <div
                      key={sectionName}
                      className="w-[350px] flex-shrink-0 flex flex-col gap-[10px]"
                    >
                      {/* HEADER */}
                      <div className="py-[7px] bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white text-center font-semibold rounded-b-[30px]">
                        {sectionName.toUpperCase()}
                      </div>

                      {/* LIST */}
                      <div className="flex flex-col gap-[8px] px-[10px] pb-3 max-h-[80vh] overflow-y-auto">
                        {sectionLogs.map((log) => (
                          <motion.div
                            key={log.id}
                            initial={{ opacity: 0, scale: 0.97 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.2 }}
                            className="relative p-3 rounded-[10px] overflow-hidden bg-gray-50 min-h-[125px] !h-fit shadow-md border hover:bg-white hover:shadow-md transition-all"
                          >
                            {/* Left Strip */}
                            <div
                              className={`absolute left-0 top-0 h-full w-[5px] rounded-l-xl  bg-gradient-to-t from-blue-500 via-purple-500 to-pink-500 ${getStripColor(
                                log.action
                              )}`}
                            />

                            {/* Header */}
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                {getIcon(log.action)}
                                <h3 className="text-[13px] font-semibold capitalize">
                                  {log.action.replace(/_/g, " ")}
                                </h3>
                              </div>
                              <span className="text-[10px] text-gray-500">
                                {log.date}
                              </span>
                            </div>

                            {/* Body */}
                            <div className="text-[12px] text-gray-800 mb-1">
                              <User className="w-3 h-3 inline-block mr-1 text-gray-600" />
                              {log.doctor}
                            </div>

                            <p className="text-[11px] text-gray-600">
                              {log.description}
                            </p>

                            <p className="mt-1 text-[10px] text-gray-500">
                              Time: {log.time}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
