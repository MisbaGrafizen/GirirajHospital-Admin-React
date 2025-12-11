
import React, { useEffect, useState } from 'react'
import NewDatePicker from '../MainInputFolder/NewDatePicker'
import { Download, Search } from 'lucide-react'
import ModernDatePicker from '../MainInputFolder/ModernDatePicker'

export default function InternalComFilter({ onFilterChange, onExportExcel, onExportCapa }) {
        const [dateFrom1, setDateFrom1] = useState(null);
  const [dateTo1, setDateTo1] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
    if (onFilterChange) {
      onFilterChange({
        search: searchTerm,
        from: dateFrom1,
        to: dateTo1,
      });
    }
  }, [searchTerm, dateFrom1, dateTo1]);

    return (
        <>
             <div className="px-3 py-2  w-[100%] min-w-[670px] gap-[10px] flex justify-between  items-center">

                  {/* Date Range */}
                  <div className="flex gap-2 ">
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

                           <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search Internal Comp..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-[30px] pr-3 py-[4px] border text-[12px] rounded-md"
                      />
                    </div>
                  </div>

                  {/* Search + Export */}
             
             
                    
                    {/* <button
                      onClick={onExportExcel}
                      className="flex items-center px-2 py-[4px] ml-auto w-fit bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Excel
                    </button>
                    {localStorage.getItem("loginType") === "admin" && (
  <button
    onClick={onExportCapa}
    className="flex items-center px-2 py-[4px] ml-auto w-fit bg-blue-600 text-white rounded-md hover:bg-blue-700"
  >
    <Download className="w-4 h-4 mr-2" />
    Capa
  </button>
)} */}
               
                </div>
        </>
    )
}
