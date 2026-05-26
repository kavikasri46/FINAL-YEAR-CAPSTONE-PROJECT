import { Student, Mentor, Session, Notification, PerformanceData } from "./types";

export const mockStudents: Student[] = [
  { id: "s1", name: "Arjun Patel", email: "arjun@school.edu", grade: "10th", gpa: 2.1, attendance: 62, riskLevel: "high", riskScore: 87, phone: "+1234567890" },
  { id: "s2", name: "Priya Sharma", email: "priya@school.edu", grade: "11th", gpa: 3.4, attendance: 88, riskLevel: "low", riskScore: 22, phone: "+1234567891" },
  { id: "s3", name: "Rahul Kumar", email: "rahul@school.edu", grade: "10th", gpa: 2.8, attendance: 71, riskLevel: "medium", riskScore: 58, phone: "+1234567892" },
  { id: "s4", name: "Ananya Gupta", email: "ananya@school.edu", grade: "12th", gpa: 3.8, attendance: 95, riskLevel: "low", riskScore: 12, phone: "+1234567893" },
  { id: "s5", name: "Vikram Singh", email: "vikram@school.edu", grade: "11th", gpa: 1.9, attendance: 55, riskLevel: "high", riskScore: 91, phone: "+1234567894" },
  { id: "s6", name: "Meera Nair", email: "meera@school.edu", grade: "10th", gpa: 3.1, attendance: 79, riskLevel: "medium", riskScore: 45, phone: "+1234567895" },
  { id: "s7", name: "Karan Joshi", email: "karan@school.edu", grade: "12th", gpa: 2.5, attendance: 68, riskLevel: "medium", riskScore: 62, phone: "+1234567896" },
  { id: "s8", name: "Sneha Reddy", email: "sneha@school.edu", grade: "11th", gpa: 3.7, attendance: 92, riskLevel: "low", riskScore: 15, phone: "+1234567897" },
];

export const mockMentors: Mentor[] = [
  { id: "m1", name: "Dr. Rajesh Verma", email: "rajesh@school.edu", specialization: "Academic Counseling", studentsAssigned: 12 },
  { id: "m2", name: "Prof. Sunita Das", email: "sunita@school.edu", specialization: "Behavioral Support", studentsAssigned: 8 },
  { id: "m3", name: "Dr. Anil Kapoor", email: "anil@school.edu", specialization: "Career Guidance", studentsAssigned: 15 },
];

export const mockSessions: Session[] = [
  { id: "ss1", title: "Academic Review - Arjun", date: "2026-02-17", time: "10:00 AM", type: "mentor-student", participants: ["Arjun Patel", "Dr. Rajesh Verma"], status: "scheduled" },
  { id: "ss2", title: "Parent Meeting - Vikram", date: "2026-02-18", time: "2:00 PM", type: "mentor-parent", participants: ["Vikram's Parent", "Prof. Sunita Das"], status: "scheduled" },
  { id: "ss3", title: "Group Study Skills", date: "2026-02-16", time: "11:00 AM", type: "group", participants: ["Multiple Students"], status: "completed" },
];

export const mockNotifications: Notification[] = [
  { id: "n1", title: "High Risk Alert", message: "Arjun Patel's dropout risk has increased to 87%. Immediate intervention required.", type: "alert", timestamp: "2026-02-16T09:00:00", read: false, recipientRole: "admin" },
  { id: "n2", title: "Low Attendance Warning", message: "Vikram Singh's attendance has dropped below 60%. SMS sent to parent.", type: "warning", timestamp: "2026-02-16T08:30:00", read: false, recipientRole: "admin" },
  { id: "n3", title: "Session Completed", message: "Group Study Skills session completed successfully with 12 participants.", type: "success", timestamp: "2026-02-16T12:00:00", read: true, recipientRole: "mentor" },
  { id: "n4", title: "GPA Improvement", message: "Meera Nair's GPA improved by 0.3 points this semester.", type: "info", timestamp: "2026-02-15T16:00:00", read: true, recipientRole: "admin" },
  { id: "n5", title: "Parent Alert Sent", message: "SMS alert sent to Arjun's parent regarding high dropout risk.", type: "warning", timestamp: "2026-02-16T09:05:00", read: false, recipientRole: "parent" },
];

export const mockPerformance: PerformanceData[] = [
  { month: "Sep", gpa: 3.2, attendance: 92, assignments: 88 },
  { month: "Oct", gpa: 3.0, attendance: 85, assignments: 82 },
  { month: "Nov", gpa: 2.8, attendance: 78, assignments: 75 },
  { month: "Dec", gpa: 2.5, attendance: 72, assignments: 70 },
  { month: "Jan", gpa: 2.3, attendance: 65, assignments: 62 },
  { month: "Feb", gpa: 2.1, attendance: 62, assignments: 58 },
];

export const riskDistribution = [
  { name: "Low Risk", value: 45, fill: "hsl(152 60% 40%)" },
  { name: "Medium Risk", value: 30, fill: "hsl(38 92% 50%)" },
  { name: "High Risk", value: 25, fill: "hsl(0 72% 51%)" },
];

export const attendanceTrend = [
  { week: "W1", attendance: 88 },
  { week: "W2", attendance: 85 },
  { week: "W3", attendance: 82 },
  { week: "W4", attendance: 78 },
  { week: "W5", attendance: 75 },
  { week: "W6", attendance: 71 },
  { week: "W7", attendance: 74 },
  { week: "W8", attendance: 70 },
];
