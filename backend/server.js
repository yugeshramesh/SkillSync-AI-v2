import dotenv from "dotenv";
dotenv.config();

import express from "express";
import http from "http";
import cors from "cors";

import connectDB from "./config/db.js";
import { initSocket } from "./sockets/index.js";

import authRoutes from "./routes/auth.js";
import profileRoutes from "./routes/profile.js";
import matchRoutes from "./routes/match.js";
import chatRoutes from "./routes/chat.js";
import aiRoutes from "./routes/ai.js";
import sessionRoutes from "./routes/sessions.js";
import connectionRoutes from "./routes/connections.js";

connectDB();

const app = express();

// ===============================
// CORS CONFIGURATION
// ===============================

const allowedOrigins = [
  "http://localhost:5173",
  "https://skill-sync-ai-v2.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (Postman, mobile apps)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Handle preflight requests
app.options("*", cors());

app.use(express.json());

// ===============================
// ROUTES
// ===============================

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/match", matchRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/connections", connectionRoutes);

// ===============================
// HEALTH CHECK
// ===============================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: " SkillSync AI Backend Running Successfully",
  });
});

const PORT = process.env.PORT || 5000;

// ===============================
// SOCKET SERVER
// ===============================

const httpServer = http.createServer(app);

initSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log("🔌 Socket.IO Ready");
});