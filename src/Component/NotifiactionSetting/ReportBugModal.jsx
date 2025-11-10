"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bug, Upload } from "lucide-react";
import { ApiPost } from "../../helper/axios";

export default function ReportBugModal({ open, onClose }) {
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!text.trim()) return alert("⚠️ Please describe the issue");

    const formData = new FormData();
    if (imageFile) formData.append("screenshot", imageFile);
    formData.append("description", text);
    formData.append("priority", "Medium");
    formData.append("userId", localStorage.getItem("userId"));
    formData.append("userModel", localStorage.getItem("userModel") || "GIRIRAJRoleUser");

    try {
      setLoading(true);
      const res = await ApiPost("/admin/bug/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res?.data) alert("✅ Bug report submitted successfully!");
      else alert("⚠️ Failed to submit bug report");

      setText("");
      setImageFile(null);
      setPreview(null);
      onClose();
    } catch (err) {
      console.error("❌ Bug report submission failed:", err);
      alert("Error submitting bug report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="w-[430px] bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-red-600 to-red-800 text-white">
              <div className="flex items-center gap-2">
                <Bug className="w-5 h-5" />
                <h2 className="text-lg font-semibold">Report a Bug</h2>
              </div>
              <button onClick={onClose}>
                <i className="fa-solid fa-circle-xmark text-[20px]"></i>
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-5">
              {/* Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Screenshot
                </label>
                <label className="flex items-center gap-3 px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <Upload size={16} className="text-red-500" />
                  <span className="text-sm text-gray-600">Click to upload image</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
                {preview && (
                  <img
                    src={preview}
                    alt="Preview"
                    className="mt-3 w-full rounded-lg border border-gray-200 shadow-sm"
                  />
                )}
              </div>

              {/* Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Describe the Issue
                </label>
                <textarea
                  rows={4}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Explain what went wrong..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                ></textarea>
              </div>

              {/* Submit */}
              <button
                disabled={loading}
                onClick={handleSubmit}
                className="w-full py-2 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-md font-medium hover:opacity-90 transition disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Submit Bug"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
