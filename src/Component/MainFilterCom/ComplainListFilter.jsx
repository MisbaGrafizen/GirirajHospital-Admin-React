import React, { useEffect, useState } from 'react'
import NewDatePicker from '../MainInputFolder/NewDatePicker'
import { Download, Search } from 'lucide-react'
import ModernDatePicker from '../MainInputFolder/ModernDatePicker'

export default function ComplainListFilter({ onFilterChange }) {
    const [from, setFrom] = useState(null);
    const [to, setTo] = useState(null);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("All Status");

    useEffect(() => {
        onFilterChange?.({
            from,
            to,
            search,
            status
        });
    }, [from, to, search, status]);


    return (
        <>
            <div className="px-3 py-2  w-[] min-w-[670px] gap-[10px] flex justify-between  items-center">

                {/* Date Range */}
                <div className="flex gap-2 ">
                    <ModernDatePicker label="From Date" selectedDate={from} setSelectedDate={setFrom} />
                    <ModernDatePicker label="To Date" selectedDate={to} setSelectedDate={setTo} />


                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search Complain..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-[30px] pr-3 py-[4px] border text-[12px] rounded-md"
                        />
                    </div>
                </div>

                {/* Search + Export */}



                <button
                    //   onClick={exportToExcel}
                    className="flex items-center px-2 py-[4px] ml-auto w-fit bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    <Download className="w-4 h-4 mr-2" />
                    Excel
                </button>

                     <button
                    //   onClick={exportToExcel}
                    className="flex items-center px-2 py-[4px] ml-auto w-fit bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    <Download className="w-4 h-4 mr-2" />
                    CAPA
                </button>

            </div>






        </>
    )
}
