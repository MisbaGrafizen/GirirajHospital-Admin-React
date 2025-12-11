import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import SideBar from '../../Component/sidebar/CubaSidebar'
import Header from '../../Component/header/Header'
import { Calendar, User, Phone, Stethoscope, BedSingle, Star } from "lucide-react"
import { ApiGet } from '../../helper/axios'
import { Loading } from '../../Component/DashboardFiles/Constant'
import Preloader from '../../Component/loader/Preloader'

// ----------------- utils -----------------
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

// ----------------- small UI parts -----------------
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
    <div className="flex items-start gap-3 bg-gray-50 shadow-sm p-3 rounded-lg border border-gray-100">
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

const COMMENT_SERVICE_LABELS = {
  trainingNeeded: "Training Needed",
  challengesSupportNeeded: "Challenges & Support Needed",
  suggestions: "Suggestions"
};


// ----------------- page -----------------
export default function EmployeeFeedbackDetails() {
  const { state } = useLocation()
  const navigate = useNavigate()

  // Prefer state, fallback to session (for refresh)
  const stash = useMemo(() => {
    try {
      const raw = sessionStorage.getItem('opdFeedback:last')
      return raw ? JSON.parse(raw) : null
    } catch { return null }
  }, [])

  const id = state?.id ?? stash?.id ?? null

  const [doc, setDoc] = useState(null)
  const [loading, setLoading] = useState(!!id)
  const [error, setError] = useState(null)

  // Guard: nothing to show -> go back
  useEffect(() => {
    if (!id) {
      setError("No feedback selected.")
      const t = setTimeout(() => navigate('/feedback'), 1200)
      return () => clearTimeout(t)
    }
  }, [id, navigate])

  // ALWAYS fetch full OPD by id (no id in URL; id only in request)
  useEffect(() => {
    if (!id) return
      ; (async () => {
        try {
          setLoading(true); setError(null)
          const res = await ApiGet(`/admin/employee-feedback/${encodeURIComponent(id)}`)
          console.log('res', res)
          setDoc(res?.data ?? res)
        } catch (e) {
          console.error('Fetch feedback by id failed:', e)
          setError('Failed to load feedback.')
        } finally {
          setLoading(false)
        }
      })()
  }, [id])
const model = useMemo(() => {
  if (!doc) return null;
  console.log('doc', doc)

  const r = doc.ratings ?? {};

  const c = {
    trainingNeeded: doc.comments?.trainingNeeded || doc.trainingNeeded || "",
    challengesSupportNeeded: doc.comments?.challengesSupportNeeded || doc.challengesSupportNeeded || "",
    suggestions: doc.comments?.suggestions || doc.suggestions || "",
  };

  return {
    id: String(normId(doc._id ?? doc.id) || ''),
    dateTime: normDate(doc.createdAt),
    employeeName: doc.employeeName ?? "-",
    employeeId: doc.employeeId ?? "-",

    ratings: {
      jobSatisfaction: to05(r.jobSatisfaction),
      feelingValued: to05(r.feelingValued),
      growthOpportunities: to05(r.growthOpportunities),
      trainingSupport: to05(r.trainingSupport),
      welfareFacility: to05(r.welfareFacility),
      trainingNeeded: to05(r.trainingNeeded),
      challengesSupportNeeded: to05(r.challengesSupportNeeded),
      suggestions: to05(r.suggestions),
    },

    comments: c,
    overallRecommendation: doc.overallRecommendation ?? 0,
  };
}, [doc]);

console.log("model", model)

function RatingRow({ label, score, comment }) {
  const hideComment =
    !comment ||
    comment.trim() === "" ||
    comment.trim().toLowerCase() === "nothing";

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-2 rounded-md border border-gray-100 bg-gray-50">
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        {!hideComment && (
          <p className="text-xs text-gray-600 mt-1">📝 {comment}</p>
        )}
      </div>
      <StarRating score={score} label={label} />
    </div>
  );
}



  if (!id) return <div className="p-6 text-red-600">{error || 'No feedback selected.'}</div>
  if (loading) return <div className="p-6"><Preloader /></div>
  if (error) return <div className="p-6 text-red-600">{error}</div>
  if (!model) return null

  return (
    <section className="flex w-[100%] h-[100%] select-none   md11:pr-[0px] overflow-hidden">
      <div className="flex w-[100%] flex-col gap-[0px] h-[100vh]">
        <Header pageName="Feedback Details" />
        <div className="flex gap-[10px] w-[100%] h-[100%]">
          <SideBar />
          <div className="flex flex-col w-[100%] md34:!mx-[10px] mt-[10px] md11:!mx-auto max-h-[99%] pb-[50px] md11:!pr-[15px] overflow-y-auto gap-[30px] ">

            <section className="bg-white  rounded-xl  md11:!mb-[0px] md34:!mb-[160px]   bg-white shadow-sm border border-red-600 ">
              {/* <div className="px-5 py-4 flex items-center justify-between bg-gray-50 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">OPD Feedback</h2>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-sky-50 text-sky-700 ring-1 ring-sky-200">
                  OPD
                </span>
              </div> */}

              <div className="p-4">
                {/* Meta */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <InfoRow icon={Calendar} label="Date & Time" value={formatDateTime(model.dateTime)} />
                  <InfoRow icon={User} label="Employee Name" value={model.employeeName} />
<InfoRow icon={User} label="Employee ID" value={model.employeeId} />
<InfoRow icon={Star} label="Overall Recommendation (NPS)" value={model.overallRecommendation + "/10"} />

                </div>

                <div className="my-6 h-px bg-gray-100" />

                {/* Department-wise ratings ONLY */}
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-4">Employee Ratings</h3>
<div className="space-y-4">

  <RatingRow label="Job Satisfaction" score={model.ratings.jobSatisfaction} />
  <RatingRow label="Feeling Valued" score={model.ratings.feelingValued} />
  <RatingRow label="Growth Opportunities" score={model.ratings.growthOpportunities} />
  <RatingRow label="Training Support" score={model.ratings.trainingSupport} />
  <RatingRow label="Welfare Facility" score={model.ratings.welfareFacility} />

  <RatingRow label="Training Needed" score={model.ratings.trainingNeeded} comment={model.comments.trainingNeeded} />

  <RatingRow label="Challenges & Support Needed" score={model.ratings.challengesSupportNeeded} comment={model.comments.challengesSupportNeeded} />

  <RatingRow label="Suggestions" score={model.ratings.suggestions} comment={model.comments.suggestions} />

</div>

              </div>

              <div className="my-6 h-px bg-gray-100" />

  {/* Final Comments Section
  {Object.entries(model.comments).some(
    ([key, val]) => val && val.trim() !== "" && val.trim().toLowerCase() !== "nothing"
  ) && (
    <div className="mt-6">
      <h3 className="text-base font-semibold text-gray-900 mb-2">
        Comments (service-wise)
      </h3>

      <div className="space-y-3">

        {Object.entries(model.comments).map(([key, val]) => {
          if (!val || typeof val !== "string") return null;

          const text = val.trim();
          if (!text || text.toLowerCase() === "nothing") return null;

          const label = COMMENT_SERVICE_LABELS[key] || key;

          return (
            <div
              key={key}
              className="bg-gray-50 border border-gray-200 rounded-lg p-3"
            >
              <p className="text-sm font-semibold text-gray-900">
                {label}
              </p>
              <p className="text-sm text-gray-700 mt-1">{text}</p>
            </div>
          );
        })}

      </div>
    </div>
  )} */}


          </div>
        </section>

      </div>
    </div>
      </div>
    </section>
  )
}
