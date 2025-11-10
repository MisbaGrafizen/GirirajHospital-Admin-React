"use client"
import { useState, useEffect } from "react"
import { ApiGet, ApiPost, ApiPut, ApiDelete } from "../../helper/axios"

export default function TodoApp() {
  const [todos, setTodos] = useState([])
  const [filter, setFilter] = useState("all")
  const [showAddModal, setShowAddModal] = useState(false)
  const [newTodo, setNewTodo] = useState("")
  const [newDate, setNewDate] = useState(new Date().toISOString().split("T")[0])
  const [selectedColor, setSelectedColor] = useState("blue")
  const getActiveUserId = () => {
  const id = localStorage.getItem("userId");
  return id && id !== "undefined" && id !== "null" ? id : null;
};

  // 🎯 Fetch all tasks
  useEffect(() => {
    fetchTodos()
  }, [])

  const fetchTodos = async () => {
  try {
    const userId = getActiveUserId();
    if (!userId) return console.warn("⚠️ No userId found in localStorage");

    const res = await ApiGet(`/admin/task/user/${userId}`);
    const data = res?.data?.data || res?.data || [];
    setTodos(data);
  } catch (err) {
    console.error("Fetch error:", err);
  }
};


  // 🎯 Add new task (instantly reflect)
  const handleAddTodo = async () => {
  if (!newTodo.trim()) return;

  const userId = getActiveUserId();
  if (!userId) return alert("User not found. Please log in again.");

  const payload = {
    title: newTodo,
    dueDate: newDate,
    color: colors[selectedColor],
    userId, // ✅ link task to the logged-in user
  };

  try {
    const res = await ApiPost("/admin/task", payload);
    const newTask = res.data?.data || res.data || res;

    setTodos((prev) => [newTask, ...prev]);
    setNewTodo("");
    setNewDate(new Date().toISOString().split("T")[0]);
    setSelectedColor("blue");
    setShowAddModal(false);
    fetchTodos();
  } catch (err) {
    console.error("Add failed:", err);
  }
};


  // 🎯 Toggle complete
  const handleToggleTodo = async (id, completed) => {
    try {
      const res = await ApiPut(`/admin/task/${id}`, { isCompleted: !completed })
      const updated = res.data || res?.data?.data
      setTodos((prev) => prev.map((t) => (t._id === id ? updated : t)))
    } catch (err) {
      console.error("Toggle failed:", err)
    }
  }

  // 🎯 Delete
  const handleDeleteTodo = async (id) => {
    try {
      await ApiDelete(`/admin/task/${id}`)
      setTodos((prev) => prev.filter((t) => t._id !== id))
    } catch (err) {
      console.error("Delete failed:", err)
    }
  }

  // 🎯 Mark all finished
  const handleMarkAllFinished = async () => {
    const updates = todos.map((t) => handleToggleTodo(t._id, false))
    await Promise.all(updates)
    fetchTodos()
  }

  // Filters
  const filteredTodos = todos.filter((t) =>
    filter === "completed" ? t.isCompleted : filter === "active" ? !t.isCompleted : true
  )

  const today = new Date().toISOString().split("T")[0]
  const todayTasks = filteredTodos.filter((t) => t.dueDate?.split("T")[0] === today)
  const nextTasks = filteredTodos.filter((t) => t.dueDate?.split("T")[0] > today)

  const colors = {
    blue: "#6366f1",
    green: "#10b981",
    pink: "#ec4899",
    teal: "#14b8a6",
    yellow: "#f59e0b",
    red: "#ef4444",
    purple: "#a855f7",
  }
  const colorNames = Object.keys(colors)

  const formatDate = (d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" })
  const getStatusColor = (c) => (c ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700")

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-2xl font-bold text-slate-900"></h1>
          <div className="flex gap-3">
            <button
              onClick={handleMarkAllFinished}
              className="flex items-center gap-2 px-4 py-2 text-red-600 font-semibold hover:bg-red-50 rounded-lg"
            >
      <i className="fa-regular text-green-500 text-[18px] fa-circle-check"></i>Mark all as finished
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700"
            >
           <i className="fa-solid fa-plus"></i> Add new task
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex  gap-6 mb-8 border-b border-slate-200">
          {["all", "active", "completed"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`pb-2 px-[10px] font-semibold capitalize ${
                filter === f ? "text-indigo-600 border-b-2 border-indigo-600" : "text-slate-500"
              }`}
            >
              {f === "all" ? "All Tasks" : f === "active" ? "In Progress" : "Completed"}
            </button>
          ))}
        </div>

        {/* Task Sections */}
        <TaskSection
          title="Today Tasks"
          tasks={todayTasks}
          onToggle={handleToggleTodo}
          onDelete={handleDeleteTodo}
          colors={colors}
          formatDate={formatDate}
          getStatusColor={getStatusColor}
        />
        <TaskSection
          title="Next Tasks"
          tasks={nextTasks}
          onToggle={handleToggleTodo}
          onDelete={handleDeleteTodo}
          colors={colors}
          formatDate={formatDate}
          getStatusColor={getStatusColor}
        />

        {filteredTodos.length === 0 && (
          <div className="text-center py-12 text-slate-500 text-lg">
            No tasks yet. Create one to get started!
          </div>
        )}
      </div>

      {/* Modal */}
      {showAddModal && (
        <AddTaskModal
          newTodo={newTodo}
          setNewTodo={setNewTodo}
          newDate={newDate}
          setNewDate={setNewDate}
          selectedColor={selectedColor}
          setSelectedColor={setSelectedColor}
          handleAddTodo={handleAddTodo}
          setShowAddModal={setShowAddModal}
          colors={colors}
          colorNames={colorNames}
        />
      )}
    </div>
  )
}

// ---------- Sub-Components ----------

function TaskSection({ title, tasks, onToggle, onDelete, colors, formatDate, getStatusColor }) {
  if (!tasks.length) return null
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
        <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-full text-sm font-semibold">
          {tasks.length}
        </span>
      </div>
      <div className="space-y-3">
        {tasks.map((todo) => (
          <div
            key={todo._id}
            className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm hover:shadow-md border-l-4 transition"
            style={{ borderColor: todo.color }}
          >
            <button
              onClick={() => onToggle(todo._id, todo.isCompleted)}
              className="w-6 h-6 flex items-center justify-center border-2 rounded"
              style={{
                backgroundColor: todo.isCompleted ? todo.color : "transparent",
                borderColor: todo.isCompleted ? todo.color : "#cbd5e1",
              }}
            >
              {todo.isCompleted && <span className="text-white font-bold">✔</span>}
            </button>
            <p className={`flex-1 font-semibold ${todo.isCompleted ? "line-through text-slate-400" : ""}`}>
              {todo.title}
            </p>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(todo.isCompleted)}`}>
              {todo.isCompleted ? "completed" : "active"}
            </span>
            <span className="text-slate-500 text-sm font-medium">{formatDate(todo.dueDate)}</span>
            <button onClick={() => onDelete(todo._id)} className="text-red-500 hover:text-red-700">
              🗑
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

function AddTaskModal({
  newTodo,
  setNewTodo,
  newDate,
  setNewDate,
  selectedColor,
  setSelectedColor,
  handleAddTodo,
  setShowAddModal,
  colors,
  colorNames,
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Add Task</h2>
          <button onClick={() => setShowAddModal(false)} className="text-[#f00]">
     <i className="fa-solid text-[23px] fa-circle-xmark"></i>
          </button>
        </div>

        <p className="text-slate-600 mb-6">Fill in the task details and choose a color</p>

        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Enter task title..."
          className="w-full px-4 py-3 border mb-4 border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
        />

        <input
          type="date"
          value={newDate}
          onChange={(e) => setNewDate(e.target.value)}
          className="w-full px-4 py-3 border mb-6 border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
        />

        <div className="flex gap-3 mb-8">
          {colorNames.map((color) => (
            <button
              key={color}
              onClick={() => setSelectedColor(color)}
              className={`w-10 h-10 rounded-full ${
                selectedColor === color ? "ring-2 ring-offset-2 ring-slate-400" : ""
              }`}
              style={{ backgroundColor: colors[color] }}
            />
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleAddTodo}
            className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 font-semibold"
          >
            Add Task
          </button>
          <button
            onClick={() => setShowAddModal(false)}
            className="flex-1 bg-pink-100 text-pink-600 py-3 rounded-lg hover:bg-pink-200 font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
