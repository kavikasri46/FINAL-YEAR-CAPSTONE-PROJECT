import mongoose from "mongoose";

const subjectResultSchema = new mongoose.Schema(
  {
    subjectName: { type: String, required: true },
    credits: { type: Number, default: 3 },
    externalMarks: { type: Number, default: 0 },
    internalMarks: { type: Number, default: 0 },
    totalMarks: { type: Number, default: 0 },
    grade: { type: String, default: "F" },
    gradePoint: { type: Number, default: 0 },
    passFail: { type: String, enum: ["Pass", "Fail"], default: "Pass" },
  },
  { _id: false }
);

const semesterResultSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true, index: true },
    subjects: [subjectResultSchema],
    gpa: { type: Number, default: 0 },
    cgpa: { type: Number, default: 0 },
    backlogs: { type: Number, default: 0 },
    erpSyncedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

semesterResultSchema.index({ studentId: 1 }, { unique: true });

export default mongoose.model("SemesterResult", semesterResultSchema, "erpSemesterResults");
