import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// ---------------- AUTH ----------------

export const register = (data) =>
  API.post("/auth/register", data);

export const login = (data) =>
  API.post("/auth/login", data);

// ---------------- PROFILE ----------------

// ---------------- PROFILE ----------------

export const getProfile = () =>
  API.get("/profile", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

export const updateProfile = (data) =>
  API.put("/profile", data, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

// ---------------- MATCH ----------------

export const findMatches = () =>
  API.get("/match", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

// ---------------- CHAT ----------------

// ---------------- CHAT ----------------

export const getChatList = () =>
  API.get("/chat", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

export const getConversation = (userId) =>
  API.get(`/chat/${userId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

export const sendMessage = (data) =>
  API.post("/chat/send", data, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  // ---------------- AI ----------------

export const aiChat = (message) =>
  API.post(
    "/ai/chat",
    { message },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

// ---------------- SESSIONS ----------------

const authHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

export const scheduleSession = (data) =>
  API.post("/sessions", data, authHeader());

export const respondSession = (id, status) =>
  API.put(`/sessions/${id}/respond`, { status }, authHeader());

export const cancelSession = (id) =>
  API.put(`/sessions/${id}/cancel`, {}, authHeader());

export const completeSession = (id) =>
  API.put(`/sessions/${id}/complete`, {}, authHeader());

export const getUpcomingSessions = (connectionId) =>
  API.get("/sessions/upcoming", {
    ...authHeader(),
    params: connectionId ? { connection: connectionId } : {},
  });

export const getPendingRequests = (connectionId) =>
  API.get("/sessions/requests", {
    ...authHeader(),
    params: connectionId ? { connection: connectionId } : {},
  });

export const getSessionHistory = (connectionId) =>
  API.get("/sessions/history", {
    ...authHeader(),
    params: connectionId ? { connection: connectionId } : {},
  });

// ---------------- CONNECTIONS / LEARNING PROGRESS ----------------

export const getMyConnections = () =>
  API.get("/connections", authHeader());

export const getConnection = (id) =>
  API.get(`/connections/${id}`, authHeader());

export const getConnectionWithUser = (userId) =>
  API.get(`/connections/with/${userId}`, authHeader());

export const updateConnectionGoals = (id, data) =>
  API.put(`/connections/${id}`, data, authHeader());
