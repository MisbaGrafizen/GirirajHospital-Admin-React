import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock, User, Phone, Bed, Eye, Download, Search,


  Stethoscope,

  MoreVertical,
  Edit2,
  Trash2,
} from "lucide-react";
import * as XLSX from "xlsx";
import { ApiGet } from "../../helper/axios";
import { useNavigate } from "react-router-dom";

export default function IpdList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [feedbackData, setFeedbackData] = useState([]);
  const [loading, setLoading] = useState(true);
const navigate = useNavigate();

  const rowColors = [
    "bg-white",
    "bg-gray-50",
  ];

  useEffect(() => {
    const fetchIpdFeedback = async () => {
      try {
        setLoading(true);
        const res = await ApiGet("/admin/ipd-patient");
        const allFeedback = res?.data?.patients || [];

        // Sort by created date (latest first)
        const sorted = allFeedback.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        // Keep only latest 5
        setFeedbackData(sorted.slice(0, 5));
      } catch (err) {
        console.error("❌ Failed to fetch IPD feedback:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchIpdFeedback();
  }, []);

  // 🧮 Compute average rating from nested ratings object
  const calculateAverageRating = (ratingsObj = {}) => {
    const values = Object.values(ratingsObj).filter((v) => typeof v === "number");
    if (values.length === 0) return 0;
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    return parseFloat(avg.toFixed(1));
  };

  // 🔍 Search Filter
  const filteredFeedback = feedbackData.filter((fb) => {
    const q = searchTerm.toLowerCase();
    return (
      fb.patientName?.toLowerCase().includes(q) ||
      fb.contact?.includes(searchTerm) ||
      fb.bedNo?.includes(searchTerm)
    );
  });

  // 🧮 Global average rating (of displayed)
  const overallAverage = useMemo(() => {
    if (filteredFeedback.length === 0) return 0;
    const allAverages = filteredFeedback.map((fb) =>
      calculateAverageRating(fb.ratings)
    );
    const sum = allAverages.reduce((a, b) => a + b, 0);
    return parseFloat((sum / allAverages.length).toFixed(1));
  }, [filteredFeedback]);

  // ⏰ Format date
  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ⭐ Rating stars
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

  // 👁️ Row click
  const handleIpdFeedbackDetails = (fb) => {
    alert(`Viewing feedback for ${fb.patientName}\nAverage Rating: ${calculateAverageRating(fb.ratings)}`);
  };

  // 📤 Export
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(feedbackData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "IPD Feedback");
    XLSX.writeFile(wb, "IPD_Feedback_List.xlsx");
  };

  const handlenavigate = () => {
    
  };

  return (
    <>
      <div className=" rounded-xl   overflow-hidden">
        {/* ---------- Header ---------- */}
        <div className=" px-2 border-gray-200 flex flex-col sm:flex-row justify-between items-center">
          <div className="flex gap-[10px] items-center py-[10px] justify-start">
            <div className="w-[35px] h-[35px] bg-gradient-to-br from-blue-500 to-pink-500 rounded-md flex items-center justify-center">
              <i className="fa-regular fa-users-medical text-[15px] text-[#fff]" />
            </div>
            <h3 className="text-[15px] font-[400] text-gray-900">IPD Feedback</h3>
          </div>

          <div className="flex flex-row justify-between gap-2 ">
            <div className="relative">
              <Search className="absolute left-3 top-[50%] transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search feedback..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-[6px] py-[6px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-[10px] items-center">
              <button
                onClick={exportToExcel}
                className="flex items-center px-2 py-[7px] bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
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
        {/* <div className="overflow-x-auto">
          <table className="min-w-[1200px] md11:!min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-[10px] text-left text-xs font-medium text-gray-500 uppercase border-r">
                  Date & Time
                </th>
                <th className="px-6 py-[10px] text-left text-xs font-medium text-gray-500 uppercase border-r">
                  Patient Name
                </th>
                <th className="px-6 py-[10px] text-left text-xs font-medium text-gray-500 uppercase border-r">
                  Contact
                </th>
                <th className="px-6 py-[10px] text-left text-xs font-medium text-gray-500 uppercase border-r">
                  Bed No
                </th>
                <th className="px-6 py-[10px] text-left text-xs font-medium text-gray-500 uppercase border-r">
                  Doctor Name
                </th>
                <th className="px-6 py-[10px] text-left text-xs font-medium text-gray-500 uppercase border-r">
                  Avg Rating
                </th>
                <th className="px-6 py-[10px] text-left text-xs font-medium text-gray-500 uppercase">
                  Comment
                </th>
              </tr>
            </thead>

            <tbody className="bg-white">
              {filteredFeedback.map((fb, index) => {
                const avgRating = calculateAverageRating(fb.ratings);
                return (
                  <tr
                    key={fb._id || index}
                    onClick={() => handleIpdFeedbackDetails(fb)}
                    className={`${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-blue-50 cursor-pointer transition`}
                  >
                    <td className="px-4 py-2 text-sm text-gray-900 border-r">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 text-gray-400 mr-2" />
                        {formatDate(fb.createdAt)}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900 border-r">
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-gray-400 mr-2" />
                        {fb.patientName}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900 border-r">
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 text-gray-400 mr-2" />
                        {fb.contact}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900 border-r">
                      <div className="flex items-center">
                        <Bed className="w-4 h-4 text-gray-400 mr-2" />
                        {fb.bedNo}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900 border-r">
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-gray-400 mr-2" />
                        {fb.consultantDoctorName?.name || "-"}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900 border-r">
                      <div className="flex items-center">
                        {getRatingStars(avgRating)}
                        <span className="ml-2 text-sm font-medium">
                          {avgRating}/5
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {fb.comments || "-"}
                    </td>
                  </tr>
                );
              })}

              {filteredFeedback.length === 0 && (
                <tr>
                  <td
                    colSpan="7"
                    className="text-center py-4 text-gray-500 text-sm"
                  >
                    No feedback found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div> */}


        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200"
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              {/* 🔹 Header */}
              <thead>
                <tr className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
                  <th className="px-3 py-[13px] text-left text-[11px] w-[130px] font-[600] text-white">DATE & TIME</th>
                  <th className="px-6 py-[13px] text-left text-[11px] font-[600] text-white">PATIENT NAME</th>
                  <th className="px-6 py-[13px] text-left text-[11px] font-[600] text-white">CONTACT</th>
                  <th className="px-2 py-[13px] text-left text-[11px] font-[600] w-[100px] text-white">BED NO</th>
                  <th className="px-6 py-[13px] text-left text-[11px] font-[600] w-[160px] text-white">DOCTOR NAME</th>
                  <th className="px-6 py-[13px] text-left text-[11px] font-[600] text-white">AVG RATING</th>
                  <th className="px-6 py-[13px] text-left text-[11px] font-[600] text-white">COMMENT</th>
                  <th className="px-6 py-[13px] text-center text-[11px] font-[600] text-white">ACTIONS</th>
                </tr>
              </thead>

              {/* 🔹 Body */}
              <tbody>
                <AnimatePresence>
                  {filteredFeedback.map((fb, index) => {
                    const avgRating = calculateAverageRating(fb.ratings);

                    return (
                      <motion.tr
                        key={fb._id || index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: index * 0.05 }}

                        className={`border-b border-gray-200 hover:shadow-md cursor-pointer transition-all ${rowColors[index % rowColors.length]}`}
                      >
                        {/* 🕒 Date & Time */}
                        <td className="px-2 py-2">
                          <div className="flex items-center gap-2 text-gray-700">
                            <Clock size={16} className="text-blue-500 flex" />
                            <div>
                              <p className="text-[10px]  flex-shrink-0  leading-[10px] font-[500]">
                                {formatDate(fb.createdAt)}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* 👤 Patient Name */}
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <div className="w-[26px] h-[26px] rounded-full flex-shrink-0 text-[10px] bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-[600] shadow-md">
                              {fb.patientName?.charAt(0)?.toUpperCase() || "?"}
                            </div>
                            <span className="text-gray-900 font-[500] text-[14px] leading-[16px]">
                              {fb.patientName || "-"}
                            </span>
                          </div>
                        </td>

                        {/* ☎️ Contact */}
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2 text-gray-700">
                            <Phone size={15} className="text-emerald-500" />
                            <span className="font-medium text-[13px]">
                              {fb.contact || "-"}
                            </span>
                          </div>
                        </td>

                        {/* 🛏 Bed No */}
                        <td className="px-2 py-2">
                          <div className="flex items-center gap-2 text-gray-700">
                            <Bed size={16} className="text-orange-500" />
                            <span className="font-medium">
                              {fb.bedNo || "-"}
                            </span>
                          </div>
                        </td>

                        {/* 🩺 Doctor */}
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2 text-gray-700">
                            <Stethoscope size={15} className="text-purple-500 flex-shrink-0" />
                            <span className="font-medium  text-[12px] flex-shrink-0">
                              {fb.consultantDoctorName?.name || "-"}
                            </span>
                          </div>
                        </td>

                        {/* ⭐ Rating */}
                        <td className="px-6 py-2">
                          <div className="flex items-center">
                            {getRatingStars(avgRating)}
                            <span className="ml-2 text-sm font-medium text-gray-600">
                              {avgRating}/5
                            </span>
                          </div>
                        </td>

                        {/* 💬 Comment */}
                        <td className="px-6 py-2 text-gray-600 text-sm">
                          {fb.comments || "-"}
                        </td>

                        {/* ⚙️ Actions */}
                        <td className="px-6 py-2">
                          <div className="flex items-center justify-center gap-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleIpdFeedbackDetails(fb);
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

                  {/* 🕳️ Empty State */}
                  {filteredFeedback.length === 0 && (
                    <tr>
                      <td
                        colSpan="8"
                        className="text-center py-6 text-gray-500 text-sm"
                      >
                        No feedback found.
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </>
  );
}
