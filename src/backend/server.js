import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import fs from "fs";

const app = express();
app.use(cors());
app.use(bodyParser.json());

const USERS_FILE = "./users.json";

// Ensure file exists
if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([]));
}

// Signup Route
app.post("/signup", (req, res) => {
    const { name, password } = req.body;
    if (!name || !password) {
        return res.status(400).json({ message: "Name and password are required" });
    }

    const users = JSON.parse(fs.readFileSync(USERS_FILE)); 

    // Check if user already exists
    if (users.find((u) => u.name === name)) {
        return res.status(400).json({ message: "User already exists" });
    }

    // Save user (no hashing for simplicity)
    users.push({ name, password });
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));

    res.json({ message: "Signup successful" });
});

app.listen(5000, () => console.log("Server running on http://localhost:5000"));

// ------------------------------------------------------------------
// Login Route
app.post("/login", (req, res) => {
    const { name, password } = req.body;
  
    if (!name || !password) {
      return res.status(400).json({ message: "Name and password are required" });
    }
  
    const users = JSON.parse(fs.readFileSync(USERS_FILE));
  
    // Find the user
    const user = users.find((u) => u.name === name && u.password === password);
  
    if (!user) {
      return res.status(401).json({ message: "Invalid name or password" });
    }
  
    // Successful login
    res.json({ message: "Login successful", user });
  });

  // ---------------------------------------------------------
  // Menu Route (GET all items)
  app.get("/menu", (req, res) => {
    const menuItems = JSON.parse(fs.readFileSync("./menu.json"));
    res.json(menuItems);
  });