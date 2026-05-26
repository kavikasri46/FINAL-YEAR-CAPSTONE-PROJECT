export type UserRole = "admin" | "student" | "mentor" | "parent";
export type RiskLevel = "low" | "medium" | "high";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  grade: string;
  gpa: number;
  attendance: number;
  riskLevel: RiskLevel;
  riskScore: number;
  parentId?: string;
  mentorId?: string;
  phone?: string;
}

export interface Mentor {
  id: string;
  name: string;
  email: string;
  specialization: string;
  studentsAssigned: number;
}

export interface Parent {
  id: string;
  name: string;
  email: string;
  phone: string;
  childrenIds: string[];
}

export interface Session {
  id: string;
  title: string;
  date: string;
  time: string;
  type: "mentor-student" | "mentor-parent" | "group";
  participants: string[];
  status: "scheduled" | "completed" | "cancelled";
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "alert" | "info" | "warning" | "success";
  timestamp: string;
  read: boolean;
  recipientRole: UserRole;
}

export interface PerformanceData {
  month: string;
  gpa: number;
  attendance: number;
  assignments: number;
}
