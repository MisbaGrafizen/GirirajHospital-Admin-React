
import React, { useState, useEffect } from 'react'
import { Download, Search } from 'lucide-react'
import ModernDatePicker from '../MainInputFolder/ModernDatePicker'

export default function ExcutiveFilter({ onFilterChange }) {
    const [dateFrom1, setDateFrom1] = useState(null)
    const [dateTo1, setDateTo1] = useState(null)
    const [search, setSearch] = useState("")

    // 🔥 Send filter data to parent (Header → page)
useEffect(() => {
    onFilterChange &&
        onFilterChange({
            from: dateFrom1 ? new Date(dateFrom1) : null,
            to: dateTo1 ? new Date(dateTo1) : null,
            search,
        });
}, [dateFrom1, dateTo1, search]);

    return (
        <>
            <div className="px-3 py-2  w-[400px]  gap-[10px] flex justify-between  items-center">

                {/* Date Range */}
                <div className="flex gap-2 w-[500px]">
                    <ModernDatePicker
                        label="From Date"
                        selectedDate={dateFrom1}
                        setSelectedDate={setDateFrom1}
                    />
                    <ModernDatePicker
                        label="To Date"
                        selectedDate={dateTo1}
                        setSelectedDate={setDateTo1}
                    />


                </div>

                {/* Excel Button */}
                <button
                    className="flex items-center px-2 py-[4px] ml-auto w-fit bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    <Download className="w-4 h-4 mr-2" />
                    Excel
                </button>

            </div>
        </>
    )
}
