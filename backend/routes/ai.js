import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { aiChat } from "../controllers/aiController.js";

const router = express.Router();

// AI Mentor Chat
router.post("/chat", authMiddleware, aiChat);

export default router;