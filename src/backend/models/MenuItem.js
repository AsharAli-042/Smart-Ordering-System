// backend/models/MenuItem.js
import { Schema, model } from "mongoose";

const MenuItemSchema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: String,
  image: String,
  // new: category (type of food) - useful for admin filtering / grouping
  category: {
    type: String,
    enum: [
      "Starters",
      "Salads",
      "Soups",
      "Beef Mains",
      "Chicken Mains",
      "Vegetarian",
      "Vegan",
      "Desserts",
      "Beverages",
      "Sides",
      "Other"
    ],
    default: "Other",
  },
}, { timestamps: true });

const MenuItem = model("MenuItem", MenuItemSchema);
export default MenuItem;
