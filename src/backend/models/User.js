// src/backend/models/User.js
import mongoose from "mongoose";
import bcrypt from "bcrypt";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["user", "admin", "chef"], default: "user" },
}, { timestamps: true });

// instance method to compare password
UserSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

// helper to generate a hash
UserSchema.statics.hashPassword = (plain) => bcrypt.hash(plain, 10);

// create indexes explicitly (helps in some environments)
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ name: 1 }, { unique: true });

const User = mongoose.model("User", UserSchema);
export default User;
