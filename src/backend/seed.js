import mongoose from "mongoose";     // FULL PATH + .js extension
import MenuItem from "./models/MenuItem.js";

// 1. MongoDB URI
const MONGO_URI = "mongodb://127.0.0.1:27017/smart-restaurant";

const seedMenu = [
  {
    name: "Margherita Pizza",
    price: 899,
    description: "Classic cheese pizza with fresh basil",
    image: "https://example.com/pizza1.jpg",
  },
  {
    name: "Zinger Burger",
    price: 499,
    description: "Crispy fried chicken burger",
    image: "https://example.com/burger.jpg",
  }
];

async function seedDatabase() {
  try {
    console.log("⏳ Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);

    console.log("✅ Connected to database!");

    // ✅ 4. Insert new data
    for(let i =0; i< seedMenu.length ; i++){
      await MenuItem.create(seedMenu[i]);
    }

    console.log("✅ Seed data inserted successfully!");

  } catch (err) {
    console.error("❌ Seeding failed:", err);
  } finally {
    mongoose.connection.close();
    console.log("🔌 Database connection closed.");
  }
}

// ✅ Execute seeding
seedDatabase();
