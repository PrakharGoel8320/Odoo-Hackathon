// middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded?.id) return res.status(401).json({ message: "Invalid token" });

    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(401).json({ message: "User not found" });
    req.user = user;
    next();
  } catch (err) {
    console.error("Auth error:", err);
    return res.status(401).json({ message: "Not authorized", error: err.message });
  }
};

// Admin-only guard
export const adminOnly = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Not authenticated" });
  if (req.user.role !== "Admin") return res.status(403).json({ message: "Admins only" });
  next();
};

// role-based helper (keeps compatibility)
export const authMiddleware = (allowedRoles = []) => {
  return async (req, res, next) => {
    await protect(req, res, async () => {
      if (allowedRoles.length === 0 || allowedRoles.includes(req.user.role)) return next();
      return res.status(403).json({ message: "Forbidden" });
    });
  };
};
