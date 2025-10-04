// controllers/expenseController.js
import Expense from "../models/Expense.js";
import ApprovalRule from "../models/ApprovalRule.js";
import User from "../models/User.js";
import Company from "../models/Company.js";
import Tesseract from "tesseract.js";
import axios from "axios";
import { convertCurrency } from "../utils/currency.js";

// Helper to evaluate an approval rule (parallel mode)
async function evaluateRule(expense) {
  if (!expense.approvalRule) return false;
  const rule = await ApprovalRule.findById(expense.approvalRule);
  if (!rule) return false;

  const total = expense.approverStatuses.length;
  const approvedCount = expense.approverStatuses.filter(
    (s) => s.status === "Approved"
  ).length;

  if (rule.type === "specific") {
    if (rule.specificApproverUserId) {
      return expense.approverStatuses.some(
        (s) =>
          s.approver.toString() === rule.specificApproverUserId.toString() &&
          s.status === "Approved"
      );
    }
    if (rule.specificApproverRole) {
      const approverUsers = await User.find({
        _id: { $in: expense.approvers },
        role: rule.specificApproverRole,
      });
      const approverIds = approverUsers.map((u) => u._id.toString());
      return expense.approverStatuses.some(
        (s) =>
          approverIds.includes(s.approver.toString()) &&
          s.status === "Approved"
      );
    }
  } else if (rule.type === "percentage") {
    const pct = total === 0 ? 0 : (approvedCount / total) * 100;
    return pct >= (rule.thresholdPercent || 60);
  } else if (rule.type === "hybrid") {
    const pct = total === 0 ? 0 : (approvedCount / total) * 100;
    const pctOk = pct >= (rule.thresholdPercent || 60);
    let specificOk = false;
    if (rule.specificApproverUserId) {
      specificOk = expense.approverStatuses.some(
        (s) =>
          s.approver.toString() === rule.specificApproverUserId.toString() &&
          s.status === "Approved"
      );
    } else if (rule.specificApproverRole) {
      const approverUsers = await User.find({
        _id: { $in: expense.approvers },
        role: rule.specificApproverRole,
      });
      const approverIds = approverUsers.map((u) => u._id.toString());
      specificOk = expense.approverStatuses.some(
        (s) =>
          approverIds.includes(s.approver.toString()) &&
          s.status === "Approved"
      );
    }
    return pctOk || specificOk;
  }

  return false;
}

// Employee submits expense
export const submitExpense = async (req, res) => {
  try {
    const {
      amount,
      currency = "INR",
      category,
      description,
      approvers = [],
      mode = "sequential",
      approvalRuleId,
    } = req.body;

    const expense = new Expense({
      employee: req.user._id,
      amount,
      currency,
      category,
      description,
      approvers,
      mode,
      approvalRule: approvalRuleId || null,
    });

    if (mode === "parallel") {
      expense.approverStatuses = approvers.map((a) => ({ approver: a }));
    }

    await expense.save();

    // Convert to company base currency if different
    const company = await Company.findOne({ _id: req.user.company });
    if (company && expense.currency !== company.baseCurrency) {
      const convertedAmount = await convertCurrency(
        expense.amount,
        expense.currency,
        company.baseCurrency
      );
      expense.convertedAmount = convertedAmount;
      expense.convertedCurrency = company.baseCurrency;
      await expense.save();
    }

    res.status(201).json(expense);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Upload receipt + OCR
export const uploadReceipt = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const expenseId = req.params.expenseId || req.params.id;
    const expense = await Expense.findById(expenseId);
    if (!expense) return res.status(404).json({ error: "Expense not found" });

    const imgPath = req.file.path;
    const result = await Tesseract.recognize(imgPath, "eng", { logger: () => {} });
    const text = result?.data?.text || "";

    expense.receiptOCRText = text;
    expense.receiptImagePath = imgPath;
    await expense.save();

    res.json({ expense, ocrTextSnippet: text.slice(0, 400) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Approve / Reject
export const approveExpense = async (req, res) => {
  try {
    const { expenseId } = req.params;
    const { decision, comment } = req.body; // "Approved" or "Rejected"
    const userId = req.user._id.toString();

    const expense = await Expense.findById(expenseId)
      .populate("approvalRule")
      .exec();
    if (!expense) return res.status(404).json({ error: "Expense not found" });
    if (expense.status !== "Pending")
      return res.status(400).json({ error: "Expense already finalised" });

    // SEQUENTIAL
    if (expense.mode === "sequential") {
      const idx = expense.currentApproverIndex;
      const currentApprover = (expense.approvers[idx] || "").toString();
      if (currentApprover !== userId)
        return res.status(403).json({ error: "Not authorized to act at this stage" });

      expense.comments.push({ user: req.user.name, text: comment });

      if (decision === "Approved") {
        if (idx < expense.approvers.length - 1) {
          expense.currentApproverIndex = idx + 1;
        } else {
          expense.status = "Approved";
        }
      } else {
        expense.status = "Rejected";
      }

      await expense.save();
      return res.json(expense);
    }

    // PARALLEL
    const apIndex = expense.approverStatuses.findIndex(
      (s) => s.approver.toString() === userId
    );
    if (apIndex === -1)
      return res.status(403).json({ error: "Not an approver for this expense" });

    expense.approverStatuses[apIndex].status =
      decision === "Approved" ? "Approved" : "Rejected";
    expense.approverStatuses[apIndex].comment = comment;
    expense.approverStatuses[apIndex].actedAt = new Date();
    expense.comments.push({ user: req.user.name, text: comment });

    // Any rejection -> final Rejected (change if you want different behavior)
    if (decision !== "Approved") {
      expense.status = "Rejected";
      await expense.save();
      return res.json(expense);
    }

    // If approval rule present, evaluate it
    if (expense.approvalRule) {
      const passed = await evaluateRule(expense);
      if (passed) {
        expense.status = "Approved";
        await expense.save();
        return res.json(expense);
      }
    }

    await expense.save();
    return res.json(expense);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get my expenses (employee)
export const myExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ employee: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Pending approvals for current user
export const pendingApprovals = async (req, res) => {
  try {
    const userId = req.user._id.toString();

    // sequential: where current approver equals user
    const seq = await Expense.find({
      mode: "sequential",
      status: "Pending",
      $where: function () {
        return (
          this.approvers &&
          this.approvers[this.currentApproverIndex] &&
          this.approvers[this.currentApproverIndex].toString() === userId
        );
      },
    }).exec();

    // parallel: approverStatuses entry with Pending
    const par = await Expense.find({
      mode: "parallel",
      status: "Pending",
      "approverStatuses.approver": userId,
      "approverStatuses.status": "Pending",
    }).exec();

    const combined = [...seq, ...par];
    res.json(combined);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
