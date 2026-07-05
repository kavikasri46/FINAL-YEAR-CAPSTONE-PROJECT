import express from "express";
import cors from "cors";
import mongoose from "mongoose";

import authRoutes from "./routes/auth.js";
import studentRoutes from "./routes/students.js";
import sessionRoutes from "./routes/sessions.js";
import timetableRoutes from "./routes/timetable.js";
import alertRoutes from "./routes/alerts.js";

const app = express();
const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://nnitheesh863_db_user:nnitheesh863_db_user@cluster0.8paqpqr.mongodb.net/eduguard?retryWrites=true&w=majority";

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/timetable", timetableRoutes);
app.use("/api/alerts", alertRoutes);

app.get("/api/health", (req, res) => res.json({ status: "ok", version: "1.0.0" }));

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    console.log("Starting server without database...");
    app.listen(PORT, () => console.log(`Server running on port ${PORT} (no database)`));
  });
