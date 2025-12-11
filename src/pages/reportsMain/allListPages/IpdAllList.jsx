import React, { useCallback, useEffect, useState } from 'react'
import Preloader from '../../../Component/loader/Preloader'
import CubaSidebar from '../../../Component/sidebar/CubaSidebar'
import Header from '../../../Component/header/Header'
import {
  Download,
  Search,
  User,
  Star,
  Phone,
  Clock,
  Bed,
  CalendarClock,
  Stethoscope,
} from "lucide-react"
import { ApiGet } from '../../../helper/axios'
import { useNavigate } from 'react-router-dom'
import NewDatePicker from '../../../Component/MainInputFolder/NewDatePicker'

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
  const navigate = useNavigate();
  const [dateFrom1, setDateFrom1] = useState(null);
  const [dateTo1, setDateTo1] = useState(null);
  const [filters, setFilters] = useState({
  search: "",
  from: null,
  to: null,
});


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

  const getRatingStars = (rating) => {
    const filled = Math.round(rating)
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < filled ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
    ))
  }

  /* -------------------- DATE FILTER FUNCTION -------------------- */
  const isWithinDateRange = (createdAt) => {
    if (!dateFrom1 && !dateTo1) return true;

    const entryDate = new Date(createdAt);

    if (dateFrom1) {
      const from = new Date(dateFrom1);
      if (entryDate < from) return false;
    }

    if (dateTo1) {
      const to = new Date(dateTo1);
      to.setHours(23, 59, 59, 999);
      if (entryDate > to) return false;
    }

    return true;
  };

  const handleIpdFeedbackDetails = useCallback((row) => {
    const id = row?.id || row?._id;
    if (!id) {
      alert("No id found for this feedback.");
      return;
    }
    navigate("/ipd-feedback-details", {
      state: { id, feedback: row, from: "ipd" },
    });
  }, [navigate]);

  const fetchIPD = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await ApiGet(`${API_URL}`);
      const data = Array.isArray(res?.data?.patients) ? res.data?.patients : [];
      console.log('daat', data)

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

      setRows(list);
    } catch (e) {
      setError("Failed to load IPD feedback");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIPD()
  }, [fetchIPD])

  /* -------------------- UPDATED FILTER (DATE + SEARCH) -------------------- */
const filteredFeedback = rows
  .filter((f) => {
    const term = (filters.search || "").toLowerCase();

    // Text search filter
    const matchText =
      f.patient?.toLowerCase().includes(term) ||
      f.contact?.toLowerCase().includes(term) ||
      String(f.consultantDoctorName || "").toLowerCase().includes(term) ||
      String(f.comments || "").toLowerCase().includes(term);

    const entryDate = new Date(f.createdAt);

    // Date filtering without mutating state
    let matchFrom = true;
    let matchTo = true;

    if (filters.from) {
      const fromDate = new Date(filters.from);
      fromDate.setHours(0, 0, 0, 0);
      matchFrom = entryDate >= fromDate;
    }

    if (filters.to) {
      const toDate = new Date(filters.to);
      toDate.setHours(23, 59, 59, 999);
      matchTo = entryDate <= toDate;
    }

    return matchText && matchFrom && matchTo;
  })
  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));



  /* -------------------- EXPORT TO EXCEL -------------------- */
const exportToExcel = async () => {
  const XLSX = await import("xlsx");

  if (!filteredFeedback.length) {
    alert("No feedback found for selected date range");
    return;
  }

  const feedbackRows = filteredFeedback.map((f) => ({
    Date: formatDate(f.createdAt),
    "Patient Name": f.patient,
    Contact: f.contact,
    "Bed No": f.bedNo,
    "Doctor Name": f.consultantDoctorName,
    "Average Rating (/5)": f.rating,
    comments: f.comments || "-",
  }));

  const ws = XLSX.utils.json_to_sheet(feedbackRows);
  ws["!cols"] = Object.keys(feedbackRows[0]).map((key) => ({ wch: 20 }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "IPD Feedback");

  XLSX.writeFile(
    wb,
    `IPD_Feedback_${filters.from || "ALL"}_${filters.to || "ALL"}.xlsx`
  );
};


  return (
    <>
      <section className="flex w-[100%] h-[100%] select-none md11:pr-[0px] overflow-hidden">
        <div className="flex w-[100%] flex-col gap-[0px] h-[100vh]">
          <Header
  pageName="Ipd Feedback List"
  onFilterChange={setFilters}
  onExportExcel={exportToExcel}
/>
          <div className="flex w-[100%] h-[100%]">
            <CubaSidebar />
            <div className="flex flex-col w-[100%] relative max-h-[93%] md34:!pb-[120px] md11:!pb-[30px] py-[10px] pr-[10px] overflow-y-auto gap-[10px] ">
              <Preloader />
              <div>

                <div className="bg-white w-[98%] mx-auto rounded-xl border shadow-sm overflow-hidden">
                

                  {/* Table */}
                  <div className="overflow-x-auto">
                    <table className="min-w-[1200px] md11:!min-w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-[10px] text-left text-[12px] font-medium text-gray-500 uppercase tracking-wider border-r">
                            Date & Time
                          </th>
                          <th className="px-3 py-[10px] text-left text-[12px] w-[220px] font-medium text-gray-500 uppercase border-r">
                            Patient Name
                          </th>
                          <th className="px-3 py-[10px] text-left text-[12px] font-medium text-gray-500 uppercase border-r">
                            Contact
                          </th>
                          <th className="px-3 py-[10px] text-left text-[12px] font-medium text-gray-500 uppercase border-r">
                            Bed No
                          </th>
                          <th className="px-3 py-[10px] text-left text-[12px] w-[200px]  font-medium text-gray-500 uppercase border-r">
                            Doctor Name
                          </th>
                          <th className="px-6 py-[10px] text-left text-[12px] font-medium text-gray-500 uppercase border-r">
                            Rating
                          </th>
                          <th className="px-6 py-[10px] text-left text-[12px] font-medium text-gray-500 uppercase">
                            Comment
                          </th>
                        </tr>
                      </thead>

                      <tbody className="bg-white">
                        {filteredFeedback.map((feedback, index) => (
                          <tr
                            key={feedback.id}
                            onClick={() => handleIpdFeedbackDetails(feedback)}
                            className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50 cursor-pointer`}
                          >

                            <td className="px-3 py-2 text-sm border-r">
                              <div className="flex items-center">
                                <CalendarClock className="w-4 h-4 text-gray-400 mr-2" />
                                {formatDate(feedback.createdAt)}
                              </div>
                            </td>

                            <td className="px-3 py-[10px] text-sm border-r">
                              <div className="flex items-center">
                                <User className="w-4 h-4 text-gray-400 mr-2" />
                                {feedback.patient}
                              </div>
                            </td>

                            <td className="px-3 py-2 text-sm border-r">
                              <div className="flex items-center">
                                <Phone className="w-4 h-4 text-gray-400 mr-2" />
                                {feedback.contact}
                              </div>
                            </td>

                            <td className="px-3 py-2 text-sm border-r">
                              <div className="flex items-center">
                                <Bed className="w-4 h-4 text-gray-400 mr-2" />
                                {feedback.bedNo}
                              </div>
                            </td>

                            <td className="px-3 py-2 text-sm border-r">
                              <div className="flex items-center">
                                <Stethoscope className="w-4 h-4 text-gray-400 mr-2" />
                                {feedback.consultantDoctorName}
                              </div>
                            </td>

                            <td className="px-3 py-2 text-sm border-r">
                              <div className="flex items-center">
                                {getRatingStars(feedback.rating)}
                                <span className="ml-2 text-sm">{feedback.rating}/5</span>
                              </div>
                            </td>

                            <td className="px-4 py-2 text-sm">
                              {feedback.comments || "-"}
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
