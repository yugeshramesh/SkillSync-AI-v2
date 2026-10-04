import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getProfile,
  updateProfile,
} from "../controllers/profileController.js";

const router = express.Router();

// GET Logged-in User Profile
router.get("/", authMiddleware, getProfile);

// UPDATE Logged-in User Profile
router.put("/", authMiddleware, updateProfile);

export default router;