import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  date: { type: String },
  time: { type: String },
  youtubeUrl: { type: String },
  type: { type: String, default: "mentor-student" },
  status: { type: String, enum: ["scheduled", "completed", "cancelled"], default: "scheduled" },
  createdBy: { type: String },
  createdByName: { type: String },
  assignedTo: [{ type: String }],
}, { timestamps: true });

export default mongoose.model("Session", sessionSchema);
