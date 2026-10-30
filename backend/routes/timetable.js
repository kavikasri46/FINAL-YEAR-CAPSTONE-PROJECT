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
      return res.json(entries);
    }
  } catch (err) {
    console.warn("MongoDB timetable notice:", err.message);
  }
  res.json(memTimetable);
});

router.post("/", verifyToken, async (req, res) => {
  try {
    if (isMongoConnected()) {
      const entry = await Timetable.create(req.body);
      return res.status(201).json(entry);
    }
  } catch (err) {
    console.warn("MongoDB create timetable notice:", err.message);
  }
  const fallback = { _id: "t_" + Date.now(), ...req.body };
  memTimetable.unshift(fallback);
  res.status(201).json(fallback);
});

router.put("/:id", verifyToken, async (req, res) => {
  try {
    if (isMongoConnected()) {
      const updated = await Timetable.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (updated) return res.json(updated);
    }
  } catch (err) {
    console.warn("MongoDB update timetable notice:", err.message);
  }
  const idx = memTimetable.findIndex(t => t._id === req.params.id);
  if (idx >= 0) {
    memTimetable[idx] = { ...memTimetable[idx], ...req.body };
    return res.json(memTimetable[idx]);
  }
  res.json({ _id: req.params.id, ...req.body });
});

router.delete("/:id", verifyToken, async (req, res) => {
  try {
    if (isMongoConnected()) {
      await Timetable.findByIdAndDelete(req.params.id);
      return res.json({ message: "Timetable entry deleted from MongoDB" });
    }
  } catch (err) {
    console.warn("MongoDB delete timetable notice:", err.message);
  }
  memTimetable = memTimetable.filter(t => t._id !== req.params.id);
  res.json({ message: "Timetable entry deleted" });
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
