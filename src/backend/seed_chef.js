// src/backend/seed_chef.js
// type: module
// Run: node src/backend/seed_chef.js

import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import User from "./models/User.js"; // <-- exact path you specified

dotenv.config();

const MONGO = process.env.MONGODB_URI || "mongodb://localhost:27017/smart-restaurant";

async function createChef({ name = "chef", password = "ChefPass123!" } = {}) {
  await mongoose.connect(MONGO);
  console.log("Connected to MongoDB:", MONGO);

  try {
    // check if a 'chef' already exists (this uses the collection query so it doesn't validate against schema enums)
    const existing = await User.collection.findOne({ role: "chef" });
    if (existing) {
      console.log(`Found existing chef user -> name: "${existing.name}" id: ${existing._id}`);
      return existing;
    }

    // hash password
    const saltRounds = 10;
    const hashed = await bcrypt.hash(password, saltRounds);

    // decide which password field to write to, based on your schema paths
    const schemaPaths = User.schema && User.schema.paths ? Object.keys(User.schema.paths) : [];
    let passwordField = "passwordHash"; // default fallback

    if (schemaPaths.includes("passwordHash")) passwordField = "passwordHash";
    else if (schemaPaths.includes("password")) passwordField = "password";
    else if (schemaPaths.includes("hash")) passwordField = "hash";
    // otherwise keep "passwordHash" (will just create that field in the doc)

    // If schema requires email or other required fields, attempt to provide them
    const doc = {
      name,
      role: "chef",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    doc[passwordField] = hashed;

    if (schemaPaths.includes("email")) {
      // create a unique but harmless email
      doc.email = `chef+seed.${Date.now()}@example.com`;
    }

    // Insert raw into the collection to avoid Mongoose validation (useful if enum doesn't include "chef" yet)
    const result = await User.collection.insertOne(doc);
    if (!result?.acknowledged) throw new Error("Insert not acknowledged");

    const created = await User.collection.findOne({ _id: result.insertedId });
    console.log(`Created chef user -> name: "${name}", password: "${password}", id: ${result.insertedId}`);
    if (doc.email) console.log(`Email used: ${doc.email}`);
    return created;
  } catch (err) {
    console.error("Seeding error:", err);
    throw err;
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

(async () => {
  try {
    await createChef();
    console.log("Seeding complete.");
    process.exit(0);
  } catch (err) {
    console.error("Seed failed:", err);
    process.exit(1);
  }
})();
