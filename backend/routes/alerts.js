import { Router } from "express";
import mongoose from "mongoose";
import ParentAlert from "../models/ParentAlert.js";
import { verifyToken } from "../middleware/auth.js";

const router = Router();
const isMongoConnected = () => mongoose.connection.readyState === 1;

let memAlerts = [
  { _id: "a1", student_name: "Aarav Sharma", parent_phone: "+91 98765 43210", alert_type: "Attendance Critical (< 75%)", message: "Aarav's attendance is at 68%. Immediate counseling recommended.", status: "sent", is_read: false, createdAt: new Date().toISOString() },
  { _id: "a2", student_name: "Ananya Iyer", parent_phone: "+91 98765 43211", alert_type: "Internal Mark Drop", message: "Mark drop detected in Internal Assessment 2 (below 50%).", status: "sent", is_read: true, createdAt: new Date().toISOString() },
];

router.get("/", verifyToken, async (req, res) => {
  try {
    if (isMongoConnected()) {
      const alerts = await ParentAlert.find().sort({ createdAt: -1 }).maxTimeMS(2500);
      if (alerts && alerts.length > 0) return res.json(alerts);
    }
  } catch (err) {
    console.warn("MongoDB alerts notice:", err.message);
  }
  res.json(memAlerts);
});

router.post("/", verifyToken, async (req, res) => {
  try {
    if (isMongoConnected()) {
      const alert = await ParentAlert.create(req.body);
      return res.status(201).json(alert);
    }
  } catch (err) {
    console.warn("MongoDB create alert notice:", err.message);
  }
  const fallbackAlert = { _id: "a_" + Date.now(), createdAt: new Date().toISOString(), ...req.body };
  memAlerts.unshift(fallbackAlert);
  res.status(201).json(fallbackAlert);
});

router.post("/bulk", verifyToken, async (req, res) => {
  try {
    const { alerts } = req.body;
    if (!Array.isArray(alerts)) return res.status(400).json({ error: "alerts must be an array" });
    if (isMongoConnected()) {
      const created = await ParentAlert.insertMany(alerts);
      return res.json({ count: created.length });
    }
    alerts.forEach((a) => memAlerts.unshift({ _id: "a_" + Date.now(), createdAt: new Date().toISOString(), ...a }));
    res.json({ count: alerts.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", verifyToken, async (req, res) => {
  try {
    if (isMongoConnected()) {
      const alert = await ParentAlert.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (alert) return res.json(alert);
    }
  } catch (err) {
    console.warn("MongoDB update alert notice:", err.message);
  }
  const idx = memAlerts.findIndex(a => a._id === req.params.id);
  if (idx >= 0) {
    memAlerts[idx] = { ...memAlerts[idx], ...req.body };
    return res.json(memAlerts[idx]);
  }
  res.json({ _id: req.params.id, ...req.body });
});

export default router;
