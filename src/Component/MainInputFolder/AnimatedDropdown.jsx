import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

export default function AnimatedDropdown({ label, icon: Icon, options = [], selected, onChange }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <label className="block text-[8px] rounded-[10px] px-[5px] top-[-8px] left-[10px]  border z-10 bg-white  ] absolute font-medium text-gray-700 mb-1">{label}</label>
      <div
        className="flex items-center w-full pl-10 pr-3 py-1 border border-gray-300 rounded-md bg-white cursor-pointer relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        {Icon && <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />}
        <span className="text-[13px] text-gray-700">{selected}</span>
        <ChevronDown className="ml-auto w-4 h-4 text-gray-400" />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.ul
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-md"
          >
            {options.map((opt) => (
              <li
                key={opt}
                onClick={() => {
                  onChange(opt);
                  setIsOpen(false);
                }}
                className="px-4 py-2 text-[13px] hover:bg-blue-50 cursor-pointer"
              >
                {opt}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
