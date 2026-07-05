import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String },
  grade: { type: String },
  gpa: { type: Number, default: 0 },
  attendance: { type: Number, default: 0 },
  parent_phone: { type: String },
  parent_email: { type: String },
  assignments_completed: { type: Number, default: 0 },
  risk_score: { type: Number, default: 0 },
  risk_level: { type: String, default: "safe" },
  mentor_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

export default mongoose.model("Student", studentSchema);
