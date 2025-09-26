"use client"

import { motion, AnimatePresence } from "framer-motion"

export default function VideoPlayerModal({ open, onOpenChange, src, title = "Video" }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-xl shadow-xl max-w-3xl w-full p-4"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-2 mb-4">
              <h2 className="text-lg font-semibold">{title}</h2>
              <button
                onClick={() => onOpenChange(false)}
                className="text-gray-500 hover:text-gray-800"
              >
                ✕
              </button>
            </div>

            {/* Video */}
            {src ? (
              <video src={src} controls className="w-full rounded-xl" />
            ) : (
              <p className="text-center text-gray-500">No video available</p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
