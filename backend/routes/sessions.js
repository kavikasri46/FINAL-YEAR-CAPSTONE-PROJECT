import { Router } from "express";
import mongoose from "mongoose";
import Session from "../models/Session.js";
import { verifyToken } from "../middleware/auth.js";

const router = Router();

// Fallback in-memory store for sessions if MongoDB is offline or empty
let inMemorySessions = [
  {
    _id: "s101",
    title: "Mathematics & Calculus Revision Session",
    description: "Deep dive into Differential Calculus, Integration concepts, and practice problems for upcoming midterms.",
    date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    time: "10:00 AM",
    youtubeUrl: "https://www.youtube.com/watch?v=WSpt44EZG1g",
    type: "mentor-student",
    status: "scheduled",
    createdBy: "u1",
    createdByName: "Admin User",
    assignedTo: ["u2"],
    createdAt: new Date().toISOString(),
  },
  {
    _id: "s102",
    title: "Data Structures & Algorithms - Trees & Graphs",
    description: "Comprehensive walkthrough of Binary Search Trees, BFS/DFS graph traversals and interview problem patterns.",
    date: new Date(Date.now() + 172800000).toISOString().split("T")[0],
    time: "02:00 PM",
    youtubeUrl: "https://www.youtube.com/watch?v=RBSGKlAnoiM",
    type: "group",
    status: "scheduled",
    createdBy: "u3",
    createdByName: "Dr. Rajesh Verma",
    assignedTo: ["u2"],
    createdAt: new Date().toISOString(),
  },
  {
    _id: "s103",
    title: "1-on-1 Academic Counseling & Study Plan",
    description: "Personalized mentorship discussion to address attendance, internal mark improvements, and study schedule optimization.",
    date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
    time: "11:30 AM",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    type: "counseling",
    status: "completed",
    createdBy: "u3",
    createdByName: "Dr. Rajesh Verma",
    assignedTo: ["u2"],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  }
];

const isDbConnected = () => mongoose.connection.readyState === 1;

// GET /api/sessions - View all or assigned sessions
router.get("/", verifyToken, async (req, res) => {
  try {
    if (isDbConnected()) {
      let filter = {};
      if (req.user.role === "student") {
        // Students see sessions assigned to them OR general public sessions
        filter = { $or: [{ assignedTo: req.user.id }, { assignedTo: { $size: 0 } }, { type: "group" }] };
      } else if (req.user.role === "mentor") {
        filter = { $or: [{ createdBy: req.user.id }, { createdBy: "admin" }, { type: "group" }] };
      }
      const dbSessions = await Session.find(filter).sort({ createdAt: -1 }).lean();
      if (dbSessions && dbSessions.length > 0) {
        return res.json(dbSessions);
      }
    }
  } catch (dbErr) {
    console.warn("MongoDB fetch sessions warning (falling back to memory):", dbErr.message);
  }

  // Fallback to in-memory store
  if (req.user.role === "student") {
    const studentSessions = inMemorySessions.filter(
      (s) => !s.assignedTo || s.assignedTo.length === 0 || s.assignedTo.includes(req.user.id) || s.type === "group"
    );
    return res.json(studentSessions.length > 0 ? studentSessions : inMemorySessions);
  }

  res.json(inMemorySessions);
});

// POST /api/sessions - Only ADMIN and MENTOR can create sessions
router.post("/", verifyToken, async (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "mentor") {
    return res.status(403).json({ error: "Access denied. Only Admins and Mentors can create student sessions." });
  }

  try {
    const { title, description, date, time, youtubeUrl, type, assignedTo } = req.body;

    const newSessionData = {
      title,
      description: description || "",
      date: date || new Date().toISOString().split("T")[0],
      time: time || "10:00 AM",
      youtubeUrl: youtubeUrl || "",
      type: type || "mentor-student",
      status: "scheduled",
      createdBy: req.user.id || req.user.email || "mentor",
      createdByName: req.user.name || (req.user.role === "admin" ? "Admin" : "Mentor"),
      assignedTo: Array.isArray(assignedTo) ? assignedTo : (assignedTo ? [assignedTo] : []),
      createdAt: new Date().toISOString(),
    };

    if (isDbConnected()) {
      try {
        const session = await Session.create(newSessionData);
        inMemorySessions.unshift({ ...newSessionData, _id: session._id.toString() });
        return res.status(201).json(session);
      } catch (dbErr) {
        console.warn("MongoDB create session fallback:", dbErr.message);
      }
    }

    const sessionWithId = { ...newSessionData, _id: "s" + Date.now() };
    inMemorySessions.unshift(sessionWithId);
    return res.status(201).json(sessionWithId);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/sessions/:id - Only ADMIN and MENTOR can update sessions
router.put("/:id", verifyToken, async (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "mentor") {
    return res.status(403).json({ error: "Access denied. Only Admins and Mentors can update student sessions." });
  }

  try {
    const { id } = req.params;
    let updatedSession = null;

    if (isDbConnected()) {
      try {
        updatedSession = await Session.findByIdAndUpdate(id, req.body, { new: true });
      } catch (dbErr) {
        console.warn("MongoDB update session fallback:", dbErr.message);
      }
    }

    // Also update in-memory
    const idx = inMemorySessions.findIndex((s) => s._id === id || s._id?.toString() === id);
    if (idx !== -1) {
      inMemorySessions[idx] = { ...inMemorySessions[idx], ...req.body };
      updatedSession = inMemorySessions[idx];
    } else if (!updatedSession) {
      const createdFallback = { _id: id, ...req.body };
      inMemorySessions.unshift(createdFallback);
      updatedSession = createdFallback;
    }

    res.json(updatedSession);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/sessions/:id - Only ADMIN and MENTOR can delete sessions
router.delete("/:id", verifyToken, async (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "mentor") {
    return res.status(403).json({ error: "Access denied. Only Admins and Mentors can delete sessions." });
  }

  try {
    const { id } = req.params;
    if (isDbConnected()) {
      try {
        await Session.findByIdAndDelete(id);
      } catch (dbErr) {
        console.warn("MongoDB delete session fallback:", dbErr.message);
      }
    }
    inMemorySessions = inMemorySessions.filter((s) => s._id !== id && s._id?.toString() !== id);
    res.json({ message: "Session deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
