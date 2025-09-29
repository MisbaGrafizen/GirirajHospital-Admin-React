import { io } from "socket.io-client";

// ✅ Replace with your backend server URL
const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:";

const socket = io(SOCKET_URL, {
  transports: ["websocket"], // force WebSocket (better performance)
  reconnection: true,
});

export default socket;
