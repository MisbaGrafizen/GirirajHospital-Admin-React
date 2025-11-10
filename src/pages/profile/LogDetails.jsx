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

export default function LogDetails() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    // Example static data (replace with API later)
    setLogs([
      {
        id: 1,
        doctor: "Dr. Mehul Patel",
        action: "Login",
        date: "2025-11-08",
        time: "09:10 AM",
      },
      {
        id: 2,
        doctor: "Dr. Mehul Patel",
        action: "Complaint In Progress",
        date: "2025-11-08",
        time: "10:20 AM",
      },
      {
        id: 3,
        doctor: "Dr. Mehul Patel",
        action: "Complaint Resolved",
        date: "2025-11-08",
        time: "12:05 PM",
      },
      {
        id: 4,
        doctor: "Dr. Mehul Patel",
        action: "Logout",
        date: "2025-11-08",
        time: "06:15 PM",
      },
    ]);
  }, []);

  // --- Color theme logic based on action type ---
  const getColor = (action) => {
    switch (action) {
      case "Login":
        return "border-green-500/40 bg-green-50 text-green-700";
      case "Logout":
        return "border-gray-400/40 bg-gray-50 text-gray-700";
      case "Complaint In Progress":
        return "border-yellow-500/40 bg-yellow-50 text-yellow-700";
      case "Complaint Resolved":
        return "border-blue-500/40 bg-blue-50 text-blue-700";
      default:
        return "border-slate-400/40 bg-slate-50 text-slate-700";
    }
  };

  // --- Icon logic per log type ---
  const getIcon = (action) => {
    switch (action) {
      case "Login":
        return <LogIn className="text-green-600 w-5 h-5" />;
      case "Logout":
        return <LogOut className="text-gray-600 w-5 h-5" />;
      case "Complaint In Progress":
        return <Clock3 className="text-yellow-600 w-5 h-5" />;
      case "Complaint Resolved":
        return <CheckCircle2 className="text-blue-600 w-5 h-5" />;
      default:
        return <Activity className="text-slate-600 w-5 h-5" />;
    }
  };

  return (
    <section className="flex w-full h-full select-none overflow-hidden">
      <div className="flex w-full flex-col h-screen">
        <Header pageName="Log Details" />
        <div className="flex w-full h-full">
          <CubaSidebar />
          <div className="flex flex-col bg-[#f7f9fb] w-full relative max-h-[93%] pb-[10px] overflow-y-auto gap-[16px] p-[10px]">
            <Preloader />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {logs.map((log) => (
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
                        {log.action}
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
                      {log.action === "Complaint Resolved" ? (
                        <span className="flex items-center gap-1 text-blue-600">
                          <CheckCircle2 size={14} /> Closed
                        </span>
                      ) : log.action === "Complaint In Progress" ? (
                        <span className="flex items-center gap-1 text-yellow-600">
                          <Clock3 size={14} /> Ongoing
                        </span>
                      ) : log.action === "Login" ? (
                        <span className="flex items-center gap-1 text-green-600">
                          <LogIn size={14} /> Active
                        </span>
                      ) : log.action === "Logout" ? (
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
