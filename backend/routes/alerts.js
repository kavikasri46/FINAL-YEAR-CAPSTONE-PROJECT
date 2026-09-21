import { Router } from "express";
import ParentAlert from "../models/ParentAlert.js";
import { verifyToken } from "../middleware/auth.js";

const router = Router();

router.get("/", verifyToken, async (req, res) => {
  try {
    const alerts = await ParentAlert.find().sort({ createdAt: -1 });
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", verifyToken, async (req, res) => {
  try {
    const alert = await ParentAlert.create(req.body);
    res.status(201).json(alert);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/bulk", verifyToken, async (req, res) => {
  try {
    const { alerts } = req.body;
    if (!Array.isArray(alerts)) return res.status(400).json({ error: "alerts must be an array" });
    const created = await ParentAlert.insertMany(alerts);
    res.json({ count: created.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", verifyToken, async (req, res) => {
  try {
    const alert = await ParentAlert.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(alert);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
