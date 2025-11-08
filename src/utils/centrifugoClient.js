// src/utils/centrifugoClient.js
import { Centrifuge } from "centrifuge";

let centrifuge = null;

/**
 * Initialize Centrifugo connection
 * @param {string} token - JWT token received from your backend for the logged-in user
 */
export const initCentrifugo = (token) => {
  if (centrifuge) {
    console.log("Centrifugo already initialized");
    return centrifuge;
  }

  // ✅ Replace with your Centrifugo WebSocket URL
  const WEBSOCKET_URL = "wss://localhost:8000/connection/websocket"; 

  centrifuge = new Centrifuge(WEBSOCKET_URL, {
    token,
    debug: true, // Remove in production
  });

  centrifuge.on('connecting', ctx => console.log("🟡 Connecting:", ctx));
  centrifuge.on('connected', ctx => console.log("🟢 Connected:", ctx));
  centrifuge.on('disconnected', ctx => console.log("🔴 Disconnected:", ctx));
  centrifuge.on('error', err => console.error("❌ Centrifugo Error:", err));

  centrifuge.connect();
  return centrifuge;
};

/**
 * Subscribe to a channel
 * @param {string} channel - e.g., "user#123" or "complaints"
 * @param {function} callback - triggered on message received
 */
export const subscribeChannel = (channel, callback) => {
  if (!centrifuge) {
    console.error("⚠️ Centrifugo not initialized yet!");
    return;
  }

  const sub = centrifuge.newSubscription(channel);

  sub.on("publication", (ctx) => {
    console.log(`📩 Message from ${channel}:`, ctx.data);
    callback?.(ctx.data);
  });

  sub.on("subscribed", () => console.log(`✅ Subscribed to ${channel}`));
  sub.on("unsubscribed", () => console.log(`🚪 Unsubscribed from ${channel}`));
  sub.on("error", (err) => console.error(`❌ Subscription error on ${channel}:`, err));

  sub.subscribe();
  return sub;
};
