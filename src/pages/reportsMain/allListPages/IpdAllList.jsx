import React, { useCallback, useEffect, useState } from 'react'
import Preloader from '../../../Component/loader/Preloader'
import CubaSidebar from '../../../Component/sidebar/CubaSidebar'
import Header from '../../../Component/header/Header'
import {
  FileText,
  Download,
  Search,
  User,
  Star,
  ThumbsUp,
  Award,
  Phone,

  Clock,
  Bed,
} from "lucide-react"
import { ApiGet } from '../../../helper/axios'
import { useNavigate } from 'react-router-dom'

const API_URL = "/admin/ipd-patient"

function round1(n) {
  return Math.round((Number(n) || 0) * 10) / 10
}

const RATING_KEYS = [
  "overallExperience",
  "consultantDoctorServices",
  "medicalAdminDoctorService",
  "billingServices",
  "housekeeping",
  "maintenance",
  "radiologyDiagnosticServices",
  "pathologyDiagnosticServices",
  "dietitianServices",
  "security",
]


export default function IpdAllList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [rawIPD, setRawIPD] = useState([]);
  const navigate = useNavigate();



  function formatDate(dateStr) {
    const d = new Date(dateStr)
    const day = String(d.getDate()).padStart(2, "0")
    const month = String(d.getMonth() + 1).padStart(2, "0")
    const year = d.getFullYear()
    return `${day}/${month}/${year}`
  }

  function calcRowAverage(ratings = {}) {
    const vals = []
    for (const key of RATING_KEYS) {
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

  const getRatingStars = (rating) => {
    const filled = Math.round(rating)
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < filled ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
    ))
  }


  const handleIpdFeedbackDetails = useCallback((row) => {
    const id = row?.id || row?._id;
    if (!id) {
      console.error("No id on IPD row:", row);
      alert("No id found for this feedback.");
      return;
    }
    // ✅ pass id (and the shallow row) via navigation state; no id in URL
    navigate("/ipd-feedback-details", {
      state: { id, feedback: row, from: "ipd" },
    });
  }, [navigate]);


  const fetchIPD = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await ApiGet(`${API_URL}`);
      console.log('res', res)
      const data = Array.isArray(res?.data?.patients) ? res.data?.patients : [];

      setRawIPD(data);

      const list = data.map((d) => {
        const rating = calcRowAverage(d.ratings);
        return {
          id: String(d._id || d.id),
          createdAt: d.createdAt || d.date,
          patient: d.patientName || d.name || "-",
          contact: d.contact || "-",
          bedNo: d.bedNo || "-",
          consultantDoctorName: d.consultantDoctorName?.name || "-",
          rating,
          overallRecommendation: d.overallRecommendation,
          comments: d.comments || "-",
        };
      });

      const avg = list.length
        ? round1(list.reduce((s, r) => s + (r.rating || 0), 0) / list.length)
        : 0;

      const nps = calcNpsPercent(list);
      const overallScore =
        avg >= 4.5 ? "Excellent" :
          avg >= 4.0 ? "Good" :
            avg >= 3.0 ? "Av." :
              avg >= 2.0 ? "Poor" : "Very Poor";

      setRows(list);
    } catch (e) {
      console.error("Fetch IPD failed:", e);
      setError("Failed to load IPD feedback");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);


  useEffect(() => {
    fetchIPD()
  }, [fetchIPD])


  const filteredFeedback = rows
    .filter((f) =>
      f.patient?.toLowerCase().includes(searchTerm?.toLowerCase())
    )
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // latest first



  const exportToExcel = async () => {

    const XLSX = await import("xlsx")

    const feedbackRows = filteredFeedback.map((f) => ({
      Date: formatDate(f.createdAt),
      "Patient Name": f.patient,
      Contact: f.contact,
      "Bed No": f.bedNo,
      "Doctor Name": f.consultantDoctorName?.name,
      "Average Rating (/5)": f.rating,
      ...(typeof f.overallRecommendation === "number"
        ? { "Overall Recommendation (NPS)": f.overallRecommendation }
        : {}),
      comments: f.comments
    }))

    const feedbackHeaders = feedbackRows.length
      ? Object.keys(feedbackRows[0])
      : ["Date", "Patient Name", "Contact", "Bed No", "Doctor Name", "Average Rating (/5)"]

    const wsFeedback = XLSX.utils.json_to_sheet(feedbackRows, { header: feedbackHeaders })

    const feedbackCols = feedbackHeaders.map((key) => {
      const headerLen = String(key).length
      const maxCellLen = feedbackRows.reduce(
        (m, r) => Math.max(m, String(r[key] ?? "").length),
        0
      )
      return { wch: Math.min(Math.max(headerLen, maxCellLen) + 2, 60) }
    })
    wsFeedback["!cols"] = feedbackCols

    let wsSummary = null
    if (Array.isArray(serviceSummary) && serviceSummary.length) {
      const summaryRows = serviceSummary.map((s) => ({
        Service: s.service,
        "Excellent %": s.excellent,
        "Good %": s.good,
        "Average %": s.average,
        "Poor %": s.poor,
        "Very Poor %": s.veryPoor,
        ...(Array.isArray(s.usedFields) ? { "Fields Used": s.usedFields.join(", ") } : {}),
      }))
      wsSummary = XLSX.utils.json_to_sheet(summaryRows)
      const summaryHeaders = Object.keys(summaryRows[0] || { Service: "" })
      wsSummary["!cols"] = summaryHeaders.map((key) => {
        const headerLen = String(key).length
        const maxCellLen = summaryRows.reduce(
          (m, r) => Math.max(m, String(r[key] ?? "").length),
          0
        )
        return { wch: Math.min(Math.max(headerLen, maxCellLen) + 2, 60) }
      })
    }

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, wsFeedback, "Patient Feedback")
    if (wsSummary) XLSX.utils.book_append_sheet(wb, wsSummary, "Service Summary")

    const fileName = `IPD_Feedback_${new Date().toISOString().slice(0, 10)}.xlsx`
    XLSX.writeFile(wb, fileName)
  }



  return (
    <>
      <section className="flex w-[100%] h-[100%] select-none   md11:pr-[0px] overflow-hidden">
        <div className="flex w-[100%] flex-col gap-[0px] h-[100vh]">
          <Header pageName="Ipd Feedback List" />
          <div className="flex  w-[100%] h-[100%]">
            <CubaSidebar />
            <div className="flex flex-col w-[100%]  relative max-h-[93%]  md34:!pb-[120px] m md11:!pb-[30px] py-[10px] pr-[10px]  overflow-y-auto gap-[10px] ">
              <Preloader />
              <div>


                <div className="bg-white  w-[98%]   mx-auto rounded-xl e md34:!mb-[100px] md11:!mb-0  border shadow-sm overflow-hidden">
                  <div className="p-[13px]  border-b  border-gray-200 flex flex-col sm:flex-row justify-between sm:items-center">
                    <div className=' flex gap-[10px] items-center py-[10px]    justify-start '>



                    </div>
                    <div className="flex flex-row justify-between gap-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-[19px] transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          placeholder="Search feedback..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 pr-[6px] py-1 w-[200px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {/* Export only if permitted */}
                      <button
                        onClick={exportToExcel}
                        className="flex items-center flex-shrink-0 px-2 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Export to Excel
                      </button>

                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className=" min-w-[1200px] md11:!min-w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-[10px] text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                            Date & Time
                          </th>
                          <th className="px-6 py-[10px] text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                            Patient Name
                          </th>
                          <th className="px-6 py-[10px] text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                            Contact
                          </th>
                          <th className="px-6 py-[10px] text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                            Bed No
                          </th>
                          <th className="px-6 py-[10px] text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                            Doctor Name
                          </th>
                          <th className="px-6 py-[10px] text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                            Rating
                          </th>
                          <th className="px-6 py-[10px] text-left text-xs font-medium text-gray-500 uppercase tracking-wider  border-gray-200">Comment</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        {filteredFeedback.map((feedback, index) => (
                          <tr
                            key={feedback.id}
                            className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50  cursor-pointer transition-colors`}
                            onClick={() => handleIpdFeedbackDetails(feedback)}
                          >
                            <td className="px-4 py-2 text-sm text-gray-900 border-r border-gray-200">
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 text-gray-400 mr-2" />
                                {formatDate(feedback.createdAt)}
                              </div>
                            </td>
                            <td className="px-6 py-[10px] text-sm font-medium text-gray-900 border-r border-gray-200">
                              <div className="flex items-center">
                                <User className="w-4 h-4 text-gray-400 mr-2" />
                                {feedback.patient}
                              </div>
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900 border-r border-gray-200">
                              <div className="flex items-center">
                                <Phone className="w-4 h-4 text-gray-400 mr-2" />
                                {feedback.contact}
                              </div>
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900 border-r border-gray-200">
                              <div className="flex items-center">
                                <Bed className="w-4 h-4 text-gray-400 mr-2" />
                                {feedback.bedNo}
                              </div>
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900 border-r border-gray-200">
                              <div className="flex items-center">
                                <User className="w-4 h-4 text-gray-400 mr-2" />
                                {feedback.consultantDoctorName}
                              </div>
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900 border-r border-gray-200">
                              <div className="flex items-center">
                                {getRatingStars(feedback.rating)}
                                <span className="ml-2 text-sm font-medium">{feedback.rating}/5</span>
                              </div>
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900  border-gray-200">

                              <div className="flex text-[12px] items-center">
                                {feedback.comments || "-"}


                              </div>
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
        </div>
      </section>

    </>
  )
}
