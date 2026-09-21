import { Router } from "express";
import mongoose from "mongoose";
import Student from "../models/Student.js";
import { verifyToken } from "../middleware/auth.js";

const router = Router();
const isMongoConnected = () => mongoose.connection.readyState === 1;

let memStudents = [
  { id: "s1", name: "Aarav Sharma", email: "aarav@school.edu", roll_no: "21CS001", department: "Computer Science", semester: 6, risk_score: 82, attendance_pct: 68, cgpa: 6.4, status: "High Risk" },
  { id: "s2", name: "Ananya Iyer", email: "ananya@school.edu", roll_no: "21CS002", department: "Computer Science", semester: 6, risk_score: 45, attendance_pct: 82, cgpa: 7.8, status: "Medium Risk" },
  { id: "s3", name: "Arjun Patel", email: "arjun@school.edu", roll_no: "21CS003", department: "Computer Science", semester: 6, risk_score: 22, attendance_pct: 91, cgpa: 8.9, status: "Low Risk" },
];

router.get("/", verifyToken, async (req, res) => {
  try {
    if (isMongoConnected()) {
      const filter = {};
      if (req.user.role === "mentor") filter.mentor_id = req.user.id;
      const students = await Student.find(filter).sort({ risk_score: -1 }).maxTimeMS(2500);
      if (students && students.length > 0) return res.json(students);
    }
  } catch (err) {
    console.warn("MongoDB student fetch notice:", err.message);
  }
  res.json(memStudents);
});

router.post("/", verifyToken, async (req, res) => {
  try {
    if (isMongoConnected()) {
      const student = await Student.create(req.body);
      return res.status(201).json(student);
    }
  } catch (err) {
    console.warn("MongoDB create student notice:", err.message);
  }
  const fallbackStudent = { id: "s_" + Date.now(), ...req.body };
  memStudents.unshift(fallbackStudent);
  res.status(201).json(fallbackStudent);
});

router.post("/bulk", verifyToken, async (req, res) => {
  try {
    const { students } = req.body;
    if (!Array.isArray(students)) return res.status(400).json({ error: "students must be an array" });
    if (isMongoConnected()) {
      let count = 0;
      for (const s of students) {
        await Student.findOneAndUpdate(
          { email: s.email || s.name },
          { $set: s },
          { upsert: true, new: true }
        );
        count++;
      }
      return res.json({ count });
    }
    students.forEach((s) => {
      const idx = memStudents.findIndex(m => m.email === (s.email || s.name));
      if (idx >= 0) memStudents[idx] = { ...memStudents[idx], ...s };
      else memStudents.push({ id: "s_" + Date.now(), ...s });
    });
    res.json({ count: students.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
