import React, { useEffect, useMemo, useState } from 'react'
import Header from '../../../Component/header/Header'
import CubaSidebar from '../../../Component/sidebar/CubaSidebar'
import Preloader from '../../../Component/loader/Preloader'
import { ApiGet } from '../../../helper/axios'

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
        return recs.sort((a, b) => a.date.localeCompare(b.date) || a.datetime.localeCompare(b.datetime))
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

  return (
 <>





          <section className="flex w-[100%] h-[100%] select-none   md11:pr-[15px] overflow-hidden">
        <div className="flex w-[100%] flex-col gap-[0px] h-[100vh]">
          <Header pageName="Nps All Record"  />
          <div className="flex  w-[100%] h-[100%]">
            <CubaSidebar />
          <div className="flex flex-col w-[100%]  relative max-h-[93%]  md34:!pb-[120px] m md11:!pb-[30px]  py-[10px] pr-[10px]  overflow-y-auto gap-[10px] rounded-[10px]">
              <Preloader />
             <div>

       <div className="bg-white rounded-lg shadow-sm border md34:!mb-[100px] w-[96%] mx-auto  md11:!mb-[0px] border-gray-100 overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="md34:!min-w-[1200px] md11:!min-w-full table-auto divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SR No</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Name</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room No</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor Name</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NPS Rating</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comment</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-100">
                            {filteredRecords
                              .map((rec, idx) => (
                                <tr key={`${rec.datetime}-${idx}`} className="hover:bg-gray-50 transition-colors">
                                  <td className="px-4 py-3 text-sm text-gray-700">{idx + 1}</td>
                                  <td className="px-4 py-3 text-sm text-gray-900">{rec.datetime}</td>
                                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{rec.patient}</td>
                                  <td className="px-4 py-3 text-sm text-gray-900">{rec.room}</td>
                                  <td className="px-4 py-3 text-sm text-gray-900">{rec.doctor}</td>
                                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">{rec.rating}</td>
                                  <td className="px-4 py-3 text-sm">
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
                                  <td className="px-4 py-3 text-sm text-gray-700 max-w-sm truncate">{rec.comment || "-"}</td>
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
                      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 text-sm text-gray-600 flex items-center justify-between">
                        <span>Showing {Math.min(400, filteredRecords.length)} of {filteredRecords.length} records</span>
                        {/* <span className="text-gray-500">Colors: Promoter (green), Passive (yellow), Detractor (red)</span> */}
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
