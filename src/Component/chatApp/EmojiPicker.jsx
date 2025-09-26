"use client"

import { motion, AnimatePresence } from "framer-motion"

const EMOJIS = [
  "😀", "😁", "😂", "🤣", "😊", "😍", "😘", "😎",
  "🤩", "🤔", "🙌", "👏", "👍", "🙏", "🔥", "✨",
  "🎉", "🥳", "💖", "💬", "😅", "🥲", "🤗", "😴",
  "😇", "🤤", "😐", "😑", "😶", "🙄"
]

export default function EmojiPicker({ open, onSelect }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 6, scale: 0.98 }}
          transition={{ duration: 0.15 }}
          className="absolute bottom-14 left-2 z-20 w-60 rounded-xl border border-gray-200 bg-white p-2 shadow-lg"
          role="dialog"
          aria-label="Emoji picker"
        >
          <div className="grid grid-cols-8 gap-1.5">
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => onSelect(emoji)}
                className="h-8 w-8 rounded-md hover:bg-gray-100 text-lg flex items-center justify-center"
                aria-label={`Insert emoji ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
