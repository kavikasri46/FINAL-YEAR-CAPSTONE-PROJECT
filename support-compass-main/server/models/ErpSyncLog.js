import mongoose from "mongoose";

const erpSyncLogSchema = new mongoose.Schema(
  {
    syncId: {
      type: String,
      required: true,
      unique: true,
      default: () => `sync_${Date.now()}`,
    },
    triggeredBy: { type: String, default: "admin" },
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date },
    durationMs: { type: Number },
    studentsAdded: { type: Number, default: 0 },
    studentsUpdated: { type: Number, default: 0 },
    attendanceRecords: { type: Number, default: 0 },
    marksRecords: { type: Number, default: 0 },
    resultsRecords: { type: Number, default: 0 },
    reportsGenerated: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["running", "completed", "failed", "partial"],
      default: "running",
    },
    errors: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.model("ErpSyncLog", erpSyncLogSchema, "erpSyncLogs");
