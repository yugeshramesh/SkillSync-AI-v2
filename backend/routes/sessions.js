import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  scheduleSession,
  respondSession,
  cancelSession,
  completeSession,
  getUpcomingSessions,
  getPendingRequests,
  getSessionHistory,
} from "../controllers/sessionController.js";

const router = express.Router();

router.get("/upcoming", authMiddleware, getUpcomingSessions);
router.get("/requests", authMiddleware, getPendingRequests);
router.get("/history", authMiddleware, getSessionHistory);

router.post("/", authMiddleware, scheduleSession);
router.put("/:id/respond", authMiddleware, respondSession);
router.put("/:id/cancel", authMiddleware, cancelSession);
router.put("/:id/complete", authMiddleware, completeSession);

export default router;
