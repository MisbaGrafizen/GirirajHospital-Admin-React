  import { DayPicker } from "react-day-picker";
  import "react-day-picker/dist/style.css";
  import { CalendarIcon } from "lucide-react";
  import { useState, useEffect, useRef } from "react";

  export default function ModernDatePicker({
    label = "Select Date",
    selectedDate,
    setSelectedDate,
  }) {
    const [open, setOpen] = useState(false);
    const pickerRef = useRef(null);

    // ✅ Detect click outside and close
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (pickerRef.current && !pickerRef.current.contains(event.target)) {
          setOpen(false);
        }
      };

      if (open) {
        document.addEventListener("mousedown", handleClickOutside);
      } else {
        document.removeEventListener("mousedown", handleClickOutside);
      }

      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    return (
      <div className="relative w-full">
        {/* Label */}
        <label className="block text-[7px] rounded-[10px] px-[5px] top-[-7px] left-[10px] border z-5 bg-white absolute font-medium text-gray-700 mb-1">
          {label}
        </label>

        {/* Input display */}
        <div
          onClick={() => setOpen(!open)}
          className="flex items-center px-3 py-[3px] border border-gray-300 rounded-md bg-white cursor-pointer"
        >
          <CalendarIcon className="w-3 h-3 text-gray-400 mr-2" />
          <span className="text-[13px] text-gray-700">
            {selectedDate ? selectedDate.toLocaleDateString() : "Choose date"}
          </span>
        </div>

        {/* Popup Calendar */}
        {open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div ref={pickerRef} className="bg-white border rounded-lg shadow-lg p-4">
              <DayPicker
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  setSelectedDate(date);
                  setOpen(false);
                }}
              />
              <button
                onClick={() => setOpen(false)}
                className="mt-3 px-4 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
          )}
        </div>
      );
  }
