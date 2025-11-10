// src/backend/models/Order.js
import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema({
  menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem", required: false },
  name: String,
  price: Number,
  image: String,
  quantity: { type: Number, default: 1 },
});

const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false }, // optional for guests
  items: { type: [OrderItemSchema], default: [] },
  subtotal: { type: Number, required: true },
  additionalCharges: { type: Number, default: 0 },
  total: { type: Number, required: true },
  specialInstructions: { type: String, default: "" },
  status: { type: String, default: "placed" }, // placed, preparing, ready, delivered, cancelled...
  placedAt: { type: Date, default: () => new Date() },
  meta: { type: Object, default: {} }, // free-form (tableNo, phone, etc.)
}, { timestamps: true });

// You can add indexes if needed
OrderSchema.index({ userId: 1 });
const Order = mongoose.model("Order", OrderSchema);
export default Order;
