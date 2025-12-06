
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
} from "lucide-react";
import CubaSidebar from "../../Component/sidebar/CubaSidebar";
import Preloader from "../../Component/loader/Preloader";
import Header from "../../Component/header/Header";
import { ApiGet } from "../../helper/axios";

export default function LogDetails() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [viewMode, setViewMode] = useState("board");

  /* --- FORMATTERS --- */
  const formatDate = (d) =>
    `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}/${d.getFullYear()}`;

  const formatTime = (d) => {
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

        const formatted = data.map((log, idx) => {
          const d = new Date(log.createdAt);
          return {
            id: log._id || idx,
            doctor:
              log?.userId?.name || log?.roleUserId?.name || "Unknown User",
            action: log?.action?.toLowerCase() || "unknown",
            description: log?.description || "No details provided",
            date: formatDate(d),
            time: formatTime(d),
            dateRaw: d, // required for sorting logic
          };
        });

        // newest first
        setLogs(
  formatted.sort((a, b) => b.dateRaw - a.dateRaw)
);
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
    if (action.includes("forward"))
      return <Activity className="text-purple-600 w-4 h-4" />;
    if (action.includes("escalate"))
      return <Activity className="text-red-600 w-4 h-4" />;

    return <Activity className="text-slate-600 w-4 h-4" />;
  };

  const getStripColor = (action) => {
    if (action.includes("login")) return "bg-green-400";
    if (action.includes("logout")) return "bg-gray-400";
    if (action.includes("progress")) return "bg-yellow-500";
    if (action.includes("resolve")) return "bg-blue-500";
    if (action.includes("forward")) return "bg-purple-500";
    if (action.includes("escalate")) return "bg-red-500";

    return "bg-slate-400";
  };

  /*--------------------------------------
    🔥 AUTO-SORT SECTIONS BY LATEST ACTION
  ---------------------------------------*/
  const uniqueActions = [...new Set(logs.map((l) => l.action))];

  const actionLatestTime = {};
  logs.forEach((l) => {
    if (!actionLatestTime[l.action] || l.dateRaw > actionLatestTime[l.action]) {
      actionLatestTime[l.action] = l.dateRaw;
    }
  });

  const sections = uniqueActions.sort(
    (a, b) => actionLatestTime[b] - actionLatestTime[a]
  );

  return (
    <section className="flex w-full h-full select-none overflow-hidden">
      <div className="flex w-full flex-col h-screen">
        <Header pageName="Log Details" />

        <div className="flex w-full h-full">
          <CubaSidebar />

          <div className="flex flex-col bg-[#f7f9fb] w-full p-[10px] max-h-[97%] overflow-x-auto">
            {loading && <Preloader />}

            {/* Toggle Buttons */}
            <div className="flex justify-end gap-4 pr-4 pb-2">
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg border ${
                  viewMode === "list"
                    ? "bg-gray-900 text-white"
                    : "bg-white text-gray-600"
                }`}
              >
                <List size={18} />
              </button>

              <button
                onClick={() => setViewMode("board")}
                className={`p-2 rounded-lg border ${
                  viewMode === "board"
                    ? "bg-gray-900 text-white"
                    : "bg-white text-gray-600"
                }`}
              >
                <LayoutGrid size={18} />
              </button>
            </div>

            {/* LIST VIEW */}
            {viewMode === "list" && (
              <div className="w-full flex flex-col gap-2">
                {logs.map((log) => (
                  <div key={log.id} className="bg-blue-50 rounded px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                      {getIcon(log.action)}
                      <h3 className="text-[14px] font-semibold capitalize">
                        {log.action.replace(/_/g, " ")}
                      </h3>
                    </div>

                    <div className="text-[11px] text-gray-500 mb-1">
                      {log.date} • {log.time}
                    </div>

                    <div className="flex items-center gap-2 text-[13px] font-medium text-gray-800 mb-1">
                      <User className="w-4 h-4 text-gray-600" />
                      {log.doctor}
                    </div>

                    <p className="text-[12px] text-gray-600">{log.description}</p>
                  </div>
                ))}
              </div>
            )}

            {/* BOARD VIEW */}
            {viewMode === "board" && (
              <div className="flex gap-[20px] overflow-x-auto pb-3 pt-1">
                {sections.map((sectionName) => {
                  const sectionLogs = logs.filter((l) =>
                    l.action.includes(sectionName)
                  );

                  return (
                    <div
                      key={sectionName}
                      className="w-[350px] flex-shrink-0 flex flex-col gap-[10px]"
                    >
                      {/* Column Header */}
                      <div className="py-[7px] bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white text-center font-semibold rounded-b-[30px]">
                        {sectionName.toUpperCase()}
                      </div>

                      {/* Logs */}
                      <div className="flex flex-col gap-[8px] px-[10px] max-h-[85vh] overflow-y-auto">
                        {sectionLogs.map((log) => (
                          <motion.div
                            key={log.id}
                            initial={{ opacity: 0, scale: 0.97 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.2 }}
                            className="relative p-3 rounded-[10px] bg-gray-50 shadow-md border hover:bg-white"
                          >
                            <div
                              className={`absolute left-0 top-0 h-full w-[5px] rounded-l-xl ${getStripColor(
                                log.action
                              )}`}
                            />

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

                            <div className="text-[12px] text-gray-800 mb-1">
                              <User className="w-3 h-3 inline mr-1" />
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
