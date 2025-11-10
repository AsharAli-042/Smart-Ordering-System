import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
// import fs from "fs";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import User from "./models/User.js";
import MenuItem from "./models/MenuItem.js";
import Cart from "./models/Cart.js";
import Order from "./models/Order.js";
import Feedback from "./models/Feedback.js";


const app = express();
app.use(cors(
  {origin:  "http://localhost:5173"}
));
app.use(bodyParser.json());

const USERS_FILE = "./users.json";

// // Ensure file exists
// if (!fs.existsSync(USERS_FILE)) {
//     fs.writeFileSync(USERS_FILE, JSON.stringify([]));
// }

// eslint-disable-next-line no-undef
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret"; // use strong secret in prod

// Connect to MongoDB
// eslint-disable-next-line no-undef
mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/smart-restaurant", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Auth middleware (checks Authorization: Bearer <token>)
const authMiddleware = async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ message: "Missing token" });
  const token = auth.split(" ")[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload; // { userId, name }
    next();
  // eslint-disable-next-line no-unused-vars
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

/* ----------------
   Auth routes
   ---------------- */
app.post("/api/auth/signup", async (req, res) => {
  const { name, password } = req.body;
  if (!name || !password) return res.status(400).json({ message: "Missing fields" });

  try {
    const existing = await User.findOne({ name });
    if (existing) return res.status(409).json({ message: "User already exists" });

    const passwordHash = await User.hashPassword(password);
    const newUser = await User.create({ name, passwordHash });
    const token = jwt.sign({ userId: newUser._id, name: newUser.name }, JWT_SECRET, { expiresIn: "7d" });

    res.json({ id: newUser._id, name: newUser.name, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Signup failed" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { name, password } = req.body;
  if (!name || !password) return res.status(400).json({ message: "Missing fields" });

  try {
    const user = await User.findOne({ name });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id, name: user.name }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ id: user._id, name: user.name, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login failed" });
  }
});

/* ----------------
   Menu routes
   ---------------- */
app.get("/api/menu", async (req, res) => {
  const items = await MenuItem.find().lean();
  res.json(items);
});

/* ----------------
   Cart routes (user-specific)
   ---------------- */
// Get user's cart
app.get("/api/cart", authMiddleware, async (req, res) => {
  const userId = req.user.userId;
  let cart = await Cart.findOne({ userId }).lean();
  if (!cart) cart = { userId, items: [] };
  res.json(cart.items);
});

// Replace/Set cart (client sends full array of items)
app.post("/api/cart", authMiddleware, async (req, res) => {
  const userId = req.user.userId;
  const items = req.body.items || [];
  await Cart.findOneAndUpdate({ userId }, { userId, items }, { upsert: true });
  res.json({ message: "Cart saved" });
});

// Remove one menuItem from cart
app.delete("/api/cart/:menuItemId", authMiddleware, async (req, res) => {
  const { menuItemId } = req.params;
  const userId = req.user.userId;
  const cart = await Cart.findOne({ userId });
  if (!cart) return res.status(404).json({ message: "Cart not found" });

  cart.items = cart.items.filter(it => it.menuItemId.toString() !== menuItemId);
  await cart.save();
  res.json({ message: "Item removed", items: cart.items });
});

// Clear cart
app.delete("/api/cart", authMiddleware, async (req, res) => {
  const userId = req.user.userId;
  await Cart.findOneAndUpdate({ userId }, { items: [] }, { upsert: true });
  res.json({ message: "Cart cleared" });
});

// softAuth: set req.user if Authorization header present and valid, otherwise continue as guest
const softAuth = async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) {
    // guest
    return next();
  }
  const token = auth.split(" ")[1];
  if (!token) return next();
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload; // { userId, name }
  } catch (err) {
    // invalid token -> treat as guest
    console.warn("softAuth: invalid token", err.message);
  }
  return next();
};

/**
 * POST /api/orders
 * Body: {
 *   items: [{ menuItemId?, name, price, image, quantity }],
 *   subtotal: Number,
 *   additionalCharges: Number,
 *   total: Number,
 *   specialInstructions?: String,
 *   meta?: Object (optional extras: tableNo, phone, etc.)
 * }
 *
 * If Authorization header present and valid, order.userId will be set.
 */
app.post("/api/orders", softAuth, async (req, res) => {
  try {
    const {
      items = [],
      subtotal,
      additionalCharges = 0,
      total,
      specialInstructions = "",
      meta = {},
    } = req.body || {};

    // Basic validation
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Order must contain at least one item." });
    }
    if (typeof subtotal !== "number" || typeof total !== "number") {
      return res.status(400).json({ message: "Subtotal and total must be numbers." });
    }

    const orderDoc = await Order.create({
      userId: req.user?.userId || null,
      items,
      subtotal,
      additionalCharges,
      total,
      specialInstructions,
      placedAt: new Date(),
      meta,
      status: "placed",
    });

    // If a logged-in user placed the order, clear their server-side cart (optional but common)
    if (req.user?.userId) {
      try {
        await Cart.findOneAndUpdate({ userId: req.user.userId }, { items: [] }, { upsert: true });
      } catch (err) {
        console.warn("Failed to clear cart after order:", err);
        // don't fail the whole request; order is placed
      }
    }

    return res.status(201).json({ orderId: orderDoc._id, message: "Order placed successfully." });
  } catch (err) {
    console.error("POST /api/orders error:", err);
    return res.status(500).json({ message: "Failed to place order" });
  }
});

/**
 * POST /api/feedback
 * Body: {
 *   orderId?: string,
 *   rating: number,
 *   message?: string,
 *   placedAt?: string
 * }
 */
app.post("/api/feedback", softAuth, async (req, res) => {
  try {
    const { orderId = null, rating = 0, message = "" } = req.body || {};

    if (typeof rating !== "number" || rating < 0 || rating > 5) {
      return res.status(400).json({ message: "Rating must be a number between 0 and 5." });
    }

    const feedbackDoc = await Feedback.create({
      userId: req.user?.userId || null,
      orderId,
      rating,
      message,
      createdAt: new Date(),
    });

    return res.status(201).json({ feedbackId: feedbackDoc._id, message: "Thanks for your feedback!" });
  } catch (err) {
    console.error("POST /api/feedback error:", err);
    return res.status(500).json({ message: "Failed to submit feedback" });
  }
});


/* ----------------
   Start server
   ---------------- */
// eslint-disable-next-line no-undef
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening at ${PORT}`));