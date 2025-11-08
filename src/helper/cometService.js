import CometChat from "../config/comet.config";
import { ApiPost } from "./axios"; // ✅ use your existing helper


/* ---------- Fetch token from your backend ---------- */
export async function getAuthToken(uid) {
  try {
    const res = await ApiPost(`/comet-chat/get-token`, { uid });
    if (!res.data?.token) throw new Error("Failed to fetch CometChat token");
    return res.data.token;
  } catch (err) {
    console.error("❌ Token Fetch Error:", err);
    throw new Error(err.message || "Error fetching CometChat token");
  }
}

/* ---------- Login user ---------- */
export async function loginToComet(uid) {
  try {
    const token = await getAuthToken(uid);
    const user = await CometChat.login(token);
    console.log("🟢 Logged in as:", user.name);
    return user;
  } catch (err) {
    console.error("❌ CometChat Login Error:", err);
    throw new Error(err.message || "CometChat login failed");
  }
}

/* ---------- Send a message ---------- */
export async function sendMessage(receiver, text, receiverType = "user") {
  try {
    const message = new CometChat.TextMessage(receiver, text, receiverType);
    const sent = await CometChat.sendMessage(message);
    console.log("📤 Message Sent:", sent);
    return sent;
  } catch (err) {
    console.error("❌ Message Send Error:", err);
    throw new Error(err.message || "Message send failed");
  }
}

/* ---------- Listen for incoming messages ---------- */
export function listenForMessages(callback) {
  const listenerID = "listener_" + Date.now();
  CometChat.addMessageListener(
    listenerID,
    new CometChat.MessageListener({
      onTextMessageReceived: (msg) => {
        console.log("💬 Received:", msg);
        callback(msg);
      },
    })
  );
  console.log("👂 Listening for incoming CometChat messages...");
}
