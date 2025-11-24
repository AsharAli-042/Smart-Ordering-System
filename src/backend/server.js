import express from "express";
import cors from "cors";
import crypto from "crypto";
import bodyParser from "body-parser";
import dotenv from "dotenv";
// import fs from "fs";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import User from "./models/User.js";
import MenuItem from "./models/MenuItem.js";
import Cart from "./models/Cart.js";
import Order from "./models/Order.js";
import Feedback from "./models/Feedback.js";
import PasswordReset from "./models/PasswordReset.js";
import { sendEmail } from "./utils/mailer.js";

const TZ_NAME = process.env.TZ_NAME || "Asia/Karachi"; // Olson timezone name
const TZ_OFFSET_HOURS = Number(process.env.TZ_OFFSET_HOURS || 5); // numeric offset fallback (if needed)


/**
 * Compute UTC Date that represents the start-of-day (00:00) in the target timezone.
 * daysAgo = 0 -> today, 1 -> yesterday, etc.
 */
function startOfDayInUTC(
  offsetHours = 0,
  daysAgo = 0,
  tz = TZ_NAME || "Asia/Karachi"
) {
  // get an instant daysAgo days before now
  const instant =
    Date.now() - Math.max(0, Math.floor(daysAgo)) * 24 * 60 * 60 * 1000;
  const localIso = new Date(instant).toLocaleDateString("en-CA", {
    timeZone: tz,
  }); // "YYYY-MM-DD"
  const [yearStr, monthStr, dayStr] = localIso.split("-");
  const year = Number(yearStr),
    month = Number(monthStr),
    day = Number(dayStr);
  // Date.UTC gives midnight UTC for that date; local midnight (tz) corresponds to UTC = local - offset
  const utcMs =
    Date.UTC(year, month - 1, day, 0, 0, 0) -
    Number(offsetHours || 0) * 60 * 60 * 1000;
  return new Date(utcMs);
}

const app = express();
app.use(cors({ origin: "https://smart-ordering-system-psi.vercel.app" }));
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
mongoose.connect(
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/smart-restaurant",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

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

const auth = authMiddleware;

/* ----------------
   Auth routes
   ---------------- */

app.get("/", (req, res) => {
  res.send("Smart Ordering System API is running.");
});

app.post("/api/auth/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body || {};

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email and password are required." });
    }

    // basic validations (you can make stronger)
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters." });
    }

    // check existing email or name
    const exists = await User.findOne({
      $or: [{ email: email.toLowerCase().trim() }, { name: name.trim() }],
    });
    if (exists) {
      return res
        .status(409)
        .json({ message: "User with this name or email already exists." });
    }

    const passwordHash = await User.hashPassword(password);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role: "user", // default role for signups
    });

    // Respond with safe public data (do NOT send passwordHash)
    return res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    console.error("POST /api/auth/signup error:", err);
    // handle duplicate key more gracefully
    if (err?.code === 11000) {
      return res.status(409).json({ message: "Name or email already exists." });
    }
    return res.status(500).json({ message: "Failed to create user." });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { name, password } = req.body;
  if (!name || !password)
    return res.status(400).json({ message: "Missing fields" });

  try {
    const user = await User.findOne({ name });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { userId: user._id, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.json({ id: user._id, name: user.name, token, role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login failed" });
  }
});

app.post("/api/auth/forgot-password", async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      // Always respond success to avoid user enumeration
      return res
        .status(200)
        .json({ message: "If that email exists, a reset link was sent." });
    }

    // Create a secure token
    const token = crypto.randomBytes(24).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    // Save token (you may choose to remove previous tokens for this user)
    await PasswordReset.create({ userId: user._id, token, expiresAt });

    // Email link (use your frontend URL)
    const frontendBase = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetLink = `${frontendBase}/reset-password?token=${encodeURIComponent(
      token
    )}`;

    const html = `
      <p>Hello ${user.name},</p>
      <p>We received a request to reset your password. Click the link below to set a new password (valid for 1 hour):</p>
      <p><a href="${resetLink}">${resetLink}</a></p>
      <p>If you didn't request this, you can safely ignore this email.</p>
      <p>— Smart Ordering</p>
    `;

    try {
      await sendEmail({
        to: user.email,
        subject: "Reset your Smart Ordering password",
        html,
      });
    } catch (mailErr) {
      console.error("Failed to send reset email:", mailErr);
      // don't fail; respond OK so UX isn't broken
    }

    return res
      .status(200)
      .json({ message: "If that email exists, a reset link was sent." });
  } catch (err) {
    console.error("POST /api/auth/forgot-password error:", err);
    return res.status(500).json({ message: "Failed to process request" });
  }
});

app.post("/api/auth/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body || {};
    if (!token || !newPassword)
      return res
        .status(400)
        .json({ message: "Token and newPassword are required" });
    if (newPassword.length < 6)
      return res.status(400).json({ message: "Password too short" });

    const pr = await PasswordReset.findOne({ token });
    if (!pr || pr.expiresAt < new Date()) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const user = await User.findById(pr.userId);
    if (!user) {
      return res.status(400).json({ message: "Invalid token" });
    }

    const hash = await User.hashPassword(newPassword);
    user.passwordHash = hash;
    await user.save();

    // Remove all password reset tokens for this user
    await PasswordReset.deleteMany({ userId: user._id });

    return res.status(200).json({ message: "Password updated" });
  } catch (err) {
    console.error("POST /api/auth/reset-password error:", err);
    return res.status(500).json({ message: "Failed to reset password" });
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

  cart.items = cart.items.filter(
    (it) => it.menuItemId.toString() !== menuItemId
  );
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
// POST /api/orders
app.post("/api/orders", authMiddleware, async (req, res) => {
  try {
    const {
      items = [],
      subtotal,
      additionalCharges = 0,
      total,
      specialInstructions = "",
      meta = {},
      tableNumber: rawTableNumber,
      placedAt: rawPlacedAt,
    } = req.body || {};

    // Basic validation
    if (!Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ message: "Order must contain at least one item." });
    }
    if (typeof subtotal !== "number" || typeof total !== "number") {
      return res
        .status(400)
        .json({ message: "Subtotal and total must be numbers." });
    }

    // Table number is required (either as top-level property or inside meta.tableNumber)
    const tableNumberCandidate =
      (typeof rawTableNumber !== "undefined" && rawTableNumber !== null
        ? String(rawTableNumber)
        : "") || (meta && meta.tableNumber ? String(meta.tableNumber) : "");

    if (!tableNumberCandidate || !tableNumberCandidate.trim()) {
      return res.status(400).json({ message: "tableNumber is required." });
    }
    const tableNumber = tableNumberCandidate.trim();

    // placedAt: accept client-provided ISO string, otherwise use server time
    const placedAt = rawPlacedAt ? new Date(rawPlacedAt) : new Date();

    const orderDoc = await Order.create({
      userId: req.user?.userId || null,
      items,
      subtotal,
      additionalCharges,
      total,
      specialInstructions,
      placedAt,
      meta,
      status: "placed",
      tableNumber,
    });

    // If a logged-in user placed the order, clear their server-side cart (optional but common)
    if (req.user?.userId) {
      try {
        await Cart.findOneAndUpdate(
          { userId: req.user.userId },
          { items: [] },
          { upsert: true }
        );
      } catch (err) {
        console.warn("Failed to clear cart after order:", err);
        // don't fail the whole request; order is placed
      }
    }

    return res
      .status(201)
      .json({ orderId: orderDoc._id, message: "Order placed successfully." });
  } catch (err) {
    console.error("POST /api/orders error:", err);
    return res.status(500).json({ message: "Failed to place order" });
  }
});

// GET /api/orders/:orderId — requires auth
app.get("/api/orders/:orderId", authMiddleware, async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId).lean();
    if (!order) return res.status(404).json({ message: "Order not found" });

    // ensure ownership: order.userId must equal req.user.userId
    if (order.userId && String(order.userId) !== String(req.user.userId)) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this order" });
    }

    // return order minimal fields (avoid leaking)
    return res.json({
      _id: order._id,
      userId: order.userId,
      status: order.status,
      items: order.items,
      subtotal: order.subtotal,
      total: order.total,
      placedAt: order.placedAt,
      meta: order.meta,
    });
  } catch (err) {
    console.error("GET /api/orders/:orderId error:", err);
    return res.status(500).json({ message: "Failed to fetch order" });
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
// POST /api/feedback
// Require authentication for server-side feedback (prevents multiple guest abuse).
// If you want guests to be allowed server-side, you can change this to softAuth and add additional checks.
app.post("/api/feedback", auth, async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { orderId, rating, message } = req.body || {};

    if (!orderId || typeof rating === "undefined") {
      return res
        .status(400)
        .json({ message: "orderId and rating are required." });
    }

    // validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: "Invalid orderId." });
    }

    // fetch order
    const order = await Order.findById(orderId).lean();
    if (!order) return res.status(404).json({ message: "Order not found." });

    // only allow feedback for completed/delivered orders
    const status = (order.status || "").toString().toLowerCase();
    if (!(status === "completed" || status === "delivered")) {
      return res
        .status(400)
        .json({ message: "Feedback allowed only after order is completed." });
    }

    // ensure this user hasn't already left feedback for this order
    const existing = await Feedback.findOne({ orderId, userId });
    if (existing) {
      return res.status(400).json({
        message: "You have already submitted feedback for this order.",
      });
    }

    const fb = await Feedback.create({
      userId,
      orderId,
      rating: Number(rating),
      message: message || "",
    });

    return res
      .status(201)
      .json({ message: "Feedback submitted.", feedbackId: fb._id });
  } catch (err) {
    console.error("POST /api/feedback error:", err);
    return res.status(500).json({ message: "Failed to submit feedback" });
  }
});

// GET /api/feedback/check/:orderId - tells if current logged-in user already submitted feedback for that order
app.get("/api/feedback/check/:orderId", authMiddleware, async (req, res) => {
  try {
    const { orderId } = req.params;
    // server-side: find feedback by orderId and optionally by userId
    const found = await Feedback.findOne({
      orderId,
      userId: req.user.userId,
    }).lean();
    return res.json({ exists: Boolean(found) });
  } catch (err) {
    console.error("GET /api/feedback/check/:orderId", err);
    return res.status(500).json({ message: "Failed to check feedback" });
  }
});

/**
 * GET /api/admin/stats
 * returns summary KPIs: totalOrdersToday, revenueToday, revenueWeek
 */
app.get("/api/admin/stats", authMiddleware, async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const tz = TZ_NAME || "Asia/Karachi";
    const offsetHours = Number(TZ_OFFSET_HOURS || 0);

    // Start of today local in UTC, and start of week (6 days ago local midnight)
    const startOfTodayUTC = startOfDayInUTC(offsetHours, 0, tz);
    const startOfWeekUTC = startOfDayInUTC(offsetHours, 6, tz); // last 7 days including today

    // total orders today
    const totalOrdersToday = await Order.countDocuments({
      placedAt: { $gte: startOfTodayUTC },
    });

    // revenue today
    const revenueTodayAgg = await Order.aggregate([
      { $match: { placedAt: { $gte: startOfTodayUTC } } },
      { $group: { _id: null, sum: { $sum: { $ifNull: ["$total", 0] } } } },
    ]);
    const revenueToday = (revenueTodayAgg[0] && revenueTodayAgg[0].sum) || 0;

    // revenue for the last 7 days (from startOfWeekUTC)
    const revenueWeekAgg = await Order.aggregate([
      { $match: { placedAt: { $gte: startOfWeekUTC } } },
      { $group: { _id: null, sum: { $sum: { $ifNull: ["$total", 0] } } } },
    ]);
    const revenueWeek = (revenueWeekAgg[0] && revenueWeekAgg[0].sum) || 0;

    return res.json({
      totalOrdersToday,
      revenueToday,
      revenueWeek,
    });
  } catch (err) {
    console.error("GET /api/admin/stats error:", err);
    return res.status(500).json({ message: "Failed to compute stats" });
  }
});

/**
 * GET /api/admin/weekly-revenue
 * returns list for last 7 local days (date: "YYYY-MM-DD", revenue, orders)
 */
app.get("/api/admin/weekly-revenue", authMiddleware, async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const tz = TZ_NAME || "Asia/Karachi";
    const offsetHours = Number(TZ_OFFSET_HOURS || 0);

    const startOfWeekUTC = startOfDayInUTC(offsetHours, 6, tz);

    // Aggregate grouped by local date string in timezone
    const agg = await Order.aggregate([
      { $match: { placedAt: { $gte: startOfWeekUTC } } },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$placedAt",
              timezone: tz,
            },
          },
          revenue: { $sum: { $ifNull: ["$total", 0] } },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Build full 7-day list (including zeros) to ensure frontend always receives 7 entries
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const iso = startOfDayInUTC(offsetHours, i, tz)
        .toLocaleString("en-CA", { timeZone: tz })
        .slice(0, 10);
      days.push(iso);
    }

    const map = Object.fromEntries(
      agg.map((a) => [
        a._id,
        { revenue: a.revenue || 0, orders: a.orders || 0 },
      ])
    );

    const result = days.map((d) => ({
      date: d,
      revenue: map[d] ? map[d].revenue : 0,
      orders: map[d] ? map[d].orders : 0,
    }));

    return res.json(result);
  } catch (err) {
    console.error("GET /api/admin/weekly-revenue error:", err);
    return res
      .status(500)
      .json({ message: "Failed to compute weekly revenue" });
  }
});

/**
 * GET /api/admin/peak-hours
 * returns array of 24 entries: { hour: 0..23, orders }
 * computed across last 7 local days (so hours are local PKT hours)
 */
app.get("/api/admin/peak-hours", authMiddleware, async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const tz = TZ_NAME || "Asia/Karachi";
    const offsetHours = Number(TZ_OFFSET_HOURS || 0);

    const startOfWeekUTC = startOfDayInUTC(offsetHours, 6, tz);

    const agg = await Order.aggregate([
      { $match: { placedAt: { $gte: startOfWeekUTC } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%H", date: "$placedAt", timezone: tz },
          },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // map results and fill missing hours 0..23
    const map = Object.fromEntries(
      agg.map((a) => [Number(a._id), a.orders || 0])
    );
    const hours = Array.from({ length: 24 }, (_, h) => ({
      hour: h,
      orders: map[h] || 0,
    }));

    return res.json(hours);
  } catch (err) {
    console.error("GET /api/admin/peak-hours error:", err);
    return res.status(500).json({ message: "Failed to compute peak hours" });
  }
});

/**
 * GET /api/admin/top-selling
 * returns top selling items across all time (or you can add ?days=7 to limit)
 */
app.get("/api/admin/top-selling", authMiddleware, async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Optional: limit by days param (e.g., ?days=7)
    const days = Number(req.query.days || 0);
    const match =
      days > 0
        ? {
            placedAt: {
              $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
            },
          }
        : {};

    const pipeline = [
      ...(Object.keys(match).length ? [{ $match: match }] : []),
      { $unwind: "$items" },
      {
        $group: {
          _id: { $ifNull: ["$items.name", "$items.menuItemId"] },
          sales: { $sum: { $ifNull: ["$items.quantity", 1] } },
          revenue: {
            $sum: {
              $multiply: [
                { $ifNull: ["$items.quantity", 1] },
                { $ifNull: ["$items.price", 0] },
              ],
            },
          },
        },
      },
      { $sort: { sales: -1 } },
      { $limit: 10 },
    ];

    const agg = await Order.aggregate(pipeline);

    const result = agg.map((a) => ({
      name: String(a._id),
      sales: a.sales || 0,
      revenue: a.revenue || 0,
    }));

    return res.json(result);
  } catch (err) {
    console.error("GET /api/admin/top-selling error:", err);
    return res
      .status(500)
      .json({ message: "Failed to compute top selling items" });
  }
});

// --- GET /api/admin/feedback ---
// Returns list of feedbacks (most recent first). Admin-only.
app.get("/api/admin/feedback", authMiddleware, async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin")
      return res.status(403).json({ message: "Forbidden" });

    // fetch feedbacks, populate user (optional) and orderId (if you want)
    const feedbacks = await Feedback.find({})
      .sort({ createdAt: -1 })
      .populate({ path: "userId", select: "name" }) // optional: show user name when available
      .lean();

    // normalize response to front-end friendly shape
    const out = feedbacks.map((f) => ({
      id: f._id,
      userId: f.userId?._id ?? null,
      customerName: f.userId?.name ?? (f.guestName || "Guest"),
      orderId: f.orderId ? String(f.orderId) : f.orderNumber || "N/A",
      rating: f.rating,
      message: f.message,
      response: f.response || "",
      responseAt: f.responseAt || null,
      createdAt: f.createdAt || f.createdAt,
    }));

    return res.json(out);
  } catch (err) {
    console.error("GET /api/admin/feedback error:", err);
    return res.status(500).json({ message: "Failed to load feedbacks" });
  }
});

// --- POST /api/admin/feedback/:id/respond ---
// Admin posts a response to a feedback item.
app.post(
  "/api/admin/feedback/:id/respond",
  authMiddleware,
  async (req, res) => {
    try {
      if (!req.user || req.user.role !== "admin")
        return res.status(403).json({ message: "Forbidden" });

      const { id } = req.params;
      const { response = "" } = req.body || {};

      if (!id) return res.status(400).json({ message: "Missing feedback id" });

      const update = {
        response: String(response).trim(),
        responseAt: response ? new Date() : null,
      };

      const updated = await Feedback.findByIdAndUpdate(id, update, {
        new: true,
      }).lean();
      if (!updated)
        return res.status(404).json({ message: "Feedback not found" });

      return res.json({
        id: updated._id,
        response: updated.response || "",
        responseAt: updated.responseAt || null,
        message: "Response saved",
      });
    } catch (err) {
      console.error("POST /api/admin/feedback/:id/respond error:", err);
      return res.status(500).json({ message: "Failed to save response" });
    }
  }
);

// GET all menu items (admin)
app.get("/api/admin/menu", authMiddleware, async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin")
      return res.status(403).json({ message: "Forbidden" });

    const items = await MenuItem.find({}).sort({ createdAt: -1 }).lean();
    return res.json(items);
  } catch (err) {
    console.error("GET /api/admin/menu error:", err);
    return res.status(500).json({ message: "Failed to load menu items" });
  }
});

// POST create menu item (admin)
app.post("/api/admin/menu", authMiddleware, async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin")
      return res.status(403).json({ message: "Forbidden" });

    const {
      name,
      price,
      description = "",
      image = "",
      category,
    } = req.body || {};
    if (!name || typeof price === "undefined" || price === null) {
      return res
        .status(400)
        .json({ message: "Missing required fields: name and price" });
    }

    const item = await MenuItem.create({
      name: String(name).trim(),
      price: Number(price),
      description: String(description).trim(),
      image: String(image).trim(),
      // only set category if provided (model will apply default otherwise)
      ...(typeof category !== "undefined" && category !== null
        ? { category: String(category).trim() }
        : {}),
    });

    return res.status(201).json(item);
  } catch (err) {
    console.error("POST /api/admin/menu error:", err);
    return res.status(500).json({ message: "Failed to create menu item" });
  }
});

// PUT update menu item (admin)
app.put("/api/admin/menu/:id", authMiddleware, async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin")
      return res.status(403).json({ message: "Forbidden" });

    const { id } = req.params;
    const { name, price, description, image, category } = req.body || {};

    if (!id) return res.status(400).json({ message: "Missing item id" });

    const update = {};
    if (typeof name !== "undefined") update.name = String(name).trim();
    if (typeof price !== "undefined") update.price = Number(price);
    if (typeof description !== "undefined")
      update.description = String(description).trim();
    if (typeof image !== "undefined") update.image = String(image).trim();
    if (typeof category !== "undefined")
      update.category = String(category).trim();

    const updated = await MenuItem.findByIdAndUpdate(id, update, {
      new: true,
    }).lean();
    if (!updated)
      return res.status(404).json({ message: "Menu item not found" });

    return res.json(updated);
  } catch (err) {
    console.error("PUT /api/admin/menu/:id error:", err);
    return res.status(500).json({ message: "Failed to update menu item" });
  }
});

// DELETE menu item (admin)
app.delete("/api/admin/menu/:id", authMiddleware, async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin")
      return res.status(403).json({ message: "Forbidden" });

    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "Missing item id" });

    const removed = await MenuItem.findByIdAndDelete(id).lean();
    if (!removed)
      return res.status(404).json({ message: "Menu item not found" });

    return res.json({ id: removed._id, message: "Deleted" });
  } catch (err) {
    console.error("DELETE /api/admin/menu/:id error:", err);
    return res.status(500).json({ message: "Failed to delete menu item" });
  }
});

// ---------- GET /api/kitchen/orders (allow only chef or admin) ----------
app.get("/api/kitchen/orders", authMiddleware, async (req, res) => {
  try {
    const role = (req.user?.role || "").toLowerCase();
    if (!req.user || !["chef", "admin"].includes(role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const orders = await Order.find({}).sort({ placedAt: -1 }).lean();

    const out = orders.map((o) => ({
      id: o._id,
      items: (o.items || []).map((it) => ({
        menuItemId: it.menuItemId || null,
        name: it.name || (it.menuItem?.name ?? "Item"),
        qty: it.quantity || it.qty || 1,
      })),
      table: o.tableNumber || (o.meta && o.meta.tableNumber) || "",
      status: o.status || "placed",
      placedAt: o.placedAt || o.createdAt || null,
      subtotal: o.subtotal || 0,
      total: o.total || 0,
    }));

    return res.json(out);
  } catch (err) {
    console.error("GET /api/kitchen/orders error:", err);
    return res.status(500).json({ message: "Failed to load orders" });
  }
});

// ---------- PATCH /api/kitchen/orders/:id/status (allow only chef or admin) ----------
app.patch(
  "/api/kitchen/orders/:id/status",
  authMiddleware,
  async (req, res) => {
    try {
      const role = (req.user?.role || "").toLowerCase();
      if (!req.user || !["chef", "admin"].includes(role)) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const { id } = req.params;
      const { status } = req.body || {};
      if (!id) return res.status(400).json({ message: "Missing order id" });
      if (!status || typeof status !== "string")
        return res.status(400).json({ message: "Missing or invalid status" });

      const newStatus = String(status).trim();

      const updated = await Order.findByIdAndUpdate(
        id,
        { status: newStatus },
        { new: true }
      ).lean();
      if (!updated) return res.status(404).json({ message: "Order not found" });

      return res.json({
        id: updated._id,
        status: updated.status,
        message: "Status updated",
      });
    } catch (err) {
      console.error("PATCH /api/kitchen/orders/:id/status error:", err);
      return res.status(500).json({ message: "Failed to update status" });
    }
  }
);

/* ----------------
   Start server
   ---------------- */
// eslint-disable-next-line no-undef
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening at ${PORT}`));
dotenv.config({ path: "./src/backend/.env" }); // adjust path to where your .env actually lives
