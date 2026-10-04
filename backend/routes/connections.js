import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getMyConnections,
  getConnection,
  getConnectionWithUser,
  updateConnectionGoals,
} from "../controllers/connectionController.js";

const router = express.Router();

router.get("/", authMiddleware, getMyConnections);
router.get("/with/:userId", authMiddleware, getConnectionWithUser);
router.get("/:id", authMiddleware, getConnection);
router.put("/:id", authMiddleware, updateConnectionGoals);

export default router;
