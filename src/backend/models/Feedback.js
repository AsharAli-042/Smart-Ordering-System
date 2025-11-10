// src/backend/models/Feedback.js
import mongoose from "mongoose";

const FeedbackSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false }, // optional for guests
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: false },
  rating: { type: Number, min: 0, max: 5 },
  message: { type: String, default: "" },
  createdAt: { type: Date, default: () => new Date() },
}, { timestamps: true });

const Feedback = mongoose.model("Feedback", FeedbackSchema);
export default Feedback;
