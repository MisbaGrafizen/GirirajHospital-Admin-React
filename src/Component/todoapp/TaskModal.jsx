"use client";

import { useState, useEffect } from "react";
import { X, Calendar, Clock } from "lucide-react";

const colors = [
  "#1E40AF", // Blue
  "#F59E0B", // Orange
  "#EC4899", // Pink
  "#06B6D4", // Cyan
  "#8B5CF6", // Purple
  "#EF4444", // Red
];

export default function TaskModal({ folder, onClose, onSubmit, editingTask }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState("09:00");
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [isImportant, setIsImportant] = useState(false);

  // 🧠 Pre-fill if editing
  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title || "");
      setDescription(editingTask.description || "");
      setDate(editingTask.date || new Date().toISOString().split("T")[0]);
      setTime(editingTask.time || "09:00");
      setSelectedColor(editingTask.color || colors[0]);
      setIsImportant(editingTask.isImportant || false);
    }
  }, [editingTask]);

  // ✅ Submit handler
  const handleSubmit = () => {
    if (!title.trim()) return;

    onSubmit({
      title,
      description,
      date,
      time,
      category: folder?.name || "General",
      isImportant,
      isCompleted: false,
      color: selectedColor,
    });

    setTitle("");
    setDescription("");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pt-3 pb-[10px] px-3  border-b border-slate-200 sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-[600] text-slate-900">
            {editingTask ? "Edit Task" : "New Task"}
          </h2>
          <button
            onClick={onClose}
            className="  rounded-lg transition-colors"
          >
           <i className="fa-solid text-[20px] text-[#f00] fa-circle-xmark"></i>
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          {/* Title */}
          <div className=" relative">
            <label className="text-[9px] absolute top-[-8px] left-[10px]  bg-[#fff] font-[500] text-slate-900 px-[7px] rounded-[10px] border mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Add a new item..."
              className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:border-blue-500 focus:bg-blue-50 transition-all"
            />
          </div>

          {/* Description */}
          <div className=" relative">
            <label className="text-[9px] absolute top-[-8px] left-[10px]  bg-[#fff] font-[500] text-slate-900 px-[7px] rounded-[10px] border mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description..."
              className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:border-blue-500 focus:bg-blue-50 transition-all"
            />
          </div>

          {/* Date */}
          <div className=" relative">
            <label className="text-[9px] absolute top-[-8px] left-[10px]  bg-[#fff] font-[500] text-slate-900 px-[7px] rounded-[10px] border mb-2">
              Date
            </label>
            <div className="flex items-center gap-3 px-3 py-2 border border-slate-200 rounded-md">
              <Calendar className="w-5 h-5 text-blue-600" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="flex-1 focus:outline-none bg-transparent"
              />
            </div>
          </div>

          {/* Time */}
          <div className=" relative">
            <label className="text-[9px] absolute top-[-8px] left-[10px]  bg-[#fff] font-[500] text-slate-900 px-[7px] rounded-[10px] border mb-2">
              Time
            </label>
            <div className="flex items-center gap-3 px-3 py-2 border border-slate-200 rounded-md">
              <Clock className="w-5 h-5 text-blue-600" />
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="flex-1 focus:outline-none bg-transparent"
              />
            </div>
          </div>

          {/* Category */}
          <div className=" relative">
            <label className="text-[9px] absolute top-[-8px] left-[10px]  bg-[#fff] font-[500] text-slate-900 px-[7px] rounded-[10px] border mb-2">
              Category
            </label>
            <div className="px-3 py-2 border border-slate-200 rounded-md  bg-slate-50">
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: folder?.color || "#3B82F6" }}
                />
                <span className="font-medium text-slate-900">
                  {folder?.name || "General"}
                </span>
              </div>
            </div>
          </div>

          {/* Important */}
          <div className="flex items-center gap-3 px-4 py-2 bg-slate-100 rounded-md">
            <input
              type="checkbox"
              id="important"
              checked={isImportant}
              onChange={(e) => setIsImportant(e.target.checked)}
              className="w-5 h-5 rounded accent-yellow-400 cursor-pointer"
            />
            <label
              htmlFor="important"
              className="font-medium text-slate-900 pt-[9px] cursor-pointer "
            >
              Mark as Important?
            </label>
          </div>

          {/* Color Picker */}
          <div>
            <label className="text-sm font-semibold text-slate-900 block mb-2">
              Event Color
            </label>
            <div className="flex gap-3 flex-wrap">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-full transition-all duration-300 ${
                    selectedColor === color
                      ? "ring-1 ring-offset-1 ring-blue-700 scale-110"
                      : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-3 border-t border-slate-200 sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 font-semibold rounded-md text-[15px] hover:bg-slate-50 transition"
          >
            Close
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-2 bg-gradient-to-b from-purple-400 to-blue-500 text-white font-semibold text-[15px] rounded-md hover:shadow-lg hover:scale-105 transition-all duration-300"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
