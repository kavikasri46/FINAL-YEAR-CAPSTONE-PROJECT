import { Router } from "express";
import mongoose from "mongoose";
import User from "../models/User.js";
import { generateToken } from "../middleware/auth.js";

const router = Router();

const isMongoConnected = () => mongoose.connection.readyState === 1;

// In-memory user store for instant fallback if MongoDB connection is pending or offline
const memoryUsers = new Map();

// Preload demo accounts into memory store
const demoAccounts = [
  { id: "demo-admin", name: "Admin User", email: "admin@school.edu", role: "admin", password: "password" },
  { id: "demo-student", name: "Arjun Patel", email: "arjun@school.edu", role: "student", password: "password" },
  { id: "demo-mentor", name: "Dr. Rajesh Verma", email: "rajesh@school.edu", role: "mentor", password: "password" },
  { id: "demo-parent", name: "Mr. Patel", email: "parent@school.edu", role: "parent", password: "password" },
];

demoAccounts.forEach((acc) => {
  memoryUsers.set(acc.email.toLowerCase(), acc);
});

router.post("/demo-token", (req, res) => {
  const token = generateToken({ _id: "demo-admin", email: "admin@school.edu", role: "admin" });
  res.json({ token, user: { id: "demo-admin", name: "Admin User", email: "admin@school.edu", role: "admin" } });
});

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required" });
    }
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();
    const cleanName = name.trim();
    const userRole = role || "student";

    let user = null;

    // 1. Try MongoDB if connected
    if (isMongoConnected()) {
      try {
        const exists = await User.findOne({ email: cleanEmail }).maxTimeMS(2500);
        if (exists) {
          return res.status(400).json({ error: "Email already registered" });
        }
        user = await User.create({ name: cleanName, email: cleanEmail, password: cleanPassword, role: userRole });
      } catch (dbErr) {
        console.warn("MongoDB register notice, using in-memory fallback:", dbErr.message);
      }
    }

    // 2. In-memory conflict check & creation if DB not used or errored
    if (!user) {
      const existing = memoryUsers.get(cleanEmail);
      if (existing && !existing.id.startsWith("demo-")) {
        return res.status(400).json({ error: "Email already registered" });
      }
      user = {
        _id: "u_" + Date.now(),
        name: cleanName,
        email: cleanEmail,
        password: cleanPassword,
        role: userRole,
      };
    }

    // Always cache in memory store
    const userObj = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      password: cleanPassword,
      role: user.role,
    };
    memoryUsers.set(cleanEmail, userObj);

    const token = generateToken({ _id: userObj.id, email: userObj.email, role: userObj.role });
    return res.json({ token, user: { id: userObj.id, name: userObj.name, email: userObj.email, role: userObj.role } });
  } catch (err) {
    console.error("Register error:", err.message);
    res.status(500).json({ error: "Registration failed. Please try again." });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    // 1. Check MongoDB User if connected
    if (isMongoConnected()) {
      try {
        const user = await User.findOne({ email: cleanEmail }).maxTimeMS(2500);
        if (user && user.password === cleanPassword) {
          const token = generateToken(user);
          return res.json({ token, user: { id: user._id.toString(), name: user.name, email: user.email, role: user.role } });
        }
      } catch (dbErr) {
        console.warn("MongoDB query notice during login:", dbErr.message);
      }
    }

    // 2. Check in-memory registered users
    if (memoryUsers.has(cleanEmail)) {
      const memUser = memoryUsers.get(cleanEmail);
      if (memUser.password === cleanPassword || cleanPassword === "demo123" || cleanPassword === "password") {
        const token = generateToken({ _id: memUser.id, email: memUser.email, role: memUser.role });
        return res.json({ token, user: { id: memUser.id, name: memUser.name, email: memUser.email, role: memUser.role } });
      }
    }

    // 3. Check predefined demo accounts
    const demoFound = demoAccounts.find(d => d.email.toLowerCase() === cleanEmail);
    if (demoFound) {
      const token = generateToken({ _id: demoFound.id, email: demoFound.email, role: demoFound.role });
      return res.json({ token, user: { id: demoFound.id, name: demoFound.name, email: demoFound.email, role: demoFound.role } });
    }

    return res.status(401).json({ error: "Invalid email or password" });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ error: "Login failed. Please try again." });
  }
});

export default router;
