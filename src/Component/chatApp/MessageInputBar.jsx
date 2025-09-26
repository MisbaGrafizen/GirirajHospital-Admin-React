"use client"

import { useEffect, useRef, useState } from "react"
import { Smile, Paperclip, Send, FileText, ImageIcon, VideoIcon, X } from "lucide-react"
import { motion } from "framer-motion"
import EmojiPicker from "../../Component/chatApp/EmojiPicker"

export default function MessageInputBar({ onSend }) {
  const [value, setValue] = useState("")
  const [emojiOpen, setEmojiOpen] = useState(false)
  const [preview, setPreview] = useState(null)

  const taRef = useRef(null)
  const imgInputRef = useRef(null)
  const videoInputRef = useRef(null)
  const docInputRef = useRef(null)

  useEffect(() => {
    if (!taRef.current) return
    taRef.current.style.height = "0px"
    const scrollH = taRef.current.scrollHeight
    taRef.current.style.height = Math.min(scrollH, 140) + "px"
  }, [value])

  const handleFile = (file, type) => {
    const url = URL.createObjectURL(file)
    setPreview({ type, url, name: file.name })
  }

  const send = () => {
    if (preview) {
      onSend({ type: preview.type, file: preview })
      setPreview(null)
      return
    }
    const trimmed = value.trim()
    if (!trimmed) return
    onSend({ type: "text", content: trimmed })
    setValue("")
  }

  return (
    <div className="relative border-t p-2 md:p-3 bg-white">
      {/* Preview Block */}
      {preview && (
        <div className="mb-2 flex items-center gap-3 rounded-lg border border-dashed p-2">
          {preview.type === "image" ? (
            <img
              src={preview.url}
              alt={preview.name || "Image"}
              className="h-16 w-16 rounded-md object-cover"
            />
          ) : preview.type === "video" ? (
            <video src={preview.url} className="h-16 w-16 rounded-md object-cover" />
          ) : (
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <span className="text-sm">{preview.name || "Document"}</span>
            </div>
          )}
          <button
            className="ml-auto flex items-center gap-1 rounded-md bg-gray-200 px-2 py-1 text-xs hover:opacity-80"
            onClick={() => setPreview(null)}
          >
            <X className="h-4 w-4" /> Remove
          </button>
        </div>
      )}

      {/* Input Row */}
      <div className="flex items-end gap-2">
        {/* Emoji Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setEmojiOpen((o) => !o)}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            <Smile className="h-5 w-5 text-gray-600" />
          </button>
          <EmojiPicker
            open={emojiOpen}
            onSelect={(e) => {
              setValue((v) => v + e)
              setEmojiOpen(false)
            }}
          />
        </div>

        {/* File Attach */}
        <div className="relative">
          <button
            type="button"
            className="p-2 rounded-md hover:bg-gray-100"
            onClick={() => {
              // Simple menu toggle: default to image
              imgInputRef.current?.click()
            }}
          >
            <Paperclip className="h-5 w-5 text-gray-600" />
          </button>
          {/* Hidden Inputs */}
          <input
            ref={imgInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) handleFile(f, "image")
              e.target.value = ""
            }}
          />
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) handleFile(f, "video")
              e.target.value = ""
            }}
          />
          <input
            ref={docInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) handleFile(f, "doc")
              e.target.value = ""
            }}
          />
        </div>

        {/* Text Area */}
        <textarea
          ref={taRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Type a message"
          className="min-h-[44px] max-h-[140px] flex-1 resize-none rounded-xl border px-3 py-2 leading-6 focus:outline-none"
          onBlur={() => setEmojiOpen(false)}
        />

        {/* Send Button */}
        <motion.div whileTap={{ scale: 0.95 }}>
          <button
            type="button"
            onClick={send}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-white hover:bg-blue-700"
          >
            <Send className="h-4 w-4" /> Send
          </button>
        </motion.div>
      </div>
    </div>
  )
}
