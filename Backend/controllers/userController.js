// controllers/userController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Company from "../models/Company.js";
import { getCurrencyByCountry } from "../utils/currency.js";

// Generate JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// @desc Register new user
// @route POST /api/users/register
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, country, companyName, companyId } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
    });

    // If Admin, create a new company
    if (role === "Admin") {
      if (!country || !companyName) {
        return res
          .status(400)
          .json({ error: "Admin must provide country and company name" });
      }

      const baseCurrency = await getCurrencyByCountry(country);

      const company = new Company({
        name: companyName,
        country,
        baseCurrency,
        admin: user._id,
        employees: [user._id],
      });

      await company.save();

      // Link admin to company
      user.company = company._id;
    } else {
      // Non-admins must join an existing company
      if (!companyId) {
        return res
          .status(400)
          .json({ error: "Non-admin users must provide companyId" });
      }
      user.company = companyId;
    }

    await user.save();

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      company: user.company,
      token: generateToken(user._id, user.role),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc Authenticate user & get token
// @route POST /api/users/login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).populate("company");
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      company: user.company,
      token: generateToken(user._id, user.role),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc Get current logged in user
// @route GET /api/users/me
// @access Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("company");
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      company: user.company,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
