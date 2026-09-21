import mongoose from "mongoose";

const erpStudentSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true, unique: true, index: true },
    registerNo: { type: String, required: true, unique: true },
    rollNo: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    gender: { type: String },
    dob: { type: String },
    department: { type: String, default: "Computer Science with Data Analytics" },
    year: { type: Number },
    semester: { type: Number },
    section: { type: String },
    parentName: { type: String },
    parentPhone: { type: String },
    email: { type: String },
    bloodGroup: { type: String },
    address: { type: String },
    advisor: { type: String },
    riskLevel: {
      type: String,
      enum: ["Very Low", "Low", "Medium", "High", "Critical"],
      default: "Very Low",
    },
    erpSyncedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("ErpStudent", erpStudentSchema, "erpStudents");
