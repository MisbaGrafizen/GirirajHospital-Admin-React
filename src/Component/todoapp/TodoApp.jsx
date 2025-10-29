"use client"

import { useState, useEffect } from "react"

export default function TodoApp() {
  const [todos, setTodos] = useState([])
  const [filter, setFilter] = useState("all")
  const [showAddModal, setShowAddModal] = useState(false)
  const [newTodo, setNewTodo] = useState("")
  const [newDate, setNewDate] = useState(new Date().toISOString().split("T")[0])
  const [selectedColor, setSelectedColor] = useState("blue")
  const [editingId, setEditingId] = useState(null)

  // Load todos from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("todos")
    if (saved) {
      setTodos(JSON.parse(saved))
    }
  }, [])

  // Save todos to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos))
  }, [todos])

  // Add new todo
  const handleAddTodo = () => {
    if (newTodo.trim()) {
      const todo = {
        id: Date.now(),
        title: newTodo,
        completed: false,
        date: newDate,
        color: selectedColor,
        createdAt: new Date().toISOString(),
      }
      setTodos([todo, ...todos])
      setNewTodo("")
      setNewDate(new Date().toISOString().split("T")[0])
      setSelectedColor("blue")
      setShowAddModal(false)
    }
  }

  // Toggle todo completion
  const handleToggleTodo = (id) => {
    setTodos(todos.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)))
  }

  // Delete todo
  const handleDeleteTodo = (id) => {
    setTodos(todos.filter((todo) => todo.id !== id))
  }

  // Mark all as finished
  const handleMarkAllFinished = () => {
    setTodos(todos.map((todo) => ({ ...todo, completed: true })))
  }

  // Filter todos
  const filteredTodos = todos.filter((todo) => {
    if (filter === "completed") return todo.completed
    if (filter === "active") return !todo.completed
    return true
  })

  // Get today's tasks
  const today = new Date().toISOString().split("T")[0]
  const todayTasks = filteredTodos.filter((todo) => todo.date === today)
  const nextTasks = filteredTodos.filter((todo) => todo.date > today)

  // Color options
  const colors = {
    blue: "#6366f1",
    green: "#10b981",
    pink: "#ec4899",
    teal: "#14b8a6",
    yellow: "#f59e0b",
    red: "#ef4444",
    purple: "#a855f7",
  }

  const colorNames = ["blue", "green", "pink", "teal", "yellow", "red", "purple"]

  // Format date
  const formatDate = (dateStr) => {
    const date = new Date(dateStr + "T00:00:00")
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  // Get status badge color
  const getStatusColor = (completed) => {
    return completed ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className=" w-[100%] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-slate-900">To-Do</h1>
          <div className="flex gap-3">
            <button
              onClick={handleMarkAllFinished}
              className="flex items-center gap-2 px-4 py-2 text-red-600 font-semibold hover:bg-red-50 rounded-lg transition"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Mark all as finished
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add new task
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-6 mb-8 border-b border-slate-200">
          {["all", "active", "completed"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`pb-3 font-semibold capitalize transition ${
                filter === f ? "text-indigo-600 border-b-2 border-indigo-600" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {f === "all" ? "All Tasks" : f === "active" ? "In Progress" : "Completed"}
            </button>
          ))}
        </div>

        {/* Today Tasks Section */}
        {todayTasks.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-xl font-bold text-slate-900">Today Tasks</h2>
              <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-sm font-semibold">
                {todayTasks.length}
              </span>
            </div>
            <div className="space-y-3">
              {todayTasks.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggle={handleToggleTodo}
                  onDelete={handleDeleteTodo}
                  colors={colors}
                  formatDate={formatDate}
                  getStatusColor={getStatusColor}
                />
              ))}
            </div>
          </div>
        )}

        {/* Next Tasks Section */}
        {nextTasks.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-xl font-bold text-slate-900">Next Tasks</h2>
              <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-sm font-semibold">
                {nextTasks.length}
              </span>
            </div>
            <div className="space-y-3">
              {nextTasks.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggle={handleToggleTodo}
                  onDelete={handleDeleteTodo}
                  colors={colors}
                  formatDate={formatDate}
                  getStatusColor={getStatusColor}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredTodos.length === 0 && (
          <div className="text-center py-12">
            <svg
              className="w-16 h-16 mx-auto text-slate-300 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-slate-500 text-lg">No tasks yet. Create one to get started!</p>
          </div>
        )}
      </div>

      {/* Add Todo Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Add Task</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-slate-600 mb-6">Fill in the task details and choose a color</p>

            {/* Task Title */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-900 mb-2">Task Title</label>
              <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddTodo()}
                placeholder="Enter task title..."
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Due Date */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-900 mb-2">Due Date</label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Color Selection */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-slate-900 mb-3">Select Color</label>
              <div className="flex gap-3">
                {colorNames.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-10 h-10 rounded-full transition transform hover:scale-110 ${
                      selectedColor === color ? "ring-2 ring-offset-2 ring-slate-400" : ""
                    }`}
                    style={{ backgroundColor: colors[color] }}
                  >
                    {selectedColor === color && (
                      <svg className="w-6 h-6 text-white mx-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleAddTodo}
                className="flex-1 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition"
              >
                Add Task
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-6 py-3 bg-pink-100 text-pink-600 font-semibold rounded-lg hover:bg-pink-200 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Todo Item Component
function TodoItem({ todo, onToggle, onDelete, colors, formatDate, getStatusColor }) {
  return (
    <div
      className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition border-l-4"
      style={{ borderColor: colors[todo.color] }}
    >
      {/* Checkbox */}
      <button
        onClick={() => onToggle(todo.id)}
        className="flex-shrink-0 w-6 h-6 rounded border-2 border-slate-300 flex items-center justify-center hover:border-indigo-600 transition"
        style={{
          backgroundColor: todo.completed ? colors[todo.color] : "transparent",
          borderColor: todo.completed ? colors[todo.color] : "#cbd5e1",
        }}
      >
        {todo.completed && (
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </button>

      {/* Task Content */}
      <div className="flex-1">
        <p className={`font-semibold transition ${todo.completed ? "line-through text-slate-400" : "text-slate-900"}`}>
          {todo.title}
        </p>
      </div>

      {/* Status Badge */}
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(todo.completed)}`}>
        {todo.completed ? "completed" : "active"}
      </span>

      {/* Date */}
      <span className="text-slate-500 text-sm font-medium">{formatDate(todo.date)}</span>

      {/* Delete Button */}
      <button
        onClick={() => onDelete(todo.id)}
        className="flex-shrink-0 p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  )
}
