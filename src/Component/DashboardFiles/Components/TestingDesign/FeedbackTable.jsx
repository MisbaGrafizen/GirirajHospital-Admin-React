"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Eye, MoreVertical, Trash2, Edit2, Search, Plus, Star, Clock, Phone, Bed, Stethoscope, X } from "lucide-react"

export default function FeedbackTable() {
  const [feedbacks, setFeedbacks] = useState([
    {
      id: 1,
      date: "01 Nov 2025",
      time: "11:39 am",
      patientName: "Kantaben kariya",
      contact: "9825538881",
      bedNo: "406",
      doctorName: "-",
      avgRating: 4.5,
      comment: "-",
      color: "from-blue-400 to-blue-600",
    },
    {
      id: 2,
      date: "01 Nov 2025",
      time: "11:10 am",
      patientName: "Hemkuvarben chavda",
      contact: "9824087484",
      bedNo: "423",
      doctorName: "Dr. Vishal Sadatiya",
      avgRating: 5,
      comment: "-",
      color: "from-emerald-400 to-emerald-600",
    },
    {
      id: 3,
      date: "01 Nov 2025",
      time: "11:05 am",
      patientName: "Rupabhai Rathod",
      contact: "9979523767",
      bedNo: "421",
      doctorName: "-",
      avgRating: 5,
      comment: "-",
      color: "from-rose-400 to-rose-600",
    },
  ])

  const [selectedFeedback, setSelectedFeedback] = useState(null)
  const [openMenu, setOpenMenu] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    patientName: "",
    contact: "",
    bedNo: "",
    doctorName: "",
    avgRating: 5,
    comment: "",
    color: "from-blue-400 to-blue-600",
  })

  const loadFeedbacks = () => {
    const saved = localStorage.getItem("feedbacks")
    if (saved) setFeedbacks(JSON.parse(saved))
  }

  useState(() => {
    loadFeedbacks()
  }, [])

  const handleAddFeedback = (e) => {
    e.preventDefault()
    const newFeedback = {
      id: Date.now(),
      ...formData,
    }
    const updated = [newFeedback, ...feedbacks]
    setFeedbacks(updated)
    localStorage.setItem("feedbacks", JSON.stringify(updated))
    setFormData({
      date: "",
      time: "",
      patientName: "",
      contact: "",
      bedNo: "",
      doctorName: "",
      avgRating: 5,
      comment: "",
      color: "from-blue-400 to-blue-600",
    })
    setShowAddForm(false)
  }

  const handleDeleteFeedback = (id) => {
    const updated = feedbacks.filter((f) => f.id !== id)
    setFeedbacks(updated)
    localStorage.setItem("feedbacks", JSON.stringify(updated))
    setOpenMenu(null)
  }

  const handleEditFeedback = (feedback) => {
    setFormData(feedback)
    setShowAddForm(true)
    setOpenMenu(null)
  }

  const filteredFeedbacks = feedbacks.filter(
    (f) =>
      f.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.contact.includes(searchTerm) ||
      f.doctorName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const renderStars = (rating) => {
    return (
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={18}
            className={i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
          />
        ))}
      </div>
    )
  }

  const colorOptions = [
    { name: "Blue", value: "from-blue-400 to-blue-600" },
    { name: "Green", value: "from-emerald-400 to-emerald-600" },
    { name: "Rose", value: "from-rose-400 to-rose-600" },
    { name: "Purple", value: "from-purple-400 to-purple-600" },
    { name: "Orange", value: "from-orange-400 to-orange-600" },
    { name: "Cyan", value: "from-cyan-400 to-cyan-600" },
  ]

  const rowColors = [
    "bg-blue-50/30",
    "bg-emerald-50/30",
    "bg-rose-50/30",
    "bg-purple-50/30",
    "bg-orange-50/30",
    "bg-cyan-50/30",
  ]

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Patient Feedback</h1>
            <p className="text-gray-500 mt-2">{filteredFeedbacks.length} total feedback entries</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-shadow"
          >
            <Plus size={20} /> Add Feedback
          </motion.button>
        </motion.div>

        {/* Search Bar */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by patient name, contact, or doctor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
          </div>
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
                  <th className="px-6 py-4 text-left text-sm font-bold text-white">DATE & TIME</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white">PATIENT NAME</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white">CONTACT</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white">BED NO</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white">DOCTOR NAME</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white">RATING</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white">COMMENT</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-white">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredFeedbacks.map((feedback, index) => (
                    <motion.tr
                      key={feedback.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className={`border-b border-gray-200 hover:shadow-md transition-all ${rowColors[index % rowColors.length]}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-700">
                          <Clock size={16} className="text-blue-500" />
                          <div>
                            <p className="text-sm font-semibold">{feedback.date}</p>
                            <p className="text-xs text-gray-500">{feedback.time}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-full bg-gradient-to-br ${feedback.color} flex items-center justify-center text-white font-bold shadow-md`}
                          >
                            {feedback.patientName.charAt(0)}
                          </div>
                          <span className="text-gray-900 font-semibold">{feedback.patientName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-700">
                          <Phone size={16} className="text-emerald-500" />
                          <span className="font-medium">{feedback.contact}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-700">
                          <Bed size={16} className="text-orange-500" />
                          <span className="font-medium">{feedback.bedNo}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-700">
                          <Stethoscope size={16} className="text-purple-500" />
                          <span className="font-medium">{feedback.doctorName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">{renderStars(feedback.avgRating)}</td>
                      <td className="px-6 py-4 text-gray-600 text-sm">{feedback.comment}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedFeedback(feedback)}
                            className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                          >
                            <Eye size={18} className="text-blue-500" />
                          </motion.button>
                          <div className="relative">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setOpenMenu(openMenu === feedback.id ? null : feedback.id)}
                              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                              <MoreVertical size={18} className="text-gray-600" />
                            </motion.button>
                            <AnimatePresence>
                              {openMenu === feedback.id && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.8, y: -10 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.8, y: -10 }}
                                  transition={{ type: "spring", damping: 15, stiffness: 300 }}
                                  className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden"
                                >
                                  <motion.button
                                    whileHover={{ backgroundColor: "#f0f9ff" }}
                                    onClick={() => {
                                      setFormData(feedback)
                                      setShowAddForm(true)
                                      setOpenMenu(null)
                                    }}
                                    className="w-full px-4 py-3 text-left flex items-center gap-2 text-gray-700 hover:text-blue-600 font-medium transition-colors border-b border-gray-100"
                                  >
                                    <Edit2 size={16} /> Edit
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ backgroundColor: "#fef2f2" }}
                                    onClick={() => handleDeleteFeedback(feedback.id)}
                                    className="w-full px-4 py-3 text-left flex items-center gap-2 text-gray-700 hover:text-red-600 font-medium transition-colors"
                                  >
                                    <Trash2 size={16} /> Delete
                                  </motion.button>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Details Modal */}
        <AnimatePresence>
          {selectedFeedback && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedFeedback(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 400 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200"
              >
                <div className="sticky top-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 px-6 py-4 flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-white">Feedback Details</h2>
                  <motion.button
                    whileHover={{ rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedFeedback(null)}
                    className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                  >
                    <X size={24} />
                  </motion.button>
                </div>

                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200"
                    >
                      <p className="text-sm text-blue-600 font-semibold mb-1">Patient Name</p>
                      <p className="text-lg font-bold text-gray-900">{selectedFeedback.patientName}</p>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-lg border border-emerald-200"
                    >
                      <p className="text-sm text-emerald-600 font-semibold mb-1">Contact</p>
                      <p className="text-lg font-bold text-gray-900">{selectedFeedback.contact}</p>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 }}
                      className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200"
                    >
                      <p className="text-sm text-orange-600 font-semibold mb-1">Bed Number</p>
                      <p className="text-lg font-bold text-gray-900">{selectedFeedback.bedNo}</p>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 }}
                      className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200"
                    >
                      <p className="text-sm text-purple-600 font-semibold mb-1">Doctor Name</p>
                      <p className="text-lg font-bold text-gray-900">{selectedFeedback.doctorName}</p>
                    </motion.div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-r from-yellow-100 to-orange-100 p-4 rounded-lg border border-yellow-300"
                  >
                    <p className="text-sm text-yellow-700 font-semibold mb-3">Average Rating</p>
                    <div className="flex items-center gap-3">
                      {renderStars(selectedFeedback.avgRating)}
                      <span className="text-2xl font-bold text-yellow-600">{selectedFeedback.avgRating}/5</span>
                    </div>
                  </motion.div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.25 }}
                      className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-4 rounded-lg border border-cyan-200"
                    >
                      <p className="text-sm text-cyan-600 font-semibold mb-1">Date</p>
                      <p className="text-lg font-bold text-gray-900">{selectedFeedback.date}</p>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.25 }}
                      className="bg-gradient-to-br from-rose-50 to-rose-100 p-4 rounded-lg border border-rose-200"
                    >
                      <p className="text-sm text-rose-600 font-semibold mb-1">Time</p>
                      <p className="text-lg font-bold text-gray-900">{selectedFeedback.time}</p>
                    </motion.div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-br from-indigo-50 to-blue-50 p-4 rounded-lg border border-indigo-200"
                  >
                    <p className="text-sm text-indigo-600 font-semibold mb-2">Comment</p>
                    <p className="text-gray-800">{selectedFeedback.comment || "No comment provided"}</p>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add/Edit Form Modal */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowAddForm(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 400 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200"
              >
                <div className="sticky top-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 px-6 py-4 flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-white">Add Feedback</h2>
                  <motion.button
                    whileHover={{ rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowAddForm(false)}
                    className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                  >
                    <X size={24} />
                  </motion.button>
                </div>

                <form onSubmit={handleAddFeedback} className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Date (e.g., 01 Nov 2025)"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="px-4 py-3 border border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Time (e.g., 11:39 am)"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className="px-4 py-3 border border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Patient Name"
                      value={formData.patientName}
                      onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                      className="px-4 py-3 border border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Contact"
                      value={formData.contact}
                      onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                      className="px-4 py-3 border border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Bed No"
                      value={formData.bedNo}
                      onChange={(e) => setFormData({ ...formData, bedNo: e.target.value })}
                      className="px-4 py-3 border border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Doctor Name"
                      value={formData.doctorName}
                      onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
                      className="px-4 py-3 border border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Rating</label>
                    <select
                      value={formData.avgRating}
                      onChange={(e) => setFormData({ ...formData, avgRating: Number.parseFloat(e.target.value) })}
                      className="w-full px-4 py-3 border border-gray-300 bg-gray-50 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {[1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map((r) => (
                        <option key={r} value={r}>
                          {r}/5
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Patient Avatar Color</label>
                    <div className="grid grid-cols-6 gap-3">
                      {colorOptions.map((option) => (
                        <motion.button
                          key={option.value}
                          type="button"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setFormData({ ...formData, color: option.value })}
                          className={`w-full h-10 rounded-lg bg-gradient-to-br ${option.value} border-2 transition-all ${
                            formData.color === option.value
                              ? "border-gray-800 scale-110 shadow-lg"
                              : "border-transparent"
                          }`}
                          title={option.name}
                        />
                      ))}
                    </div>
                  </div>

                  <textarea
                    placeholder="Comment"
                    value={formData.comment}
                    onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows="3"
                  />

                  <div className="flex gap-3 pt-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-shadow"
                    >
                      Save Feedback
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
