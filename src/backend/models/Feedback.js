// src/backend/models/Feedback.js
import mongoose from "mongoose";

const FeedbackSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false }, // optional for guests
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  rating: { type: Number, min: 0, max: 5, required: true },
  message: { type: String, default: "" },
  response: { type: String, default: "" }, // admin response
  createdAt: { type: Date, default: () => new Date() },
}, { timestamps: true });

// indexes for common queries
FeedbackSchema.index({ orderId: 1 });
FeedbackSchema.index({ userId: 1, orderId: 1 }, { unique: true, sparse: true }); // prevent dup by same user

const Feedback = mongoose.model("Feedback", FeedbackSchema);
export default Feedback;
