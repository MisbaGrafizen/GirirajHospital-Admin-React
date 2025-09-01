import React from 'react'
import SideBar from '../../Component/sidebar/SideBar'
import Header from '../../Component/header/Header'



import { Calendar, User, Phone, Stethoscope, BedSingle, Star, ClipboardList } from "lucide-react"

// Read-only star display: highlights N out of 5 stars using fill for active stars
function StarRating({ score = 0, label = "Rating" }) {
    const stars = [1, 2, 3, 4, 5]
    const clamped = Math.max(0, Math.min(5, Math.round(score)))
    return (
        <div className="flex items-center gap-2" aria-label={`${label}: ${clamped} out of 5`} role="img">
            <div className="flex items-center">
                {stars.map((i) =>
                    i <= clamped ? (
                        <Star
                            key={i}
                            className="w-5 h-5 text-yellow-500"
                            strokeWidth={1.5}
                            fill="currentColor"
                            aria-hidden="true"
                        />
                    ) : (
                        <Star key={i} className="w-5 h-5 text-gray-300" strokeWidth={1.5} fill="none" aria-hidden="true" />
                    ),
                )}
            </div>
            <span className="text-sm text-gray-600">{clamped}/5</span>
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

export default function FeedbackDetails() {
    const opd = {
        dateTime: "2025-08-20 09:45",
        name: "Aarav Patel",
        contact: "+91 98765 11111",
        doctorName: "Dr. Mehta",
        department: "OPD",
        // no bedNo for OPD
        scores: { appointmentBooking: 3, receptionServices: 4, doctorServices: 5 },
        comments: "Quick consultation. Reception could be faster during peak hours.",
    }

    const ipd = {
        dateTime: "2025-08-22 14:10",
        name: "Priya Sharma",
        contact: "+91 98765 22222",
        doctorName: "Dr. Rao",
        department: "IPD",
        bedNo: "B-210",
        scores: { appointmentBooking: 4, receptionServices: 5, doctorServices: 4 },
        comments: "Nursing staff were attentive. Doctor explained treatment plan clearly. Overall a comfortable stay.",
    }


    return (
        <>

            <section className="flex w-[100%] h-[100%] select-none p-[15px] overflow-hidden">
                <div className="flex w-[100%] flex-col gap-[14px] h-[96vh]">
                    <Header pageName="Feedback Details" />
                    <div className="flex gap-[10px] w-[100%] h-[100%]">
                        <SideBar />
                        <div className="flex flex-col w-[100%] max-h-[97%] pb-[50px] bg-white pr-[15px]  gap-[30px] rounded-[10px]">


                            <div className="">
                                <div className="">
                  

                                    {/* OPD Card */}
                                    <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                        <div className="px-5 py-4 flex items-center justify-between bg-gray-50 border-b border-gray-100">
                                            <h2 className="text-lg font-semibold text-gray-900">OPD Feedback</h2>
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-sky-50 text-sky-700 ring-1 ring-sky-200">
                                                OPD
                                            </span>
                                        </div>

                                        <div className="p-5">
                                            {/* Info grid */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                <InfoRow icon={Calendar} label="Date & Time" value={opd.dateTime} />
                                                <InfoRow icon={User} label="Name" value={opd.name} />
                                                <InfoRow icon={Phone} label="Contact Number" value={opd.contact} />
                                                <InfoRow icon={Stethoscope} label="Doctor Name" value={opd.doctorName} />
                                                <InfoRow icon={User} label="Department Type" value={opd.department} />
                                                {/* Bed No intentionally hidden for OPD */}
                                            </div>

                                            {/* Divider */}
                                            <div className="my-6 h-px bg-gray-100" />

                                            {/* Scores */}
                                            <div>
                                                <h3 className="text-base font-semibold text-gray-900 mb-4">Feedback Scores</h3>
                                                <div className="space-y-4">
                                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900">Appointment Booking</p>
                                                            <p className="text-xs text-gray-500">Ease of scheduling and appointment availability</p>
                                                        </div>
                                                        <StarRating score={opd.scores.appointmentBooking} label="Appointment Booking" />
                                                    </div>
                                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900">Reception Services</p>
                                                            <p className="text-xs text-gray-500">Professionalism and responsiveness of reception</p>
                                                        </div>
                                                        <StarRating score={opd.scores.receptionServices} label="Reception Services" />
                                                    </div>
                                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900">Doctor Services</p>
                                                            <p className="text-xs text-gray-500">Doctor’s communication and care quality</p>
                                                        </div>
                                                        <StarRating score={opd.scores.doctorServices} label="Doctor Services" />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Divider */}
                                            <div className="my-6 h-px bg-gray-100" />

                                            {/* Comments */}
                                            <div>
                                                <h3 className="text-base font-semibold text-gray-900 mb-2">Comments (if any)</h3>
                                                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                                    {opd.comments && opd.comments.trim() ? opd.comments : "—"}
                                                </p>
                                            </div>
                                        </div>
                                    </section>

                                    {/* IPD Card */}
                                    {/* <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                        <div className="px-5 py-4 flex items-center justify-between bg-gray-50 border-b border-gray-100">
                                            <h2 className="text-lg font-semibold text-gray-900">IPD Feedback</h2>
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-violet-50 text-violet-700 ring-1 ring-violet-200">
                                                IPD
                                            </span>
                                        </div>

                                        <div className="p-5">
                                          
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                <InfoRow icon={Calendar} label="Date & Time" value={ipd.dateTime} />
                                                <InfoRow icon={User} label="Name" value={ipd.name} />
                                                <InfoRow icon={Phone} label="Contact Number" value={ipd.contact} />
                                                <InfoRow icon={Stethoscope} label="Doctor Name" value={ipd.doctorName} />
                                                <InfoRow icon={User} label="Department Type" value={ipd.department} />
                                                {ipd.bedNo ? <InfoRow icon={BedSingle} label="Bed No" value={ipd.bedNo} /> : null}
                                            </div>

                                            
                                            <div className="my-6 h-px bg-gray-100" />

                                            
                                            <div>
                                                <h3 className="text-base font-semibold text-gray-900 mb-4">Feedback Scores</h3>
                                                <div className="space-y-4">
                                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900">Appointment Booking</p>
                                                            <p className="text-xs text-gray-500">Ease of scheduling and appointment availability</p>
                                                        </div>
                                                        <StarRating score={ipd.scores.appointmentBooking} label="Appointment Booking" />
                                                    </div>
                                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900">Reception Services</p>
                                                            <p className="text-xs text-gray-500">Professionalism and responsiveness of reception</p>
                                                        </div>
                                                        <StarRating score={ipd.scores.receptionServices} label="Reception Services" />
                                                    </div>
                                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900">Doctor Services</p>
                                                            <p className="text-xs text-gray-500">Doctor’s communication and care quality</p>
                                                        </div>
                                                        <StarRating score={ipd.scores.doctorServices} label="Doctor Services" />
                                                    </div>
                                                </div>
                                            </div>


                                            <div className="my-6 h-px bg-gray-100" />

                                     
                                            <div>
                                                <h3 className="text-base font-semibold text-gray-900 mb-2">Comments (if any)</h3>
                                                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                                    {ipd.comments && ipd.comments.trim() ? ipd.comments : "—"}
                                                </p>
                                            </div>
                                        </div>
                                    </section> */}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>



        </>
    )
}
