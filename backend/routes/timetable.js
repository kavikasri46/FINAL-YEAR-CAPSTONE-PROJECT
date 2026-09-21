import { Router } from "express";
import mongoose from "mongoose";
import Timetable from "../models/Timetable.js";
import { verifyToken } from "../middleware/auth.js";

const router = Router();
const isMongoConnected = () => mongoose.connection.readyState === 1;

let memTimetable = [
  { _id: "t1", day: "Monday", time: "09:00 - 10:00 AM", subject: "Compiler Design", room: "CS-301", faculty: "Dr. K. Raman" },
  { _id: "t2", day: "Monday", time: "10:00 - 11:00 AM", subject: "Cloud Computing", room: "CS-302", faculty: "Prof. S. Devi" },
  { _id: "t3", day: "Tuesday", time: "09:00 - 10:00 AM", subject: "Machine Learning", room: "CS-301", faculty: "Dr. R. Verma" },
];

router.get("/", verifyToken, async (req, res) => {
  try {
    if (isMongoConnected()) {
      const entries = await Timetable.find().sort({ createdAt: -1 }).maxTimeMS(2500);
      if (entries && entries.length > 0) return res.json(entries);
    }
  } catch (err) {
    console.warn("MongoDB timetable notice:", err.message);
  }
  res.json(memTimetable);
});

router.post("/bulk", verifyToken, async (req, res) => {
  try {
    const { entries } = req.body;
    if (!Array.isArray(entries)) return res.status(400).json({ error: "entries must be an array" });
    if (isMongoConnected()) {
      const created = await Timetable.insertMany(entries);
      return res.json({ count: created.length });
    }
    entries.forEach(e => memTimetable.unshift({ _id: "t_" + Date.now(), ...e }));
    res.json({ count: entries.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
