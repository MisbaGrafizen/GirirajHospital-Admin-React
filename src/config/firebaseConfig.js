// src/config/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, isSupported } from "firebase/messaging";

// ✅ Your Firebase Project Config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// ✅ Initialize Firebase App
const app = initializeApp(firebaseConfig);

// ✅ Initialize Messaging (only if supported)
let messaging = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      messaging = getMessaging(app);
      console.log("📩 Firebase Messaging supported and initialized.");
    } else {
      console.warn("⚠️ Firebase Messaging not supported on this browser.");
    }
  });
}

/* ----------------------------------------------------------------
   🔹 Function: Request FCM Token
---------------------------------------------------------------- */
export const requestFcmToken = async () => {
  try {
    if (!messaging) {
      console.warn("⚠️ Messaging not ready yet.");
      return null;
    }

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("🔕 Notification permission not granted.");
      return null;
    }

    // ✅ Get token using your VAPID key (from Firebase Console → Project Settings → Cloud Messaging)
    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
    const token = await getToken(messaging, { vapidKey });

    if (token) {
      console.log("✅ FCM Token:", token);
      return token;
    } else {
      console.warn("⚠️ No FCM token retrieved.");
      return null;
    }
  } catch (err) {
    console.error("❌ FCM Token Error:", err);
    return null;
  }
};

export { app, messaging };
