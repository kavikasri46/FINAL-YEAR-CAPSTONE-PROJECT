import express from "express";
import cors from "cors";
import mongoose from "mongoose";

import authRoutes from "./routes/auth.js";
import studentRoutes from "./routes/students.js";
import sessionRoutes from "./routes/sessions.js";
import timetableRoutes from "./routes/timetable.js";
import alertRoutes from "./routes/alerts.js";
import erpRoutes from "./routes/erp.js";

const app = express();
const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://kavikasri46_db_user:ZbiAkbNFwAyIahbX@cluster0.ulib1zn.mongodb.net/eduguard?retryWrites=true&w=majority";

// Disable command buffering so queries fail immediately to fallback instead of hanging 10s
mongoose.set("bufferCommands", false);

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Root welcome & API health routes
app.get("/", (req, res) => res.json({ status: "ok", name: "EduGuard Backend API", version: "1.0.0" }));

app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/timetable", timetableRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api", erpRoutes); // ERP Integration — Fake ERP + Sync + Analytics

app.get("/api/health", (req, res) => res.json({ 
  status: "ok", 
  version: "1.0.0",
  database: mongoose.connection.readyState === 1 ? "connected" : "in-memory-fallback"
}));

// MongoDB connection caching for Serverless & standalone
let isConnecting = false;
const connectDB = async () => {
  if (mongoose.connection.readyState === 1 || isConnecting) return;
  isConnecting = true;
  try {
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 3000 });
    console.log("Connected to MongoDB Atlas");
  } catch (err) {
    console.warn("MongoDB connection notice (in-memory mode):", err.message);
  } finally {
    isConnecting = false;
  }
};

connectDB();

// Only listen on port if running as standalone server directly (not inside Vercel serverless)
if (!process.env.VERCEL && process.env.NODE_ENV !== "test") {
  try {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (e) {}
}

export default app;
