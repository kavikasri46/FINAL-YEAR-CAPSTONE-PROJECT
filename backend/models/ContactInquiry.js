import mongoose from "mongoose";

const contactInquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    department: { type: String, default: "Computer Science" },
    message: { type: String, required: true },
    service: { type: String, default: "Dropout Early Warning Inquiry" },
    status: { type: String, enum: ["new", "in-progress", "responded", "archived"], default: "new" },
  },
  { timestamps: true }
);

export default mongoose.model("ContactInquiry", contactInquirySchema, "contactInquiries");

