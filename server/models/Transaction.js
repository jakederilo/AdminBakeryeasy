import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  }, // Reference to the Order model
  userName: { type: String, required: true },
  userEmail: { type: String, required: true },
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ["Pending", "Completed"], // Restrict status values to predefined options
    required: true,
    default: "Pending",
  },
  createdAt: { type: Date, default: Date.now }, // Track transaction creation time
});

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;
