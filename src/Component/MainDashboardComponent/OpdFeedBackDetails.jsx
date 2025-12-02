import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {
  Calendar,
  User,
  Phone,
  Download,
  Eye,
  Stethoscope,
  Search,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as XLSX from "xlsx";
import { ApiGet } from "../../helper/axios"; // ✅ adjust the import path if needed

export default function OpdFeedBackDetails() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [feedbackData, setFeedbackData] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🧠 Fetch OPD Feedbacks from Backend
  useEffect(() => {
    const fetchOpdFeedback = async () => {
      try {
        setLoading(true);
        const res = await ApiGet("/admin/opd-patient"); // ✅ backend endpoint for OPD feedback
        const allFeedback = res?.data || [];

        // ✅ Sort by createdAt (latest first)
        const sorted = allFeedback.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        // ✅ Keep only top 5
        setFeedbackData(sorted.slice(0, 5));
      } catch (err) {
        console.error("❌ Failed to fetch OPD feedback:", err);
        setError("Failed to fetch OPD feedbacks.");
      } finally {
        setLoading(false);
      }
    };

    fetchOpdFeedback();
  }, []);

  // 🔍 Filtered Data
  // 🔍 Search Filter
  const filteredFeedback = feedbackData.filter((fb) => {
    const q = searchTerm.toLowerCase();
    return (
      fb.patientName?.toLowerCase().includes(q) ||
      fb.contact?.includes(searchTerm)
    );
  });

  // 🕒 Format Date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ⭐ Rating stars generator
  const getRatingStars = (rating) => {
    const rounded = Math.round(rating || 0);
    return (
      <div className="flex text-yellow-500">
        {[...Array(5)].map((_, i) => (
          <i
            key={i}
            className={`fa-solid fa-star ${i < rounded ? "" : "text-gray-300"}`}
          ></i>
        ))}
      </div>
    );
  };

  const calculateAverageRating = (ratingsObj = {}) => {
    const values = Object.values(ratingsObj).filter((v) => typeof v === "number");
    if (values.length === 0) return 0;
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    return parseFloat(avg.toFixed(1));
  };

  const openFeedbackDetails = (feedback) => {
    // ✅ Save to sessionStorage for reload persistence
    sessionStorage.setItem("opdFeedback:last", JSON.stringify({ id: feedback._id }));

    // ✅ Navigate to the details route
    navigate("/opd-feedback-details", { state: { id: feedback._id } });
  };



  // 📤 Export to Excel
  const exportToExcel = () => {
    try {
      const ws = XLSX.utils.json_to_sheet(feedbackData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "OPD Feedback");
      XLSX.writeFile(wb, "OPD_Feedback_List.xlsx");
    } catch (err) {
      setError("Error exporting file. Please try again.");
    }
  };

  // 🔗 Dummy Navigate button
  const handlenavigate = () => {
    navigate("/dashboards/opd-all-list")
  };

  return (
    <>
      <div className=" rounded-lg  overflow-hidden">
        {/* ---------- Header ---------- */}
        <div className="px-2 border-gray-200 flex  sm:flex-row justify-between  items-center">
          <div className="flex gap-[10px] items-center py-[9px] justify-start">
            <div className="w-[35px] h-[35px] bg-gradient-to-br from-blue-500 to-pink-500 rounded-md flex items-center justify-center">
              <i className="fa-regular fa-users-medical text-[15px] text-[#fff]" />
            </div>
            <h3 className="text-[15px] font-[400] text-gray-900">
              OPD Feedback
            </h3>
          </div>

          {/* ---------- Search + Buttons ---------- */}
          <div className="flex flex-row items-center gap-2">
            <div className="relative md:!flex md34:!hidden">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search feedback..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-3 py-[5px] border border-gray-300 rounded-md focus:outline-none focus:ring-[1.3px] focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-[10px]">
              <button
                onClick={exportToExcel}
                className="items-center flex  px-2 py-[6px] w-[140px] bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Export to Excel
              </button>

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
        <div className="overflow-x-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200"
          >
            <table className="w-full min-w-[1000px]">
              {/* 🔹 HEADER */}
              <thead>
                <tr className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500">
                  <th className="px-3 py-[13px] text-left text-[11px] w-[140px] font-[600] text-white">
                    DATE & TIME
                  </th>
                  <th className="px-6 py-[13px] text-left text-[11px] font-[600] text-white">
                    PATIENT NAME
                  </th>
                  <th className="px-6 py-[13px] text-left text-[11px] font-[600] text-white">
                    CONTACT
                  </th>
                  <th className="px-6 py-[13px] text-left text-[11px] font-[600] text-white">
                    DOCTOR
                  </th>
                  <th className="px-6 py-[13px] text-left text-[11px] font-[600] text-white">
                    RATING
                  </th>
                  <th className="px-6 py-[13px] text-left text-[11px] font-[600] text-white">
                    COMMENT
                  </th>
                  <th className="px-6 py-[13px] text-center text-[11px] font-[600] text-white">
                    ACTIONS
                  </th>
                </tr>
              </thead>

              {/* 🔹 BODY */}
              <tbody>
                <AnimatePresence>
                  {filteredFeedback.map((feedback, index) => {
                    const avgRating = calculateAverageRating(feedback.ratings);

                    return (
                      <motion.tr
                        key={feedback._id || index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          openFeedbackDetails(feedback);
                        }}
                        className={`border-b border-gray-200 hover:shadow-md transition-all ${index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          } cursor-pointer`}
                      >
                        {/* 🕒 DATE & TIME */}
                        <td className="px-2 py-2 text-sm text-gray-900">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-500" />
                            <span className="text-[11px]  leading-4 font-[500]">
                              {formatDate(feedback.createdAt)}
                            </span>
                          </div>
                        </td>

                        {/* 👤 PATIENT NAME */}
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-2">
                            <div className="w-[28px] h-[28px] rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-[11px] font-[600] shadow-sm">
                              {feedback.patient?.charAt(0)?.toUpperCase() ||
                                feedback.patientName?.charAt(0)?.toUpperCase() ||
                                "?"}
                            </div>
                            <span className="text-gray-900 font-[500] text-[13px] leading-[15px]">
                              {feedback.patient || feedback.patientName || "-"}
                            </span>
                          </div>
                        </td>

                        {/* ☎️ CONTACT */}
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-2 text-gray-700">
                            <Phone size={15} className="text-emerald-500" />
                            <span className="text-[13px]">{feedback.contact || "-"}</span>
                          </div>
                        </td>

                        {/* 🩺 DOCTOR */}
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-2 text-gray-700">
                            <Stethoscope size={15} className="text-purple-500" />
                            <span className="text-[13px] font-[500]">
                              {feedback.doctor ||
                                feedback.consultantDoctorName?.name ||
                                "-"}
                            </span>
                          </div>
                        </td>

                        {/* ⭐ RATING */}
                        <td className="px-4 py-2 text-sm text-gray-900">
                          <div className="flex items-center">
                            {getRatingStars(avgRating)}
                            <span className="ml-2 text-sm font-medium text-gray-600">
                              {avgRating}/5
                            </span>
                          </div>
                        </td>

                        {/* 💬 COMMENT */}
                        <td className="px-4 py-2 text-gray-700 text-[12px] max-w-[200px] truncate">
                          <div title={feedback.comment || "-"}>
                            {feedback.comment || "-"}
                          </div>
                        </td>

                        {/* ⚙️ ACTIONS */}
                        <td className="px-4 py-2">
                          <div className="flex justify-center">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                openFeedbackDetails(feedback);
                              }}
                              className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                            >
                              <Eye size={18} className="text-blue-500" />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </motion.div>
        </div>

        {error && <div className="text-red-600 text-sm mt-3 px-6">{error}</div>}
      </div>
    </>
  );
}
