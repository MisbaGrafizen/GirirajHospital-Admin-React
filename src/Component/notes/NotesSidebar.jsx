"use client"

import { useState } from "react"
import { FaChevronDown, FaChevronRight, FaTrash } from "react-icons/fa"

export default function NotesSidebar({
  notes,
  selectedNoteId,
  onSelectNote,
  onCreateNote,
  onDeleteNote,
  onTogglePin,
  searchQuery,
  onSearchChange,
}) {
  const [expandedSections, setExpandedSections] = useState({
    pinned: true,
    today: true,
    week: true,
    month: true,
    older: false,
  })

  // Organize notes by time period
  const organizeNotes = () => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

    const pinned = notes.filter((n) => n.isPinned)
    const todayNotes = notes.filter((n) => {
      const noteDate = new Date(n.updatedAt)
      return (
        !n.isPinned &&
        noteDate.getFullYear() === today.getFullYear() &&
        noteDate.getMonth() === today.getMonth() &&
        noteDate.getDate() === today.getDate()
      )
    })
    const weekNotes = notes.filter(
      (n) => !n.isPinned && new Date(n.updatedAt) > weekAgo && new Date(n.updatedAt) <= today,
    )
    const monthNotes = notes.filter(
      (n) => !n.isPinned && new Date(n.updatedAt) > monthAgo && new Date(n.updatedAt) <= weekAgo,
    )
    const olderNotes = notes.filter((n) => !n.isPinned && new Date(n.updatedAt) <= monthAgo)

    return { pinned, todayNotes, weekNotes, monthNotes, olderNotes }
  }

  const { pinned, todayNotes, weekNotes, monthNotes, olderNotes } = organizeNotes()

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  // ------------------- Individual Note -------------------
  const NoteItem = ({ note }) => (
    <div
      onClick={() => onSelectNote(note.id)}
      className={`p-2 mb-2 rounded-lg cursor-pointer transition-colors flex justify-between items-start ${
        selectedNoteId === note.id
          ? "bg-blue-100 border-l-4 border-blue-500"
          : "shadow-sm hover:bg-gray-100 border"
      }`}
    >
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 truncate text-sm">{note.title || "Untitled"}</h3>
        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{note.content || "No content"}</p>
        <p className="text-xs text-gray-400 mt-1">
          {new Date(note.updatedAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>

      <div className="flex flex-col items-center ml-2 space-y-1">
        {/* Pin Button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onTogglePin(note.id)
          }}
          className="text-gray-400 hover:text-yellow-500 text-lg"
        >
          {note.isPinned ? "📌" : ""}
        </button>

        {/* Trash / Delete Button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDeleteNote(note.id)
          }}
          className="text-gray-400 hover:text-red-600 text-sm"
          title="Delete Note"
        >
          <FaTrash />
        </button>
      </div>
    </div>
  )

  // ------------------- Section Wrapper -------------------
  const Section = ({ title, notes: sectionNotes, sectionKey }) => {
    if (sectionNotes.length === 0) return null

    return (
      <div className="mb-4">
        <button
          onClick={() => toggleSection(sectionKey)}
          className="flex items-center w-full px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded"
        >
          {expandedSections[sectionKey] ? (
            <FaChevronDown className="mr-2 text-gray-600" />
          ) : (
            <FaChevronRight className="mr-2 text-gray-600" />
          )}
          {title}
          <span className="ml-auto text-xs text-gray-500">{sectionNotes.length}</span>
        </button>

        {expandedSections[sectionKey] && (
          <div className="px-2">
            {sectionNotes.map((note) => (
              <NoteItem key={note.id} note={note} />
            ))}
          </div>
        )}
      </div>
    )
  }

  // ------------------- Sidebar -------------------
  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-bold text-gray-900">Notes</h1>
          <span className="text-sm text-gray-500">{notes.length} notes</span>
        </div>
        <button
          onClick={onCreateNote}
          className="w-full px-4 py-2 from-purple-400 to-blue-500 text-white rounded-lg bg-gradient-to-b transition-colors text-sm font-medium"
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
      <div className="flex-1 overflow-y-auto px-2 pt-[13px]">
        {notes.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">No notes yet</p>
            <p className="text-gray-400 text-xs mt-2">Create one to get started</p>
          </div>
        ) : (
          <>
            <Section title="Pinned" notes={pinned} sectionKey="pinned" />
            <Section title="Today" notes={todayNotes} sectionKey="today" />
            <Section title="Previous 7 Days" notes={weekNotes} sectionKey="week" />
            <Section title="Previous 30 Days" notes={monthNotes} sectionKey="month" />
            <Section title="Older" notes={olderNotes} sectionKey="older" />
          </>
        )}
      </div>
    </div>
  )
}
