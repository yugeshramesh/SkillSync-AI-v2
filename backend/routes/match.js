import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { findMatches } from "../controllers/matchController.js";

const router = express.Router();

// Find AI Matches
router.get("/", authMiddleware, findMatches);

export default router;