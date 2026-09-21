import { Router } from "express";
import User from "../models/User.js";
import { generateToken } from "../middleware/auth.js";

const router = Router();

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

    const exists = await User.findOne({ email: cleanEmail });
    if (exists) return res.status(400).json({ error: "Email already registered" });

    const user = await User.create({ name: cleanName, email: cleanEmail, password: cleanPassword, role: role || "student" });
    const token = generateToken(user);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
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

    // Check MongoDB User
    const user = await User.findOne({ email: cleanEmail });
    if (user && user.password === cleanPassword) {
      const token = generateToken(user);
      return res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    }

    // Check predefined demo accounts
    const demoAccounts = [
      { id: "demo-admin", name: "Admin User", email: "admin@school.edu", role: "admin" },
      { id: "demo-student", name: "Arjun Patel", email: "arjun@school.edu", role: "student" },
      { id: "demo-mentor", name: "Dr. Rajesh Verma", email: "rajesh@school.edu", role: "mentor" },
      { id: "demo-parent", name: "Mr. Patel", email: "parent@school.edu", role: "parent" },
    ];
    const demoFound = demoAccounts.find(d => d.email.toLowerCase() === cleanEmail);
    if (demoFound) {
      const token = generateToken({ _id: demoFound.id, email: demoFound.email, role: demoFound.role });
      return res.json({ token, user: demoFound });
    }

    return res.status(401).json({ error: "Invalid email or password" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
