const express = require("express");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// POST /signup
router.post(
  "/signup",
  [
    body("username")
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage("Username must be 3–30 characters"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("purpose")
      .optional()
      .isIn(["Personal", "Retail Shop", "Trip", "Petrol", "Other"])
      .withMessage("Invalid purpose value"),
    body("purposeNote")
      .optional()
      .isLength({ max: 200 })
      .withMessage("Purpose note must be under 200 characters"),
    body("mobile")
      .notEmpty()
      .withMessage("Mobile number is required")
      .matches(/^\+\d{1,4}\d{7,12}$/)
      .withMessage("Enter a valid mobile number with country code"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { username, password, purpose, purposeNote, mobile } = req.body;

    try {
      const existing = await User.findOne({ username });
      if (existing) {
        return res.status(409).json({ message: "Username already taken" });
      }

      const user = new User({
        username,
        password,
        purpose: purpose || "Personal",
        purposeNote: purpose === "Other" ? purposeNote || "" : "",
        mobile,
      });
      await user.save();

      res.status(201).json({ message: "Account created successfully" });
    } catch (err) {
      res.status(500).json({ message: "Signup failed" });
    }
  },
);

// POST /login
router.post(
  "/login",
  [
    body("username").trim().notEmpty().withMessage("Username is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { username, password } = req.body;

    try {
      const user = await User.findOne({ username });
      if (!user) {
        // Same message for missing user or wrong password — avoids user enumeration
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const match = await user.comparePassword(password);
      if (!match) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
      });

      res.json({ token });
    } catch (err) {
      res.status(500).json({ message: "Login failed" });
    }
  },
);

// GET /me — return current user's profile
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select(
      "username mobile purpose",
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({
      username: user.username,
      mobile: user.mobile,
      purpose: user.purpose,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch profile" });
  }
});

module.exports = router;
