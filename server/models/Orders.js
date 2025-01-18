import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userName: { type: String, required: true }, // Add userName field
  userEmail: { type: String, required: true }, // Add userEmail field
  cartItems: [
    {
      title: { type: String, required: true },
      price: { type: Number, required: true },
    },
  ],
  totalAmount: { type: Number, required: true },
  pickupDateTime: { type: String, required: true },
  paymentMethod: { type: String, required: true },
  status: {
    type: String,
    enum: ["Pending", "Baking", "Ready for Pickup", "Picked Up", "Canceled"], // Add new statuses
    default: "Pending",
  },
});

const Order = mongoose.model("Order", orderSchema);

export default Order;
