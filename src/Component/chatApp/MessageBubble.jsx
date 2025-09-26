"use client"

import { motion } from "framer-motion"
import { FileText } from "lucide-react"

export default function MessageBubble({
  message,
  isOwn = false,
  onOpenImage,
  onOpenVideo,
  onOpenDoc,
}) {
  const baseClasses =
    "max-w-[80%] md:max-w-[65%] rounded-2xl px-3 py-2 shadow-sm text-sm leading-relaxed"
  const bubbleClasses = isOwn
    ? "bg-blue-600 text-white rounded-br-md"
    : "bg-gray-200 text-gray-900 rounded-bl-md"

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: isOwn ? 20 : -20, scale: 0.98 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0 }}
      className={`flex items-end gap-2 ${isOwn ? "justify-end" : "justify-start"}`}
    >
      <div className={`${baseClasses} ${bubbleClasses}`}>
        {/* Text */}
        {message.type === "text" && (
          <p className="whitespace-pre-wrap">{message.content}</p>
        )}

        {/* Image */}
        {message.type === "image" && (
          <img
            src={message.url || "/placeholder.svg"}
            alt={message.name || "Image"}
            className="rounded-xl max-h-60 object-cover cursor-zoom-in"
            onClick={() => onOpenImage?.(message.url)}
          />
        )}

        {/* Video */}
        {message.type === "video" && (
          <video
            src={message.url}
            className="rounded-xl max-h-60 cursor-pointer"
            controls
            onClick={() => onOpenVideo?.(message.url)}
          />
        )}

        {/* Document */}
        {message.type === "doc" && (
          <button
            className="flex items-center gap-2 p-2 rounded-md bg-gray-100 text-gray-800 text-sm hover:bg-gray-200 transition"
            onClick={() =>
              onOpenDoc?.({ name: message.name || "document", url: message.url })
            }
          >
            <FileText className="h-4 w-4" />
            {message.name || "Document"}
          </button>
        )}

        {/* Timestamp */}
        <div
          className={`mt-1 text-[10px] opacity-70 ${
            isOwn ? "text-right" : "text-left"
          }`}
        >
          {message.time}
        </div>
      </div>
    </motion.div>
  )
}
