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

mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 3000 })
  .then(() => {
    console.log("Connected to MongoDB Atlas");
    app.listen(PORT, () => console.log(`Server running on port ${PORT} (MongoDB Atlas connected)`));
  })
  .catch((err) => {
    console.warn("MongoDB connection notice (using in-memory store):", err.message);
    app.listen(PORT, () => console.log(`Server running on port ${PORT} (in-memory offline mode)`));
  });
