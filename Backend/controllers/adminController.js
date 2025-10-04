// controllers/adminController.js
import ApprovalRule from "../models/ApprovalRule.js";
import axios from "axios";

export const createApprovalRule = async (req, res) => {
  try {
    const { name, type, thresholdPercent, specificApproverRole, specificApproverUserId } = req.body;
    const rule = new ApprovalRule({
      name,
      type,
      thresholdPercent,
      specificApproverRole,
      specificApproverUserId,
      createdBy: req.user._id
    });
    await rule.save();
    res.status(201).json(rule);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const listApprovalRules = async (req, res) => {
  try {
    const rules = await ApprovalRule.find().sort({ createdAt: -1 });
    res.json(rules);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const listCountries = async (req, res) => {
  try {
    const resp = await axios.get("https://restcountries.com/v3.1/all?fields=name,currencies");
    res.json(resp.data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch countries" });
  }
};

export const getRates = async (req, res) => {
  try {
    const base = req.params.base || "USD";
    const resp = await axios.get(`https://api.exchangerate-api.com/v4/latest/${base}`);
    res.json(resp.data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch exchange rates" });
  }
};
