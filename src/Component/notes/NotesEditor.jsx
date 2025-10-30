"use client"

import { useState, useEffect } from "react"

export default function NotesEditor({ note, onTyping, onAutoDelete }) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")

  useEffect(() => {
    if (note) {
      setTitle(note.title || "")
      setContent(note.content || "")
    } else {
      setTitle("")
      setContent("")
    }
  }, [note])

  const handleTitleChange = (e) => {
    const newTitle = e.target.value
    setTitle(newTitle)
    if (note?._id) onTyping("title", newTitle)
  }

  const handleContentChange = (e) => {
    const newContent = e.target.value
    setContent(newContent)
    if (note?._id) onTyping("content", newContent)
  }

  // 🗑️ Auto-delete blank notes
  useEffect(() => {
    if (note?._id && !title.trim() && !content.trim()) {
      const timeout = setTimeout(() => onAutoDelete(note._id), 1500)
      return () => clearTimeout(timeout)
    }
  }, [title, content])

  if (!note) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-4">No note selected</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      <div className="px-6 py-2 text-xs text-gray-500 border-b border-gray-200">
        {note.updatedAt &&
          new Date(note.updatedAt).toLocaleString([], {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="Note title..."
          className="px-6 py-4 text-3xl font-[600] text-gray-900 border-b border-gray-200 focus:outline-none bg-white"
        />

        <textarea
          value={content}
          onChange={handleContentChange}
          placeholder="Start typing..."
          className="flex-1 px-6 py-4 text-base text-gray-700 focus:outline-none resize-none bg-white"
        />
      </div>
    </div>
  )
}
