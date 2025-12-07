import React, { useCallback, useEffect, useState } from 'react'
import Header from '../../../Component/header/Header'
import CubaSidebar from '../../../Component/sidebar/CubaSidebar'
import Preloader from '../../../Component/loader/Preloader'
import { Calendar, ChevronDown, Hospital, User, Activity, HeartPulse, Frown, Minus, Search, CalendarClock, IdCard } from "lucide-react"

import { FileText, Download, Star, ThumbsUp, BarChart3, Award, Phone, Clock } from "lucide-react"
import { MessageSquare, } from "lucide-react";
import { Users, Stethoscope, ShieldCheck, Microscope } from "lucide-react";
import { ApiGet } from '../../../helper/axios'
import { useNavigate } from 'react-router-dom'
import NewDatePicker from '../../../Component/MainInputFolder/NewDatePicker'

const API_URL = "/admin/employee-feedback"


function round1(n) {
  return Math.round((Number(n) || 0) * 10) / 10
}

const OPD_RATING_KEYS = [
  "appointment",
  "receptionStaff",
  "radiologyDiagnosticServices",
  "pathologyDiagnosticServices",
  "doctorServices",
  "security"
];

function calcRowAverage(ratings = {}) {
  const vals = []
  for (const key of OPD_RATING_KEYS) {
    const v = ratings?.[key]
    if (typeof v === "number" && v >= 1 && v <= 5) vals.push(v)
  }
  if (!vals.length) return 0
  return round1(vals.reduce((a, b) => a + b, 0) / vals.length)
}

function calcNpsPercent(items) {
  const values = items
    .map((it) => it.overallRecommendation)
    .filter((v) => typeof v === "number")
  if (!values.length) return 0
  const promoters = values.filter((v) => v >= 9).length
  const detractors = values.filter((v) => v <= 6).length
  const n = values.length
  return Math.round(((promoters - detractors) / n) * 100)
}


function formatDate(dateStr) {
  const d = new Date(dateStr)
  const day = String(d.getDate()).padStart(2, "0")
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

const getRatingStars = (rating) => {
  const filled = Math.round(rating)
  return Array.from({ length: 5 }, (_, i) => (
    <Star key={i} className={`w-4 h-4 ${i < filled ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
  ))
}


const normId = (v) =>
  typeof v === 'object' && v !== null
    ? (v.$oid ?? v._id ?? v.toString?.() ?? '')
    : (v ?? '');
const normDate = (v) =>
  typeof v === 'object' && v !== null && '$date' in v ? v.$date : v;


export default function EmployeeAllList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [dateFrom, setDateFrom] = useState("2024-01-01")
  const [dateTo, setDateTo] = useState("2024-01-31")
  const [rawOPD, setRawOPD] = useState([])
  const navigate = useNavigate();
  const [dateFrom1, setDateFrom1] = useState(null);
  const [dateTo1, setDateTo1] = useState(null);
  const [filters, setFilters] = useState({
  search: "",
  from: null,
  to: null,
});



  const getRatingStars = (rating = 0) => {
    const totalStars = 5;
    const filledStars = Math.floor(rating);
    const fractionalPart = rating - filledStars;

    return (
      <div className="flex items-center">
        {Array.from({ length: totalStars }, (_, i) => {
          if (i < filledStars) {
            return (
              <Star
                key={i}
                className="w-4 h-4 text-yellow-400 fill-current"
              />
            );
          } else if (i === filledStars && fractionalPart > 0) {
            const fillPercent = Math.round(fractionalPart * 100);
            return (
              <div key={i} className="relative w-4 h-4">
                <Star className="absolute w-4 h-4 text-gray-300" />
                <Star
                  className="absolute w-4 h-4 text-yellow-400"
                  style={{
                    clipPath: `inset(0 ${100 - fillPercent}% 0 0)`
                  }}
                />
              </div>
            );
          } else {
            return (
              <Star
                key={i}
                className="w-4 h-4 text-gray-300"
              />
            );
          }
        })}

        <span className="ml-1 text-sm font-medium text-gray-700">
          {rating.toFixed(1)}/5
        </span>
      </div>
    );
  };



  const fetchOPD = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await ApiGet(`${API_URL}`)
      const data = Array.isArray(res) ? res : (res.data?.feedbacks || [])
      console.log('data', data)
      setRawOPD(data)

      const list = data.map((d) => {
        const id = normId(d._id ?? d.id);
        const ratings = d.ratings || {};
        const ratingValues = Object.values(ratings).filter((v) => v >= 1 && v <= 5);
        const avgRating = ratingValues.length
          ? round1(ratingValues.reduce((a, b) => a + b, 0) / ratingValues.length)
          : 0;
        return {
          id,
          _id: id, // keep for safety
          createdAt: normDate(d.createdAt ?? d.date),
          patient: d.employeeName || d.name || "-",
          contact: d.employeeId || "-",
          doctor: d.consultantDoctorName?.name || d.doctorName || d.consultant || "-",
          rating: avgRating,
          comment: d.comments || d.comment || "-",
          overallRecommendation: d.overallRecommendation,
        };
      });

      const avg = list.length ? round1(list.reduce((s, r) => s + (r.rating || 0), 0) / list.length) : 0
      const nps = calcNpsPercent(data)
      const overallScore =
        avg >= 4.5 ? "Excellent" :
          avg >= 4.0 ? "Good" :
            avg >= 3.0 ? "Av" :
              avg >= 2.0 ? "Poor" : "Very Poor"

      setRows(list)
    } catch (e) {
      console.error("Fetch OPD failed:", e)
      setError("Failed to load OPD feedback")
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [dateFrom, dateTo])

  useEffect(() => { fetchOPD() }, [fetchOPD])

const filteredFeedback = rows.filter((f) => {
  const dt = new Date(f.createdAt);

  // Normalize header FROM date
  const from = filters.from ? new Date(filters.from) : null;
  if (from) from.setHours(0, 0, 0, 0);

  // Normalize header TO date
  const to = filters.to ? new Date(filters.to) : null;
  if (to) to.setHours(23, 59, 59, 999);

  // DATE FILTER
  if (from && dt < from) return false;
  if (to && dt > to) return false;

  // SEARCH FILTER
  const s = filters.search?.toLowerCase() || "";
  return (
    f.patient.toLowerCase().includes(s) ||
    f.comment.toLowerCase().includes(s)
  );
});

const exportToExcel = async () => {
  const XLSX = await import("xlsx");

  const excelRows = filteredFeedback.map((f) => ({
    "Date": formatDate(f.createdAt),
    "Employee Name": f.patient,
    "Employee ID": f.contact,
    "Rating": f.rating,
    "Comment": f.comment,
  }));

  const ws = XLSX.utils.json_to_sheet(excelRows);
  ws["!cols"] = Object.keys(excelRows[0] || {}).map((k) => ({ wch: 20 }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Employee Feedback");

  XLSX.writeFile(wb, `Employee_Feedback_${new Date().toISOString().slice(0, 10)}.xlsx`);
};



  const openFeedbackDetails = useCallback((fb) => {
    const id = normId(fb?._id ?? fb?.id)
    if (!id) {
      console.error("No ID on feedback row:", fb)
      alert("No ID found for this feedback.")
      return
    }
    sessionStorage.setItem(
      'opdFeedback:last',
      JSON.stringify({ id, preview: fb })
    )

    navigate('/employee-feedback-details', {
      state: { id, feedback: fb }
    })
  }, [navigate])

  return (
    <>



      <section className="flex w-[100%] h-[100%] select-none   md11:pr-[0px] overflow-hidden">
        <div className="flex w-[100%] flex-col gap-[0px] h-[100vh]">
          <Header
  pageName="Employee Feedback"
  onFilterChange={(f) => setFilters(f)}
/>
          <div className="flex  w-[100%] h-[100%]">
            <CubaSidebar />
            <div className="flex flex-col w-[100%]  pl-[10px] relative max-h-[93%]  md34:!pb-[120px] m md11:!pb-[20px] py-[10px] pr-[10px]  overflow-y-auto gap-[10px] ">
              <Preloader />
              <div>

                <div className="bg-white  md11:!mb-[0px] rounded-lg border shadow-sm overflow-hidden">
                  {/* <div className="px-3 py-[8px] border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div className=' flex gap-[10px]  items-center  pt-[5px] justify-start '>

            
                          <div className=" flex  gap-[20px]">

                            <div className="relative ">

                              <NewDatePicker
                                label="From Date"
                                selectedDate={dateFrom1}
                                setSelectedDate={setDateFrom1}
                              />

                            </div>

                            <div className="relative">

                              <NewDatePicker
                                label="To Date"
                                selectedDate={dateTo1}
                                setSelectedDate={setDateTo1}
                              />
                            </div>
                          </div>


                  


                    </div>
                    <div className="flex flex-row items-center    gap-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          placeholder="Search feedback..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 pr-3 py-[5px] border md34:!w-[190px] md11:!w-[230px] border-gray-300 rounded-md focus:outline-none "
                        />
                      </div>

                 <button
                        onClick={exportToExcel}
                        className="flex items-center px-2 py-[6px] w-[140px] bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Export to Excel
                      </button> 

                    </div>

                  </div> */}

                  <div className="overflow-x-auto">
                    <table className=" md34:!min-w-[1200px] md11:!min-w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-[7px] text-left text-[12px] font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">Date & Time</th>
                          <th className="px-6 py-[7px] text-left text-[12px] font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">EmployeeId Name</th>
                          <th className="px-6 py-[7px] text-left text-[12px] font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">Employee Id</th>
                          {/* <th className="px-6 py-[7px] text-left text-[12px] font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">Doctor</th> */}
                          <th className="px-6 py-[7px] text-left text-[12px] font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">Rating</th>
                          <th className="px-6 py-[7px] text-left text-[12px] font-medium text-gray-500 uppercase tracking-wider">Comment</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        {filteredFeedback
                          .map((feedback, index) => (
                            <tr
                              key={feedback.id || feedback._id}
                              onClick={() => openFeedbackDetails(feedback)}
                              className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50 transition-colors cursor-pointer`}
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => { if (e.key === "Enter") openFeedbackDetails(feedback); }}
                            >

                              <td className="px-4 py-2 text-sm text-gray-900 border-r border-gray-200">
                                <div className="flex items-center">
                                  <CalendarClock className="w-4 h-4 text-gray-400 mr-2" />
                                  {formatDate(feedback.createdAt)}
                                </div>
                              </td>
                              <td className="px-6 py-[7px] text-sm  text-gray-900 border-r border-gray-200">



                                <div className="flex flex-shrink-0 items-center">
                                  <User className="w-5 h-5 text-gray-400 mr-2" />
                                  {feedback.patient}
                                </div>
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-900 border-r border-gray-200">
                                <div className="flex items-center">
                                  <IdCard className="w-5 h-5 text-gray-400 mr-2" />
                                  {feedback.contact}
                                </div>
                              </td>
                              {/* <td className="px-4 py-2 text-sm text-gray-900 border-r border-gray-200">{feedback.doctor}</td> */}
                              <td className="px-4 py-2 text-sm text-gray-900 border-r border-gray-200">
                                <div className="flex items-center">
                                  {getRatingStars(feedback.rating)}
                                  {/* <span className="ml-2 text-sm font-medium">{feedback.rating}</span> */}
                                </div>
                              </td>
                              <td className="px-6 py-[7px] text-sm text-gray-900 max-w-xs">
                                <div className="truncate" title={feedback.comment}>{feedback.comment}</div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>

                  {error && <div className="text-red-600 text-sm mt-3 px-6">{error}</div>}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  )
}
