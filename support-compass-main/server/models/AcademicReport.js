import mongoose from "mongoose";

const academicReportSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true, unique: true, index: true },
    studentName: { type: String },
    overallScore: { type: Number, default: 0 },
    attendanceScore: { type: Number, default: 0 },
    marksScore: { type: Number, default: 0 },
    performanceScore: { type: Number, default: 0 },
    learningTrend: { type: String, default: "Stable" },
    improvementPct: { type: Number, default: 0 },
    consistency: { type: Number, default: 0 },
    riskScore: { type: Number, default: 0 },
    performanceIndex: { type: Number, default: 0 },
    studentRanking: { type: Number, default: 0 },
    riskCategory: {
      type: String,
      enum: ["Very Low", "Low", "Medium", "High", "Critical"],
      default: "Very Low",
    },
    weakSubjects: [{ type: String }],
    strongSubjects: [{ type: String }],
    recommendations: {
      teacher: [{ type: String }],
      parent: [{ type: String }],
      student: [{ type: String }],
      ai: [{ type: String }],
    },
    dropoutRiskFeatures: {
      attendancePct: { type: Number, default: 0 },
      ciaTotal: { type: Number, default: 0 },
      semesterMarks: { type: Number, default: 0 },
      backlogs: { type: Number, default: 0 },
      cgpa: { type: Number, default: 0 },
      assignmentPerformance: { type: Number, default: 0 },
      performanceTrend: { type: Number, default: 0 },
      attendanceTrend: { type: Number, default: 0 },
      lateAttendance: { type: Number, default: 0 },
      medicalLeave: { type: Number, default: 0 },
    },
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("AcademicReport", academicReportSchema, "erpReports");
