import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true, index: true },
    workingDays: { type: Number, default: 0 },
    presentDays: { type: Number, default: 0 },
    absentDays: { type: Number, default: 0 },
    medicalLeave: { type: Number, default: 0 },
    od: { type: Number, default: 0 },
    lateEntry: { type: Number, default: 0 },
    attendancePercentage: { type: Number, default: 0 },
    erpSyncedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

attendanceSchema.index({ studentId: 1 }, { unique: true });

export default mongoose.model("Attendance", attendanceSchema, "erpAttendance");
