import mongoose from "mongoose";

const parentAlertSchema = new mongoose.Schema({
  student_id: { type: String },
  parent_phone: { type: String },
  parent_email: { type: String },
  alert_type: { type: String },
  message: { type: String },
  risk_level: { type: String },
  sent_via: { type: String },
  is_read: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model("ParentAlert", parentAlertSchema);
