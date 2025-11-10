// backend/models/MenuItem.js
import { Schema, model } from "mongoose";

const MenuItemSchema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: String,
  image: String,
}, { timestamps: true });

const MenuItem = model("MenuItem", MenuItemSchema);
export default MenuItem;
