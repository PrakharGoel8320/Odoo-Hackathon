// routes/adminRoutes.js
import express from "express";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { createApprovalRule, listApprovalRules, listCountries, getRates } from "../controllers/adminController.js";

const router = express.Router();

router.post("/approval-rule", protect, adminOnly, createApprovalRule);
router.get("/approval-rule", protect, adminOnly, listApprovalRules);
router.get("/countries", protect, listCountries);
router.get("/rates/:base?", protect, getRates);

export default router;
