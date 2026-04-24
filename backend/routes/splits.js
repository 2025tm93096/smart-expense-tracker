const express = require("express");
const { body, param, validationResult } = require("express-validator");
const Split = require("../models/Split");
const User = require("../models/User");
const Expense = require("../models/Expense");
const authMiddleware = require("../middleware/auth");

const router = express.Router();
router.use(authMiddleware);

// GET /splits — all splits created by current user
router.get("/", async (req, res) => {
  try {
    const splits = await Split.find({ creator: req.userId }).sort({
      createdAt: -1,
    });
    res.json(splits);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch splits" });
  }
});

// GET /splits/incoming — splits where current user is a tagged member (by mobile)
router.get("/incoming", async (req, res) => {
  try {
    const currentUser = await User.findById(req.userId).select("mobile");
    if (!currentUser || !currentUser.mobile) return res.json([]);

    const splits = await Split.find({
      members: { $elemMatch: { mobile: currentUser.mobile, settled: false } },
      creator: { $ne: req.userId },
    })
      .sort({ createdAt: -1 })
      .populate("creator", "username");

    res.json(splits);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch incoming splits" });
  }
});

// POST /splits — create a new split
router.post(
  "/",
  [
    body("description")
      .trim()
      .notEmpty()
      .withMessage("Description is required")
      .isLength({ max: 100 })
      .withMessage("Description must be under 100 characters"),
    body("note")
      .optional()
      .isLength({ max: 200 })
      .withMessage("Note must be under 200 characters"),
    body("totalAmount")
      .isFloat({ min: 0.01 })
      .withMessage("Total amount must be greater than 0"),
    body("members")
      .isArray({ min: 1, max: 20 })
      .withMessage("Must have 1–20 members"),
    body("members.*.name")
      .trim()
      .notEmpty()
      .withMessage("Each member must have a name"),
    body("members.*.mobile")
      .trim()
      .notEmpty()
      .withMessage("Each member must have a mobile number"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { description, note, totalAmount, members } = req.body;
    const perHead = parseFloat((totalAmount / members.length).toFixed(2));

    const membersWithShare = members.map((m) => ({
      name: m.name,
      mobile: m.mobile,
      share: perHead,
      settled: m.settled === true,
    }));

    try {
      const split = new Split({
        creator: req.userId,
        description,
        note: note || "",
        totalAmount,
        members: membersWithShare,
      });
      await split.save();
      res.status(201).json(split);
    } catch (err) {
      res.status(500).json({ message: "Failed to create split" });
    }
  },
);

// PATCH /splits/:id/settle/:memberId — mark a member as settled
router.patch(
  "/:id/settle/:memberId",
  [
    param("id").isMongoId().withMessage("Invalid split ID"),
    param("memberId").isMongoId().withMessage("Invalid member ID"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    try {
      const split = await Split.findOne({
        _id: req.params.id,
        creator: req.userId,
      });
      if (!split) return res.status(404).json({ message: "Split not found" });

      const member = split.members.id(req.params.memberId);
      if (!member) return res.status(404).json({ message: "Member not found" });

      member.settled = !member.settled;
      await split.save();
      res.json(split);
    } catch (err) {
      res.status(500).json({ message: "Failed to update member" });
    }
  },
);

// PATCH /splits/:id/pay — current user marks their own member entry as paid/settled
router.patch(
  "/:id/pay",
  [param("id").isMongoId().withMessage("Invalid split ID")],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    try {
      const currentUser = await User.findById(req.userId).select("mobile");
      if (!currentUser || !currentUser.mobile) {
        return res.status(400).json({ message: "User mobile not found" });
      }

      const split = await Split.findById(req.params.id);
      if (!split) return res.status(404).json({ message: "Split not found" });

      const member = split.members.find((m) => m.mobile === currentUser.mobile);
      if (!member) {
        return res
          .status(403)
          .json({ message: "You are not a member of this split" });
      }

      const wasSettled = member.settled;
      member.settled = !member.settled;
      await split.save();

      // Auto-save expense only when transitioning to settled (not when un-settling)
      if (!wasSettled && member.settled) {
        await split.populate("creator", "username");
        const today = new Date().toISOString().split("T")[0];
        const payerUser = await User.findById(req.userId).select("username");

        // Expense for the payer (member who paid)
        await Expense.create({
          user: req.userId,
          category: split.description.slice(0, 50),
          amount: member.share,
          date: today,
          toUser: split.creator?.username || null,
        });

        // Expense for the creator (requestor) — money received from payer
        await Expense.create({
          user: split.creator._id,
          category: split.description.slice(0, 50),
          amount: member.share,
          date: today,
          toUser: payerUser?.username || null,
        });
      }

      await split.populate("creator", "username");
      res.json(split);
    } catch (err) {
      res.status(500).json({ message: "Failed to update payment status" });
    }
  },
);

// DELETE /splits/:id — delete a split
router.delete(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid split ID")],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    try {
      const split = await Split.findOneAndDelete({
        _id: req.params.id,
        creator: req.userId,
      });
      if (!split) return res.status(404).json({ message: "Split not found" });
      res.json({ message: "Split deleted" });
    } catch (err) {
      res.status(500).json({ message: "Failed to delete split" });
    }
  },
);

module.exports = router;
