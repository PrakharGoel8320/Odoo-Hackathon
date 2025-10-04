// models/Company.js
import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    country: { type: String, required: true },
    baseCurrency: { type: String, required: true }, // e.g. "INR"
    admin: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    employees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
  },
  { timestamps: true }
);

export default mongoose.model("Company", companySchema);
