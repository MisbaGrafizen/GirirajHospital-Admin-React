
import React, { useState, useEffect } from 'react'
import { Download, Search } from 'lucide-react'
import ModernDatePicker from '../MainInputFolder/ModernDatePicker'

export default function ExcutiveFilter({ onFilterChange, onExportExcel }) {
    const [dateFrom1, setDateFrom1] = useState(null)
    const [dateTo1, setDateTo1] = useState(null)
    const [search, setSearch] = useState("")

    // Send filter data to parent (Header → page)
useEffect(() => {
    const normalizeISO = (d) => {
        if (!d) return null;
        const dd = new Date(d);
        if (isNaN(dd)) return null;

        const y = dd.getFullYear();
        const m = String(dd.getMonth() + 1).padStart(2, "0");
        const da = String(dd.getDate()).padStart(2, "0");

        return `${y}-${m}-${da}`;
    };

    onFilterChange &&
        onFilterChange({
            from: normalizeISO(dateFrom1),
            to: normalizeISO(dateTo1),
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
                    onClick={onExportExcel}
                    className="flex items-center px-2 py-[4px] ml-auto w-fit bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    <Download className="w-4 h-4 mr-2" />
                    Excel
                </button>

            </div>
        </>
    )
}
