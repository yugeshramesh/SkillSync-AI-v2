import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";

import {
  sendMessage,
  getConversation,
  getChatList,
} from "../controllers/chatController.js";

const router = express.Router();

// Get all chats
router.get("/", authMiddleware, getChatList);

// Get conversation with one user
router.get("/:userId", authMiddleware, getConversation);

// Send message
router.post("/send", authMiddleware, sendMessage);

export default router;