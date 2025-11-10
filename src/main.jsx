import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

import { BrowserRouter } from "react-router-dom";
import { NextUIProvider } from "@nextui-org/react";
import { Provider } from "react-redux";

// 🟢 Register Firebase Service Worker (for FCM Push Notifications)
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/firebase-messaging-sw.js")
    .then((registration) => {
      console.log("✅ Firebase Service Worker registered successfully:", registration);
    })
    .catch((error) => {
      console.error("❌ Service Worker registration failed:", error);
    });
}

// 🟢 Optional: check if notifications are blocked
if (Notification.permission === "denied") {
  console.warn("🔕 Notifications are blocked by the user.");
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <NextUIProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </NextUIProvider>
  </StrictMode>
);
