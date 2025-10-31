import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Preloader from "../../Component/loader/Preloader";
import Header from "../../Component/header/Header";
import CubaSidebar from "../../Component/sidebar/CubaSidebar";
import { Search, Clock, User, Phone, Bed } from "lucide-react";

export default function OpdIpdAllDetails() {
  const [activeType, setActiveType] = useState("IPD");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // --- Sample Data ---
  const ipdFeedback = [
    {
      id: 1,
      createdAt: new Date(),
      patient: "Amit",
      contact: "9876543210",
      bedNo: "B-102",
      consultantDoctorName: "Dr. Patel",
      rating: 4,
      comments: "Good service",
    },
  ];

  const opdFeedback = [
    {
      id: 2,
      createdAt: new Date(),
      patient: "Kiran",
      contact: "9876543211",
      consultantDoctorName: "Dr. Shah",
      rating: 5,
      comments: "Excellent staff",
    },
  ];

  // --- Helpers ---
  const formatDate = (date) =>
    new Date(date).toLocaleString("en-IN", {
      dateStyle: "short",
      timeStyle: "short",
    });

  const getRatingStars = (rating) =>
    "⭐".repeat(Math.floor(rating)) + (rating % 1 !== 0 ? "½" : "");

  const filteredFeedback = (activeType === "IPD" ? ipdFeedback : opdFeedback).filter(
    (fb) => fb.patient.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- On Row Click ---
  const handleRowClick = (fb) => {
    if (activeType === "IPD") {
      navigate(`/ipd-details/${fb.id}`, { state: { feedback: fb } });
    } else {
      navigate(`/opd-details/${fb.id}`, { state: { feedback: fb } });
    }
  };

  return (
    <>
      <section className="flex w-full h-full select-none overflow-hidden">
        <div className="flex w-full flex-col gap-0 h-screen">
          <Header pageName="IPD / OPD List" />
          <div className="flex w-full h-full">
            <CubaSidebar />
            <div className="flex flex-col w-full bg-white relative max-h-[93%] overflow-y-auto gap-4 rounded-[10px]">
              <Preloader />

              {/* 🔘 Modern Slide Toggle + Search */}
              <div className="flex items-center justify-between px-3 py-3 border-b border-gray-200 bg-gray-50 sticky top-0 z-10">
                {/* Toggle */}
                <div className="relative flex items-center justify-center bg-gray-200 rounded-full w-[130px] h-[40px] p-[4px] cursor-pointer select-none">
                  <div
                    className={`absolute top-[4px] left-[4px] h-[32px] w-[60px] bg-[#000dff] rounded-full transition-all duration-300 ${
                      activeType === "OPD" ? "translate-x-[62px]" : "translate-x-0"
                    }`}
                  ></div>

                  <div
                    onClick={() => setActiveType("IPD")}
                    className={`z-10 flex-1 text-center font-medium text-sm transition-all duration-300 ${
                      activeType === "IPD" ? "text-white" : "text-gray-700"
                    }`}
                  >
                    IPD
                  </div>
                  <div
                    onClick={() => setActiveType("OPD")}
                    className={`z-10 flex-1 text-center font-medium text-sm transition-all duration-300 ${
                      activeType === "OPD" ? "text-white" : "text-gray-700"
                    }`}
                  >
                    OPD
                  </div>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder={`Search ${activeType} feedback...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-3 py-2 w-[220px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* 🩺 Feedback Table */}
              <div className="bg-white rounded-xl border shadow-sm  w-[90%] mx-auto overflow-hidden">
                <div className=" w-[100%] overflow-x-auto ">
                  <table className=" w-[100%]">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase border-r">
                          Date & Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase border-r">
                          Patient Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase border-r">
                          Contact
                        </th>
                        {activeType === "IPD" && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase border-r">
                            Bed No
                          </th>
                        )}
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase border-r">
                          Doctor Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase border-r">
                          Rating
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Comment
                        </th>
                      </tr>
                    </thead>

                    <tbody className="bg-white">
                      {filteredFeedback.map((fb, index) => (
                        <tr
                          key={fb.id}
                          onClick={() => handleRowClick(fb)}
                          className={`cursor-pointer ${
                            index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          } hover:bg-blue-50 transition`}
                        >
                          <td className="px-6 py-3 text-[15px] text-gray-700 border-r">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-gray-400" />
                              {formatDate(fb.createdAt)}
                            </div>
                          </td>
                          <td className="px-6 py-3 text-[15px] text-gray-700 border-r">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-400" />
                              {fb.patient}
                            </div>
                          </td>
                          <td className="px-6 py-3 text-[15px] text-gray-700 border-r">
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-gray-400" />
                              {fb.contact}
                            </div>
                          </td>

                          {activeType === "IPD" && (
                            <td className="px-6 py-3 text-[15px] text-gray-700 border-r">
                              <div className="flex items-center gap-2">
                                <Bed className="w-4 h-4 text-gray-400" />
                                {fb.bedNo}
                              </div>
                            </td>
                          )}

                          <td className="px-6 py-3 text-[15px] text-gray-700 border-r">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-400" />
                              {fb.consultantDoctorName}
                            </div>
                          </td>

                          <td className="px-6 py-3 text-[15px] text-gray-700 border-r">
                            <div className="flex items-center">
                              {getRatingStars(fb.rating)}
                              <span className="ml-2">{fb.rating}/5</span>
                            </div>
                          </td>

                          <td className="px-6 py-3 text-[15px] text-gray-700">
                            {fb.comments || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
