
const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    provider: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "success", "failed", "refunded"],
      default: "pending",
      required: true,
    },
    transactionReference: {
      type: String,
      trim: true,
      sparse: true,
      unique: true,
    },
    currency: {
      type: String,
      required: true,
      default: "INR",
      uppercase: true,
      trim: true,
    },
  },
  { timestamps: true }
);

paymentSchema.index({ orderId: 1, createdAt: -1 });

module.exports = mongoose.model("Payment", paymentSchema);
