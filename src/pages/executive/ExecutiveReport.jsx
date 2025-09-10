"use client"

import { useState } from "react"
import SideBar from "../../Component/sidebar/CubaSideBar"
import Header from "../../Component/header/Header"

import { Filter, Calendar, TrendingUp, TrendingDown, CheckCircle, AlertTriangle, Circle } from "lucide-react"


export default function ExecutiveReport() {
    // Filters (static UI; no backend required)
    const [fromDate, setFromDate] = useState("2025-08-01")
    const [toDate, setToDate] = useState("2025-08-31")

    // Static metrics per spec
    const metrics = [
        {
            metric: "Overall OPD Feedback",
            value: "82.9%",
            trend: { value: "+4.0", direction: "up" },
            status: { type: "good", label: "Good" },
        },
        {
            metric: "Overall IPD Feedback",
            value: "78.0%",
            trend: { value: "-2.0", direction: "down" },
            status: { type: "attention", label: "Needs Attention" },
        },
        {
            metric: "NPS (IPD)",
            value: "+52",
            trend: { value: "+7", direction: "up" },
            status: { type: "improving", label: "Improving" },
        },
        {
            metric: "Complaints",
            value: "23",
            trend: { value: "+5", direction: "up" },
            status: { type: "attention", label: "Needs Attention" },
        },
        {
            metric: "Avg Doctor Rating",
            value: "2.3/3",
            trend: { value: "+0.2", direction: "up" },
            status: { type: "stable", label: "Stable" },
        },
        {
            metric: "Cleanliness (Score)",
            value: "88.9%",
            trend: { value: "-3.8%", direction: "down" },
            status: { type: "attention", label: "Needs Attention" },
        },
    ]

    function statusStyles(type) {
        switch (type) {
            case "good":
                return { Icon: CheckCircle, iconClass: "text-emerald-600" }
            case "improving":
                return { Icon: TrendingUp, iconClass: "text-sky-600" }
            case "stable":
                return { Icon: Circle, iconClass: "text-emerald-600" }
            case "attention":
            default:
                return { Icon: AlertTriangle, iconClass: "text-amber-600" }
        }
    }

    function trendColor(direction) {
        return direction === "down" ? "text-red-700" : "text-emerald-700"
    }
    function TrendIcon({ direction }) {
        const Icon = direction === "down" ? TrendingDown : TrendingUp
        return <Icon className="w-4 h-4" aria-hidden="true" />
    }

    const handleFilter = (e) => {
        e.preventDefault()
        // UI-only demo; values remain static as requested.
    }

    return (

        <>



            <section className="flex w-[100%] h-[100%] select-none py-[15px] pr-[15px] overflow-hidden">
                <div className="flex w-[100%] flex-col gap-[0px] h-[96vh]">
                    <Header pageName="Executive Report" />
                    <div className="flex gap-[10px] w-[100%] h-[100%]">
                        <SideBar />
                        <div className="flex flex-col w-[100%] max-h-[90%] pb-[50px] bg-white ] pr-[15px] overflow-y-auto gap-[30px] rounded-[10px]">

                            <main className="">
                                {/* Title */}


                                {/* Filters — conservative, bordered panel */}
                                <section className="mb-6 border border-gray-200 rounded-md">
                                    <form onSubmit={handleFilter} className="p-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">



                                            <div className=" relative">
                                                <label className="block  text-[10px] font-medium top-[-8px] left-[10px] border-gray-300  bg-white border px-[10px] rounded-[10px] z-[3] absolute text-gray-700 mb-1">From</label>
                                                <div className="relative">
                                                    <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                                    <input
                                                        type="date"
                                                        value={fromDate}
                                                        max={toDate}
                                                        onChange={(e) => setFromDate(e.target.value)}
                                                        className="w-full pl-9 text-[14px] pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                                                    />
                                                </div>
                                            </div>
                                            {/* To date */}
                                            <div className=" relative">
                                                <label className="block  text-[10px] font-medium top-[-8px] left-[10px] border-gray-300  bg-white border px-[10px] rounded-[10px] z-[3] absolute text-gray-700 mb-1">To</label>
                                                <div className="relative">
                                                    <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                                    <input
                                                        type="date"
                                                        value={toDate}
                                                        min={fromDate}
                                                        onChange={(e) => setToDate(e.target.value)}
                                                        className="w-full pl-9 pr-3 py-2 text-[14px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                                                    />
                                                </div>
                                            </div>
                                        
                                        </div>
                                    </form>
                                </section>

                                {/* Table — professional, bordered, zebra rows, minimal hover */}
                                <section aria-labelledby="metrics-table" className="border border-gray-200 rounded-md overflow-hidden">
                                    <h2 id="metrics-table" className="sr-only">
                                        Metric Summary Table
                                    </h2>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full table-fixed">
                                            <colgroup>
                                                <col className="w-2/5" />
                                                <col className="w-1/5" />
                                                <col className="w-1/5" />
                                                <col className="w-1/5" />
                                            </colgroup>
                                            <thead className="bg-gray-100 border-b border-gray-200">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                        Metric
                                                    </th>
                                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                        Value
                                                    </th>
                                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                        Trend vs Last Month
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                        Status
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {metrics.map((row, idx) => {
                                                    const { Icon, iconClass } = statusStyles(row.status.type)
                                                    return (
                                                        <tr
                                                            key={row.metric}
                                                            className={idx % 2 === 0 ? "bg-white" : "bg-gray-50 hover:bg-gray-100 transition-colors"}
                                                        >
                                                            <td className="px-4 py-3 text-sm font-semibold text-gray-900">{row.metric}</td>
                                                            <td className="px-4 py-3 text-center">
                                                                <span className="text-base sm:text-lg font-semibold text-gray-900">{row.value}</span>
                                                            </td>
                                                            <td className="px-4 py-3 text-center">
                                                                <span
                                                                    className={`inline-flex items-center gap-2 text-sm font-medium ${trendColor(row.trend.direction)}`}
                                                                >
                                                                    <TrendIcon direction={row.trend.direction} />
                                                                    {row.trend.value}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <span className="inline-flex items-center gap-2 text-sm text-gray-800">
                                                                    <Icon className={`w-4 h-4 ${iconClass}`} aria-hidden="true" />
                                                                    <span className="font-medium">{row.status.label}</span>
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    )
                                                })}
                                            </tbody>
                                            <tfoot>
                                                <tr>
                                                    <td colSpan={4} className="px-4 py-3 bg-gray-100 border-t border-gray-200 text-xs text-gray-600">
                                                        Report period: {fromDate} to {toDate}
                                                    </td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </section>
                            </main>


                        </div>

                    </div>
                </div>
            </section>


        </>
    )
}
