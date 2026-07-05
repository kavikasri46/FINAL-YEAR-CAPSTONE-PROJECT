import { Router } from "express";
import Session from "../models/Session.js";
import { verifyToken } from "../middleware/auth.js";

const router = Router();

router.get("/", verifyToken, async (req, res) => {
  try {
    let sessions;
    if (req.user.role === "student") {
      sessions = await Session.find({ assignedTo: req.user.id }).sort({ createdAt: -1 });
    } else if (req.user.role === "mentor") {
      sessions = await Session.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
    } else {
      sessions = await Session.find().sort({ createdAt: -1 });
    }
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", verifyToken, async (req, res) => {
  try {
    const { title, description, date, time, youtubeUrl, type, assignedTo } = req.body;
    const session = await Session.create({
      title, description, date, time, youtubeUrl,
      type: type || "mentor-student",
      createdBy: req.user.id,
      assignedTo: assignedTo || [],
    });
    res.status(201).json(session);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", verifyToken, async (req, res) => {
  try {
    const session = await Session.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
