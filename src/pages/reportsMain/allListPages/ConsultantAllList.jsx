import React, { useCallback, useEffect, useState } from 'react'
import Header from '../../../Component/header/Header'
import CubaSidebar from '../../../Component/sidebar/CubaSidebar'
import Preloader from '../../../Component/loader/Preloader'
import { Calendar, ChevronDown, Hospital, User, Activity, HeartPulse, Frown, Minus, Search, CalendarClock } from "lucide-react"

import { FileText, Download, Star, ThumbsUp, BarChart3, Award, Phone, Clock } from "lucide-react"
import { MessageSquare, } from "lucide-react";
import { Users, Stethoscope, ShieldCheck, Microscope } from "lucide-react";
import { ApiGet } from '../../../helper/axios'
import { useNavigate } from 'react-router-dom'
import NewDatePicker from '../../../Component/MainInputFolder/NewDatePicker'

const API_URL = "/admin/consultant-feedback"


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

function calcRowAverage(feedback) {
  const arr = [];

  if (Array.isArray(feedback?.serviceRatings)) {
    feedback.serviceRatings.forEach((r) => {
      if (r.rating >= 1 && r.rating <= 5) arr.push(r.rating);
    });
  }

  if (Array.isArray(feedback?.bdRatings)) {
    feedback.bdRatings.forEach((r) => {
      if (r.rating >= 1 && r.rating <= 5) arr.push(r.rating);
    });
  }

  if (Array.isArray(feedback?.managementFeedback)) {
    feedback.managementFeedback.forEach((r) => {
      if (r.rating >= 1 && r.rating <= 5) arr.push(r.rating);
    });
  }

  if (!arr.length) return 0;
  return round1(arr.reduce((a, b) => a + b, 0) / arr.length);
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


export default function ConsultantAllList() {
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

      const fetchOPD = useCallback(async () => {
          setLoading(true)
          setError(null)
          try {
            const res = await ApiGet(`${API_URL}`)
            const data = Array.isArray(res) ? res : (res.data?.feedbacks || [])
            setRawOPD(data)
      
            const list = data.map((d) => {
  const id = normId(d._id ?? d.id);
  const rating = calcRowAverage(d);

  return {
    id,
    _id: id,
    createdAt: normDate(d.createdAt),
    doctor: d.doctorName || "-",
    rating,
    comment: d.finalComments || d.managementFeedback?.[0]?.comment || "",
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

  const from = dateFrom1 ? new Date(dateFrom1) : null;
  const to = dateTo1 ? new Date(dateTo1) : null;

  if (to) to.setHours(23, 59, 59, 999);

  if (from && dt < from) return false;
  if (to && dt > to) return false;

  const s = searchTerm.toLowerCase();

  return (
    (f.doctor || "").toLowerCase().includes(s) ||
    (f.comment || "").toLowerCase().includes(s)
  );
});



const exportToExcel = async () => {
  const XLSX = await import("xlsx");

  // Use the SAME filtered rows (already filtered by date & search)
  const excelRows = filteredFeedback.map((f) => ({
    "Date": formatDate(f.createdAt),
    "Doctor Name": f.doctor || "-",
    "Rating": f.rating || 0,
    "Comment": f.comment || "",
  }));

  const ws = XLSX.utils.json_to_sheet(excelRows);

  // Auto column width
  ws["!cols"] = Object.keys(excelRows[0] || { " ": "" }).map((key) => ({
    wch: 20
  }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Consultant Feedback");

  XLSX.writeFile(
    wb,
    `Consultant_Feedback_${new Date().toISOString().slice(0, 10)}.xlsx`
  );
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
  
      navigate('/consultant-feedback-details', {
        state: { id, feedback: fb }
      })
    }, [navigate])
    
  return (
 <>
          <section className="flex w-[100%] h-[100%] select-none   md11:pr-[0px] overflow-hidden">
        <div className="flex w-[100%] flex-col gap-[0px] h-[100vh]">
          <Header 
  pageName="Consultant Feedback"
  onFilterChange={(data) => {
    setDateFrom1(data.from);
    setDateTo1(data.to);
    setSearchTerm(data.search || "");
  }}
  onExportExcel={exportToExcel}
/>

          <div className="flex  w-[100%] h-[100%]">
            <CubaSidebar />
          <div className="flex flex-col w-[100%]  pl-[10px] relative max-h-[93%]  md34:!pb-[120px] m md11:!pb-[20px] py-[10px] pr-[10px]  overflow-y-auto gap-[10px] ">
              <Preloader />
             <div>


               <div className="bg-white  md11:!mb-[0px] rounded-lg border shadow-sm overflow-hidden">
         

                      <div className="overflow-x-auto">
                        <table className=" md34:!min-w-[800px] md11:!min-w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-[7px] text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">Date & Time</th>
                              {/* <th className="px-6 py-[7px] text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">Patient Name</th>
                              <th className="px-6 py-[7px] text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">Contact</th> */}
                              <th className="px-6 py-[7px] text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">Doctor</th>
                              <th className="px-6 py-[7px] text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">Rating</th>
                              <th className="px-6 py-[7px] text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comment</th>
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
                                  {/* <td className="px-6 py-[7px] text-sm font-medium text-gray-900 border-r border-gray-200">



                                    <div className="flex flex-shrink-0 items-center">
                                      <User className="w-4 h-4 text-gray-400 mr-2" />
                                      {feedback.patient}
                                    </div>
                                  </td>
                                  <td className="px-4 py-2 text-sm text-gray-900 border-r border-gray-200">
                                    <div className="flex items-center">
                                      <Phone className="w-4 h-4 text-gray-400 mr-2" />
                                      {feedback.contact}
                                    </div>
                                  </td> */}
                                  <td className="px-4 py-2 text-sm text-gray-900 border-r border-gray-200">
                                                                      <div className="flex items-center">
                                      <Stethoscope className="w-4 h-4 text-gray-400 mr-2" />
                                  
                                  {feedback.doctor}
                                  </div>
                                  </td>
                                  <td className="px-4 py-2 text-sm text-gray-900 border-r border-gray-200">
                                    <div className="flex items-center">
                                      {getRatingStars(feedback.rating)}
                                      <span className="ml-2 text-sm font-medium">{feedback.rating}/5</span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-[7px] text-sm text-gray-900 max-w-xs">
                                    <div className="truncate" title={feedback.comment}>  {feedback.comment?.trim() || "-"}</div>
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
