import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import SideBar from '../../Component/sidebar/CubaSideBar'
import Header from '../../Component/header/Header'
import { Calendar, User, Phone, Stethoscope, BedSingle, Star } from "lucide-react"
import { ApiGet } from '../../helper/axios'
import Preloader from '../../Component/loader/Preloader'

// ---------- utils ----------
const normId = (v) =>
  typeof v === 'object' && v !== null
    ? (v.$oid ?? v._id ?? v.toString?.() ?? '')
    : (v ?? '')

const normDate = (v) =>
  typeof v === 'object' && v !== null && '$date' in v ? v.$date : v

const to05 = (x) => {
  const n = Number(x)
  if (!Number.isFinite(n)) return 0
  return Math.min(5, Math.max(0, Math.round(n)))
}

function formatDateTime(dt) {
  if (!dt) return '-'
  const d = new Date(dt)
  return isNaN(d) ? String(dt) : d.toLocaleString()
}

// pull first numeric value among candidate keys
const getScore = (ratings = {}, candidates = []) => {
  for (const key of candidates) {
    const v = Number(ratings?.[key])
    if (Number.isFinite(v)) return to05(v)
  }
  return 0
}

// ---------- tiny UI ----------
function StarRating({ score = 0, label = "Rating" }) {
  const s = to05(score)
  return (
    <div className="flex items-center gap-2" aria-label={`${label}: ${s} out of 5`} role="img">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map(i =>
          i <= s
            ? <Star key={i} className="w-5 h-5 text-yellow-500" strokeWidth={1.5} fill="currentColor" />
            : <Star key={i} className="w-5 h-5 text-gray-300" strokeWidth={1.5} fill="none" />
        )}
      </div>
      <span className="text-sm text-gray-600">{s}/5</span>
    </div>
  )
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border border-gray-100">
      <div className="mt-0.5 text-gray-400">
        <Icon className="w-5 h-5" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-900 truncate">{value || "-"}</p>
      </div>
    </div>
  )
}

// ---------- page ----------
export default function IpdFeedbackDetails() {
  const { state } = useLocation()
  const navigate = useNavigate()

  // keep selection for refreshes (no id in URL)
  useEffect(() => {
    if (state?.id) sessionStorage.setItem('ipdFeedback:last', JSON.stringify({ id: state.id }))
    if (state?.feedback) sessionStorage.setItem('ipdFeedback:row', JSON.stringify(state.feedback))
  }, [state])

  const stash = useMemo(() => {
    try { return JSON.parse(sessionStorage.getItem('ipdFeedback:last') || 'null') } catch { return null }
  }, [])

  const id = state?.id ?? stash?.id ?? null

  const [doc, setDoc] = useState(null)
  const [loading, setLoading] = useState(!!id)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) {
      setError("No feedback selected.")
      const t = setTimeout(() => navigate('/ipd-feedback'), 1200)
      return () => clearTimeout(t)
    }
  }, [id, navigate])

  useEffect(() => {
    if (!id) return
      ; (async () => {
        try {
          setLoading(true); setError(null)
          const res = await ApiGet(`/admin/ipd-patient/${encodeURIComponent(id)}`)
          console.log('res', res)
          setDoc(res?.data ?? res)
        } catch (e) {
          console.error('Fetch IPD feedback by id failed:', e)
          setError('Failed to load feedback.')
        } finally {
          setLoading(false)
        }
      })()
  }, [id])

  const model = useMemo(() => {
    if (!doc) return null
    return {
      id: String(normId(doc._id ?? doc.id) || ''),
      dateTime: normDate(doc.createdAt ?? doc.date ?? doc.dateTime ?? doc.createdOn) || '',
      name: doc.patientName ?? doc.patient ?? doc.name ?? '-',
      contact: doc.contact ?? doc.phone ?? doc.mobile ?? '-',
      doctorName: doc.consultantDoctorName?.name ?? doc.doctor ?? doc.doctorName ?? doc.consultant ?? '-',
      department: doc.department ?? doc.dept ?? 'IPD',
      bedNo: doc.bedNo ?? doc.bed ?? '',
      ratings: {
        overallExperience: to05(doc.ratings?.overallExperience),
        consultantDoctorServices: to05(doc.ratings?.consultantDoctorServices),
        medicalAdminDoctorService: to05(doc.ratings?.medicalAdminDoctorService),
        billingServices: to05(doc.ratings?.billingServices),
        housekeeping: to05(doc.ratings?.housekeeping),
        maintenance: to05(doc.ratings?.maintenance),
        radiologyDiagnosticServices: to05(doc.ratings?.radiologyDiagnosticServices),
        pathologyDiagnosticServices: to05(doc.ratings?.pathologyDiagnosticServices),
        dietitianServices: to05(doc.ratings?.dietitianServices),
        security: to05(doc.ratings?.security),
      },
      extra: {
        doctorType: doc.doctorType ?? "",
        diagnosticType: doc.diagnosticType ?? "",
      },
      comments: doc.comments ?? doc.comment ?? '',
    }
  }, [doc])

  console.log('model', model)

  if (!id) return <div className="p-6 text-red-600">{error || 'No feedback selected.'}</div>
  if (loading) return <div className="p-6">Loading…</div>
  if (error) return <div className="p-6 text-red-600">{error}</div>
  if (!model) return null

  return (
    <>
      <section className="flex w-[100%] h-[100%] select-none   md11:pr-[15px] overflow-hidden">
        <div className="flex w-[100%] flex-col gap-[0px] h=[98vh]">
          <Header pageName="Ipd Feedback Details" />
          <div className="flex  w-[100%] h-[100%]">
            <SideBar />
            <div className="flex flex-col w-[100%] max-h-[90%] pb-[50px] py-[10px] px-[10px]  overflow-y-auto gap-[10px] rounded-[10px]">
            <Preloader />
              <section className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-4">
                  {/* Top info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <InfoRow icon={Calendar} label="Date & Time" value={formatDateTime(model.dateTime)} />
                    <InfoRow icon={User} label="Name" value={model.name} />
                    <InfoRow icon={Phone} label="Contact Number" value={model.contact} />
                    <InfoRow icon={Stethoscope} label="Doctor Name" value={model.doctorName} />
                    <InfoRow icon={User} label="Department Type" value={model.department} />
                    {model.bedNo ? <InfoRow icon={BedSingle} label="Bed No" value={model.bedNo} /> : null}
                  </div>

                  <div className="my-6 h-px bg-gray-100" />

                  {/* Department-wise Ratings */}
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 mb-4">Department-wise Ratings</h3>
                    <div className="space-y-4">
                      {[
                        { key: "overallExperience", label: "Overall Experience" },
                        { key: "consultantDoctorServices", label: "Consultant Doctor Services" },
                        { key: "medicalAdminDoctorService", label: "Medical Admin Doctor Services" },
                        { key: "billingServices", label: "Billing Services" },
                        { key: "housekeeping", label: "Housekeeping" },
                        { key: "maintenance", label: "Maintenance" },
                        { key: "radiologyDiagnosticServices", label: "Radiology Diagnostic Services" },
                        { key: "pathologyDiagnosticServices", label: "Pathology Diagnostic Services" },
                        { key: "dietitianServices", label: "Dietitian Services (Food, Canteen)" },
                        { key: "security", label: "Security" },
                      ].map(({ key, label }) => (
                        <div
                          key={key}
                          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                        >
                          <div><p className="text-sm font-medium text-gray-900">{label}</p></div>
                          <StarRating score={model.ratings[key]} label={label} />
                        </div>
                      ))}
                    </div>


                  </div>

                  <div className="my-6 h-px bg-gray-100" />

                  {/* Comments */}
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 mb-2">Comments (if any)</h3>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {model.comments && model.comments.trim() ? model.comments : "—"}
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
