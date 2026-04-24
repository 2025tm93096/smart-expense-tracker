const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 50 },
  mobile: { type: String, required: true, trim: true },
  share: { type: Number, required: true, min: 0 },
  settled: { type: Boolean, default: false },
});

const splitSchema = new mongoose.Schema(
  {
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    description: { type: String, required: true, trim: true, maxlength: 100 },
    note: { type: String, trim: true, maxlength: 200, default: "" },
    totalAmount: { type: Number, required: true, min: 0 },
    members: {
      type: [memberSchema],
      validate: {
        validator: (arr) => arr.length >= 1 && arr.length <= 20,
        message: "A group must have between 1 and 20 members",
      },
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Split", splitSchema);
