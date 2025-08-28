import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import { CalendarIcon } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import 'react-datepicker/dist/react-datepicker.css';

export default function ModernDatePicker({ label = "Select Date", selectedDate, setSelectedDate }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full relative">
      <label className="block text-[8px] rounded-[10px] px-[5px] top-[-8px] left-[10px]  border z-10 bg-white  ] absolute font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        <div
          onClick={() => setOpen(!open)}
          className="flex items-center pl-10 pr-3 py-1 border border-gray-300 rounded-md bg-white cursor-pointer focus-within:ring-2 focus-within:ring-blue-500"
        >
          <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <span className="text-gray-700 text-sm">
            {selectedDate ? selectedDate.toLocaleDateString() : 'Choose date'}
          </span>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-10 mt-2"
            >
              <DatePicker
                selected={selectedDate}
                onChange={(date) => {
                  setSelectedDate(date);
                  setOpen(false);
                }}
                inline
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
