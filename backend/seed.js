import mongoose from "mongoose";
import User from "./models/User.js";
import Student from "./models/Student.js";
import ErpStudent from "./models/ErpStudent.js";
import Attendance from "./models/Attendance.js";
import InternalMarks from "./models/InternalMarks.js";
import SemesterResult from "./models/SemesterResult.js";
import AcademicReport from "./models/AcademicReport.js";
import ErpSyncLog from "./models/ErpSyncLog.js";
import Timetable from "./models/Timetable.js";
import Session from "./models/Session.js";
import ParentAlert from "./models/ParentAlert.js";
import ContactInquiry from "./models/ContactInquiry.js";
import NewsletterSubscriber from "./models/NewsletterSubscriber.js";

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://kavikasri46_db_user:Kavika246@cluster0.ulib1zn.mongodb.net/eduguard?retryWrites=true&w=majority";

const DEMO_USERS = [
  { name: "Admin User", email: "admin@school.edu", password: "password", role: "admin" },
  { name: "Dr. Rajesh Verma", email: "rajesh@school.edu", password: "password", role: "mentor" },
  { name: "Ramesh kumar", email: "ramesh.kumar@kprcas.ac.in", password: "password", role: "mentor" },
  { name: "Manoj", email: "manoj@kprcas.ac.in", password: "password", role: "mentor" },
  { name: "brindaa", email: "brindaa@kprcas.ac.in", password: "password", role: "mentor" },
  { name: "sathayavathy", email: "sathayavathy@kprcas.ac.in", password: "password", role: "mentor" },
  { name: "keerthi", email: "keerthi@kprcas.ac.in", password: "password", role: "mentor" },
  { name: "jayathi", email: "jayathi@kprcas.ac.in", password: "password", role: "mentor" },
  { name: "Arjun Patel", email: "arjun@school.edu", password: "password", role: "student" },
  { name: "Mr. Patel", email: "parent@school.edu", password: "password", role: "parent" },
];

const DEMO_STUDENTS = [
  { name: "Arjun Patel", email: "arjun.patel@example.com", grade: "12th", gpa: 2.1, attendance: 95, risk_score: 85, risk_level: "critical", parent_phone: "+91 9876543210", parent_email: "parent.arjun@example.com", assignments_completed: 14 },
  { name: "Vikram Singh", email: "vikram.singh@example.com", grade: "11th", gpa: 1.8, attendance: 45, risk_score: 92, risk_level: "critical", parent_phone: "+91 9876543211", parent_email: "parent.vikram@example.com", assignments_completed: 8 },
  { name: "Rahul Kumar", email: "rahul.kumar@example.com", grade: "10th", gpa: 3.2, attendance: 88, risk_score: 45, risk_level: "medium", parent_phone: "+91 9876543212", parent_email: "parent.rahul@example.com", assignments_completed: 22 },
  { name: "Sana Iqbal", email: "sana.iqbal@example.com", grade: "12th", gpa: 2.4, attendance: 72, risk_score: 78, risk_level: "high", parent_phone: "+91 9876543213", parent_email: "parent.sana@example.com", assignments_completed: 18 },
  { name: "Meera Nair", email: "meera.nair@example.com", grade: "11th", gpa: 2.7, attendance: 64, risk_score: 58, risk_level: "medium", parent_phone: "+91 9876543214", parent_email: "parent.meera@example.com", assignments_completed: 19 },
  { name: "Daniel Brown", email: "daniel.brown@example.com", grade: "12th", gpa: 3.8, attendance: 98, risk_score: 15, risk_level: "low", parent_phone: "+91 9876543215", parent_email: "parent.daniel@example.com", assignments_completed: 30 },
  { name: "Aisha Khan", email: "aisha.khan@example.com", grade: "10th", gpa: 2.9, attendance: 58, risk_score: 67, risk_level: "high", parent_phone: "+91 9876543216", parent_email: "parent.aisha@example.com", assignments_completed: 16 },
  { name: "Lucas Silva", email: "lucas.silva@example.com", grade: "11th", gpa: 3.1, attendance: 82, risk_score: 35, risk_level: "low", parent_phone: "+91 9876543217", parent_email: "parent.lucas@example.com", assignments_completed: 25 },
  { name: "Olivia Martin", email: "olivia.martin@example.com", grade: "12th", gpa: 2.5, attendance: 69, risk_score: 74, risk_level: "high", parent_phone: "+91 9876543218", parent_email: "parent.olivia@example.com", assignments_completed: 15 },
  { name: "Noah Wilson", email: "noah.wilson@example.com", grade: "11th", gpa: 1.9, attendance: 50, risk_score: 81, risk_level: "critical", parent_phone: "+91 9876543219", parent_email: "parent.noah@example.com", assignments_completed: 10 },
  { name: "Emma Thomas", email: "emma.thomas@example.com", grade: "10th", gpa: 3.9, attendance: 99, risk_score: 12, risk_level: "low", parent_phone: "+91 9876543220", parent_email: "parent.emma@example.com", assignments_completed: 32 },
  { name: "Liam Garcia", email: "liam.garcia@example.com", grade: "12th", gpa: 2.8, attendance: 61, risk_score: 69, risk_level: "high", parent_phone: "+91 9876543221", parent_email: "parent.liam@example.com", assignments_completed: 17 },
  { name: "Sophia Lee", email: "sophia.lee@example.com", grade: "11th", gpa: 3.0, attendance: 72, risk_score: 55, risk_level: "medium", parent_phone: "+91 9876543222", parent_email: "parent.sophia@example.com", assignments_completed: 21 },
  { name: "James Anderson", email: "james.anderson@example.com", grade: "10th", gpa: 3.3, attendance: 85, risk_score: 47, risk_level: "medium", parent_phone: "+91 9876543223", parent_email: "parent.james@example.com", assignments_completed: 24 },
  { name: "Isabella Moore", email: "isabella.moore@example.com", grade: "12th", gpa: 1.7, attendance: 42, risk_score: 88, risk_level: "critical", parent_phone: "+91 9876543224", parent_email: "parent.isabella@example.com", assignments_completed: 9 },
  { name: "Benjamin Taylor", email: "benjamin.taylor@example.com", grade: "11th", gpa: 2.6, attendance: 67, risk_score: 60, risk_level: "medium", parent_phone: "+91 9876543225", parent_email: "parent.benjamin@example.com", assignments_completed: 19 },
  { name: "Charlotte Harris", email: "charlotte.harris@example.com", grade: "10th", gpa: 3.5, attendance: 90, risk_score: 28, risk_level: "low", parent_phone: "+91 9876543226", parent_email: "parent.charlotte@example.com", assignments_completed: 28 },
  { name: "Henry Clark", email: "henry.clark@example.com", grade: "12th", gpa: 2.4, attendance: 70, risk_score: 73, risk_level: "high", parent_phone: "+91 9876543227", parent_email: "parent.henry@example.com", assignments_completed: 17 },
  { name: "Mia Robinson", email: "mia.robinson@example.com", grade: "11th", gpa: 3.0, attendance: 75, risk_score: 52, risk_level: "medium", parent_phone: "+91 9876543228", parent_email: "parent.mia@example.com", assignments_completed: 22 },
  { name: "Ethan Lewis", email: "ethan.lewis@example.com", grade: "12th", gpa: 1.5, attendance: 30, risk_score: 95, risk_level: "critical", parent_phone: "+91 9876543229", parent_email: "parent.ethan@example.com", assignments_completed: 6 },
];

const STUDENT_NAMES = [
  "MUHAMMAD TAMATTAN", "SHAMUTHRA K", "SANTHOSH KUMAR M", "SARVESH D L", "ANITHA M",
  "SAKTHI VIKNESHWARAN P K", "KIRUTHIK K", "INDUJHA A", "DEVASREE M", "RUPIKASRI K J",
  "SASMITHA P B", "VIDHYABHARATHY P", "ACHSHA MIRACLIN HEBZIBAH A", "NITHEESH KUMAR S",
  "VISHNU PRIYA C", "SOWMATHI R", "SANJEEVI H", "TULASI PRIYA G", "REKHA SHREE T",
  "DEVASHREE B", "PRATHIKSHA V", "KANIMOZHI M", "JACK MATHEW S", "SANDHIYA S S",
  "VIVITHA SRI P S", "DHARUNYA N", "MAHALAKSHMI K", "KISHORE N", "DEVASREE S S",
  "GUHAN B R", "DEEPAN KUMAR S", "SAMICSHA SREE V", "MONIKA C", "RITHANI M",
  "SAHANA G", "SANDHIYA SHREE N", "VARSSHINI N S", "VISHNU PRAKASH S", "KANIKAA M G",
  "YAGAVARSHINI R K", "SRUTHI K M", "KAVIKA SRI M", "JEEVIKA A R", "SREYA G P",
  "PRATHEEBA S", "SWEETHA T", "RITHANYA C", "CLEMENT RASARIO P", "RITIKA T",
  "DHARANIDHARAN K", "PUGHALVANAN C", "VIVEGA D", "KANISHKKA R", "INDERASH M",
  "KAVYA VARSINI S", "NAVEEN K E", "THIRUSELVAN J", "KARAN KUMAR S", "HARIHARAN S V",
  "PRANEKA G", "SURIYA A", "SATHANA S", "THITHANYA RP", "PRIYA G", "SUJITHA G",
  "NISHAANTH V S", "BHARANITHARAN V A", "CHIRANJEEVI P", "SANJAY S",
];

const SUBJECTS = [
  "Programming in Java", "Python Programming", "DBMS", "Operating System",
  "Computer Networks", "Machine Learning", "Statistics", "Data Analytics",
  "Cloud Computing", "Artificial Intelligence", "Mini Project",
];

const ADVISORS = ["Dr. Rajesh Kumar", "Prof. Priya Nair", "Dr. S. Vignesh", "Prof. K. Anand"];

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFloat = (min, max, d = 2) => parseFloat((Math.random() * (max - min) + min).toFixed(d));
const pickOne = (arr) => arr[Math.floor(Math.random() * arr.length)];

function calcRiskLevel(score) {
  if (score <= 40) return "Critical";
  if (score <= 60) return "High";
  if (score <= 70) return "Medium";
  if (score <= 80) return "Low";
  return "Very Low";
}

function calcGrade(total) {
  if (total >= 90) return "O";
  if (total >= 80) return "A+";
  if (total >= 70) return "A";
  if (total >= 60) return "B+";
  if (total >= 50) return "B";
  if (total >= 40) return "C";
  return "F";
}

function gradeToPoints(grade) {
  const map = { O: 10, "A+": 9, A: 8, "B+": 7, B: 6, C: 5, F: 0 };
  return map[grade] || 0;
}

async function seed() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGO_URI);
  console.log("Connected successfully!");

  // 1. Seed Demo Users
  console.log("\nSeeding Users...");
  for (const u of DEMO_USERS) {
    await User.findOneAndUpdate({ email: u.email }, { $set: u }, { upsert: true, new: true });
  }
  console.log(`✓ Seeded ${DEMO_USERS.length} Demo Users`);

  // 2. Seed Students
  console.log("\nSeeding Students...");
  for (const s of DEMO_STUDENTS) {
    await Student.findOneAndUpdate({ email: s.email }, { $set: s }, { upsert: true, new: true });
  }
  console.log(`✓ Seeded ${DEMO_STUDENTS.length} Students`);

  // 3. Seed ERP Data (Students, Attendance, Marks, Results, Reports)
  console.log("\nSeeding College ERP Data (69 Students, Marks, Attendance, Reports)...");
  const rawStudents = STUDENT_NAMES.map((name, i) => {
    const studentId = `DA${String(2024001 + i)}`;
    const registerNo = `211322105${String(i + 1).padStart(3, "0")}`;
    const rollNo = `21DA${String(i + 1).padStart(2, "0")}`;
    const email = `${name.toLowerCase().replace(/\s+/g, ".")}@college.edu`;
    const advisor = ADVISORS[i % ADVISORS.length];
    return {
      studentId,
      registerNo,
      rollNo,
      name,
      gender: i % 2 === 0 ? "Male" : "Female",
      dob: `2003-${String(rand(1, 12)).padStart(2, "0")}-${String(rand(1, 28)).padStart(2, "0")}`,
      department: "Computer Science with Data Analytics",
      year: 3,
      semester: 6,
      section: "A",
      parentName: `${name.split(" ")[0]} Parent`,
      parentPhone: `+91${rand(6000000000, 9999999999)}`,
      email,
      bloodGroup: pickOne(["O+", "A+", "B+", "AB+", "O-", "A-"]),
      address: "Coimbatore, Tamil Nadu, India",
      advisor,
      riskLevel: "Very Low",
    };
  });

  const attendanceList = rawStudents.map((s) => {
    const workingDays = 90;
    const medicalLeave = rand(0, 5);
    const od = rand(0, 3);
    const lateEntry = rand(0, 6);
    const absentDays = rand(2, 22);
    const presentDays = Math.max(0, workingDays - absentDays);
    const attendancePercentage = parseFloat(((presentDays / workingDays) * 100).toFixed(1));
    return {
      studentId: s.studentId,
      workingDays,
      presentDays,
      absentDays,
      medicalLeave,
      od,
      lateEntry,
      attendancePercentage,
      erpSyncedAt: new Date(),
    };
  });

  const marksList = [];
  const resultsList = [];
  const reportsList = [];

  for (let i = 0; i < rawStudents.length; i++) {
    const s = rawStudents[i];
    const att = attendanceList[i];
    const studentMarks = SUBJECTS.map((subjectName) => {
      const cia1 = rand(15, 50);
      const cia2 = rand(15, 50);
      const assignment1 = rand(5, 10);
      const assignment2 = rand(5, 10);
      const quiz = rand(5, 10);
      const seminar = rand(5, 10);
      const lab = rand(15, 20);
      const modelExam = rand(30, 75);
      const attendanceMark = att.attendancePercentage >= 90 ? 5 : att.attendancePercentage >= 80 ? 4 : att.attendancePercentage >= 75 ? 3 : 2;
      const internalTotal = Math.min(100, Math.round(((cia1 + cia2) / 2) * 0.4 + (modelExam / 75) * 40 + assignment1 + assignment2 + attendanceMark));
      const internalPercentage = internalTotal;
      const grade = calcGrade(internalPercentage);
      return {
        studentId: s.studentId,
        subjectName,
        cia1, cia2, assignment1, assignment2, quiz, seminar, lab, modelExam,
        attendanceMark, internalTotal, internalPercentage, grade,
        erpSyncedAt: new Date(),
      };
    });
    marksList.push(...studentMarks);

    // Semester Result
    let totalGradePoints = 0;
    let totalCredits = 0;
    let backlogs = 0;
    const subjects = studentMarks.map((m) => {
      const externalMarks = rand(35, 100);
      const internalPercentage = m.internalPercentage;
      const totalMarks = Math.round((externalMarks * 0.6) + (internalPercentage * 0.4));
      const grade = calcGrade(totalMarks);
      const gradePoint = gradeToPoints(grade);
      const passFail = totalMarks >= 40 ? "Pass" : "Fail";
      const credits = 3;
      totalGradePoints += gradePoint * credits;
      totalCredits += credits;
      if (passFail === "Fail") backlogs++;
      return { subjectName: m.subjectName, credits, externalMarks, internalMarks: m.internalTotal, totalMarks, grade, gradePoint, passFail };
    });
    const gpa = totalCredits > 0 ? parseFloat((totalGradePoints / totalCredits).toFixed(2)) : 0;
    const cgpa = parseFloat((gpa * (0.92 + Math.random() * 0.08)).toFixed(2));
    const result = { studentId: s.studentId, subjects, gpa, cgpa: Math.min(cgpa, 10), backlogs, erpSyncedAt: new Date() };
    resultsList.push(result);

    // Academic Report
    const attendancePct = att.attendancePercentage;
    const internalPct = studentMarks.reduce((sum, m) => sum + m.internalPercentage, 0) / studentMarks.length;
    const semesterPct = result.gpa > 0 ? (result.gpa / 10) * 100 : 0;
    const overallScore = parseFloat(((attendancePct * 0.35) + (internalPct * 0.35) + (semesterPct * 0.3)).toFixed(2));
    const riskCategory = calcRiskLevel(overallScore);
    const failProbability = parseFloat((Math.max(0, (80 - overallScore) / 80).toFixed(2)));
    const weakSubjects = studentMarks.filter((m) => m.internalPercentage < 50).map((m) => m.subjectName);
    const strongSubjects = studentMarks.filter((m) => m.internalPercentage >= 80).map((m) => m.subjectName);

    reportsList.push({
      studentId: s.studentId,
      studentName: s.name,
      overallScore,
      attendanceScore: attendancePct,
      marksScore: internalPct,
      performanceScore: semesterPct,
      learningTrend: overallScore >= 75 ? "Improving" : overallScore >= 60 ? "Stable" : "Declining",
      improvementPct: randFloat(-5, 12),
      consistency: randFloat(60, 95),
      riskScore: Math.round(failProbability * 100),
      performanceIndex: parseFloat((overallScore * 0.85).toFixed(2)),
      weakSubjects,
      strongSubjects,
      riskCategory,
      recommendations: {
        teacher: [overallScore < 50 ? "Recommend remedial sessions." : "Encourage advanced research projects."],
        parent: [attendancePct < 75 ? "Ensure ward attends all CIA coaching reviews." : "Satisfactory progress."],
        student: [weakSubjects.length > 0 ? `Focus more on ${weakSubjects.join(", ")}.` : "Maintain data analytics skill levels."],
        ai: ["Participate in peer learning networks.", "Focus on model evaluation in data science courses."],
      },
      dropoutRiskFeatures: {
        attendancePct,
        ciaTotal: internalPct,
        semesterMarks: semesterPct,
        backlogs: result.backlogs || 0,
        cgpa: result.cgpa || 0,
        assignmentPerformance: randFloat(60, 95),
        performanceTrend: randFloat(-3, 8),
        attendanceTrend: randFloat(-4, 5),
        lateAttendance: att.lateEntry || 0,
        medicalLeave: att.medicalLeave || 0,
      },
      generatedAt: new Date(),
    });
  }

  // Insert into MongoDB
  for (const s of rawStudents) await ErpStudent.findOneAndUpdate({ studentId: s.studentId }, { $set: s }, { upsert: true });
  for (const att of attendanceList) await Attendance.findOneAndUpdate({ studentId: att.studentId }, { $set: att }, { upsert: true });
  for (const m of marksList) await InternalMarks.findOneAndUpdate({ studentId: m.studentId, subjectName: m.subjectName }, { $set: m }, { upsert: true });
  for (const r of resultsList) await SemesterResult.findOneAndUpdate({ studentId: r.studentId }, { $set: r }, { upsert: true });
  for (const rep of reportsList) await AcademicReport.findOneAndUpdate({ studentId: rep.studentId }, { $set: rep }, { upsert: true });

  await ErpSyncLog.create({
    syncId: `sync_${Date.now()}`,
    triggeredBy: "admin@school.edu",
    startTime: new Date(Date.now() - 5000),
    endTime: new Date(),
    durationMs: 5000,
    studentsAdded: rawStudents.length,
    studentsUpdated: 0,
    attendanceRecords: attendanceList.length,
    marksRecords: marksList.length,
    resultsRecords: resultsList.length,
    reportsGenerated: reportsList.length,
    status: "completed",
  });
  console.log(`✓ Seeded ERP (${rawStudents.length} Students, ${attendanceList.length} Attendance, ${marksList.length} Marks, ${reportsList.length} Reports)`);

  // 4. Seed Timetables
  console.log("\nSeeding Timetables...");
  const timetables = [
    { class: "CSDA Section A", subject: "Machine Learning", mentor: "Dr. Rajesh Kumar", day: "Monday", time: "09:30 AM - 10:30 AM", room: "Lab 3" },
    { class: "CSDA Section A", subject: "Data Analytics", mentor: "Prof. Priya Nair", day: "Monday", time: "10:45 AM - 11:45 AM", room: "Room 204" },
    { class: "CSDA Section A", subject: "Python Programming", mentor: "Dr. S. Vignesh", day: "Tuesday", time: "01:30 PM - 02:30 PM", room: "Lab 1" },
    { class: "CSDA Section A", subject: "DBMS", mentor: "Prof. K. Anand", day: "Wednesday", time: "11:00 AM - 12:00 PM", room: "Room 102" },
  ];
  for (const t of timetables) {
    await Timetable.findOneAndUpdate({ subject: t.subject, day: t.day, time: t.time }, { $set: t }, { upsert: true });
  }
  console.log(`✓ Seeded ${timetables.length} Timetable entries`);

  // 5. Seed Parent Alerts
  console.log("\nSeeding Parent Alerts...");
  const alerts = [
    { student_id: "DA2024001", parent_phone: "+91 9876543210", parent_email: "parent.arjun@example.com", alert_type: "Attendance Warning", message: "Ward attendance has dropped below 75% in Data Analytics.", risk_level: "High", sent_via: "SMS & Email", is_read: false },
    { student_id: "DA2024002", parent_phone: "+91 9876543211", parent_email: "parent.vikram@example.com", alert_type: "Academic Risk Alert", message: "Ward scored below 40% in CIA 1 Exam.", risk_level: "Critical", sent_via: "SMS & Email", is_read: false },
  ];
  for (const a of alerts) {
    await ParentAlert.findOneAndUpdate({ student_id: a.student_id, alert_type: a.alert_type }, { $set: a }, { upsert: true });
  }
  console.log(`✓ Seeded ${alerts.length} Parent Alerts`);

  // 6. Seed Sessions
  console.log("\nSeeding Mentorship Sessions...");
  const sessions = [
    {
      title: "Mathematics & Calculus Revision Session",
      description: "Deep dive into Differential Calculus, Integration concepts, and practice problems for upcoming midterms.",
      date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
      time: "10:00 AM",
      youtubeUrl: "https://www.youtube.com/watch?v=WSpt44EZG1g",
      type: "mentor-student",
      status: "scheduled",
      createdBy: "admin",
      createdByName: "Admin User",
      assignedTo: [],
    },
    {
      title: "Data Structures & Algorithms - Trees & Graphs",
      description: "Comprehensive walkthrough of Binary Search Trees, BFS/DFS graph traversals and interview problem patterns.",
      date: new Date(Date.now() + 172800000).toISOString().split("T")[0],
      time: "02:00 PM",
      youtubeUrl: "https://www.youtube.com/watch?v=RBSGKlAnoiM",
      type: "group",
      status: "scheduled",
      createdBy: "mentor",
      createdByName: "Dr. Rajesh Verma",
      assignedTo: [],
    },
    {
      title: "1-on-1 Academic Counseling & Study Plan",
      description: "Personalized mentorship discussion to address attendance, internal mark improvements, and study schedule optimization.",
      date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
      time: "11:30 AM",
      youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      type: "counseling",
      status: "completed",
      createdBy: "mentor",
      createdByName: "Dr. Rajesh Verma",
      assignedTo: [],
    },
  ];
  for (const s of sessions) {
    await Session.findOneAndUpdate({ title: s.title }, { $set: s }, { upsert: true });
  }
  console.log(`✓ Seeded ${sessions.length} Mentorship Sessions`);

  // 7. Seed Contact Inquiries
  console.log("\nSeeding Contact Inquiries...");
  const sampleInquiries = [
    {
      name: "Dr. K. Raman",
      email: "raman.k@kprcas.ac.in",
      department: "Computer Science & Engineering",
      message: "Requesting batch sync setup for Semester 6 attendance and internal assessment 2 marks.",
      service: "ERP Live Sync Setup",
      status: "responded",
    },
    {
      name: "Mrs. Meena Sundaram",
      email: "meena.parent@gmail.com",
      department: "Information Technology",
      message: "Inquiring about the parent alert notification system for upcoming mid-term results.",
      service: "Parent Alert System",
      status: "new",
    },
  ];
  for (const inq of sampleInquiries) {
    await ContactInquiry.findOneAndUpdate({ email: inq.email, message: inq.message }, { $set: inq }, { upsert: true });
  }
  console.log(`✓ Seeded ${sampleInquiries.length} Inquiries`);

  // 8. Seed Newsletter Subscribers
  console.log("\nSeeding Newsletter Subscribers...");
  const subscribersList = ["principal@kprcas.ac.in", "mentorship@kprcas.ac.in"];
  for (const subEmail of subscribersList) {
    await NewsletterSubscriber.findOneAndUpdate({ email: subEmail }, { $set: { email: subEmail, subscribedAt: new Date() } }, { upsert: true });
  }
  console.log(`✓ Seeded ${subscribersList.length} Newsletter Subscribers`);

  console.log("\n==========================================");
  console.log("🎉 ALL DEMO DATA SUCCESSFULLY SEEDED INTO MONGODB!");
  console.log("==========================================");
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
