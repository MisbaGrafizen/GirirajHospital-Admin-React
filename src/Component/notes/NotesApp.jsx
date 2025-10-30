"use client"

import { useState, useEffect } from "react"
import NotesSidebar from "./NotesSidebar"
import NotesEditor from "./NotesEditor"
import { ApiGet, ApiPost, ApiPut, ApiDelete } from "../../helper/axios"

export default function NotesApp() {
  const [notes, setNotes] = useState([])
  const [selectedNoteId, setSelectedNoteId] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")

  // 🧠 Helper to get userId from localStorage
  const getActiveUserId = () => {
    const id = localStorage.getItem("userId")
    return id && id !== "undefined" && id !== "null" ? id : null
  }

  // 🔹 Fetch notes for logged-in user
  useEffect(() => {
    const fetchNotes = async () => {
      const userId = getActiveUserId()
      if (!userId) return

      try {
        const res = await ApiGet(`/admin/note/user/${userId}`)
        const data = res?.data || []
        setNotes(data)
        if (data.length && !selectedNoteId) setSelectedNoteId(data[0]._id)
      } catch (err) {
        console.error("❌ Failed to fetch notes:", err)
      }
    }

    fetchNotes()
  }, [])

  // 🟢 Create blank note immediately when user clicks “+ New Note”
  const createNewNote = async () => {
    try {
      const userId = getActiveUserId()
      if (!userId) return alert("User not found")

      const res = await ApiPost("/admin/note", { userId })
      const newNote = res.data?.data || res.data

      // Insert on top and select it
      setNotes((prev) => [newNote, ...prev])
      setSelectedNoteId(newNote._id)
    } catch (err) {
      console.error("❌ Error creating new note:", err)
    }
  }

  // 🟣 Handle auto-save (like Apple Notes)
  const handleTyping = async (field, value) => {
  const activeNote = notes.find((n) => n._id === selectedNoteId)
  if (!activeNote) return

  // 🧠 Update the note locally
  const updatedNote = {
    ...activeNote,
    [field]: value,
    updatedAt: new Date().toISOString(),
  }

  setNotes((prev) =>
    prev.map((n) => (n._id === activeNote._id ? updatedNote : n))
  )

  // 🕒 Debounced full auto-save (send both fields)
  clearTimeout(activeNote._saveTimeout)
  activeNote._saveTimeout = setTimeout(async () => {
    try {
      await ApiPut(`/admin/note/${activeNote._id}`, {
        title: updatedNote.title,
        content: updatedNote.content,
      })
    } catch (err) {
      console.error("❌ Auto-save failed:", err)
    }
  }, 800)
}


  // 🗑️ Auto-delete if both fields empty
  // 🗑️ Auto-delete if both fields empty
const handleAutoDelete = async (noteId) => {
  const note = notes.find((n) => n._id === noteId)
  console.log('note', note)
  if (!note) return

    try {
      await ApiDelete(`/admin/note/${noteId}`)
      setNotes((prev) => prev.filter((n) => n._id !== noteId))
      setSelectedNoteId(null)
    } catch (err) {
      console.error("❌ Auto-delete failed:", err)
    }
}


  // 🧭 Selected Note
  const selectedNote = notes.find((n) => n._id === selectedNoteId) || null

  // 🔍 Search notes
  const filteredNotes = notes.filter(
    (n) =>
      n.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex bg-white">
      {/* Sidebar */}
      <NotesSidebar
        notes={filteredNotes}
        selectedNoteId={selectedNote?._id}
        onSelectNote={setSelectedNoteId}
        onCreateNote={createNewNote}
        onDeleteNote={handleAutoDelete}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Editor */}
      <NotesEditor
        note={selectedNote}
        onTyping={handleTyping}
        onAutoDelete={handleAutoDelete}
      />
    </div>
  )
}
