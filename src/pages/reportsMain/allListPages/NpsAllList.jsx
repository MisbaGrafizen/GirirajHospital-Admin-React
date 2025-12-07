import React, { useEffect, useMemo, useState } from 'react'
import Header from '../../../Component/header/Header'
import CubaSidebar from '../../../Component/sidebar/CubaSidebar'
import Preloader from '../../../Component/loader/Preloader'
import { ApiGet } from '../../../helper/axios'
import { User, Bed, CalendarClock, Stethoscope, Smile, Meh, Frown, Download, Search } from "lucide-react"
import NewDatePicker from '../../../Component/MainInputFolder/NewDatePicker'

const pick = (...vals) => vals.find((v) => v != null && v !== "") ?? "-"

const toNps = (v) => {
  const n = Number(v)
  return Number.isFinite(n) ? Math.max(0, Math.min(10, Math.round(n))) : null
}
const pickDoctor = (d) => pick(d.consultantDoctorName?.name, d.doctorName, d.doctor, d.consultant, "-")
const pickPatient = (d) => pick(d.patientName, d.name, d.patient, "-")
const pickCreatedAt = (d) => new Date(d.createdAt || d.date || d.dateTime || d.createdOn || Date.now())
const pickRoom = (d, dept) => (dept === "IPD" ? pick(d.bedNo, d.roomNo, d.room, "") : "-")
function inRange(dt, fromISO, toISO) {
  const t = +dt
  const from = +new Date(`${fromISO}T00:00:00`)
  const to = +new Date(`${toISO}T23:59:59`)
  return t >= from && t <= to
}


function getDateRange(from, to) {
  const start = new Date(from)
  const end = new Date(to)
  const days = []
  const d = new Date(start)
  while (d <= end) {
    days.push(d.toISOString().slice(0, 10))
    d.setDate(d.getDate() + 1)
  }
  return days
}
function categoryFromRating(r) {
  if (r >= 9) return "Promoter"
  if (r >= 7) return "Passive"
  return "Detractor"
}

export default function NpsAllList() {

  const [department, setDepartment] = useState("Both")
  const [doctor, setDoctor] = useState("All Doctors")
  const [room, setRoom] = useState("All Rooms")
  const [rawOpd, setRawOpd] = useState([])
  const [rawIpd, setRawIpd] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState("")
  const [showDetractors, setShowDetractors] = useState(true)
  const [showPassives, setShowPassives] = useState(true)
  const [showPromoters, setShowPromoters] = useState(true)
  const [dateFrom1, setDateFrom1] = useState(null);
  const [dateTo1, setDateTo1] = useState(null);
  const [filters, setFilters] = useState({
  from: null,
  to: null,
  search: "",
});

  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - 14)
    return d.toISOString().slice(0, 10)
  })
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().slice(0, 10))

  useEffect(() => {
    ; (async () => {
      try {
        setLoading(true)
        setError(null)
        const [opdRes, ipdRes] = await Promise.all([ApiGet("/admin/opd-patient"), ApiGet("/admin/ipd-patient")])
        console.log('opdRes', opdRes)
        console.log('ipdRes', ipdRes)
        setRawOpd(Array.isArray(opdRes) ? opdRes : opdRes?.data || [])
        setRawIpd(Array.isArray(ipdRes) ? ipdRes : ipdRes?.data?.patients || [])
      } catch (e) {
        console.error("NPS load failed:", e)
        setError("Failed to load NPS data.")
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const baseRecords = useMemo(() => {
    const wantOPD = department === "OPD" || department === "Both"
    const wantIPD = department === "IPD" || department === "Both"
    const doctorFilter = doctor !== "All Doctors" ? doctor.toLowerCase() : null

    const project = (list, dept) => {
      if (!Array.isArray(list)) return []
      return list
        .map((d) => {
          const nps = toNps(d.overallRecommendation)
          if (nps === null) return null
          const when = pickCreatedAt(d)
          if (!inRange(when, dateFrom, dateTo)) return null
          const docName = pickDoctor(d)
          if (doctorFilter && docName.toLowerCase() !== doctorFilter) return null
          return {
            date: when.toISOString().slice(0, 10),
            datetime: when.toLocaleString(),
            patient: pickPatient(d),
            room: pickRoom(d, dept),
            doctor: docName,
            department: dept,
            rating: nps,
            category: categoryFromRating(nps),
            comment: pick(d.comments, d.comment, ""),
          }
        })
        .filter(Boolean)
    }

    let recs = []
    if (wantOPD) recs = recs.concat(project(rawOpd, "OPD"))
    if (wantIPD) recs = recs.concat(project(rawIpd, "IPD"))
    // stable chronology for table
    return recs
      .sort((a, b) => b.date.localeCompare(a.date) || b.datetime.localeCompare(a.datetime));
  }, [rawOpd, rawIpd, department, doctor, dateFrom, dateTo])

  const filteredRecords = useMemo(() => {
    return baseRecords.filter((r) => {
      if (room !== "All Rooms" && r.room !== room) return false
      if (query) {
        const q = query.toLowerCase()
        const match =
          r.patient.toLowerCase().includes(q) ||
          r.room.toLowerCase().includes(q) ||
          r.doctor.toLowerCase().includes(q) ||
          r.comment.toLowerCase().includes(q)
        if (!match) return false
      }
      if (r.category === "Detractor" && !showDetractors) return false
      if (r.category === "Passive" && !showPassives) return false
      if (r.category === "Promoter" && !showPromoters) return false
      return true
    })
  }, [baseRecords, room, query, showDetractors, showPassives, showPromoters])


  // 🔥 Apply selectedDate filter on top of existing filters (UI date filter)
const finalFilteredRecords = useMemo(() => {
  let list = [...filteredRecords];

  const { from, to, search } = filters;

  // 🔥 SEARCH FILTER
  if (search) {
    const q = search.toLowerCase();
    list = list.filter((r) =>
      r.patient.toLowerCase().includes(q) ||
      r.doctor.toLowerCase().includes(q) ||
      r.comment.toLowerCase().includes(q)
    );
  }

  // 🔥 DATE FILTER (Header based)
  if (from || to) {
    list = list.filter((r) => {
      const dt = new Date(r.date);

      if (from) {
        const f = new Date(from);
        f.setHours(0, 0, 0, 0);
        if (dt < f) return false;
      }

      if (to) {
        const t = new Date(to);
        t.setHours(23, 59, 59, 999);
        if (dt > t) return false;
      }

      return true;
    });
  }

  return list;
}, [filteredRecords, filters]);



  const exportToExcel = async () => {
    const XLSX = await import("xlsx");

    // ✔ Use the final date-filtered dataset
    const excelRows = finalFilteredRecords.map((r, idx) => ({
      "Sr No": idx + 1,
      "Date": r.date,
      "Date & Time": r.datetime,
      "Patient Name": r.patient,
      "Room No": r.room,
      "Doctor Name": r.doctor,
      "NPS Rating": r.rating,
      "Category": r.category,
      "Comment": r.comment,
    }));

    const ws = XLSX.utils.json_to_sheet(excelRows);

    ws["!cols"] = Object.keys(excelRows[0] || {}).map(() => ({ wch: 20 }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "NPS Records");

    XLSX.writeFile(
      wb,
      `NPS_Records_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  };



  return (
    <>





      <section className="flex w-[100%] h-[100%] select-none   md11:pr-[0px] overflow-hidden">
        <div className="flex w-[100%] flex-col gap-[0px] h-[100vh]">
        <Header 
  pageName="Nps All Record"
  onFilterChange={(data) => setFilters(data)} 
/>

          <div className="flex  w-[100%] h-[100%]">
            <CubaSidebar />
            <div className="flex flex-col w-[100%]  relative max-h-[93%]  md34:!pb-[120px] m md11:!pb-[30px]  py-[10px] px-[10px]  overflow-y-auto gap-[10px] ">
              <Preloader />
              <div>

    


                <div className="bg-white rounded-lg shadow-sm border md34:!mb-[100px] w-[100%] mx-auto md11:!mb-[0px] border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="md34:!min-w-[1200px] md11:!min-w-full table-auto divide-y divide-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-2 py-[12px] text-left text-[12px] font-medium text-gray-500 uppercase tracking-wider border-r w-[100px]">SR No</th>
                          <th className="px-3 py-[12px] text-left text-[12px] font-medium text-gray-500 uppercase tracking-wider border-r w-[220px]">Date & Time</th>
                          <th className="px-3 py-[12px] text-left text-[12px] font-medium text-gray-500 uppercase tracking-wider border-r w-[250px]">Patient Name</th>
                          <th className="px-3 py-[12px] text-left text-[12px] font-medium text-gray-500 uppercase tracking-wider border-r w-[140px]">Room No</th>
                          <th className="px-3 py-[12px] text-left text-[12px] font-medium text-gray-500 uppercase tracking-wider border-r w-[230px]">Doctor Name</th>
                          <th className="px-3 py-[12px] text-left text-[12px] font-medium text-gray-500 uppercase tracking-wider border-r w-[140px]">NPS Rating</th>
                          <th className="px-3 py-[12px] text-left text-[12px] font-medium text-gray-500 uppercase tracking-wider border-r">Category</th>
                          <th className="px-3 py-[12px] text-left text-[12px] font-medium text-gray-500 uppercase tracking-wider  w-[230px]">Comment</th>
                        </tr>
                      </thead>

                      <tbody className="bg-white divide-y divide-gray-100">
                        {finalFilteredRecords.map((rec, idx) => (
                          <tr key={`${rec.datetime}-${idx}`} className="hover:bg-gray-50 transition-colors">
                            <td className="px-3 py-[12px] text-[13px] border-r text-gray-700">{idx + 1}</td>
                            <td className="px-2 py-[12px] text-[13px] border-r text-gray-900">
                              <div className=' flex gap-[9px]'>


                                <CalendarClock className="w-4 h-4 text-gray-400" />

                                {rec.datetime}

                              </div>
                            </td>

                            {/* 👤 Patient Name with icon */}
                            <td className="px-3 py-[12px] text-[13px] border-r font-[400] text-gray-900">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-gray-400" />
                                <span>{rec.patient || "-"}</span>
                              </div>
                            </td>

                            {/* 🛏️ Room / Bed No with icon */}
                            <td className="px-3 py-[12px] text-[13px] border-r text-gray-900">
                              <div className="flex items-center gap-2">
                                <Bed className="w-4 h-4 text-gray-400" />
                                <span>{rec.room || "-"}</span>
                              </div>
                            </td>

                            {/* 🩺 Doctor Name with icon */}
                            <td className="px-3 py-[12px] text-[13px] border-r text-gray-900">
                              <div className="flex items-center gap-2">
                                <Stethoscope className="w-4 h-4 text-gray-400" />
                                <span>{rec.doctor || "-"}</span>
                              </div>
                            </td>

                            {/* 😄😐😞 NPS Rating with icon */}
                            <td className="px-3 py-[12px] text-[13px] border-r font-[]500 text-gray-900">
                              <div className="flex items-center gap-2">
                                {rec.category === "Promoter" && <Smile className="w-4 h-4 text-emerald-600" />}
                                {rec.category === "Passive" && <Meh className="w-4 h-4 text-amber-500" />}
                                {rec.category === "Detractor" && <Frown className="w-4 h-4 text-rose-600" />}
                                <span>{rec.rating || "-"}</span>
                              </div>
                            </td>

                            {/* 🟢🟡🔴 Category Badge */}
                            <td className="px-3 py-[12px] text-[13px] border-r">
                              <span
                                className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${rec.category === "Promoter"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : rec.category === "Passive"
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-red-100 text-red-800"
                                  }`}
                              >
                                {rec.category}
                              </span>
                            </td>

                            {/* 💬 Comment with truncation */}
                            <td className="px-3 py-[12px] text-[12px] border-r text-gray-700  ">
                              {rec.comment ? rec.comment.split(" ").slice(0, 15).join(" ") + "" : ""}
                            </td>
                          </tr>
                        ))}

                        {filteredRecords.length === 0 && (
                          <tr>
                            <td colSpan={8} className="px-4 py-10 text-center text-gray-500">
                              No records match your filters.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="px-4 py-[12px] bg-gray-50 border-t border-gray-100 text-[13px] text-gray-600 flex items-center justify-between">
                    <span>

                    </span>
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
