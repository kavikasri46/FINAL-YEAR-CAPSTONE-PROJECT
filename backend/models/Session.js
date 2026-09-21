import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  date: { type: String },
  time: { type: String },
  youtubeUrl: { type: String },
  type: { type: String, enum: ["mentor-student", "mentor-parent", "group"], default: "mentor-student" },
  status: { type: String, enum: ["scheduled", "completed", "cancelled"], default: "scheduled" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true });

export default mongoose.model("Session", sessionSchema);
