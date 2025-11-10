// backend/models/User.js
import { Schema, model } from "mongoose";
import { compare, hash } from "bcrypt";

const UserSchema = new Schema({
  name: { type: String, required: true, unique: true }, // user logs in with name+password
  passwordHash: { type: String, required: true },
}, { timestamps: true });

// instance method to compare password
UserSchema.methods.comparePassword = function (plain) {
  return compare(plain, this.passwordHash);
};

UserSchema.statics.hashPassword = (plain) => hash(plain, 10);

const User = model("User", UserSchema);
export default User;