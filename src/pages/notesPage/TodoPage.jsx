
// import React from 'react'
// import CubaSidebar from '../../Component/sidebar/CubaSidebar'
// import Preloader from '../../Component/loader/Preloader'

// import Header from '../../Component/header/Header'
// import TodoApp from '../../Component/todoapp/TodoApp'

// export default function TodoPage() {
//     return (
//         <>




//             <section className="flex w-[100%] h-[100%] select-none   md11:pr-[0px] overflow-hidden">
//                 <div className="flex w-[100%] flex-col gap-[0px] h-[100vh]">
//                     <Header pageName="Todo List" />
//                     <div className="flex  w-[100%] h-[100%]">
//                         <CubaSidebar />
//                         <div className="flex flex-col w-[100%]  relative max-h-[93%]  md34:!pb-[100px] m md11:!pb-[20px]    overflow-y-auto gap-[10px] ">
//                             <Preloader />



//            <TodoApp />
//                         </div>
//                     </div>
//                 </div>
//             </section>
//         </>
//     )

    
// }
"use client";
import React, { useState, useMemo, useEffect } from "react";
import {
  Plus,
  Star,
  X,
  Clock,
  Calendar,
  CheckCircle2,
  Inbox,
  CheckSquare,
  Briefcase,
  Building2,
  Home,
  ListPlus,
  Trash2, // 🗑️ Added trash icon
} from "lucide-react";
import CubaSidebar from "../../Component/sidebar/CubaSidebar";
import Preloader from "../../Component/loader/Preloader";
import Header from "../../Component/header/Header";
import TaskModal from "../../../src/Component/todoapp/TaskModal";
import { ApiDelete, ApiGet, ApiPost, ApiPut } from "../../helper/axios";

// 🎨 Predefined gradient of folder colors
const folderColors = [
  "#3B82F6", // Blue
  "#10B981", // Green
  "#F59E0B", // Amber
  "#8B5CF6", // Violet
  "#EF4444", // Red
  "#EC4899", // Pink
  "#06B6D4", // Cyan
  "#6366F1", // Indigo
  "#84CC16", // Lime
];

// 🧩 Different icons
const availableIcons = [Home, Briefcase, Building2, Calendar, Inbox, ListPlus, Star, Clock, CheckSquare];

// ✔ Added stable fallback icon (ListPlus)

const getIconForName = (name) => {
  const lower = name?.toLowerCase() || "";

  if (lower.includes("home")) return Home;
  if (lower.includes("work")) return Briefcase;
  if (lower.includes("office")) return Building2;
  if (lower.includes("today")) return Calendar;
  if (lower.includes("month")) return Inbox;
  if (lower.includes("important")) return Star;
  if (lower.includes("schedule") || lower.includes("time")) return Clock;
  if (lower.includes("task") || lower.includes("done")) return CheckSquare;

  // 🛠 FIX: No random icon anymore. Use stable default icon.
  return ListPlus;
};


// 🎨 Random color generator
const getRandomColor = () => {
  return folderColors[Math.floor(Math.random() * folderColors.length)];
};


// 📅 Utility: format date as dd/mm/yyyy
const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// ⏰ Utility: format time as hh:mm AM/PM
const formatTime = (timeValue) => {
  if (!timeValue) return "";

  const date =
    typeof timeValue === "string" && timeValue.includes("T")
      ? new Date(timeValue)
      : new Date(`1970-01-01T${timeValue}`);

  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12; // 0 → 12
  return `${formattedHours}:${minutes} ${ampm}`;
};



const FOLDER_API = "/admin/task-list";
const TASK_API = "/admin/task";


export default function TodoPage() {
  const defaultFolders = [
    { id: "1", name: "This month", color: "#6B7280", itemCount: 0 },
    { id: "2", name: "Today", color: "#F59E0B", itemCount: 0 },
    { id: "3", name: "Work", color: "#8B5CF6", itemCount: 0 },
    { id: "4", name: "Office", color: "#6B7280", itemCount: 0 },
    { id: "5", name: "Home", color: "#3B82F6", itemCount: 0 },
  ];

  const iconMap = {
    "This month": Inbox,
    Today: Calendar,
    Work: Briefcase,
    Office: Building2,
    Home: Home,
  };

  const [folders, setFolders] = useState(defaultFolders);
  const [tasks, setTasks] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(folders[0]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const userId = localStorage.getItem("userId");
  const loginType = localStorage.getItem("loginType");
  

  const userModel =
      loginType === "admin" ? "GIRIRAJUser" : "GIRIRAJRoleUser";


  const fetchData = async () => {
    try {
      const folderRes = await ApiGet(`${FOLDER_API}/user/${userId}`);

      console.log('folderRes', folderRes)

      setFolders(folderRes.data || []);
      setCurrentFolder((folderRes.data && folderRes.data[0]) || null);
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

useEffect(() => {
  fetchData();
}, []);

useEffect(() => {
  if (!currentFolder?._id) return;

  const fetchTasks = async () => {
    try {
      const res = await ApiGet(
        `/admin/task/list/${currentFolder._id}?userId=${userId}&userModel=${userModel}`
      );

      console.log('res', res)
      if (res?.data) {
        setTasks(res.data || []);
      }
    } catch (err) {
      console.error("Error fetching tasks by list:", err);
    }
  };

  fetchTasks();
}, [currentFolder]);



  const folderTasks = useMemo(() => {
  if (!currentFolder) return [];
  return tasks.filter((task) => task.listId === currentFolder._id);
}, [currentFolder, tasks]);


 const handleAddTask = async (taskData) => {
  try {
    const payload = {
      ...taskData,
      listId: currentFolder._id, 
      userId,
      userModel,
    };

    const res = await ApiPost(TASK_API, payload);
    setTasks([...tasks, res.data]);
    setShowTaskModal(false);

    setFolders(
      folders.map((f) =>
        f._id === currentFolder._id
          ? { ...f, itemCount: (f.itemCount || 0) + 1 }
          : f
      )
    );
  } catch (err) {
    console.error("Add task failed:", err);
  }
};


  const handleDeleteTask = async (taskId) => {
  try {
    await ApiDelete(`${TASK_API}/${taskId}`);
    const deletedTask = tasks.find((t) => t._id === taskId);
    setTasks(tasks.filter((t) => t._id !== taskId));
    setFolders(
      folders.map((f) =>
        f._id === deletedTask?.listId
          ? { ...f, itemCount: Math.max(0, (f.itemCount || 0) - 1) }
          : f
      )
    );
  } catch (err) {
    console.error("Delete task failed:", err);
  }
};

const handleToggleComplete = async (taskId) => {
  try {
    const task = tasks.find((t) => t._id === taskId);
    const updated = { ...task, isCompleted: !task?.isCompleted };
    await ApiPut(`${TASK_API}/${taskId}`, updated); // or ApiPut
    setTasks(tasks.map((t) => (t._id === taskId ? updated : t)));
  } catch (err) {
    console.error("Toggle complete failed:", err);
  }
};


const handleToggleImportant = async (taskId) => {
  try {
    const task = tasks.find((t) => t._id === taskId);
    console.log('task', task)
    const updated = { ...task, important: !task.important };
    await ApiPost(`${TASK_API}/${taskId}`, updated);
    setTasks(tasks.map((t) => (t._id === taskId ? updated : t)));
  } catch (err) {
    console.error("Toggle important failed:", err);
  }
};


const handleAddFolder = async () => {
  if (!newFolderName.trim()) return;

  const IconComponent = getIconForName(newFolderName);
  const randomColor = getRandomColor(); // 🎨 choose random color

  const payload = {
    name: newFolderName,
    icon: IconComponent.displayName || IconComponent.name || "ListPlus",
    color: randomColor,
    itemCount: 0,
    userId: userId,
    userModel: userModel,
  };

  try {
    const res = await ApiPost(FOLDER_API, payload);
    setFolders([...folders, res.data]);
    setNewFolderName("");
    setShowNewFolderInput(false);
    fetchData();
  } catch (err) {
    console.error("Folder creation failed:", err);
  }
};

  // Delete folder handler
const handleDeleteFolder = async (folderId) => {
  if (window.confirm("Are you sure you want to delete this folder?")) {
    try {
      await ApiDelete(`${FOLDER_API}/${folderId}`);

      const updatedFolders = folders.filter((f) => f._id !== folderId);
      setFolders(updatedFolders);

      // Remove tasks belonging to that folder
      setTasks(tasks.filter((t) => t.listId !== folderId));

      // 🔥 KEY FIX:
      if (updatedFolders.length === 0) {
        // no folders left → hide task screen
        setCurrentFolder(null);
      } 
      else if (currentFolder?._id === folderId) {
        // deleted selected folder → select next folder
        setCurrentFolder(updatedFolders[0]);
      }

    } catch (err) {
      console.error("Folder delete failed:", err);
    }
  }
};



  const completedCount = useMemo(() => {
    return folderTasks.filter((t) => t.isCompleted).length;
  }, [folderTasks]);

  return (
    <>
      <section className="flex w-full h-full select-none overflow-hidden">
        <div className="flex w-full flex-col h-screen">
          <Header pageName="Todo List" />
          <div className="flex w-full h-full">
            <CubaSidebar />
            <div className="flex flex-col bg-white w-full relative max-h-[93%] pb-[10px] overflow-y-auto gap-[10px]">
              <Preloader />

              <div className="flex h-[100%]">
                {/* Sidebar - Folders */}
                <div className="w-80 bg-white border-r h-[100%] border-slate-200 flex flex-col">
                  {/* Folders List */}
                  <div className="flex-1 overflow-y-auto p-2 h-[100%] space-y-2">
                    {folders.map((folder) => {
                      const FolderIcon = getIconForName(folder.name);
                      const isActive = currentFolder?.id === folder.id;

                      return (
                        <div
                          key={folder.id}
                          className={`flex items-center relative justify-between w-full px-4 py-3 rounded-lg border transition-all group ${
                            isActive
                              ? "bg-blue-100 text-blue-900 border-blue-200 shadow-md"
                              : "hover:bg-slate-100 border-slate-200 text-slate-700"
                          }`}
                        >
                          <button
                            onClick={() => setCurrentFolder(folder)}
                            className="flex items-center gap-3 flex-1 text-left"
                          >
                            <div
                              className="w-3 h-3 rounded-full flex-shrink-0"
                              style={{ backgroundColor: folder.color }}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm truncate">
                                {folder.name}
                              </p>
                              <p className="text-xs opacity-70">
                                {folder.itemCount} items
                              </p>
                            </div>
                            <FolderIcon
                              className="w-5 h-5 flex-shrink-0"
                              style={{ color: folder.color }}
                            />
                          </button>

                          {/* 🗑️ Folder Delete Button */}
                          <button
                            onClick={() => handleDeleteFolder(folder._id)}
                            className="p-1.5 text-slate-500 absolute right-0 top-0 hover:text-red-600 hover:bg-red-50 rounded-md transition"
                            title="Delete folder"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Add New Folder */}
                  <div className="border-t pt-[10px] border-slate-200 pb-[30px] px-[10px] space-y-3">
                    {showNewFolderInput && (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newFolderName}
                          onChange={(e) => setNewFolderName(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleAddFolder()
                          }
                          placeholder="List name..."
                          autoFocus
                          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                        />
                        <button
                          onClick={handleAddFolder}
                          className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                          title="Add"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setShowNewFolderInput(false);
                            setNewFolderName("");
                          }}
                          className="p-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition"
                          title="Cancel"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {!showNewFolderInput && (
                      <button
                        onClick={() => setShowNewFolderInput(true)}
                        className="w-full flex justify-center items-center gap-[10px]  px-4 py-2 bg-gradient-to-b from-purple-400 to-blue-500 text-white rounded-lg text-sm font-medium hover:opacity-90"
                      >
                        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                        Add a new list
                      </button>
                    )}
                  </div>
                </div>

                {/* Main Content */}
                {currentFolder && (
                  <div className="flex-1 flex flex-col bg-white">
                    {/* Header */}
                    <div className="border-b border-slate-200 bg-gradient-to-r from-blue-50 to-slate-50 px-3 py-2">
                      <div className="flex items-center justify-between ">
                        <div className="flex-1">
                          <h2 className="text-xl font-[600] text-slate-900">
                            {currentFolder.name}
                          </h2>
                          <p className="text-sm text-slate-500 ">
                            {completedCount} of {folderTasks.length} completed
                          </p>
                        </div>
                        <button
                          onClick={() => setShowTaskModal(true)}
                          className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-full hover:shadow-lg transition-all flex items-center justify-center group hover:scale-110"
                          title="Add task"
                        >
                          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                        </button>
                      </div>
                    </div>

                    {/* Tasks */}
                    <div className="flex-1 overflow-y-auto p-8">
                      <div className="max-w-4xl space-y-3">
                        {folderTasks.length === 0 ? (
                          <div className="text-center py-20">
                            <CheckSquare className="w-20 h-20 text-slate-300 mx-auto mb-4" />
                            <p className="text-lg font-medium text-slate-500">
                              No tasks yet
                            </p>
                            <p className="text-sm text-slate-400">
                              Click the + button to add a task
                            </p>
                          </div>
                        ) : (
                          folderTasks.map((task, idx) => (
                            <div
                              key={task.id}
                              className={`bg-white border-2 rounded-xl p-4 hover:shadow-md transition-all group cursor-pointer ${
                                task.isCompleted
                                  ? "border-slate-200 bg-slate-50"
                                  : "border-slate-200 hover:border-blue-300"
                              }`}
                              style={{ animationDelay: `${idx * 50}ms` }}
                            >
                              <div className="flex items-start gap-4">
                                <button
                                  onClick={() => handleToggleComplete(task._id)}
                                  className="mt-1 flex-shrink-0 group/check"
                                >
                                  <div
                                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                                      task.isCompleted
                                        ? "bg-green-500 border-green-500"
                                        : "border-slate-300 group-hover/check:border-green-500"
                                    }`}
                                  >
                                    {task.isCompleted && (
                                      <CheckCircle2 className="w-4 h-4 text-white" />
                                    )}
                                  </div>
                                </button>

                                <div className="flex-1 min-w-0">
                                  <h3
                                    className={`text-lg font-semibold mb-1 ${
                                      task.isCompleted
                                        ? "line-through text-slate-400"
                                        : "text-slate-900"
                                    }`}
                                  >
                                    {task.title}
                                  </h3>
                                  {task.description && (
                                    <p
                                      className={`text-sm mb-3 ${
                                        task.isCompleted
                                          ? "text-slate-400"
                                          : "text-slate-600"
                                      }`}
                                    >
                                      {task.description}
                                    </p>
                                  )}
                                  <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                                    <div className="flex items-center gap-1">
                                      <Calendar className="w-3.5 h-3.5" />
                                      {formatDate(task.date)}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Clock className="w-3.5 h-3.5" />
                                      {formatTime(task.time)}
                                    </div>
                                    <div
                                      className="w-3 h-3 rounded-full"
                                      style={{ backgroundColor: task.color }}
                                    />
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                                  <button
                                    onClick={() =>
                                      handleToggleImportant(task.id)
                                    }
                                    className="p-2 hover:bg-yellow-100 rounded-lg"
                                    title={
                                      task.isImportant
                                        ? "Remove from important"
                                        : "Mark as important"
                                    }
                                  >
                                    <Star
                                      className={`w-5 h-5 ${
                                        task.isImportant
                                          ? "fill-yellow-400 text-yellow-400"
                                          : "text-slate-400"
                                      }`}
                                    />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteTask(task._id)}
                                    className="p-2 hover:bg-red-100 rounded-lg"
                                    title="Delete task"
                                  >
                                    <X className="w-5 h-5 text-red-500" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {showTaskModal && (
                  <TaskModal
                    folder={currentFolder}
                    onClose={() => setShowTaskModal(false)}
                    onSubmit={handleAddTask}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
