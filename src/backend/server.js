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

const TZ_NAME = process.env.TZ_NAME || "Asia/Karachi";          // Olson timezone name
const TZ_OFFSET_HOURS = Number(process.env.TZ_OFFSET_HOURS || 5); // numeric offset fallback (if needed)

/**
 * Compute UTC Date that represents the start-of-day (00:00) in the target timezone.
 * daysAgo = 0 -> today, 1 -> yesterday, etc.
 */
function startOfDayInUTC(offsetHours = TZ_OFFSET_HOURS, daysAgo = 0) {
  const now = new Date();
  const offsetMs = offsetHours * 60 * 60 * 1000;
  // local time in target tz as Date object
  const localNow = new Date(now.getTime() + offsetMs);
  // local midnight
  const localMidnight = new Date(localNow.getFullYear(), localNow.getMonth(), localNow.getDate() - daysAgo);
  // convert local midnight back to UTC time
  const startUtc = new Date(localMidnight.getTime() - offsetMs);
  return startUtc;
}

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

    const token = jwt.sign({ userId: user._id, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ id: user._id, name: user.name, token, role: user.role });
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
// POST /api/orders
app.post("/api/orders", softAuth, async (req, res) => {
  try {
    const {
      items = [],
      subtotal,
      additionalCharges = 0,
      total,
      specialInstructions = "",
      meta = {},
      tableNumber: rawTableNumber,
      placedAt: rawPlacedAt
    } = req.body || {};

    // Basic validation
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Order must contain at least one item." });
    }
    if (typeof subtotal !== "number" || typeof total !== "number") {
      return res.status(400).json({ message: "Subtotal and total must be numbers." });
    }

    // Table number is required (either as top-level property or inside meta.tableNumber)
    const tableNumberCandidate =
      (typeof rawTableNumber !== "undefined" && rawTableNumber !== null ? String(rawTableNumber) : "")
      || (meta && meta.tableNumber ? String(meta.tableNumber) : "");

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

// GET /api/admin/stats
// Protected: admin only
app.get("/api/admin/stats", authMiddleware, async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    // compute UTC boundaries that correspond to midnight in your timezone
    const startOfTodayUTC = startOfDayInUTC(TZ_OFFSET_HOURS, 0);
    const startOfWeekUTC = startOfDayInUTC(TZ_OFFSET_HOURS, 6); // last 7 days including today

    // total orders today (placedAt >= local-midnight)
    const totalOrdersToday = await Order.countDocuments({
      placedAt: { $gte: startOfTodayUTC },
    });

    // revenue today (sum total for orders placed today)
    const revenueTodayAgg = await Order.aggregate([
      { $match: { placedAt: { $gte: startOfTodayUTC } } },
      { $group: { _id: null, sum: { $sum: "$total" } } },
    ]);
    const revenueToday = (revenueTodayAgg[0] && revenueTodayAgg[0].sum) || 0;

    // weekly revenue (last 7 days from local midnight)
    const revenueWeekAgg = await Order.aggregate([
      { $match: { placedAt: { $gte: startOfWeekUTC } } },
      { $group: { _id: null, sum: { $sum: "$total" } } },
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

// --- ADD TO server.js ---
// GET /api/admin/weekly-revenue
app.get("/api/admin/weekly-revenue", authMiddleware, async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" });

    const startOfTodayUTC = startOfDayInUTC(TZ_OFFSET_HOURS, 0);
    const startOfWeekUTC = startOfDayInUTC(TZ_OFFSET_HOURS, 6);

    const agg = await Order.aggregate([
      { $match: { placedAt: { $gte: startOfWeekUTC } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$placedAt", timezone: TZ_NAME } },
          revenue: { $sum: "$total" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const result = agg.map(a => ({ date: a._id, revenue: a.revenue || 0, orders: a.orders || 0 }));
    return res.json(result);
  } catch (err) {
    console.error("GET /api/admin/weekly-revenue error:", err);
    return res.status(500).json({ message: "Failed to compute weekly revenue" });
  }
});

// GET /api/admin/peak-hours
app.get("/api/admin/peak-hours", authMiddleware, async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" });

    const startOfWeekUTC = startOfDayInUTC(TZ_OFFSET_HOURS, 6);

    const agg = await Order.aggregate([
      { $match: { placedAt: { $gte: startOfWeekUTC } } },
      {
        $group: {
          _id: { $dateToString: { format: "%H", date: "$placedAt", timezone: TZ_NAME } }, // hour 00-23 in TZ
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const result = agg.map(a => ({ hour: Number(a._id), orders: a.orders || 0 }));
    return res.json(result);
  } catch (err) {
    console.error("GET /api/admin/peak-hours error:", err);
    return res.status(500).json({ message: "Failed to compute peak hours" });
  }
});

// GET /api/admin/top-selling
app.get("/api/admin/top-selling", authMiddleware, async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" });

    // Unwind items and group by item name (fallback to menuItemId if name missing)
    const agg = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: { $ifNull: ["$items.name", "$items.menuItemId"] },
          sales: { $sum: { $ifNull: ["$items.quantity", 1] } },
          revenue: {
            $sum: {
              $multiply: [
                { $ifNull: ["$items.quantity", 1] },
                { $ifNull: ["$items.price", 0] }
              ]
            }
          }
        }
      },
      { $sort: { sales: -1 } },
      { $limit: 10 }
    ]);

    const result = agg.map(a => ({ name: String(a._id), sales: a.sales || 0, revenue: a.revenue || 0 }));
    return res.json(result);
  } catch (err) {
    console.error("GET /api/admin/top-selling error:", err);
    return res.status(500).json({ message: "Failed to compute top selling items" });
  }
});

// --- GET /api/admin/feedback ---
// Returns list of feedbacks (most recent first). Admin-only.
app.get("/api/admin/feedback", authMiddleware, async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" });

    // fetch feedbacks, populate user (optional) and orderId (if you want)
    const feedbacks = await Feedback.find({})
      .sort({ createdAt: -1 })
      .populate({ path: "userId", select: "name" }) // optional: show user name when available
      .lean();

    // normalize response to front-end friendly shape
    const out = feedbacks.map(f => ({
      id: f._id,
      userId: f.userId?._id ?? null,
      customerName: f.userId?.name ?? (f.guestName || "Guest"),
      orderId: f.orderId ? String(f.orderId) : (f.orderNumber || "N/A"),
      rating: f.rating,
      message: f.message,
      response: f.response || "",
      responseAt: f.responseAt || null,
      createdAt: f.createdAt || f.createdAt
    }));

    return res.json(out);
  } catch (err) {
    console.error("GET /api/admin/feedback error:", err);
    return res.status(500).json({ message: "Failed to load feedbacks" });
  }
});

// --- POST /api/admin/feedback/:id/respond ---
// Admin posts a response to a feedback item.
app.post("/api/admin/feedback/:id/respond", authMiddleware, async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" });

    const { id } = req.params;
    const { response = "" } = req.body || {};

    if (!id) return res.status(400).json({ message: "Missing feedback id" });

    const update = {
      response: String(response).trim(),
      responseAt: response ? new Date() : null
    };

    const updated = await Feedback.findByIdAndUpdate(id, update, { new: true }).lean();
    if (!updated) return res.status(404).json({ message: "Feedback not found" });

    return res.json({
      id: updated._id,
      response: updated.response || "",
      responseAt: updated.responseAt || null,
      message: "Response saved"
    });
  } catch (err) {
    console.error("POST /api/admin/feedback/:id/respond error:", err);
    return res.status(500).json({ message: "Failed to save response" });
  }
});

// GET all menu items (admin)
app.get("/api/admin/menu", authMiddleware, async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" });

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
    if (!req.user || req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" });

    const { name, price, description = "", image = "" } = req.body || {};
    if (!name || typeof price === "undefined" || price === null) {
      return res.status(400).json({ message: "Missing required fields: name and price" });
    }

    const item = await MenuItem.create({
      name: String(name).trim(),
      price: Number(price),
      description: String(description).trim(),
      image: String(image).trim(),
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
    if (!req.user || req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" });

    const { id } = req.params;
    const { name, price, description, image } = req.body || {};

    if (!id) return res.status(400).json({ message: "Missing item id" });

    const update = {};
    if (typeof name !== "undefined") update.name = String(name).trim();
    if (typeof price !== "undefined") update.price = Number(price);
    if (typeof description !== "undefined") update.description = String(description).trim();
    if (typeof image !== "undefined") update.image = String(image).trim();

    const updated = await MenuItem.findByIdAndUpdate(id, update, { new: true }).lean();
    if (!updated) return res.status(404).json({ message: "Menu item not found" });

    return res.json(updated);
  } catch (err) {
    console.error("PUT /api/admin/menu/:id error:", err);
    return res.status(500).json({ message: "Failed to update menu item" });
  }
});

// DELETE menu item (admin)
app.delete("/api/admin/menu/:id", authMiddleware, async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" });

    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "Missing item id" });

    const removed = await MenuItem.findByIdAndDelete(id).lean();
    if (!removed) return res.status(404).json({ message: "Menu item not found" });

    return res.json({ id: removed._id, message: "Deleted" });
  } catch (err) {
    console.error("DELETE /api/admin/menu/:id error:", err);
    return res.status(500).json({ message: "Failed to delete menu item" });
  }
});

/* ----------------
   Start server
   ---------------- */
// eslint-disable-next-line no-undef
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening at ${PORT}`));