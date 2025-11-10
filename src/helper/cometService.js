import axios from "axios";
import CometChat from "../config/comet.config";

const baseURL = import.meta.env.VITE_API_BASE;

/* ---------- Fetch token from your backend ---------- */
export async function getAuthToken(uid) {
  const res = await axios.post(`${baseURL}/api/cometchat/get-token`, { uid });
  if (!res.data?.token) throw new Error("Failed to fetch CometChat token");
  return res.data.token;
}

/* ---------- Login user ---------- */
export async function loginToComet(uid) {
  const token = await getAuthToken(uid);
  const user = await CometChat.login(token);
  console.log("🟢 Logged in as:", user.name);
  return user;
}

/* ---------- Send a message ---------- */
export async function sendMessage(receiver, text, receiverType = "user") {
  const message = new CometChat.TextMessage(receiver, text, receiverType);
  const sent = await CometChat.sendMessage(message);
  return sent;
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
}
