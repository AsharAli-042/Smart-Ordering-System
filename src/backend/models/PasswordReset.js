// src/backend/models/PasswordReset.js
import mongoose from "mongoose";

const PasswordResetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  token: { type: String, required: true, index: true },
  expiresAt: { type: Date, required: true, index: true },
}, { timestamps: true });

const PasswordReset = mongoose.model("PasswordReset", PasswordResetSchema);
export default PasswordReset;
