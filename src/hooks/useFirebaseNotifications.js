import { useEffect } from "react";
import { messaging } from "../firebase-config";
import { getToken, onMessage } from "firebase/messaging";

const VAPID_KEY = "YOUR_WEB_PUSH_CERTIFICATE_KEY_PAIR"; // from Firebase console

const useFirebaseNotifications = (userId) => {
  useEffect(() => {
    // Request permission + get token
    const requestPermission = async () => {
      try {
        const token = await getToken(messaging, { vapidKey: VAPID_KEY });
        if (token) {
          console.log("✅ FCM Token:", token);

          // Save token to backend
          await fetch("http://localhost:8000/api/save-token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, token }),
          });
        } else {
          console.log("⚠️ No registration token available.");
        }
      } catch (err) {
        console.error("❌ Error getting FCM token:", err);
      }
    };

    requestPermission();

    // Listen to foreground notifications
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("📩 Foreground notification:", payload);
      alert(`${payload.notification.title} - ${payload.notification.body}`);
    });

    return () => unsubscribe();
  }, [userId]);
};

export default useFirebaseNotifications;
