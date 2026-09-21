import { Router } from "express";
import Timetable from "../models/Timetable.js";
import { verifyToken } from "../middleware/auth.js";

const router = Router();

router.get("/", verifyToken, async (req, res) => {
  try {
    const entries = await Timetable.find().sort({ createdAt: -1 });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/bulk", verifyToken, async (req, res) => {
  try {
    const { entries } = req.body;
    if (!Array.isArray(entries)) return res.status(400).json({ error: "entries must be an array" });
    const created = await Timetable.insertMany(entries);
    res.json({ count: created.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
