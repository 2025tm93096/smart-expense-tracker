const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    category: { type: String, required: true, trim: true, maxlength: 50 },
    monthlyLimit: { type: Number, required: true, min: 1 },
  },
  { timestamps: true },
);

// One budget per category per user
budgetSchema.index({ user: 1, category: 1 }, { unique: true });

module.exports = mongoose.model("Budget", budgetSchema);
