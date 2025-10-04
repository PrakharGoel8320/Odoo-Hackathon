import express from "express";
import { registerUser, loginUser, getMe } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Register new user (Admin/Manager/Employee)
router.post("/register", registerUser);

// Login user
router.post("/login", loginUser);

// Get logged in user profile
router.get("/me", protect, getMe);

export default router;
