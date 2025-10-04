// models/ApprovalRule.js
import mongoose from "mongoose";

const approvalRuleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ["percentage", "specific", "hybrid"], required: true },
  thresholdPercent: { type: Number, default: 60 },
  specificApproverRole: { type: String }, // optional role like "CFO" (if you want)
  specificApproverUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // optional specific user
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

export default mongoose.model("ApprovalRule", approvalRuleSchema);
