// models/Expense.js
import mongoose from "mongoose";

const approverStatusSchema = new mongoose.Schema({
  approver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
  comment: { type: String },
  actedAt: { type: Date }
});

const expenseSchema = new mongoose.Schema({
  company: { type: String },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  currency: { type: String, required: true, default: "INR" },
  convertedAmountInCompanyCurrency: { type: Number },
  category: { type: String, required: true },
  description: { type: String },
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
  approvers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // sequence if mode === 'sequential'
  approverStatuses: [approverStatusSchema], // used for parallel mode
  mode: { type: String, enum: ["sequential", "parallel"], default: "sequential" },
  currentApproverIndex: { type: Number, default: 0 }, // for sequential
  approvalRule: { type: mongoose.Schema.Types.ObjectId, ref: "ApprovalRule" },
  receiptOCRText: { type: String },
  receiptImagePath: { type: String },
  comments: [{ user: String, text: String, date: { type: Date, default: Date.now } }],
}, { timestamps: true });

export default mongoose.model("Expense", expenseSchema);
