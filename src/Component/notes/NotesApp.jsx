"use client"

import { useState, useEffect, useRef } from "react"
import NotesSidebar from "./NotesSidebar"
import NotesEditor from "./NotesEditor"

export default function NotesApp() {
  const [notes, setNotes] = useState([])
  const [selectedNoteId, setSelectedNoteId] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const saveTimeoutRef = useRef(null)

  // Load notes from localStorage on mount
  useEffect(() => {
    const savedNotes = localStorage.getItem("notes")
    if (savedNotes) {
      try {
        setNotes(JSON.parse(savedNotes))
      } catch (error) {
        console.error("Error loading notes:", error)
      }
    }
  }, [])

  // Save notes to localStorage whenever they change
  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(() => {
      localStorage.setItem("notes", JSON.stringify(notes))
    }, 1000)

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [notes])

  // Create new note
  const createNewNote = () => {
    const newNote = {
      id: Date.now().toString(),
      title: "New Note",
      content: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPinned: false,
    }
    setNotes([newNote, ...notes])
    setSelectedNoteId(newNote.id)
  }

  // Update note
  const updateNote = (id, updates) => {
    setNotes(
      notes.map((note) =>
        note.id === id
          ? {
              ...note,
              ...updates,
              updatedAt: new Date().toISOString(),
            }
          : note,
      ),
    )
  }

  // Delete note
  const deleteNote = (id) => {
    setNotes(notes.filter((note) => note.id !== id))
    if (selectedNoteId === id) {
      setSelectedNoteId(null)
    }
  }

  // Toggle pin
  const togglePin = (id) => {
    updateNote(id, { isPinned: !notes.find((n) => n.id === id).isPinned })
  }

  // Get selected note
  const selectedNote = notes.find((note) => note.id === selectedNoteId)

  // Filter notes based on search
  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="flex  bg-white">
      {/* Sidebar */}
      <NotesSidebar
        notes={filteredNotes}
        selectedNoteId={selectedNoteId}
        onSelectNote={setSelectedNoteId}
        onCreateNote={createNewNote}
        onDeleteNote={deleteNote}
        onTogglePin={togglePin}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Editor */}
      <NotesEditor note={selectedNote} onUpdateNote={updateNote} onCreateNote={createNewNote} />
    </div>
  )
}
