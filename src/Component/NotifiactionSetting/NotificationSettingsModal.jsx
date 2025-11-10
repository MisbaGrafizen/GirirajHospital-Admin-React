"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell } from "lucide-react";
import { ApiGet, ApiPost, ApiPut } from "../../helper/axios";

export default function NotificationSettingsModal({ open, onClose }) {
  const [settings, setSettings] = useState({
    opd: false,
    ipd: false,
    complaint: true,
    internalComplaint: false,
    statusChange: false,
  });
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({ userId: null, userModel: null });

  /* ------------------------------------------------
     🔹 Load user details once (from localStorage)
  ------------------------------------------------ */
  useEffect(() => {
    const storedId = localStorage.getItem("userId");
    const loginType = localStorage.getItem("loginType");

    // ✅ Map loginType → userModel
    const userModel =
      loginType === "admin" ? "GIRIRAJUser" : "GIRIRAJRoleUser";

    if (storedId) setUserData({ userId: storedId, userModel });
  }, []);

  /* ------------------------------------------------x
     🔹 Fetch notification settings on modal open
  ------------------------------------------------ */
  useEffect(() => {
    if (open && userData.userId && userData.userModel) {
      (async () => {
        try {
          const res = await ApiGet(
            `/admin/notification-settings/get?userId=${userData.userId}&userModel=${userData.userModel}`
          );
          if (res?.data?.data) setSettings(res.data.data);
        } catch (err) {
          console.error("❌ Failed to load settings:", err);
        }
      })();
    }
  }, [open, userData]);

  /* ------------------------------------------------
     🔹 Handle checkbox toggle
  ------------------------------------------------ */
  const handleChange = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  /* ------------------------------------------------
     🔹 Save updated settings to backend
  ------------------------------------------------ */
  const handleSave = async () => {
    if (!userData.userId || !userData.userModel) {
      alert("⚠️ Missing user info. Please log in again.");
      return;
    }

    setLoading(true);
    try {
      await ApiPut("/admin/notification-setting/update", {
        userId: userData.userId,
        userModel: userData.userModel,
        ...settings,
      });

      alert("✅ Notification preferences saved!");
      onClose();
    } catch (err) {
      console.error("❌ Save failed:", err);
      alert("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  /* ------------------------------------------------
     🔹 UI Rendering
  ------------------------------------------------ */
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
            initial={{ scale: 0.9, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="w-[420px] relative bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-red-600 to-red-800 text-white">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                <h2 className="text-lg font-semibold">Notification Settings</h2>
              </div>
              <button
                onClick={onClose}
                className="hover:text-gray-200 absolute top-[15px] right-4"
              >
                <i className="fa-solid text-[20px] fa-circle-xmark"></i>
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-6">
              {/* Feedback Section */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">
                  Feedback Notifications
                </h3>
                <div className="flex flex-col gap-3">
                  {[
                    { key: "opd", label: "OPD Notifications" },
                    { key: "ipd", label: "IPD Notifications" },
                  ].map((item) => (
                    <label
                      key={item.key}
                      className="flex items-center gap-3 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={settings[item.key]}
                        onChange={() => handleChange(item.key)}
                        className="accent-red-600 w-5 h-5 rounded-md border border-gray-300"
                      />
                      <span className="text-gray-700 text-sm">
                        {item.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Complaints Section */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Complaints</h3>
                <div className="flex flex-col gap-3">
                  {[
  { key: "complaint", label: "Complaint Notifications", locked: true },
  { key: "internalComplaint", label: "Internal Complaint Notifications" },
  { key: "statusChange", label: "Status Change Notifications" },
].map((item) => (
  <label
    key={item.key}
    className={`flex items-center gap-3 ${
      item.locked ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
    }`}
  >
    <input
      type="checkbox"
      checked={settings[item.key]}
      onChange={() => !item.locked && handleChange(item.key)}
      disabled={item.locked}
      className="accent-red-600 w-5 h-5 rounded-md border border-gray-300"
    />
    <span className="text-sm text-gray-700">{item.label}</span>
  </label>
))}

                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button
                disabled={loading}
                onClick={handleSave}
                className="px-5 py-2 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-md font-medium hover:opacity-90 transition disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
