const express = require("express");
const { body, param, validationResult } = require("express-validator");
const Expense = require("../models/Expense");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// All expense routes require authentication
router.use(authMiddleware);

// GET /expenses
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

// POST /expenses/add
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
    if (!errors.isEmpty())
      return res.status(400).json({ message: errors.array()[0].msg });

    const { category, amount, date, recurring } = req.body;
    try {
      const expense = new Expense({
        user: req.userId,
        category,
        amount,
        date,
        recurring: !!recurring,
      });
      await expense.save();
      res.status(201).json(expense);
    } catch (err) {
      res.status(500).json({ message: "Failed to add expense" });
    }
  },
);

// PUT /expenses/:id — edit an expense
router.put(
  "/:id",
  [
    param("id").isMongoId().withMessage("Invalid expense ID"),
    body("category").trim().notEmpty().withMessage("Category is required"),
    body("amount")
      .isFloat({ min: 0 })
      .withMessage("Amount must be a positive number"),
    body("date").notEmpty().withMessage("Date is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ message: errors.array()[0].msg });

    const { category, amount, date, recurring } = req.body;
    try {
      const expense = await Expense.findOne({
        _id: req.params.id,
        user: req.userId,
      });
      if (!expense)
        return res.status(404).json({ message: "Expense not found" });
      if (expense.toUser)
        return res
          .status(403)
          .json({ message: "Split-paid expenses cannot be edited" });

      expense.category = category;
      expense.amount = amount;
      expense.date = date;
      expense.recurring = !!recurring;
      await expense.save();
      res.json(expense);
    } catch (err) {
      res.status(500).json({ message: "Failed to update expense" });
    }
  },
);

// DELETE /expenses/:id
router.delete(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid expense ID")],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ message: errors.array()[0].msg });

    try {
      const expense = await Expense.findOne({
        _id: req.params.id,
        user: req.userId,
      });
      if (!expense)
        return res.status(404).json({ message: "Expense not found" });
      if (expense.toUser)
        return res
          .status(403)
          .json({ message: "Split-paid expenses cannot be deleted" });

      await expense.deleteOne();
      res.json({ message: "Deleted" });
    } catch (err) {
      res.status(500).json({ message: "Failed to delete expense" });
    }
  },
);

module.exports = router;
