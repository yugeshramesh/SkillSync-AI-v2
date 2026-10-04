import { io } from "socket.io-client";

const SOCKET_URL = "https://skillsync-ai-v2.onrender.com";

let socket = null;

// Single shared socket instance for the whole app. Call connectSocket()
// once (e.g. from AppShell, which is mounted on every logged-in page) and
// grab it elsewhere with getSocket().
export const connectSocket = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  if (socket && socket.connected) return socket;

  if (socket) {
    socket.disconnect();
  }

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ["websocket", "polling"],
    reconnection: true,
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
