import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function AnimatedDropdownNavigate({ label, icon: Icon, options = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  // 🔑 Sync selected item with current route
  useEffect(() => {
    const current = options.find((opt) => opt.href === location.pathname);
    setSelected(current || options[0] || null);
  }, [location.pathname, options]);

  const handleSelect = (opt) => {
    setIsOpen(false);
    if (opt.href) {
      navigate(opt.href);
    }
  };

  // ✅ Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-[100%]" ref={dropdownRef}>
      <label className="block text-[10px] rounded-[10px] px-[5px] top-[-8px] left-[10px] border z-10 bg-white absolute font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div
        className="flex items-center w-full min-w-[360px] pl-2 pr-3 py-2 border border-gray-400 rounded-md bg-white cursor-pointer relative"
        onClick={() => setIsOpen(!isOpen)}
      >
     
        <div className="flex items-center gap-2 text-[15px] text-gray-700">
          {selected?.icon && <FontAwesomeIcon icon={selected.icon} className="text-gray-500" />}
          <span>{selected?.label || "Select"}</span>
        </div>
        <ChevronDown className="ml-auto w-4 h-4 text-gray-400" />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.ul
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="absolute z-[200] flex gap-[5px] pb-[10px] flex-col mt-1 w-full bg-white border border-gray-200 rounded-md shadow-md"
          >
            {options.map((opt) => (
              <li
                key={opt.id}
                onClick={() => handleSelect(opt)}
                className={`flex items-center gap-2 px-4 py-[7px] text-[15px] font-[500] cursor-pointer ${
                  selected?.id === opt.id ? "bg-blue-100 text-blue-600" : "hover:bg-blue-50"
                }`}
              >
                {opt.icon && <FontAwesomeIcon icon={opt.icon} className="text-gray-500" />}
                {opt.label}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
