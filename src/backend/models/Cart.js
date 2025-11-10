// backend/models/Cart.js
import { Schema, model } from "mongoose";

const CartItemSchema = new Schema({
  menuItemId: { type: Schema.Types.ObjectId, ref: "MenuItem", required: true },
  name: String, // snapshot
  price: Number, // snapshot
  image: String, // snapshot
  quantity: { type: Number, default: 1 },
});

const CartSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  items: [CartItemSchema],
}, { timestamps: true });

const Cart = model("Cart", CartSchema);
export default Cart;
