import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  LogIn,
  LogOut,
  CheckCircle2,
  Clock3,
  User,
  Activity,
} from "lucide-react";
import CubaSidebar from "../../Component/sidebar/CubaSidebar";
import Preloader from "../../Component/loader/Preloader";
import Header from "../../Component/header/Header";
import { ApiGet } from "../../helper/axios";

export default function LogDetails() {
  const [logs, setLogs] = useState();
  const [loading, setLoading] = useState(true);

  /* ------------------------------------------------
     ✅ Format helpers for date & time
  ------------------------------------------------ */
  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";
    const d = new Date(dateString);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatTime = (dateString) => {
    if (!dateString) return "Unknown";
    const d = new Date(dateString);
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
  };

  /* ------------------------------------------------
     ✅ Fetch logs from backend
  ------------------------------------------------ */
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) return;

        const res = await ApiGet(`/admin/activity-log/${userId}`);
        console.log('res', res)
        const data = res?.data || [];

        // Normalize and format
        const formatted = data.map((log, i) => ({
          id: log._id || i + 1,
          doctor: log.userName || log.user?.name || "Unknown User",
          action: log.action || "Unknown",
          date: formatDate(log.createdAt),
          time: formatTime(log.createdAt),
        }));

        setLogs(formatted.reverse()); // latest on top
      } catch (err) {
        console.error("❌ Failed to fetch logs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  /* ------------------------------------------------
     🎨 Color theme logic based on action type
  ------------------------------------------------ */
  const getColor = (action) => {
    if (!action) return "border-slate-300 bg-slate-50 text-slate-700";
    if (action.includes("login")) return "border-green-500/40 bg-green-50 text-green-700";
    if (action.includes("logout")) return "border-gray-400/40 bg-gray-50 text-gray-700";
    if (action.includes("in_progress") || action.includes("progress"))
      return "border-yellow-500/40 bg-yellow-50 text-yellow-700";
    if (action.includes("resolve")) return "border-blue-500/40 bg-blue-50 text-blue-700";
    if (action.includes("escalate")) return "border-red-500/40 bg-red-50 text-red-700";
    if (action.includes("forward")) return "border-purple-500/40 bg-purple-50 text-purple-700";
    return "border-slate-400/40 bg-slate-50 text-slate-700";
  };

  /* ------------------------------------------------
     🧩 Icon logic per log type
  ------------------------------------------------ */
  const getIcon = (action) => {
    if (!action) return <Activity className="text-slate-600 w-5 h-5" />;
    if (action.includes("login")) return <LogIn className="text-green-600 w-5 h-5" />;
    if (action.includes("logout")) return <LogOut className="text-gray-600 w-5 h-5" />;
    if (action.includes("progress")) return <Clock3 className="text-yellow-600 w-5 h-5" />;
    if (action.includes("resolve")) return <CheckCircle2 className="text-blue-600 w-5 h-5" />;
    return <Activity className="text-slate-600 w-5 h-5" />;
  };

  return (
    <section className="flex w-full h-full select-none overflow-hidden">
      <div className="flex w-full flex-col h-screen">
        <Header pageName="Log Details" />
        <div className="flex w-full h-full">
          <CubaSidebar />
          <div className="flex flex-col bg-[#f7f9fb] w-full relative max-h-[93%] pb-[10px] overflow-y-auto gap-[16px] p-[10px]">
            {loading && <Preloader />}

            {/* Empty State */}
            {!loading && logs.length === 0 && (
              <div className="flex flex-col items-center justify-center text-gray-500 h-full">
                <Activity className="w-10 h-10 mb-3 text-gray-400" />
                <p className="text-sm">No activity logs found.</p>
              </div>
            )}

            {/* Logs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {logs?.map((log) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`rounded-xl border p-3 shadow-sm hover:shadow-md transition-all ${getColor(
                    log.action
                  )}`}
                >
                  {/* Top Row */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getIcon(log.action)}
                      <h3 className="font-semibold text-[15px] capitalize">
                        {log.action.replace(/_/g, " ")}
                      </h3>
                    </div>
                    <span className="text-[10px] text-gray-500 font-medium">
                      {log.date}
                    </span>
                  </div>

                  {/* Doctor Info */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
                        <User className="w-4 h-4 text-gray-600" />
                        {log.doctor}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Activity Time: {log.time}
                      </p>
                    </div>

                    {/* Status */}
                    <div className="text-right text-[12px] mt-1 text-gray-400 italic">
                      {log.action.includes("resolve") ? (
                        <span className="flex items-center gap-1 text-blue-600">
                          <CheckCircle2 size={14} /> Closed
                        </span>
                      ) : log.action.includes("progress") ? (
                        <span className="flex items-center gap-1 text-yellow-600">
                          <Clock3 size={14} /> Ongoing
                        </span>
                      ) : log.action.includes("login") ? (
                        <span className="flex items-center gap-1 text-green-600">
                          <LogIn size={14} /> Active
                        </span>
                      ) : log.action.includes("logout") ? (
                        <span className="flex items-center gap-1 text-gray-600">
                          <LogOut size={14} /> Session Ended
                        </span>
                      ) : null}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
