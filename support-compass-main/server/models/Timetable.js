import mongoose from "mongoose";

const timetableSchema = new mongoose.Schema({
  class: String,
  subject: String,
  mentor: String,
  day: String,
  time: String,
  room: String,
  status: { type: String, default: "Scheduled" },
}, { timestamps: true });

export default mongoose.model("Timetable", timetableSchema);
