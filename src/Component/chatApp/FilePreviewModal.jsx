import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"

export default function FilePreviewModal({ open, onOpenChange, src, title = "Image" }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => onOpenChange(false)}
          />

          {/* Modal Content */}
          <motion.div
            className="relative z-50 w-full max-w-3xl rounded-lg bg-white shadow-xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b p-4">
              <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
              <button
                onClick={() => onOpenChange(false)}
                className="text-gray-500 hover:text-red-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4">
              {src ? (
                <motion.img
                  key={src}
                  src={src}
                  alt={title}
                  className="w-full rounded-xl"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                />
              ) : (
                <p className="text-center text-gray-500 py-10">No preview available</p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
