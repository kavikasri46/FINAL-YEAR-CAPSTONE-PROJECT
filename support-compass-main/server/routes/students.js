import { Router } from "express";
import Student from "../models/Student.js";
import { verifyToken } from "../middleware/auth.js";

const router = Router();

router.get("/", verifyToken, async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === "mentor") filter.mentor_id = req.user.id;
    const students = await Student.find(filter).sort({ risk_score: -1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", verifyToken, async (req, res) => {
  try {
    const student = await Student.create(req.body);
    res.status(201).json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/bulk", verifyToken, async (req, res) => {
  try {
    const { students } = req.body;
    if (!Array.isArray(students)) return res.status(400).json({ error: "students must be an array" });
    let count = 0;
    for (const s of students) {
      await Student.findOneAndUpdate(
        { email: s.email || s.name },
        { $set: s },
        { upsert: true, new: true }
      );
      count++;
    }
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
