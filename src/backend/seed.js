import mongoose from "mongoose";     // FULL PATH + .js extension
import MenuItem from "./models/MenuItem.js";

// 1. MongoDB URI
const MONGO_URI = "mongodb://127.0.0.1:27017/smart-restaurant";

const seedMenu = [
  {
    "name": "Margherita Pizza",
    "price": 899,
    "description": "Classic cheese pizza with fresh basil",
    "image": "https://images.unsplash.com/photo-1716237387584-09741d76502b?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=687",
    "category": "Other" // Could be "Chicken Mains" if it had chicken, or a specific "Pizza" category, but "Other" works for now.
  },
  {
    "name": "Zinger Burger",
    "price": 499,
    "description": "Crispy fried chicken burger",
    "image": "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=60",
    "category": "Chicken Mains" // Could be "Chicken Mains" if it had chicken, or a specific "Pizza" category, but "Other" works for now.
  },
  {
    "name": "Pepperoni Pizza",
    "price": 999,
    "description": "Classic pizza topped with spicy pepperoni slices",
    "image": "https://images.unsplash.com/photo-1564128442383-9201fcc740eb?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=931",
    "category": "Other" // Could be "Chicken Mains" if it had chicken, or a specific "Pizza" category, but "Other" works for now.
  },
  {
    "name": "Chicken Tikka Boti",
    "price": 650,
    "description": "Spicy, boneless chicken pieces marinated and grilled",
    "image": "https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=387",
    "category": "Chicken Mains"
  },
  {
    "name": "Fettuccine Alfredo",
    "price": 750,
    "description": "Creamy pasta with Parmesan cheese and garlic sauce",
    "image": "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=870",
    "category": "Vegetarian" // Assuming no meat is specified in the description
  },
  {
    "name": "Vegetable Spring Rolls",
    "price": 350,
    "description": "Crispy rolls filled with shredded vegetables, served with dip",
    "image": "https://images.unsplash.com/photo-1679310290259-78d9eaa32700?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=435",
    "category": "Starters"
  },
  {
    "name": "Grilled Salmon",
    "price": 1299,
    "description": "Pan-seared salmon fillet with lemon-butter sauce and asparagus",
    "image": "https://images.unsplash.com/photo-1676300185165-3f543c1fcb72?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=870",
    "category": "Other" // Seafood main
  },
  {
    "name": "Beef Lasagna",
    "price": 850,
    "description": "Layers of pasta, seasoned ground beef, and rich béchamel sauce",
    "image": "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=435",
    "category": "Beef Mains"
  },
  {
    "name": "Caesar Salad",
    "price": 450,
    "description": "Romaine lettuce, croutons, Parmesan cheese, and Caesar dressing",
    "image": "https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?auto=format&fit=crop&w=800&q=60",
    "category": "Salads"
  },
  {
    "name": "Chocolate Lava Cake",
    "price": 550,
    "description": "Warm chocolate cake with a gooey, molten center",
    "image": "https://images.unsplash.com/photo-1673551490812-eaee2e9bf0ef?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=870",
    "category": "Desserts"
  },
  {
    "name": "French Fries",
    "price": 250,
    "description": "Crispy, golden potato fries",
    "image": "https://images.unsplash.com/photo-1518013431117-eb1465fa5752?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=870",
    "category": "Sides"
  },
  {
    "name": "Club Sandwich",
    "price": 599,
    "description": "Triple-decker sandwich with chicken, egg, cheese, and veggies",
    "image": "https://images.unsplash.com/photo-1676300184084-de35d56a9a70?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=870",
    "category": "Other" // Main sandwich
  },
  {
    "name": "Chicken Biryani",
    "price": 699,
    "description": "Aromatic basmati rice cooked with seasoned chicken and spices",
    "image": "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=888",
    "category": "Chicken Mains"
  },
  {
    "name": "Red Velvet Cupcake",
    "price": 300,
    "description": "Moist red velvet cake with cream cheese frosting",
    "image": "https://plus.unsplash.com/premium_photo-1713920190025-79fb720f3ee1?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=869",
    "category": "Desserts"
  },
  {
    "name": "Mango Smoothie",
    "price": 400,
    "description": "Refreshing blended drink with fresh mango and yogurt",
    "image": "https://images.unsplash.com/photo-1653542773369-51cce8d08250?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=386",
    "category": "Beverages"
  },
  {
    "name": "Lemon Mint Cooler",
    "price": 350,
    "description": "Chilled, zesty drink made with fresh lemon and mint",
    "image": "https://images.unsplash.com/photo-1656830643355-a1727daa9427?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=436",
    "category": "Beverages"
  },
  {
    "name": "Pasta Alfredo",
    "price": 820,
    "description": "Creamy Alfredo sauce with parmesan and grilled chicken.",
    "image": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1232",
    "category": "Chicken Mains"
  },
  {
    "name": "Taco Platter",
    "price": 799,
    "description": "Three soft shell tacos with your choice of filling and toppings",
    "image": "https://plus.unsplash.com/premium_photo-1664476631037-87a2714dd04e?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=580",
    "category": "Other" // Can be categorized more specifically, but "Other" works for general mains.
  },
  {
    "name": "Hummus with Pita",
    "price": 499,
    "description": "Smooth, creamy chickpea dip served with warm pita bread",
    "image": "https://plus.unsplash.com/premium_photo-1663853052222-f665ed6c2b3a?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=387",
    "category": "Starters"
  },
  {
    "name": "Brownie Sundae",
    "price": 650,
    "description": "Warm chocolate brownie topped with vanilla ice cream and hot fudge",
    "image": "https://images.unsplash.com/photo-1695886855588-47117bca2fe6?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=387",
    "category": "Desserts"
  },
  {
    "name": "Espresso",
    "price": 200,
    "description": "Strong, concentrated coffee shot",
    "image": "https://plus.unsplash.com/premium_photo-1669687924558-386bff1a0469?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=388",
    "category": "Beverages"
  },
  {
    "name": "Sushi Combo (8 pcs)",
    "price": 1199,
    "description": "A selection of popular sushi rolls and nigiri",
    "image": "https://plus.unsplash.com/premium_photo-1668146927669-f2edf6e86f6f?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=870",
    "category": "Other" // Sushi is typically a main course, but "Other" works if you don't have a "Seafood Mains" category.
  }
];

async function seedDatabase() {
  try {
    console.log("⏳ Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);

    console.log("✅ Connected to database!");

    // OPTIONAL: Clear existing data before inserting, useful for a clean seed operation
    // console.log("🧹 Clearing existing menu data...");
    // await MenuItem.deleteMany({}); 

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