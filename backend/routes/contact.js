import { Router } from "express";
import mongoose from "mongoose";

const router = Router();
const isMongoConnected = () => mongoose.connection.readyState === 1;

// In-memory store for contact inquiries and demo requests
const inquiries = [
  {
    id: "inq_1",
    name: "Dr. K. Raman",
    email: "raman.k@kprcas.ac.in",
    department: "Computer Science & Engineering",
    message: "Requesting batch sync setup for Semester 6 attendance and internal assessment 2 marks.",
    service: "ERP Live Sync Setup",
    status: "responded",
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: "inq_2",
    name: "Mrs. Meena Sundaram",
    email: "meena.parent@gmail.com",
    department: "Information Technology",
    message: "Inquiring about the parent alert notification system for upcoming mid-term results.",
    service: "Parent Alert System",
    status: "new",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  }
];

const subscribers = new Set(["principal@kprcas.ac.in", "mentorship@kprcas.ac.in"]);

// KPRCAS EduGuard dynamic metadata
const kprData = {
  institution: "KPR College of Arts and Science (KPRCAS)",
  motto: "LEARN BEYOND",
  systemName: "EduGuard Dropout Prevention System",
  stats: [
    { label: "Students Monitored", value: "2,400+", change: "Active KPR Cohorts" },
    { label: "Dropouts Prevented", value: "340+", change: "Timely Interventions" },
    { label: "ML Prediction Accuracy", value: "94.8%", change: "KNN & Random Forest" },
    { label: "Parent Alerts Sent", value: "1,850+", change: "Instant SMS/Email" },
  ],
  modules: [
    {
      id: "risk-engine",
      number: "01",
      title: "ML RISK ENGINE",
      subtitle: "Predictive Dropout Probability Algorithm",
      category: "Machine Learning",
      tags: ["KNN Classifier", "Attendance Matrix", "Grade Trajectory"],
      description: "Proprietary multi-tier predictive model that evaluates attendance drop velocity, internal test fluctuations, and assignment submissions to compute a real-time Risk Index (0-100%).",
      impact: "Identified 94% of at-risk students at least 3 weeks before mid-semester examinations.",
      stats: { accuracy: "94.8%", latency: "< 35ms", monitored: "2,400+" },
      color: "from-purple-500/20 to-pink-500/10",
      featured: true,
    },
    {
      id: "erp-sync",
      number: "02",
      title: "ERP SYNC ENGINE",
      subtitle: "Unified Academic & Attendance Importer",
      category: "System Integration",
      tags: ["Auto Ingestion", "KPR ERP API", "Bi-directional"],
      description: "Direct integration pipeline syncing daily attendance percentages, CIA 1/2 marks, semester SGPA/CGPA, and arrears history directly into centralized faculty dashboards.",
      impact: "Eliminated manual record checking across 12 academic departments.",
      stats: { syncRate: "100%", departments: "12", timeSaved: "18 hrs/wk" },
      color: "from-pink-500/20 to-purple-500/10",
      featured: true,
    },
    {
      id: "parent-alert",
      number: "03",
      title: "PARENT ALERT AI",
      subtitle: "Automated Early Warning Notification Hub",
      category: "Early Intervention",
      tags: ["SMS Broadcast", "WhatsApp Bot", "Counseling Escalation"],
      description: "Instant dispatch system that notifies parents when attendance falls below the mandatory 75% threshold or when sudden score regressions are detected.",
      impact: "Increased parent-mentor counseling attendance by 78% across high-risk student cohorts.",
      stats: { delivered: "99.4%", responseRate: "82%", alerts: "1,850+" },
      color: "from-violet-500/20 to-fuchsia-500/10",
      featured: true,
    }
  ],
  capabilities: [
    {
      id: "attendance-tracking",
      title: "Attendance Anomaly Detection",
      description: "Instantly flags sudden absentee streaks and warns mentors before students fall below university eligibility limits.",
      icon: "Clock",
      features: ["75% university eligibility radar", "Consecutive absence triggers", "Biometric & ERP sync"]
    },
    {
      id: "marks-analytics",
      title: "Internal Assessment Forecasting",
      description: "Analyzes continuous assessment trends to forecast final semester pass probabilities and subject-level stress.",
      icon: "TrendingUp",
      features: ["CIA mark drop alarms", "Subject vulnerability matrix", "Historical grade curve comparison"]
    },
    {
      id: "mentorship-hub",
      title: "1-on-1 Mentorship Counseling",
      description: "Empowers faculty mentors with comprehensive student dossiers, scheduled counseling logs, and curated YouTube study resources.",
      icon: "Users",
      features: ["Assigned student dashboards", "Counseling progress notes", "Remedial video masterclasses"]
    },
    {
      id: "parent-engagement",
      title: "Multichannel Parent Bridge",
      description: "Keeps parents informed with transparent, automated alerts regarding student attendance, test results, and fee notices.",
      icon: "ShieldAlert",
      features: ["Automated SMS delivery", "One-click parent call logging", "Multilingual notification templates"]
    }
  ],
  process: [
    { step: "01", name: "DATA INGESTION", desc: "Automated sync of attendance logs, CIA marks, and student profiles from KPRCAS ERP." },
    { step: "02", name: "AI RISK MODELING", desc: "KNN & weighted risk algorithms compute composite vulnerability scores for every student." },
    { step: "03", name: "RISK TIERING", desc: "Categorizes students into High Risk (🔴), Medium Risk (🟡), and Low Risk (🟢) cohorts." },
    { step: "04", name: "EARLY INTERVENTION", desc: "Triggers automated parent SMS alerts and assigns dedicated mentor counseling sessions." },
    { step: "05", name: "RECOVERY & RETENTION", desc: "Tracks weekly recovery metrics, remedial session attendance, and academic turnaround." }
  ],
  testimonials: [
    {
      id: "t1",
      quote: "EduGuard detected 42 students at risk in our department 3 weeks before finals. With targeted mentoring, every single student cleared the semester!",
      name: "Dr. Rajesh Verma",
      role: "Head of Mentorship, KPRCAS",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
    },
    {
      id: "t2",
      quote: "The personalized counseling and video revision sessions helped me identify weak spots in Calculus and bring my attendance back above 88%.",
      name: "Arjun Patel",
      role: "Final Year Student, KPRCAS",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
    },
    {
      id: "t3",
      quote: "Receiving timely SMS updates about internal mark drops allowed us to support our child from home before any serious academic consequence occurred.",
      name: "Mr. S. Patel",
      role: "Parent, KPRCAS Cohort",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80"
    }
  ]
};

// GET /api/landing/data
router.get("/data", (req, res) => {
  res.json(kprData);
});

// POST /api/contact
router.post("/", async (req, res) => {
  try {
    const { name, email, department, message, service } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: "Name, email, and message are required fields." });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanMsg = message.trim();
    const selectedDept = department || "Computer Science";
    const selectedService = service || "Dropout Early Warning Inquiry";

    const inquiry = {
      id: "inq_" + Date.now(),
      name: cleanName,
      email: cleanEmail,
      department: selectedDept,
      message: cleanMsg,
      service: selectedService,
      status: "new",
      createdAt: new Date().toISOString(),
    };

    inquiries.unshift(inquiry);

    return res.status(201).json({
      success: true,
      message: "Inquiry received! The KPRCAS EduGuard administration team will follow up shortly.",
      inquiryId: inquiry.id,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to submit inquiry. Please try again." });
  }
});

// GET /api/contact
router.get("/", (req, res) => {
  res.json(inquiries);
});

// POST /api/newsletter
router.post("/newsletter", (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes("@")) {
      return res.status(400).json({ error: "Please provide a valid email address." });
    }
    const cleanEmail = email.trim().toLowerCase();
    subscribers.add(cleanEmail);
    res.json({ success: true, message: "Subscribed to KPRCAS EduGuard academic updates!" });
  } catch (err) {
    res.status(500).json({ error: "Subscription failed." });
  }
});

export default router;
