import React from "react";

export default function NotificationPopup({ notification, onClose }) {
  if (!notification) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-[90%] max-w-md relative animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-red-600"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold text-red-700 mb-3 flex items-center gap-2">
          🔔 New Notification
        </h2>

        <div className="space-y-3">
          <p className="font-semibold text-gray-800">{notification.title}</p>
          <p className="text-gray-600">{notification.body}</p>

          {notification.image && (
            <div className="mt-3">
              <img
                src={notification.image}
                alt="Notification"
                className="rounded-lg w-full max-h-48 object-cover"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
