import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "../firebase.config";
import { ApiPost } from "./axios";

// ✅ Request notification permission and get FCM token
export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      console.warn("🚫 Notification permission denied by user.");
      return null;
    }

    console.log("✅ Notification permission granted.");

    // ✅ Get FCM token
    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    });

    if (!token) {
      console.warn("⚠️ FCM token not received.");
      return null;
    }

    console.log("📌 FCM Token:", token);

    // ✅ Try to get userId from localStorage
    let userId = localStorage.getItem("userId");
    console.log('userId', userId)

    // 🧠 If not found yet, wait briefly and retry (handles login race condition)
    if (!userId) {
      console.warn("⚠️ userId not found yet, retrying...");
      await new Promise((resolve) => setTimeout(resolve, 500)); // wait 0.5s
      userId = localStorage.getItem("userId");
    }

    if (!userId) {
      console.error("❌ No userId found even after retry — skipping token save.");
      return token; // Return token but don’t call API
    }

    console.log("✅ Found userId:", userId);

    // ✅ Save token with userId
    const payload = { userId, token };
    console.log("📤 Sending token payload:", payload);

    await ApiPost("/admin/tokens/save", payload);

    console.log("✅ FCM token saved successfully for user:", userId);
    return token;
  } catch (error) {
    console.error("❌ Error getting or saving FCM token:", error);
    return null;
  }
};

// ✅ Foreground notification listener
export const listenForMessages = () => {
  onMessage(messaging, (payload) => {
    console.log("📩 Foreground message received:", payload);

    const { title, body } = payload?.notification || {};
    if (title && body) {
      new Notification(title, {
        body,
        icon: "/images.png",
      });
    }
  });
};
