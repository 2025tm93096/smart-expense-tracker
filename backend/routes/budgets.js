const express = require("express");
const { body, param, validationResult } = require("express-validator");
const Budget = require("../models/Budget");
const authMiddleware = require("../middleware/auth");

const router = express.Router();
router.use(authMiddleware);

// GET /budgets — all budgets for current user
router.get("/", async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.userId });
    res.json(budgets);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch budgets" });
  }
});

// POST /budgets — create or update a budget for a category (upsert)
router.post(
  "/",
  [
    body("category").trim().notEmpty().withMessage("Category is required"),
    body("monthlyLimit")
      .isFloat({ min: 1 })
      .withMessage("Monthly limit must be at least 1"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ message: errors.array()[0].msg });

    const { category, monthlyLimit } = req.body;
    try {
      const budget = await Budget.findOneAndUpdate(
        { user: req.userId, category },
        { monthlyLimit },
        { new: true, upsert: true, setDefaultsOnInsert: true },
      );
      res.status(201).json(budget);
    } catch (err) {
      res.status(500).json({ message: "Failed to save budget" });
    }
  },
);

// DELETE /budgets/:id — remove a budget
router.delete(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid budget ID")],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ message: errors.array()[0].msg });

    try {
      const budget = await Budget.findOneAndDelete({
        _id: req.params.id,
        user: req.userId,
      });
      if (!budget) return res.status(404).json({ message: "Budget not found" });
      res.json({ message: "Deleted" });
    } catch (err) {
      res.status(500).json({ message: "Failed to delete budget" });
    }
  },
);

module.exports = router;
