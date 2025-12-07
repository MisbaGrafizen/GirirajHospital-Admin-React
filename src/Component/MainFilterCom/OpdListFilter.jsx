import React, { useEffect, useState } from 'react'
import { Download, Search } from 'lucide-react'
import ModernDatePicker from '../MainInputFolder/ModernDatePicker'

export default function OpdListFilter({ onChange }) {

  const [dateFrom, setDateFrom] = useState(null)
  const [dateTo, setDateTo] = useState(null)
  const [search, setSearch] = useState("")

  // 🔥 Send filter data upward to Header → OPD All List
  useEffect(() => {
    if (onChange) {
      onChange({
        search,
        from: dateFrom,
        to: dateTo,
      });
    }
  }, [search, dateFrom, dateTo]);
  console.log('dateFrom', dateFrom)
  console.log('dateTo', dateTo)

  return (
    <>
      <div className="px-3 py-2 w-[100%] min-w-[100%] gap-[10px] flex justify-between items-center">

        {/* Date Range + Search */}
        <div className="flex gap-2 w-[500px]">

          <ModernDatePicker
            label="From Date"
            selectedDate={dateFrom}
            setSelectedDate={setDateFrom}
          />

          <ModernDatePicker
            label="To Date"
            selectedDate={dateTo}
            setSelectedDate={setDateTo}
          />

          {/* Search Field */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search feedback..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-[30px] pr-3 py-[4px] border text-[12px] rounded-md"
            />
          </div>

        </div>

        {/* Export Button */}
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
