import mongoose from "mongoose";

const internalMarksSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true, index: true },
    subjectName: { type: String, required: true },
    cia1: { type: Number, default: 0 },
    cia2: { type: Number, default: 0 },
    assignment1: { type: Number, default: 0 },
    assignment2: { type: Number, default: 0 },
    quiz: { type: Number, default: 0 },
    seminar: { type: Number, default: 0 },
    lab: { type: Number, default: 0 },
    modelExam: { type: Number, default: 0 },
    attendanceMark: { type: Number, default: 0 },
    internalTotal: { type: Number, default: 0 },
    internalPercentage: { type: Number, default: 0 },
    grade: { type: String, default: "F" },
    erpSyncedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

internalMarksSchema.index({ studentId: 1, subjectName: 1 }, { unique: true });

export default mongoose.model("InternalMarks", internalMarksSchema, "erpInternalMarks");
