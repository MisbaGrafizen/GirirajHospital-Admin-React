import { deleteToken, getToken, onMessage } from "firebase/messaging";
import { messaging } from "../firebase.config";
import { ApiPost } from "./axios";

// Ask user permission & get token
export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      console.log("✅ Notification permission granted.");

      // ❌ remove deleteToken
      // await deleteToken(messaging);

      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      });

      if (token) {
        console.log("📌 FCM Token:", token);

        const userId = localStorage.getItem("userId");

        if (!userId) {
          console.warn("⚠️ No userId found in localStorage. Did you save it at login?");
        }

        await ApiPost("/admin/tokens/save", { userId, token });
      }

      return token;
    } else {
      console.warn("Notification permission denied.");
      return null;
    }
  } catch (error) {
    console.error("Error getting token:", error);
    return null;
  }
};


// Foreground notification listener
export const listenForMessages = () => {
  onMessage(messaging, (payload) => {
    console.log("📩 Foreground message received:", payload);

    new Notification(payload.notification.title, {
      body: payload.notification.body,
      icon: "/images.png",
    });
  });
};