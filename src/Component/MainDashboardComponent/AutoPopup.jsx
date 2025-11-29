import React, { useEffect, useState } from "react";
import infoimg from "../../../public/imges/info.png";

export default function AutoPopup({
  title = "7 Days Overview",
  message = "Your dashboard is updated with the latest insights.",
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Check if popup was shown already
    const isShown = localStorage.getItem("dashboard_popup_shown");

    if (!isShown) {
      // Show after 4 seconds
      const t = setTimeout(() => {
        setOpen(true);
        localStorage.setItem("dashboard_popup_shown", "true"); // Mark as shown
      }, 4000);

      return () => clearTimeout(t);
    }
  }, []);

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        onClick={() => setOpen(false)}
      />

      {/* Popup */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
        w-[90%] max-w-md p-8 rounded-3xl z-50 animate-popup
        bg-white backdrop-blur-xl border border-white/40 shadow-[0_8px_40px_rgba(0,0,0,0.25)]">

        {/* Icon */}
        <div className="mx-auto -mt-[80px] mb-4 w-28 h-28 rounded-full bg-gradient-to-tr from-blue-500 to-blue-700 shadow-xl flex items-center justify-center ring-white/40">
          <img src={infoimg} alt="Info" className="w-full h-full rounded-full" />
        </div>

        <h2 className="text-2xl font-semibold text-gray-900 mb-3 tracking-wide">
          {title}
        </h2>

        <p className="text-gray-700 text-base leading-relaxed">
          {message}
        </p>

        <button
          onClick={() => setOpen(false)}
          className="mt-6 bg-blue-600 py-2 w-full rounded-md text-white font-semibold text-sm shadow-md hover:bg-blue-700 transition"
        >
          Okay
        </button>
      </div>

      <style>{`
        .animate-popup {
          animation: popup 0.35s ease-out;
        }
        @keyframes popup {
          from { transform: translate(-50%, -46%) scale(0.94); opacity: 0; }
          to { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
      `}</style>
    </>
  );
}
