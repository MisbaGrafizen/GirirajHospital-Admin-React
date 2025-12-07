import React, { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Preloader from "../../Component/loader/Preloader";
import Header from "../../Component/header/Header";
import CubaSidebar from "../../Component/sidebar/CubaSidebar";
import { Search, CalendarClock, User, Phone, Bed, Stethoscope } from "lucide-react";
import { ApiGet } from "../../helper/axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { MdStar, MdStarHalf, MdStarBorder } from "react-icons/md";

import {
  faStar as solidStar,
  faStarHalfStroke as halfStar,
} from "@fortawesome/free-solid-svg-icons";
import { faStar as regularStar } from "@fortawesome/free-regular-svg-icons";

export default function OpdIpdAllDetails() {
  const location = useLocation();

  const [activeType, setActiveType] = useState(
    location.state?.select === "OPD"
      ? "OPD"
      : location.state?.select === "IPD"
      ? "IPD"
      : "IPD" // default
  );
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const [ipdFeedback, setIpdFeedback] = useState([]);
  const [opdFeedback, setOpdFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ✅ Fetch IPD & OPD feedbacks
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [ipdRes, opdRes] = await Promise.all([
          ApiGet("/admin/ipd-patient"),
          ApiGet("/admin/opd-patient"),
        ]);

        setIpdFeedback(
          Array.isArray(ipdRes?.data?.patients)
            ? ipdRes.data.patients
            : ipdRes || []
        );
        setOpdFeedback(
          Array.isArray(opdRes?.data) ? opdRes.data : opdRes || []
        );
      } catch (err) {
        console.error("Error fetching feedbacks:", err);
        setError("Failed to load feedback data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (date) =>
    new Date(date).toLocaleString("en-IN", {
      dateStyle: "short",
      timeStyle: "short",
    });

  // ⚙️ Calculate overall average from all departments
  const getAverageRating = (ratingsObj = {}) => {
    if (!ratingsObj || typeof ratingsObj !== "object") return 0;
    const values = Object.values(ratingsObj).filter(
      (r) => typeof r === "number" && !isNaN(r)
    );
    if (values.length === 0) return 0;
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    return Number(avg.toFixed(1));
  };

  // ⭐ FontAwesome stars renderer
const renderStars = (rating = 0) => {
  const stars = [];
  const totalStars = 5;

  const fullStars = Math.floor(rating);
  const decimal = rating - fullStars;

  // ⭐ New perfect half-star logic
  const hasHalfStar = decimal >= 0.25 && decimal < 0.75;
  const extraFullStar = decimal >= 0.75;

  for (let i = 1; i <= totalStars; i++) {
    if (i <= fullStars) {
      // Full star
      stars.push(
        <FontAwesomeIcon
          key={`full-${i}`}
          icon={solidStar}
          className="text-yellow-400 w-4 h-4"
        />
      );
    } else if (i === fullStars + 1 && hasHalfStar) {
      // Half star
      stars.push(
        <FontAwesomeIcon
          key={`half-${i}`}
          icon={halfStar}
          className="text-yellow-400 w-4 h-4"
        />
      );
    } else if (i === fullStars + 1 && extraFullStar) {
      // Decimal above 0.75 → convert to full star
      stars.push(
        <FontAwesomeIcon
          key={`full-dec-${i}`}
          icon={solidStar}
          className="text-yellow-400 w-4 h-4"
        />
      );
    } else {
      // Empty star
      stars.push(
        <FontAwesomeIcon
          key={`empty-${i}`}
          icon={regularStar}
          className="text-gray-300 w-4 h-4"
        />
      );
    }
  }

  return <div className="flex items-center gap-[2px]">{stars}</div>;
};


  // ✅ Filter feedback safely
  const filteredFeedback = (
    Array.isArray(activeType === "IPD" ? ipdFeedback : opdFeedback)
      ? activeType === "IPD"
        ? ipdFeedback
        : opdFeedback
      : []
  ).filter((fb) => {
    const doctorName =
      typeof fb.consultantDoctorName === "object"
        ? fb.consultantDoctorName?.name || ""
        : fb.consultantDoctorName || "";
    return (
      fb.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fb.contact?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctorName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

const handleRowClick = useCallback(
  (fb) => {
    const id = fb?._id || fb?.id;
    if (!id) {
      console.error("❌ No feedback ID found:", fb);
      alert("No ID found for this feedback.");
      return;
    }

    if (activeType === "IPD") {
      navigate("/ipd-feedback-details", { state: { id, feedback: fb, from: "ipd" } });
    } else {
      navigate("/opd-feedback-details", { state: { id, feedback: fb, from: "opd" } });
    }
  },
  [navigate, activeType]
);
  return (
    <section className="flex w-full h-full select-none overflow-hidden">
      <div className="flex w-full flex-col gap-0 h-screen">
        <Header pageName="IPD / OPD List" />
        <div className="flex w-full h-full">
          <CubaSidebar />
          <div className="flex flex-col w-full bg-white  relative max-h-[93%]  gap-2 ">
            {loading && <Preloader />}


            <div className="flex items-center justify-between px-3 pt-2  sticky top-0 z-10">
              <div className="relative flex items-center justify-center bg-gray-200 rounded-full w-[130px] h-[40px] p-[4px] cursor-pointer select-none">
                <div
                  className={`absolute top-[4px] left-[4px] h-[32px] w-[60px] bg-[#0353ff] rounded-full transition-all duration-300 ${
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

            </div>

        
            <div className="bg-white rounded-xl border shadow-sm w-[98%] mx-[10px] overflow-y-auto md11:!max-h-[86%] 2xl:!max-h-[89%]">
              <div className="w-[100%]">
                <table className="w-[100%]">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-3 py-[7px] text-left border-r text-[11px] font-medium text-gray-500 w-[180px] uppercase border-r">
                        Date & Time
                      </th>
                      <th className="px-3 py-[7px] text-left text-[11px] font-medium text-gray-500  w-[230px] uppercase border-r">
                        Patient Name
                      </th>
                      <th className="px-3 py-[7px] text-left text-[11px] font-medium text-gray-500 uppercase border-r">
                        Contact
                      </th>
                      {activeType === "IPD" && (
                        <th className="px-3 py-[7px] text-left text-[11px] font-medium text-gray-500 w-[100px] uppercase border-r">
                          Bed No
                        </th>
                      )}
                      <th className="px-3 py-[7px] text-left text-[11px] font-medium text-gray-500 w-[200px] uppercase border-r">
                        Doctor Name
                      </th>
                      <th className="px-3 py-[7px] text-left text-[11px] font-medium text-gray-500 uppercase border-r">
                        Rating
                      </th>
                      <th className="px-3 py-[10px] text-left text-[11px] font-medium text-gray-500 uppercase">
                        Comment
                      </th>
                    </tr>
                  </thead>

                  <tbody className="bg-white">
                    {filteredFeedback.map((fb, index) => (
                      <tr
                        key={fb._id || fb.id}
                        onClick={() => handleRowClick(fb)}
                        className={`cursor-pointer ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        } hover:bg-blue-50 transition`}
                      >
                        <td className="px-3 py-2 text-[13px] text-gray-700 border-r">
                          <div className="flex items-center gap-2">
                            <CalendarClock className="w-4 h-4 text-gray-400" />
                            {formatDate(fb.createdAt)}
                          </div>
                        </td>

                        <td className="px-3 py-2 text-[13px] text-gray-700 border-r">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            {fb.patientName}
                          </div>
                        </td>

                        <td className="px-3 py-2 text-[13px] text-gray-700 border-r">
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            {fb.contact}
                          </div>
                        </td>

                        {activeType === "IPD" && (
                          <td className="px-3 py-2 text-[13px] text-gray-700 border-r">
                            <div className="flex items-center gap-2">
                              <Bed className="w-4 h-4 text-gray-400" />
                              {fb.bedNo}
                            </div>
                          </td>
                        )}

                        <td className="px-3 py-2 text-[13px] text-gray-700 border-r">
                          <div className="flex items-center gap-2">
                            <Stethoscope className="w-4 h-4 text-gray-400" />
                            {typeof fb.consultantDoctorName === "object"
                              ? fb.consultantDoctorName?.name
                              : fb.consultantDoctorName || "-"}
                          </div>
                        </td>

                        {/* ⭐ FontAwesome Rating */}
                        <td className="px-3 py-2 text-[13px] text-gray-700 border-r">
                          <div className="flex items-center gap-2">
                            {renderStars(getAverageRating(fb.ratings))}
                            <span className="text-gray-800 font-medium">
                              {getAverageRating(fb.ratings)}/5
                            </span>
                          </div>
                        </td>

                        <td className="px-3 py-2 text-[10px] text-gray-700">
                         {fb.comments
  ? fb.comments.length > 120
    ? fb.comments.substring(0, 120) + "..."
    : fb.comments
  : "-"}

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
  );
}
