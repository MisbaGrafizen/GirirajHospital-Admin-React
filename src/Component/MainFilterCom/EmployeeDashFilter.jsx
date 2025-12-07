
import React, { useState } from 'react'
import NewDatePicker from '../MainInputFolder/NewDatePicker'
import { Download, Search } from 'lucide-react'
import ModernDatePicker from '../MainInputFolder/ModernDatePicker'

export default function EmployeeDashFilter() {
      const [dateFrom1, setDateFrom1] = useState(null)
      const [dateTo1, setDateTo1] = useState(null)
    return (
        <>
             <div className="px-3 py-2  w-[370px]  gap-[10px] flex justify-between  items-center">

                  {/* Date Range */}
                  <div className="flex gap-3 w-[500px]">
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

               
                </div>






        </>
    )
}
