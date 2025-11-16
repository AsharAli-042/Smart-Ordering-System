// src/backend/models/Feedback.js
import mongoose from "mongoose";

const FeedbackSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false }, // optional for guests
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: false },
    rating: { type: Number, min: 0, max: 5 },
    message: { type: String, default: "" },
    // Admin response
    response: { type: String, default: "" },
    responseAt: { type: Date, required: false },
    createdAt: { type: Date, default: () => new Date() },
  },
  { timestamps: true }
);

// optional: add indexes if needed
FeedbackSchema.index({ userId: 1 });
const Feedback = mongoose.model("Feedback", FeedbackSchema);
export default Feedback;
