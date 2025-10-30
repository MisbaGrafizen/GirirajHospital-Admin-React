"use client"

import { useState, useEffect } from "react"
import { FaChevronDown, FaChevronRight, FaTrash } from "react-icons/fa"

export default function NotesSidebar({
  notes,
  selectedNoteId,
  onSelectNote,
  onCreateNote,
  onDeleteNote,
  searchQuery,
  onSearchChange,
}) {
  const [expandedSections, setExpandedSections] = useState({ all: true })
  const [localNotes, setLocalNotes] = useState([])

  // 🧩 Sync sidebar with live updates from NotesApp
  useEffect(() => {
    setLocalNotes(notes)
  }, [notes])

  // 🔍 Filter + sort notes
  const filteredNotes = localNotes.filter(
    (n) =>
      n.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const sortedNotes = [...filteredNotes].sort(
    (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
  )

  const toggleSection = (key) =>
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }))

  // 🧠 Single note block
  const NoteItem = ({ note }) => {
    const handleDeleteClick = (e) => {
      e.stopPropagation()

      if (!note._id) {
        console.warn("🟡 Skipping delete — note has no _id yet:", note)
        return
      }

      console.log("🗑️ Deleting note:", note._id)
      onDeleteNote(note._id) // ✅ Will now properly trigger API
    }

    return (
      <div
        onClick={() => onSelectNote(note._id)}
        className={`p-2 mb-2 rounded-lg cursor-pointer transition-colors flex justify-between items-start ${
          selectedNoteId === note._id
            ? "bg-blue-100 border-l-4 border-blue-500"
            : "hover:bg-gray-100 border border-transparent"
        }`}
      >
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate text-sm">
            {note.title?.trim() || "Untitled"}
          </h3>
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
            {note.content?.trim() || "No content yet"}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {note.updatedAt
              ? new Date(note.updatedAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : ""}
          </p>
        </div>

        {/* 🗑️ Delete Button */}
        <button
          onClick={handleDeleteClick}
          className="text-gray-400 hover:text-red-600 text-sm"
          title="Delete Note"
        >
          <FaTrash />
        </button>
      </div>
    )
  }

  // 🧱 Sidebar UI
  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-bold text-gray-900">Notes</h1>
          <span className="text-sm text-gray-500">{localNotes.length} total</span>
        </div>
        <button
          onClick={onCreateNote}
          className="w-full px-4 py-2 bg-gradient-to-b from-purple-400 to-blue-500 text-white rounded-lg text-sm font-medium hover:opacity-90"
        >
          + New Note
        </button>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-gray-200">
        <input
          type="text"
          placeholder="Search notes..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none"
        />
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto px-2 pt-3">
        {sortedNotes.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">No notes yet</p>
            <p className="text-gray-400 text-xs mt-2">Create one to get started</p>
          </div>
        ) : (
          <>
            <button
              onClick={() => toggleSection("all")}
              className="flex items-center w-full px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded"
            >
              {expandedSections.all ? (
                <FaChevronDown className="mr-2 text-gray-600" />
              ) : (
                <FaChevronRight className="mr-2 text-gray-600" />
              )}
              All Notes
              <span className="ml-auto text-xs text-gray-500">{sortedNotes.length}</span>
            </button>

            {expandedSections.all && (
              <div className="px-2">
                {sortedNotes.map((note) => (
                  <NoteItem key={note._id} note={note} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
