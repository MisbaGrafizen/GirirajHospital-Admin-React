import React, { useState, useEffect } from 'react'
import { Download, Search } from 'lucide-react'
import ModernDatePicker from '../MainInputFolder/ModernDatePicker'

export default function NpsListFilter({ onFilterChange, onExportExcel }) {
  const [dateFrom1, setDateFrom1] = useState(null)
  const [dateTo1, setDateTo1] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")

  // 🔥 Send filter updates to Header (and then to parent page)
  useEffect(() => {
    if (onFilterChange) {
      onFilterChange({
        from: dateFrom1,
        to: dateTo1,
        search: searchTerm,
      })
    }
  }, [dateFrom1, dateTo1, searchTerm])

  return (
    <>
      <div className="px-3 py-2 w-[100%] flex justify-between items-center gap-[10px]">

        {/* Date Range + Search */}
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

          {/* Search Field */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search Nps..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-[30px] pr-3 py-[4px] border text-[12px] rounded-md"
            />
          </div>
        </div>

        {/* Export Button */}
        {/* <button 
        onClick={onExportExcel}
        className="flex items-center px-2 py-[4px] ml-auto bg-blue-600 text-white rounded-md hover:bg-blue-700">
          <Download className="w-4 h-4 mr-2" />
          Excel
        </button> */}
      </div>
    </>
  )
}
