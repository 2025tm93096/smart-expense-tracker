const express = require("express");
const { body, validationResult } = require("express-validator");
const Expense = require("../models/Expense");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// All expense routes require authentication
router.use(authMiddleware);

// GET /expenses — fetch all expenses for the logged-in user
router.get("/", async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.userId }).sort({
      date: -1,
    });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch expenses" });
  }
});

// POST /expenses/add — add a new expense
router.post(
  "/add",
  [
    body("category").trim().notEmpty().withMessage("Category is required"),
    body("amount")
      .isFloat({ min: 0 })
      .withMessage("Amount must be a positive number"),
    body("date").notEmpty().withMessage("Date is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { category, amount, date } = req.body;

    try {
      const expense = new Expense({
        user: req.userId,
        category,
        amount,
        date,
      });
      await expense.save();
      res.status(201).json(expense);
    } catch (err) {
      res.status(500).json({ message: "Failed to add expense" });
    }
  },
);

module.exports = router;
