import React, { useEffect, useState } from "react";
import { Download, Search } from "lucide-react";
import ModernDatePicker from "../MainInputFolder/ModernDatePicker";

export default function IpdListFilter({ onFilterChange, onExportExcel }) {
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // 🔥 Send filter values to parent
  useEffect(() => {
    onFilterChange?.({
      from: dateFrom,
      to: dateTo,
      search: searchTerm,
    });
  }, [dateFrom, dateTo, searchTerm]);

  return (
    <div className="px-3 py-2 w-full flex justify-between items-center gap-3">

      {/* Date Range */}
      <div className="flex gap-2">
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

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search feedback..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-[30px] pr-3 py-[4px] border text-[12px] rounded-md"
          />
        </div>
      </div>

      {/* ⭐ Excel Export Button */}
      <button
        onClick={onExportExcel}
        className="flex items-center px-2 py-[4px] bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        <Download className="w-4 h-4 mr-2" />
        Excel
      </button>

    </div>
  );
}
