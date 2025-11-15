// src/backend/seed_admin.js
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "./models/User.js"; // full path + .js

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/smart-restaurant";

const ADMIN_NAME = "ashar_admin";        // change as required
const ADMIN_PASSWORD = "123"; // change to a secure password before production

async function run() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    const existing = await User.findOne({ name: ADMIN_NAME });
    if (existing) {
      console.log(`Admin user "${ADMIN_NAME}" already exists (id: ${existing._id}).`);
    } else {
      const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
      const admin = await User.create({
        name: ADMIN_NAME,
        passwordHash,
        role: "admin",
      });
      console.log("Admin user created:", { id: admin._id.toString(), name: admin.name });
      console.log(`Login with name: "${ADMIN_NAME}" and password: "${ADMIN_PASSWORD}"`);
    }
  } catch (err) {
    console.error("Failed to seed admin:", err);
  } finally {
    await mongoose.connection.close();
    console.log("Mongo connection closed.");
  }
}

run();
