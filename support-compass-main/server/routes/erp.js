import { Router } from "express";
import mongoose from "mongoose";
import { verifyToken } from "../middleware/auth.js";
import ErpStudent from "../models/ErpStudent.js";
import Attendance from "../models/Attendance.js";
import InternalMarks from "../models/InternalMarks.js";
import SemesterResult from "../models/SemesterResult.js";
import AcademicReport from "../models/AcademicReport.js";
import ErpSyncLog from "../models/ErpSyncLog.js";

const router = Router();

function isMongoConnected() {
  return mongoose.connection.readyState === 1;
}

// ─────────────────────────────────────────────────────────────────────────────
// IN-MEMORY STORE (used when MongoDB is unavailable)
// ─────────────────────────────────────────────────────────────────────────────
const mem = {
  students: [],
  attendance: [],
  internalMarks: [],
  semesterResults: [],
  reports: [],
  logs: [],
};

function memFind(collection, filter = {}) {
  return mem[collection].filter((item) => {
    return Object.entries(filter).every(([key, val]) => {
      if (val && typeof val === "object" && val.$regex) {
        return new RegExp(val.$regex, val.$options || "").test(item[key] || "");
      }
      if (val && typeof val === "object" && val.$in) {
        return val.$in.includes(item[key]);
      }
      if (val !== undefined && val !== null && typeof val !== "object") {
        return item[key] === val;
      }
      return true;
    });
  });
}

function memUpsert(collection, filter, data) {
  const idx = mem[collection].findIndex((item) => {
    return Object.entries(filter).every(([key, val]) => item[key] === val);
  });
  if (idx >= 0) {
    mem[collection][idx] = { ...mem[collection][idx], ...data };
  } else {
    mem[collection].push({ _id: `mem_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, ...data, ...filter });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MASTER STUDENT DATABASE
// ─────────────────────────────────────────────────────────────────────────────
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

const DATA_ANALYTICS_SUBJECTS = [
  "Programming in Java", "Python Programming", "DBMS", "Operating System",
  "Computer Networks", "Machine Learning", "Statistics", "Data Analytics",
  "Cloud Computing", "Artificial Intelligence", "Mini Project",
];

const ADVISORS = ["Dr. Rajesh Kumar", "Prof. Priya Nair", "Dr. S. Vignesh", "Prof. K. Anand"];

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFloat = (min, max, decimals = 2) =>
  parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
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

// ─────────────────────────────────────────────────────────────────────────────
// FAKE DATA GENERATORS
// ─────────────────────────────────────────────────────────────────────────────

function generateStudentsList() {
  return STUDENT_NAMES.map((name, i) => {
    const studentId = `DA${String(2024001 + i)}`;
    const registerNo = `211322105${String(i + 1).padStart(3, "0")}`;
    const rollNo = `21DA${String(i + 1).padStart(2, "0")}`;
    const email = `${name.toLowerCase().replace(/\s+/g, ".")}@college.edu`;
    const advisor = ADVISORS[i % ADVISORS.length];
    return {
      studentId, registerNo, rollNo, name,
      gender: i % 2 === 0 ? "Male" : "Female",
      dob: `2003-${String(rand(1, 12)).padStart(2, "0")}-${String(rand(1, 28)).padStart(2, "0")}`,
      department: "Computer Science with Data Analytics",
      year: 3, semester: 6, section: "A",
      parentName: `${name.split(" ")[0]} Parent`,
      parentPhone: `+91${rand(6000000000, 9999999999)}`,
      email,
      bloodGroup: pickOne(["O+", "A+", "B+", "AB+", "O-", "A-"]),
      address: "Coimbatore, Tamil Nadu, India",
      advisor,
      riskLevel: "Very Low",
    };
  });
}

function generateAttendanceForStudent(studentId) {
  const workingDays = 90;
  const medicalLeave = rand(0, 5);
  const od = rand(0, 3);
  const lateEntry = rand(0, 6);
  const absentDays = rand(0, 15);
  const presentDays = workingDays - absentDays;
  const attendancePercentage = parseFloat(((presentDays / workingDays) * 100).toFixed(2));
  return { studentId, workingDays, presentDays, absentDays, medicalLeave, od, lateEntry, attendancePercentage };
}

function generateInternalMarksForStudent(studentId) {
  return DATA_ANALYTICS_SUBJECTS.map((subjectName) => {
    const cia1 = rand(10, 20);
    const cia2 = rand(10, 20);
    const assignment1 = rand(5, 10);
    const assignment2 = rand(5, 10);
    const quiz = rand(5, 10);
    const seminar = rand(5, 10);
    const lab = rand(12, 20);
    const modelExam = rand(45, 100);
    const attendanceMark = rand(3, 5);
    const internalTotal = cia1 + cia2 + assignment1 + assignment2 + quiz + seminar + lab + Math.round(modelExam * 0.2) + attendanceMark;
    const maxTotal = 115;
    const internalPercentage = parseFloat(((internalTotal / maxTotal) * 100).toFixed(2));
    const grade = calcGrade(internalPercentage);
    return { studentId, subjectName, cia1, cia2, assignment1, assignment2, quiz, seminar, lab, modelExam, attendanceMark, internalTotal, internalPercentage, grade };
  });
}

function generateSemesterResultForStudent(studentId, marksList) {
  let totalGradePoints = 0;
  let totalCredits = 0;
  let backlogs = 0;
  const subjects = marksList.map((m) => {
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
  return { studentId, subjects, gpa, cgpa: Math.min(cgpa, 10), backlogs };
}

// ─────────────────────────────────────────────────────────────────────────────
// DB OR MEMORY OPERATIONS
// ─────────────────────────────────────────────────────────────────────────────
async function dbOrMemfindOne(collection, filter) {
  if (isMongoConnected()) {
    const ModelMap = { students: ErpStudent, attendance: Attendance, internalMarks: InternalMarks, semesterResults: SemesterResult, reports: AcademicReport, logs: ErpSyncLog };
    const Model = ModelMap[collection];
    if (Model) return Model.findOne(filter).lean().exec();
  }
  return memFind(collection, filter)[0] || null;
}

async function dbOrMemfind(collection, filter = {}, opts = {}) {
  if (isMongoConnected()) {
    const ModelMap = { students: ErpStudent, attendance: Attendance, internalMarks: InternalMarks, semesterResults: SemesterResult, reports: AcademicReport, logs: ErpSyncLog };
    const Model = ModelMap[collection];
    if (Model) {
      let q = Model.find(filter);
      if (opts.sort) q = q.sort(opts.sort);
      if (opts.skip) q = q.skip(opts.skip);
      if (opts.limit) q = q.limit(opts.limit);
      if (opts.lean) q = q.lean();
      return q.exec();
    }
  }
  let results = memFind(collection, filter);
  if (opts.sort) {
    const [key, dir] = Object.entries(opts.sort)[0];
    results.sort((a, b) => dir === -1 ? (b[key] ?? 0) - (a[key] ?? 0) : (a[key] ?? 0) - (b[key] ?? 0));
  }
  if (opts.skip) results = results.slice(opts.skip);
  if (opts.limit) results = results.slice(0, opts.limit);
  return results;
}

async function dbOrMemCount(collection, filter = {}) {
  if (isMongoConnected()) {
    const ModelMap = { students: ErpStudent, attendance: Attendance, internalMarks: InternalMarks, semesterResults: SemesterResult, reports: AcademicReport, logs: ErpSyncLog };
    const Model = ModelMap[collection];
    if (Model) return Model.countDocuments(filter).exec();
  }
  return memFind(collection, filter).length;
}

async function dbOrMemUpsert(collection, filter, data) {
  if (isMongoConnected()) {
    const ModelMap = { students: ErpStudent, attendance: Attendance, internalMarks: InternalMarks, semesterResults: SemesterResult, reports: AcademicReport, logs: ErpSyncLog };
    const Model = ModelMap[collection];
    if (Model) return Model.findOneAndUpdate(filter, { $set: data }, { upsert: true }).lean().exec();
  }
  memUpsert(collection, filter, data);
}

// ─────────────────────────────────────────────────────────────────────────────
// FAKE ERP ENDPOINTS (no auth needed)
// ─────────────────────────────────────────────────────────────────────────────

router.get("/fake-erp/students", (req, res) => {
  const data = generateStudentsList();
  res.json({ success: true, count: data.length, data });
});

router.get("/fake-erp/attendance", (req, res) => {
  const list = generateStudentsList();
  const data = list.map((s) => generateAttendanceForStudent(s.studentId));
  res.json({ success: true, count: data.length, data });
});

router.get("/fake-erp/internalmarks", (req, res) => {
  const list = generateStudentsList();
  const data = list.flatMap((s) => generateInternalMarksForStudent(s.studentId));
  res.json({ success: true, count: data.length, data });
});

router.get("/fake-erp/semesterresults", (req, res) => {
  const list = generateStudentsList();
  const data = list.map((s) => {
    const marks = generateInternalMarksForStudent(s.studentId);
    return generateSemesterResultForStudent(s.studentId, marks);
  });
  res.json({ success: true, count: data.length, data });
});

router.get("/fake-erp/subjects", (req, res) => {
  const data = DATA_ANALYTICS_SUBJECTS.map((name, i) => ({ code: `DA60${i + 1}`, name, credits: 3 }));
  res.json({ success: true, count: data.length, data });
});

router.get("/fake-erp/internal-marks", (req, res) => {
  const list = generateStudentsList();
  const data = list.flatMap((s) => generateInternalMarksForStudent(s.studentId));
  res.json({ success: true, count: data.length, data });
});

router.get("/fake-erp/semester-results", (req, res) => {
  const list = generateStudentsList();
  const data = list.map((s) => {
    const marks = generateInternalMarksForStudent(s.studentId);
    return generateSemesterResultForStudent(s.studentId, marks);
  });
  res.json({ success: true, count: data.length, data });
});

router.get("/fake-erp/departments", (req, res) => {
  res.json({
    success: true,
    data: [
      { id: "DA", name: "Computer Science with Data Analytics", code: "CSDA" },
      { id: "CSE", name: "Computer Science and Engineering", code: "CSE" },
      { id: "ECE", name: "Electronics and Communication Engineering", code: "ECE" },
      { id: "EEE", name: "Electrical and Electronics Engineering", code: "EEE" },
      { id: "MECH", name: "Mechanical Engineering", code: "MECH" },
      { id: "IT", name: "Information Technology", code: "IT" },
      { id: "AIDS", name: "AI and Data Science", code: "AIDS" },
      { id: "AIML", name: "AI and Machine Learning", code: "AIML" },
    ],
  });
});

router.get("/fake-erp/class-advisors", (req, res) => {
  res.json({
    success: true,
    data: ADVISORS.map((name, i) => ({
      id: `ADV${i + 1}`, name,
      department: "Computer Science with Data Analytics",
      section: "A",
      email: `${name.toLowerCase().replace(/\s+/g, ".")}@college.edu`,
    })),
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ERP SYNC — writes to DB (or memory fallback) + builds reports
// ─────────────────────────────────────────────────────────────────────────────

function buildSyncData() {
  const rawStudents = generateStudentsList();
  const attendanceList = rawStudents.map((s) => generateAttendanceForStudent(s.studentId));
  const marksMap = {};
  rawStudents.forEach((s) => { marksMap[s.studentId] = generateInternalMarksForStudent(s.studentId); });
  const resultsList = rawStudents.map((s) => generateSemesterResultForStudent(s.studentId, marksMap[s.studentId]));

  const reportsList = rawStudents.map((s, i) => {
    const att = attendanceList[i];
    const marks = marksMap[s.studentId];
    const result = resultsList[i];
    const attendancePct = att.attendancePercentage;
    const internalPct = marks.length > 0 ? marks.reduce((sum, m) => sum + m.internalPercentage, 0) / marks.length : 0;
    const semesterPct = result.gpa > 0 ? (result.gpa / 10) * 100 : 0;
    const overallScore = parseFloat(((attendancePct * 0.35) + (internalPct * 0.35) + (semesterPct * 0.3)).toFixed(2));
    const riskCategory = calcRiskLevel(overallScore);
    const failProbability = parseFloat((Math.max(0, (80 - overallScore) / 80).toFixed(2)));
    const weakSubjects = marks.filter((m) => m.internalPercentage < 50).map((m) => m.subjectName);
    const strongSubjects = marks.filter((m) => m.internalPercentage >= 80).map((m) => m.subjectName);

    return {
      studentId: s.studentId, studentName: s.name, overallScore,
      attendanceScore: attendancePct, marksScore: internalPct, performanceScore: semesterPct,
      learningTrend: overallScore >= 75 ? "Improving" : overallScore >= 60 ? "Stable" : "Declining",
      improvementPct: randFloat(-5, 12), consistency: randFloat(60, 95),
      riskScore: Math.round(failProbability * 100),
      performanceIndex: parseFloat((overallScore * 0.85).toFixed(2)),
      weakSubjects, strongSubjects, riskCategory,
      recommendations: {
        teacher: [overallScore < 50 ? "Recommend remedial sessions." : "Encourage advanced research projects."],
        parent: [attendancePct < 75 ? "Ensure ward attends all CIA coaching reviews." : "Satisfactory progress."],
        student: [weakSubjects.length > 0 ? `Focus more on ${weakSubjects.join(", ")}.` : "Maintain data analytics skill levels."],
        ai: ["Participate in peer learning networks.", "Focus on model evaluation in data science courses."],
      },
      dropoutRiskFeatures: {
        attendancePct, ciaTotal: internalPct, semesterMarks: semesterPct,
        backlogs: result.backlogs || 0, cgpa: result.cgpa || 0,
        assignmentPerformance: randFloat(60, 95), performanceTrend: randFloat(-3, 8),
        attendanceTrend: randFloat(-4, 5), lateAttendance: att.lateEntry || 0, medicalLeave: att.medicalLeave || 0,
      },
    };
  });

  reportsList.sort((a, b) => b.overallScore - a.overallScore);
  reportsList.forEach((r, i) => { r.studentRanking = i + 1; });
  rawStudents.forEach((s, i) => {
    s.riskLevel = reportsList[i].riskCategory;
  });

  return { rawStudents, attendanceList, marksMap, resultsList, reportsList };
}

router.post("/erp/sync", verifyToken, async (req, res) => {
  const startTime = new Date();
  try {
    const { rawStudents, attendanceList, marksMap, resultsList, reportsList } = buildSyncData();

    if (isMongoConnected()) {
      for (const s of rawStudents) {
        await ErpStudent.findOneAndUpdate({ studentId: s.studentId }, { $set: s }, { upsert: true });
      }
      for (const att of attendanceList) {
        await Attendance.findOneAndUpdate({ studentId: att.studentId }, { $set: att }, { upsert: true });
      }
      for (const marks of Object.values(marksMap)) {
        for (const m of marks) {
          await InternalMarks.findOneAndUpdate({ studentId: m.studentId, subjectName: m.subjectName }, { $set: m }, { upsert: true });
        }
      }
      for (const r of resultsList) {
        await SemesterResult.findOneAndUpdate({ studentId: r.studentId }, { $set: r }, { upsert: true });
      }
      for (const rep of reportsList) {
        await AcademicReport.findOneAndUpdate({ studentId: rep.studentId }, { $set: rep }, { upsert: true });
      }
    } else {
      mem.students = rawStudents;
      mem.attendance = attendanceList;
      mem.internalMarks = Object.values(marksMap).flat();
      mem.semesterResults = resultsList;
      mem.reports = reportsList;
    }

    const endTime = new Date();
    const durationMs = endTime - startTime;

    const logEntry = {
      syncId: `sync_${Date.now()}`,
      triggeredBy: req.user?.email || "admin",
      startTime, endTime, durationMs,
      studentsAdded: rawStudents.length,
      studentsUpdated: 0,
      attendanceRecords: rawStudents.length,
      marksRecords: rawStudents.length * DATA_ANALYTICS_SUBJECTS.length,
      resultsRecords: rawStudents.length,
      reportsGenerated: rawStudents.length,
      status: "completed",
    };
    mem.logs.unshift(logEntry);
    if (isMongoConnected()) {
      await ErpSyncLog.create(logEntry);
    }

    res.json({
      success: true,
      studentsAdded: rawStudents.length,
      studentsUpdated: 0,
      attendanceRecords: rawStudents.length,
      marksRecords: rawStudents.length * DATA_ANALYTICS_SUBJECTS.length,
      resultsRecords: rawStudents.length,
      reportsGenerated: rawStudents.length,
      duration: `${(durationMs / 1000).toFixed(1)}s`,
      lastSyncTime: endTime,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// ERP READ ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────────

router.get("/erp/dashboard", verifyToken, async (req, res) => {
  try {
    const total = await dbOrMemCount("students");
    const reports = await dbOrMemfind("reports");
    const results = await dbOrMemfind("semesterResults");

    const avgAttendance = reports.length
      ? parseFloat((reports.reduce((s, r) => s + r.attendanceScore, 0) / reports.length).toFixed(2)) : 0;
    const avgCia = reports.length
      ? parseFloat((reports.reduce((s, r) => s + r.marksScore, 0) / reports.length).toFixed(2)) : 0;
    const avgGpa = results.length
      ? parseFloat((results.reduce((s, r) => s + r.gpa, 0) / results.length).toFixed(2)) : 0;
    const avgCgpa = results.length
      ? parseFloat((results.reduce((s, r) => s + r.cgpa, 0) / results.length).toFixed(2)) : 0;

    const highRiskCount = (await dbOrMemfind("students")).filter((s) => ["High", "Critical"].includes(s.riskLevel)).length;
    const top10 = reports.slice().sort((a, b) => b.overallScore - a.overallScore).slice(0, 10);
    const lowPerf = reports.slice().sort((a, b) => a.overallScore - b.overallScore).slice(0, 10);
    const lastLog = mem.logs[0] || null;

    const syncedToday = mem.logs.filter((l) => {
      const d = new Date(l.startTime);
      const now = new Date();
      return d.toDateString() === now.toDateString();
    }).length;

    res.json({
      success: true,
      data: {
        totalStudents: total,
        syncedToday,
        avgAttendance, avgCia, avgGpa, avgCgpa,
        highRisk: highRiskCount,
        top10, lowPerf,
        pendingSync: total === 0,
        lastSync: lastLog ? { time: lastLog.endTime, duration: lastLog.durationMs } : null,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/erp/academic-records", verifyToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const skip = (page - 1) * limit;

    let allStudents = await dbOrMemfind("students");

    if (req.query.search) {
      const re = new RegExp(req.query.search, "i");
      allStudents = allStudents.filter((s) => re.test(s.name));
    }
    if (req.query.risk) {
      allStudents = allStudents.filter((s) => s.riskLevel === req.query.risk);
    }

    const total = allStudents.length;
    const paged = allStudents.slice(skip, skip + limit);

    const allReports = await dbOrMemfind("reports");
    const allResults = await dbOrMemfind("semesterResults");

    const enriched = paged.map((s) => {
      const report = allReports.find((r) => r.studentId === s.studentId) || null;
      const result = allResults.find((r) => r.studentId === s.studentId) || null;
      return {
        ...s,
        markScore: report?.marksScore ?? 0,
        report,
        result: result ? { ...result, arrears: result.backlogs || 0 } : null,
      };
    });

    res.json({ success: true, data: enriched, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/erp/attendance-records", verifyToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const skip = (page - 1) * limit;

    let allAtt = await dbOrMemfind("attendance");
    const allStudents = await dbOrMemfind("students");

    if (req.query.search) {
      const re = new RegExp(req.query.search, "i");
      const matchIds = allStudents.filter((s) => re.test(s.name)).map((s) => s.studentId);
      allAtt = allAtt.filter((a) => matchIds.includes(a.studentId));
    }

    const total = allAtt.length;
    const paged = allAtt.slice(skip, skip + limit);

    const enriched = paged.map((a) => {
      const student = allStudents.find((s) => s.studentId === a.studentId) || null;
      return { ...a, student: student ? { name: student.name, department: student.department, year: student.year, section: student.section, rollNo: student.rollNo, advisor: student.advisor } : null };
    });

    res.json({ success: true, data: enriched, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/erp/internal-marks", verifyToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const skip = (page - 1) * limit;

    let allMarks = await dbOrMemfind("internalMarks");
    const allStudents = await dbOrMemfind("students");

    if (req.query.search) {
      const re = new RegExp(req.query.search, "i");
      allMarks = allMarks.filter((m) => re.test(m.subjectName));
    }

    const total = allMarks.length;
    const paged = allMarks.slice(skip, skip + limit);

    const enriched = paged.map((r) => {
      const student = allStudents.find((s) => s.studentId === r.studentId) || null;
      const allStudentMarks = allMarks.filter((m) => m.studentId === r.studentId).sort((a, b) => b.internalPercentage - a.internalPercentage);
      const rank = allStudentMarks.findIndex((m) => m.subjectName === r.subjectName) + 1;
      const subjectIdx = DATA_ANALYTICS_SUBJECTS.indexOf(r.subjectName);
      return {
        ...r,
        subjectCode: `DA60${subjectIdx >= 0 ? subjectIdx + 1 : 1}`,
        semester: 6,
        assignment: (r.assignment1 || 0) + (r.assignment2 || 0),
        practical: r.lab || 0,
        miniProject: r.modelExam || 0,
        average: r.internalPercentage || 0,
        percentage: r.internalPercentage || 0,
        riskLevel: student?.riskLevel || "Medium",
        rank,
        student: student ? { name: student.name, department: student.department, year: student.year, semester: student.semester, section: student.section, rollNo: student.rollNo, riskLevel: student.riskLevel } : null,
      };
    });

    res.json({ success: true, data: enriched, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/erp/semester-results", verifyToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const skip = (page - 1) * limit;

    let allResults = await dbOrMemfind("semesterResults");
    const allStudents = await dbOrMemfind("students");

    if (req.query.semester) {
      allResults = allResults.filter(() => true);
    }

    const total = allResults.length;
    const paged = allResults.slice(skip, skip + limit);

    const enriched = paged.map((r) => {
      const student = allStudents.find((s) => s.studentId === r.studentId) || null;
      const subjects = (r.subjects || []).map((s, i) => ({
        ...s,
        subjectCode: `DA60${i + 1}`,
        gradePoints: s.gradePoint || 0,
      }));
      const failedSubjects = subjects.filter((s) => s.passFail === "Fail").map((s) => s.subjectName);
      const creditEarned = subjects.filter((s) => s.passFail === "Pass").reduce((sum, s) => sum + (s.credits || 3), 0);
      const totalCredits = subjects.reduce((sum, s) => sum + (s.credits || 3), 0);
      return {
        ...r,
        semester: student?.semester || 6,
        academicYear: "2024-2025",
        arrears: failedSubjects.length,
        failedSubjects, creditEarned, totalCredits,
        riskLevel: student?.riskLevel || "Medium",
        subjects,
        student: student ? { name: student.name, department: student.department, year: student.year } : null,
      };
    });

    res.json({ success: true, data: enriched, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/erp/reports", verifyToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const skip = (page - 1) * limit;

    let allReports = await dbOrMemfind("reports");

    if (req.query.category) {
      allReports = allReports.filter((r) => r.riskCategory === req.query.category);
    }
    if (req.query.search) {
      const re = new RegExp(req.query.search, "i");
      allReports = allReports.filter((r) => re.test(r.studentName));
    }

    const total = allReports.length;
    const paged = allReports.slice(skip, skip + limit);

    res.json({ success: true, data: paged, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/erp/sync-logs", verifyToken, async (req, res) => {
  try {
    const logs = mem.logs.slice(0, 50);
    res.json({ success: true, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/erp/analytics/:studentId", verifyToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = (await dbOrMemfind("students")).find((s) => s.studentId === studentId) || null;
    const report = (await dbOrMemfind("reports")).find((r) => r.studentId === studentId) || null;
    const attendance = (await dbOrMemfind("attendance")).find((a) => a.studentId === studentId) || null;
    const marks = (await dbOrMemfind("internalMarks")).filter((m) => m.studentId === studentId);
    const result = (await dbOrMemfind("semesterResults")).find((r) => r.studentId === studentId) || null;

    if (!student) return res.status(404).json({ success: false, error: "Student not found" });
    res.json({ success: true, data: { student, report, attendance, marks, result } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
