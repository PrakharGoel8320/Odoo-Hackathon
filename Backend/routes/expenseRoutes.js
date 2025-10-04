// routes/expenseRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  submitExpense,
  approveExpense,
  myExpenses,
  pendingApprovals,
  uploadReceipt,
} from "../controllers/expenseController.js";

import multer from "multer";
import path from "path";

const router = express.Router();

// multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/receipts");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// endpoints
router.post("/submit", protect, submitExpense);
router.post("/:expenseId/approve", protect, approveExpense);
router.get("/my", protect, myExpenses);
router.get("/pending", protect, pendingApprovals);
router.post("/upload", protect, upload.single("receipt"), uploadReceipt);

export default router;
