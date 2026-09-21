import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  ArrowRight,
  Sparkles,
  Search,
  Layers,
  Cpu,
  Heart,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  TrendingUp,
  Users,
  ShieldAlert,
  Shield,
  Zap,
  GraduationCap,
  Sliders,
  ChevronRight,
  Mail,
  MapPin,
  Phone,
  BarChart3,
  Calendar,
  Bell,
  BookOpen
} from "lucide-react";
import { api } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import kprLogo from "@/images/kpr logo.jpg";
import heroPortrait from "@/images/hero_portrait.jpg";
import portalArch from "@/images/portal_arch.jpg";

interface ModuleItem {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  category: string;
  tags: string[];
  description: string;
  impact: string;
  stats: { [key: string]: string };
  color: string;
  featured: boolean;
}

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Contact form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("Computer Science & Engineering");
  const [service, setService] = useState("Dropout Early Warning Inquiry");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formStatus, setFormStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Live Interactive Risk Calculator Widget state
  const [calcAttendance, setCalcAttendance] = useState(68);
  const [calcMarks, setCalcMarks] = useState(45);
  const [calcArrears, setCalcArrears] = useState(1);

  // Calculate dynamic simulated risk score
  const computedRisk = Math.min(
    100,
    Math.max(
      5,
      Math.round(
        (100 - calcAttendance) * 0.55 +
        (100 - calcMarks) * 0.35 +
        calcArrears * 10
      )
    )
  );

  const riskTier =
    computedRisk >= 70
      ? { label: "High Risk (Critical)", color: "text-red-400", bg: "bg-red-950/60 border-red-500/40", action: "Immediate Mentor & Parent SMS Required" }
      : computedRisk >= 40
      ? { label: "Medium Risk (Moderate)", color: "text-amber-400", bg: "bg-amber-950/60 border-amber-500/40", action: "Scheduled Counseling & Revision Support" }
      : { label: "Low Risk (Safe)", color: "text-emerald-400", bg: "bg-emerald-950/60 border-emerald-500/40", action: "Optimal Performance & Regular Tracking" };

  // Selected module modal
  const [selectedModule, setSelectedModule] = useState<ModuleItem | null>(null);
  const [activeProcessStep, setActiveProcessStep] = useState(0);

  // Dynamic portfolio data
  const [landingData, setLandingData] = useState<any>(null);

  useEffect(() => {
    api.getLandingData()
      .then((data) => setLandingData(data))
      .catch(() => setLandingData(null));
  }, []);

  const modules: ModuleItem[] = landingData?.modules || [
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
  ];

  const capabilities = [
    {
      id: "attendance-tracking",
      title: "Attendance Anomaly Detection",
      description: "Instantly flags sudden absentee streaks and warns mentors before students fall below university eligibility limits.",
      icon: Clock,
      tags: ["75% Threshold Radar", "Absence Streaks", "ERP Sync"]
    },
    {
      id: "marks-analytics",
      title: "Internal Assessment Forecasting",
      description: "Analyzes continuous assessment trends to forecast final semester pass probabilities and subject-level stress.",
      icon: TrendingUp,
      tags: ["CIA Score Alarms", "Subject Vulnerability", "Grade Curves"]
    },
    {
      id: "mentorship-hub",
      title: "1-on-1 Mentorship Counseling",
      description: "Empowers faculty mentors with comprehensive student dossiers, scheduled counseling logs, and curated revision video masterclasses.",
      icon: Users,
      tags: ["Assigned Cohorts", "Counseling Logs", "Study Videos"]
    },
    {
      id: "parent-engagement",
      title: "Multichannel Parent Bridge",
      description: "Keeps parents informed with transparent, automated alerts regarding student attendance, test results, and fee notices.",
      icon: ShieldAlert,
      tags: ["Instant SMS Alerts", "Call Logs", "Multilingual Support"]
    }
  ];

  const processSteps = landingData?.process || [
    { step: "01", name: "DATA INGESTION", desc: "Automated sync of attendance logs, CIA marks, and student profiles from KPRCAS ERP." },
    { step: "02", name: "AI RISK MODELING", desc: "KNN & weighted risk algorithms compute composite vulnerability scores for every student." },
    { step: "03", name: "RISK TIERING", desc: "Categorizes students into High Risk (🔴), Medium Risk (🟡), and Low Risk (🟢) cohorts." },
    { step: "04", name: "EARLY INTERVENTION", desc: "Triggers automated parent SMS alerts and assigns dedicated mentor counseling sessions." },
    { step: "05", name: "RECOVERY & RETENTION", desc: "Tracks weekly recovery metrics, remedial session attendance, and academic turnaround." }
  ];

  const testimonials = landingData?.testimonials || [
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
  ];

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus(null);
    if (!name.trim() || !email.trim() || !message.trim()) {
      setFormStatus({ type: "error", text: "Please fill in your name, email, and message." });
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.submitContact({
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
        service: `${department} - ${service}`,
      });
      setFormStatus({ type: "success", text: res.message || "Thank you! Your inquiry has been submitted." });
      setName("");
      setEmail("");
      setMessage("");
    } catch (err: any) {
      setFormStatus({ type: "error", text: err.message || "Failed to submit inquiry. Please try again." });
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#080511] text-slate-100 selection:bg-pink-500/30 selection:text-pink-200 relative overflow-x-hidden font-sans">
      
      {/* Dynamic Ambient Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-40 left-1/4 w-[650px] h-[650px] bg-purple-600/15 rounded-full blur-[160px] animate-pulse-glow" />
        <div className="absolute top-[40%] -right-40 w-[550px] h-[550px] bg-pink-600/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-20 left-10 w-[600px] h-[600px] bg-indigo-700/10 rounded-full blur-[180px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          1. NAVIGATION BAR
      ────────────────────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#080511]/85 border-b border-purple-500/15 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* KPRCAS Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/40 to-pink-500/40 rounded-xl blur-sm group-hover:opacity-100 opacity-70 transition-opacity" />
              <img
                src={kprLogo}
                alt="KPRCAS Logo"
                className="h-11 w-11 rounded-xl object-contain bg-white p-1 ring-2 ring-purple-400/50 relative shadow-md"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-extrabold text-xl tracking-wider text-white">
                  KPRCAS
                </span>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-400/30 text-[9px] uppercase tracking-wider text-purple-300 font-bold">
                  EduGuard
                </span>
              </div>
              <p className="text-[9px] uppercase tracking-[0.2em] text-pink-400/80 font-semibold -mt-0.5">
                LEARN BEYOND • DROPOUT PREDICTION
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-xs uppercase tracking-widest text-slate-300">
            <a href="#overview" className="hover:text-pink-400 transition-colors flex items-center gap-1.5 font-medium text-white">
              <span className="h-1.5 w-1.5 rounded-full bg-pink-400 shadow-[0_0_8px_#f472b6]" /> Overview
            </a>
            <a href="#calculator" className="hover:text-pink-400 transition-colors text-slate-400 hover:text-white">
              Risk Predictor
            </a>
            <a href="#modules" className="hover:text-pink-400 transition-colors text-slate-400 hover:text-white">
              AI Modules
            </a>
            <a href="#capabilities" className="hover:text-pink-400 transition-colors text-slate-400 hover:text-white">
              Features
            </a>
            <a href="#process" className="hover:text-pink-400 transition-colors text-slate-400 hover:text-white">
              Intervention
            </a>
            <a href="#testimonials" className="hover:text-pink-400 transition-colors text-slate-400 hover:text-white">
              Testimonials
            </a>
          </nav>

          {/* Action / Launch Portal */}
          <div className="flex items-center gap-3">
            {user ? (
              <Link
                to="/dashboard"
                className="px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-105 transition-all duration-300 flex items-center gap-2"
              >
                <Zap className="h-3.5 w-3.5 fill-current" /> Open Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/auth"
                  className="hidden sm:inline-flex px-4 py-2 rounded-full text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 border border-purple-500/25 transition-all duration-200"
                >
                  Faculty Sign In
                </Link>
                <Link
                  to="/auth"
                  className="px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-gradient-to-r from-purple-600 via-pink-600 to-pink-500 hover:opacity-90 text-white shadow-lg shadow-pink-500/20 hover:shadow-pink-500/35 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 border border-pink-400/30 flex items-center gap-1.5"
                >
                  <GraduationCap className="h-3.5 w-3.5" /> Launch Portal
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ──────────────────────────────────────────────────────────────────────────
          2. HERO SECTION
      ────────────────────────────────────────────────────────────────────────── */}
      <section id="overview" className="relative pt-12 pb-20 md:pt-16 md:pb-28 z-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-6 space-y-7">
            
            {/* Top Pill Tag */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 text-xs tracking-widest uppercase font-medium backdrop-blur-md shadow-sm"
            >
              <span className="w-2 h-2 rounded-full bg-pink-400 animate-ping" />
              | KPRCAS AI-POWERED STUDENT SUCCESS PLATFORM |
            </motion.div>

            {/* Display Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl font-display font-extrabold leading-[1.12] tracking-tight text-white"
            >
              Predicting dropout risk <br />
              before it{" "}
              <span className="italic font-serif font-normal text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-300 to-indigo-300 drop-shadow-[0_0_35px_rgba(236,72,153,0.35)]">
                shapes futures.
              </span>
            </motion.h1>

            {/* Subtext */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg text-slate-300/85 leading-relaxed max-w-xl font-light"
            >
              Empowering KPRCAS educators and mentors with real-time ML risk scoring, automated parent alert dispatches, and deep ERP academic integration to ensure zero student dropouts.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap items-center gap-4 pt-1"
            >
              <Link
                to="/auth"
                className="px-8 py-3.5 rounded-full text-sm font-semibold tracking-wide uppercase bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:from-pink-400 hover:to-indigo-500 text-white shadow-xl shadow-pink-500/25 hover:shadow-pink-500/40 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-2 group"
              >
                Launch EduGuard Portal
                <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>

              <a
                href="#calculator"
                className="px-7 py-3.5 rounded-full text-sm font-medium tracking-wide uppercase bg-[#140f26]/80 hover:bg-[#1c1536] text-slate-200 border border-purple-500/25 hover:border-purple-400/50 backdrop-blur-md transition-all duration-300 flex items-center gap-2 shadow-lg"
              >
                <Sliders className="h-4 w-4 text-pink-400" /> Test Risk Predictor
              </a>
            </motion.div>

            {/* Monitoring Status Badge */}
            <div className="flex items-center gap-3 pt-2 text-xs text-slate-400">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-pink-500"></span>
              </span>
              <div>
                <span className="text-pink-300 font-semibold uppercase tracking-wider">ACTIVE KPRCAS MONITORING</span>
                <p className="text-slate-400 text-[11px]">2,400+ students protected across 12 departments</p>
              </div>
            </div>
          </div>

          {/* Hero Right Visual Showcase (Matching Reference Layout) */}
          <div className="lg:col-span-6 relative flex items-center justify-center">
            
            {/* Luminous Center Ring Glow */}
            <div className="absolute w-[360px] sm:w-[460px] h-[360px] sm:h-[460px] rounded-full border border-pink-500/30 bg-gradient-to-tr from-purple-600/20 via-pink-500/10 to-transparent blur-sm pointer-events-none animate-pulse-glow" />
            <div className="absolute w-[300px] sm:w-[380px] h-[300px] sm:h-[380px] rounded-full border-2 border-pink-400/40 shadow-[0_0_60px_rgba(244,114,182,0.35)] pointer-events-none" />

            {/* Main Center Mask Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative z-10 w-[300px] sm:w-[390px] h-[300px] sm:h-[390px] rounded-full overflow-hidden border-4 border-purple-500/30 shadow-[0_0_80px_rgba(168,85,247,0.3)] group"
            >
              <img
                src={heroPortrait}
                alt="EduGuard KPR Student Success"
                className="w-full h-full object-cover object-center scale-105 group-hover:scale-110 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080511] via-transparent to-purple-900/10" />
            </motion.div>

            {/* Floating Glass Card 1: Top Right */}
            <motion.div
              initial={{ opacity: 0, x: 30, y: -20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="absolute -top-4 right-0 sm:right-4 z-20 p-4 rounded-2xl bg-[#17102c]/85 border border-pink-500/30 backdrop-blur-xl shadow-2xl shadow-purple-950/80 max-w-[210px]"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-pink-300">PREVENTING</span>
                <Shield className="h-3 w-3 text-pink-400 fill-pink-400/40" />
              </div>
              <p className="text-xs font-medium text-slate-200 leading-snug">
                with empathy & <br />early AI alerts.
              </p>
            </motion.div>

            {/* Floating Glass Card 2: Bottom Right */}
            <motion.div
              initial={{ opacity: 0, x: 30, y: 30 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="absolute -bottom-6 right-0 sm:right-6 z-20 p-4 rounded-2xl bg-[#17102c]/90 border border-purple-500/30 backdrop-blur-xl shadow-2xl shadow-purple-950/80 max-w-[220px]"
            >
              <span className="text-[10px] font-bold uppercase tracking-widest text-purple-300 block mb-2">
                CORE PREDICTORS
              </span>
              <ul className="text-xs text-slate-300 space-y-1 font-light">
                <li className="flex items-center gap-1.5">
                  <span className="h-1 w-1 rounded-full bg-pink-400" /> Attendance Anomaly Radar
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="h-1 w-1 rounded-full bg-purple-400" /> Internal Mark Drop Matrix
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="h-1 w-1 rounded-full bg-indigo-400" /> Semester Risk Forecast
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="h-1 w-1 rounded-full bg-pink-300" /> Parent SMS Broadcast
                </li>
              </ul>
            </motion.div>

            {/* Floating Stats Badge: Center Bottom Left */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="absolute bottom-2 left-0 sm:left-4 z-20 p-3.5 px-4 rounded-2xl bg-[#17102c]/90 border border-purple-500/30 backdrop-blur-xl shadow-xl"
            >
              <span className="text-[10px] font-bold uppercase tracking-widest text-purple-300 block">
                ML PREDICTION ACCURACY
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-xl font-bold font-display text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-300">
                  94.8%
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-light mt-0.5">KNN & Random Forest Models</p>
            </motion.div>
          </div>

        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          3. LIVE INTERACTIVE ML RISK CALCULATOR DEMONSTRATION WIDGET
      ────────────────────────────────────────────────────────────────────────── */}
      <section id="calculator" className="py-20 relative z-10 border-t border-purple-500/10">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <span className="text-xs uppercase tracking-widest text-pink-400 font-bold block">
              LIVE INTERACTIVE AI DEMO
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
              Test the Student <span className="italic font-serif text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-300">Risk Predictor.</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-light">
              Adjust the academic parameters below to see how EduGuard's machine learning model computes real-time dropout risk and triggers intervention paths.
            </p>
          </div>

          <div className="max-w-4xl mx-auto p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-[#140d28]/95 via-[#0f091f]/95 to-[#090514]/95 border border-purple-500/30 backdrop-blur-2xl shadow-2xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            
            {/* Left Parameter Controls */}
            <div className="md:col-span-7 space-y-6">
              
              {/* Attendance Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-pink-400" /> Attendance Percentage
                  </span>
                  <span className={`font-mono font-bold ${calcAttendance < 75 ? "text-red-400" : "text-emerald-400"}`}>
                    {calcAttendance}% {calcAttendance < 75 ? "(Below 75% Limit)" : "(Eligible)"}
                  </span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="100"
                  value={calcAttendance}
                  onChange={(e) => setCalcAttendance(Number(e.target.value))}
                  className="w-full h-2 bg-purple-950/80 rounded-lg appearance-none cursor-pointer accent-pink-500"
                />
              </div>

              {/* Internal Marks Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5 text-purple-400" /> Internal Marks (CIA Average)
                  </span>
                  <span className={`font-mono font-bold ${calcMarks < 50 ? "text-amber-400" : "text-purple-300"}`}>
                    {calcMarks} / 100
                  </span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={calcMarks}
                  onChange={(e) => setCalcMarks(Number(e.target.value))}
                  className="w-full h-2 bg-purple-950/80 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>

              {/* Arrears Counter */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5 text-indigo-400" /> Active Arrears / Backlogs
                  </span>
                  <span className="font-mono font-bold text-pink-300">
                    {calcArrears} {calcArrears === 1 ? "Subject" : "Subjects"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {[0, 1, 2, 3, 4].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setCalcArrears(num)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        calcArrears === num
                          ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/20"
                          : "bg-purple-950/40 text-slate-400 border border-purple-500/20 hover:text-white"
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Risk Meter Result */}
            <div className="md:col-span-5 p-6 rounded-2xl bg-[#0b0616] border border-purple-500/25 flex flex-col items-center justify-center text-center space-y-4">
              <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                PREDICTED DROPOUT RISK INDEX
              </span>

              <div className="relative flex items-center justify-center">
                <div className="text-5xl font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-300 to-white">
                  {computedRisk}%
                </div>
              </div>

              <div className={`px-4 py-2 rounded-xl text-xs font-bold border ${riskTier.bg} ${riskTier.color}`}>
                {riskTier.label}
              </div>

              <div className="text-[11px] text-slate-300 leading-snug border-t border-purple-500/20 pt-3">
                <span className="text-pink-300 font-semibold block mb-0.5">Automated Action:</span>
                {riskTier.action}
              </div>

              <Link
                to="/auth"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:opacity-90 transition-opacity flex items-center justify-center"
              >
                View in Live Portal ➔
              </Link>
            </div>

          </div>

        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          4. CORE AI MODULES & CASE STUDIES
      ────────────────────────────────────────────────────────────────────────── */}
      <section id="modules" className="py-20 relative z-10 border-t border-purple-500/10">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
            <div>
              <span className="text-xs uppercase tracking-widest text-purple-400 font-bold mb-2 block">
                CORE SYSTEM MODULES
              </span>
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
                Architected for precision <br className="hidden sm:inline" />
                and <span className="italic font-serif text-pink-400">real-time</span> intervention.
              </h2>
            </div>
            
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-purple-300 hover:text-pink-300 group transition-colors"
            >
              Access Faculty Modules
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* 3 Core System Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {modules.map((mod, idx) => (
              <motion.div
                key={mod.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                whileHover={{ y: -8 }}
                onClick={() => setSelectedModule(mod)}
                className="group relative rounded-3xl bg-[#130d24]/80 border border-purple-500/20 hover:border-pink-500/50 p-6 backdrop-blur-xl overflow-hidden cursor-pointer shadow-xl hover:shadow-purple-500/20 transition-all duration-300 flex flex-col justify-between"
              >
                {/* Glow Backdrop */}
                <div className={`absolute inset-0 bg-gradient-to-br ${mod.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                {/* Card Top Preview Mockup Banner */}
                <div className="relative h-48 rounded-2xl bg-[#0d081b] border border-purple-500/20 overflow-hidden mb-6 flex items-center justify-center p-4">
                  <div className="w-full h-full rounded-xl bg-gradient-to-br from-purple-950/60 to-black/80 border border-purple-400/20 p-4 flex flex-col justify-between relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="h-2 w-2 rounded-full bg-pink-400" />
                        <div className="h-2 w-2 rounded-full bg-purple-400" />
                        <div className="h-2 w-2 rounded-full bg-indigo-400" />
                      </div>
                      <span className="text-[9px] uppercase tracking-wider text-purple-300/80 font-mono">{mod.category}</span>
                    </div>

                    <div className="my-auto text-center space-y-1">
                      <p className="text-lg font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-200 to-white">
                        {mod.title}
                      </p>
                      <p className="text-[10px] text-slate-400 line-clamp-1">{mod.subtitle}</p>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-purple-500/20 pt-2">
                      <span>Key Metric</span>
                      <span className="text-pink-300 font-mono font-semibold">{mod.stats?.accuracy || mod.stats?.syncRate || mod.stats?.delivered || "100%"}</span>
                    </div>
                  </div>
                </div>

                {/* Card Bottom Meta */}
                <div className="relative z-10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-purple-400 font-bold">{mod.number}</span>
                    <div className="h-8 w-8 rounded-full bg-purple-900/40 border border-purple-500/30 flex items-center justify-center text-slate-300 group-hover:text-pink-300 group-hover:border-pink-500/60 group-hover:scale-110 transition-all">
                      <ArrowUpRight className="h-4 w-4" />
                    </div>
                  </div>

                  <h3 className="text-xl font-display font-bold text-white group-hover:text-pink-200 transition-colors">
                    {mod.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2">
                    {mod.subtitle}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {mod.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 rounded-md bg-purple-950/60 border border-purple-500/20 text-[10px] text-purple-300 font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          5. FEATURES & CAPABILITIES
      ────────────────────────────────────────────────────────────────────────── */}
      <section id="capabilities" className="py-20 relative z-10 border-t border-purple-500/10">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left Headline & Feature Cards */}
            <div className="lg:col-span-8 space-y-10">
              <div>
                <span className="text-xs uppercase tracking-widest text-purple-400 font-bold mb-2 block">
                  CAPABILITIES
                </span>
                <h2 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
                  Holistic student success <br />
                  and early warning <span className="italic font-serif text-pink-400">infrastructure.</span>
                </h2>
              </div>

              {/* 4 Feature Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {capabilities.map((srv, idx) => {
                  const Icon = srv.icon;
                  return (
                    <motion.div
                      key={srv.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: idx * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      className="p-6 rounded-2xl bg-[#130d24]/70 border border-purple-500/20 hover:border-pink-500/40 backdrop-blur-xl transition-all duration-300 space-y-3 group"
                    >
                      <div className="h-10 w-10 rounded-xl bg-purple-900/40 border border-purple-500/30 flex items-center justify-center text-pink-400 group-hover:scale-110 group-hover:bg-pink-500/20 group-hover:text-pink-300 transition-all">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="text-base font-display font-bold text-white group-hover:text-pink-200 transition-colors">
                        {srv.title}
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed font-light">
                        {srv.description}
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {srv.tags.map((t) => (
                          <span key={t} className="px-2 py-0.5 rounded bg-purple-950/60 text-[9px] text-purple-300 font-medium">
                            {t}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Right Campus Overview Widget */}
            <div className="lg:col-span-4 p-8 rounded-3xl bg-[#140d28]/80 border border-purple-500/25 backdrop-blur-xl shadow-2xl space-y-6">
              <div className="flex items-center gap-3">
                <img src={kprLogo} alt="KPR" className="h-8 w-8 rounded-lg bg-white p-0.5 object-contain" />
                <div>
                  <span className="text-xs uppercase tracking-widest text-purple-300 font-bold block">
                    KPRCAS DEPARTMENTS
                  </span>
                  <p className="text-[10px] text-slate-400">Integrated Academic Cohorts</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 text-xs text-slate-300 font-medium">
                <div className="p-2.5 rounded-xl bg-[#0e091d] border border-purple-500/20 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-pink-400" /> Comp. Science
                </div>
                <div className="p-2.5 rounded-xl bg-[#0e091d] border border-purple-500/20 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-purple-400" /> Info. Technology
                </div>
                <div className="p-2.5 rounded-xl bg-[#0e091d] border border-purple-500/20 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-indigo-400" /> AI & Data Science
                </div>
                <div className="p-2.5 rounded-xl bg-[#0e091d] border border-purple-500/20 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-pink-300" /> Commerce & CA
                </div>
                <div className="p-2.5 rounded-xl bg-[#0e091d] border border-purple-500/20 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" /> Management
                </div>
                <div className="p-2.5 rounded-xl bg-[#0e091d] border border-purple-500/20 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-400" /> Arts & Science
                </div>
              </div>

              <div className="pt-4 border-t border-purple-500/20">
                <p className="text-xs text-slate-400 leading-relaxed">
                  Direct integration with MongoDB Atlas, Express Serverless backend, and React TypeScript frontend with 99.98% system uptime.
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          6. 5-STEP INTERVENTION PROCESS
      ────────────────────────────────────────────────────────────────────────── */}
      <section id="process" className="py-20 relative z-10 border-t border-purple-500/10">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Process Left Pipeline */}
            <div className="lg:col-span-7 space-y-10">
              <div>
                <span className="text-xs uppercase tracking-widest text-purple-400 font-bold mb-2 block">
                  INTERVENTION PIPELINE
                </span>
                <h2 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
                  A proactive, systematic <br />
                  approach to <span className="italic font-serif text-pink-400">student retention.</span>
                </h2>
              </div>

              {/* 5 Process Step Interactive Nodes */}
              <div className="space-y-4">
                {processSteps.map((stepItem: any, idx: number) => {
                  const isSelected = activeProcessStep === idx;
                  return (
                    <motion.div
                      key={stepItem.step}
                      whileHover={{ x: 6 }}
                      onClick={() => setActiveProcessStep(idx)}
                      className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer flex items-center gap-5 ${
                        isSelected
                          ? "bg-purple-950/70 border-pink-500/60 shadow-lg shadow-pink-500/10"
                          : "bg-[#120c22]/60 border-purple-500/20 hover:border-purple-400/40"
                      }`}
                    >
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-mono font-bold text-sm shrink-0 transition-colors ${
                        isSelected
                          ? "bg-gradient-to-tr from-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/30"
                          : "bg-purple-900/30 text-purple-300 border border-purple-500/30"
                      }`}>
                        {stepItem.step}
                      </div>

                      <div className="flex-1">
                        <h4 className={`text-sm font-display font-bold tracking-wider ${isSelected ? "text-pink-300" : "text-slate-200"}`}>
                          {stepItem.name}
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                          {stepItem.desc}
                        </p>
                      </div>

                      <ChevronRight className={`h-4 w-4 shrink-0 transition-transform ${isSelected ? "text-pink-400 rotate-90" : "text-slate-600"}`} />
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Process Right Archway Graphic */}
            <div className="lg:col-span-5 flex items-center justify-center relative">
              <div className="relative w-full max-w-[380px] h-[480px] rounded-3xl overflow-hidden border border-pink-500/30 shadow-[0_0_60px_rgba(236,72,153,0.25)] group">
                <img
                  src={portalArch}
                  alt="KPRCAS Student Journey Portal"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#080511] via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-6 inset-x-6 p-4 rounded-2xl bg-[#100a20]/90 border border-pink-500/30 backdrop-blur-md text-center">
                  <p className="text-xs uppercase tracking-widest text-pink-300 font-bold">KPRCAS STUDENT SUCCESS GATEWAY</p>
                  <p className="text-[11px] text-slate-300 mt-1 font-light">Guiding every student towards academic excellence.</p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          7. TESTIMONIALS / KIND WORDS
      ────────────────────────────────────────────────────────────────────────── */}
      <section id="testimonials" className="py-20 relative z-10 border-t border-purple-500/10">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
            <div>
              <span className="text-xs uppercase tracking-widest text-purple-400 font-bold mb-2 block">
                CAMPUS IMPACT
              </span>
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
                Stories from <span className="italic font-serif text-pink-400">faculty, students & parents.</span>
              </h2>
            </div>
            
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-purple-300 hover:text-pink-300 group transition-colors"
            >
              Sign In to View All Reports
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t: any, idx: number) => (
              <motion.div
                key={t.id || idx}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                className="p-7 rounded-3xl bg-[#130d24]/80 border border-purple-500/20 hover:border-pink-500/40 backdrop-blur-xl flex flex-col justify-between space-y-6 shadow-xl relative group"
              >
                <div className="space-y-4">
                  <span className="text-4xl font-serif text-pink-400/60 block leading-none font-bold">“</span>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
                    {t.quote}
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-purple-500/15">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="h-10 w-10 rounded-full object-cover ring-2 ring-pink-400/40"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-white">{t.name}</h4>
                    <p className="text-[11px] text-slate-400">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          8. CONTACT & INQUIRY BANNER
      ────────────────────────────────────────────────────────────────────────── */}
      <section id="contact" className="py-20 relative z-10 border-t border-purple-500/10">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="relative rounded-3xl bg-gradient-to-br from-[#170e2f]/95 via-[#120a22]/95 to-[#0b0617]/95 border border-purple-500/30 p-8 sm:p-12 backdrop-blur-2xl shadow-2xl overflow-hidden">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              
              {/* Contact Left Information */}
              <div className="lg:col-span-5 space-y-6">
                <div>
                  <span className="text-xs uppercase tracking-widest text-pink-400 font-bold mb-2 block">
                    KPRCAS ADMINISTRATION
                  </span>
                  <h3 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
                    Protect every student's <br />
                    <span className="italic font-serif text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-300 to-indigo-300">
                      academic journey.
                    </span>
                  </h3>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
                  Have questions about departmental batch sync, mentor assignment, or student risk scores? Submit an inquiry to the EduGuard administration team.
                </p>

                <div className="space-y-3 pt-2 text-xs text-slate-300">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-purple-900/40 border border-purple-500/30 flex items-center justify-center text-pink-400">
                      <Mail className="h-4 w-4" />
                    </div>
                    <span>eduguard@kprcas.ac.in</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-purple-900/40 border border-purple-500/30 flex items-center justify-center text-purple-400">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <span>KPR College of Arts and Science, Coimbatore, Tamil Nadu</span>
                  </div>
                </div>
              </div>

              {/* Contact Right Form */}
              <div className="lg:col-span-7 bg-[#0f0a1f]/80 p-6 sm:p-8 rounded-2xl border border-purple-500/25 backdrop-blur-md">
                
                {formStatus && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3.5 rounded-xl text-xs mb-5 flex items-center gap-2.5 ${
                      formStatus.type === "success"
                        ? "bg-green-950/60 border border-green-500/40 text-green-300"
                        : "bg-red-950/60 border border-red-500/40 text-red-300"
                    }`}
                  >
                    {formStatus.type === "success" ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-green-400" />
                    ) : (
                      <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                    )}
                    {formStatus.text}
                  </motion.div>
                )}

                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">Your Name / Faculty ID</label>
                      <input
                        type="text"
                        required
                        placeholder="Dr. Rajesh / Faculty Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#160f2b] border border-purple-500/30 focus:border-pink-500 focus:outline-none text-xs text-white placeholder:text-slate-500 transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">Email Address</label>
                      <input
                        type="email"
                        required
                        placeholder="faculty@kprcas.ac.in"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#160f2b] border border-purple-500/30 focus:border-pink-500 focus:outline-none text-xs text-white placeholder:text-slate-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">Department</label>
                      <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#160f2b] border border-purple-500/30 focus:border-pink-500 focus:outline-none text-xs text-white transition-colors"
                      >
                        <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                        <option value="Information Technology">Information Technology</option>
                        <option value="Artificial Intelligence & Data Science">AI & Data Science</option>
                        <option value="Commerce & Accounting">Commerce & Accounting</option>
                        <option value="Management Studies">Management Studies</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">Inquiry Type</label>
                      <select
                        value={service}
                        onChange={(e) => setService(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#160f2b] border border-purple-500/30 focus:border-pink-500 focus:outline-none text-xs text-white transition-colors"
                      >
                        <option value="Dropout Early Warning Inquiry">Dropout Early Warning Inquiry</option>
                        <option value="ERP Live Sync Setup">ERP Live Sync Setup</option>
                        <option value="Mentor Assignment & Counseling Hub">Mentor Assignment & Counseling</option>
                        <option value="Parent Alert SMS System">Parent Alert SMS System</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">Message / Request Details</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Enter specific student cohort or department requirements..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#160f2b] border border-purple-500/30 focus:border-pink-500 focus:outline-none text-xs text-white placeholder:text-slate-500 transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 px-6 rounded-xl font-semibold text-xs uppercase tracking-widest bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:from-pink-400 hover:to-indigo-500 text-white shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? "Submitting Inquiry..." : <>Submit Inquiry <ArrowRight className="h-4 w-4" /></>}
                  </button>
                </form>

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          9. FOOTER
      ────────────────────────────────────────────────────────────────────────── */}
      <footer className="py-12 border-t border-purple-500/15 bg-[#06040d] relative z-10 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center gap-3">
            <img src={kprLogo} alt="KPRCAS" className="h-9 w-9 rounded-lg bg-white p-0.5 object-contain" />
            <div>
              <p className="font-display font-bold text-white tracking-wider">KPRCAS • EduGuard</p>
              <p className="text-[10px] text-pink-400/80 uppercase tracking-wider">LEARN BEYOND • Dropout Prevention System</p>
            </div>
          </div>

          {/* Footer Nav */}
          <div className="flex flex-wrap items-center gap-6 text-[11px] uppercase tracking-wider">
            <a href="#overview" className="hover:text-pink-400 transition-colors">Overview</a>
            <a href="#calculator" className="hover:text-pink-400 transition-colors">Risk Predictor</a>
            <a href="#modules" className="hover:text-pink-400 transition-colors">AI Modules</a>
            <a href="#capabilities" className="hover:text-pink-400 transition-colors">Features</a>
            <a href="#process" className="hover:text-pink-400 transition-colors">Intervention</a>
            <Link to="/auth" className="text-purple-400 hover:text-pink-300 transition-colors">Faculty Login</Link>
          </div>

          <p className="text-[11px] text-slate-500">
            © {new Date().getFullYear()} KPR College of Arts and Science. All rights reserved.
          </p>
        </div>
      </footer>

      {/* ──────────────────────────────────────────────────────────────────────────
          10. MODULE DETAIL MODAL
      ────────────────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedModule && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-[#140d28] border border-purple-500/40 rounded-3xl p-8 shadow-2xl space-y-6 overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setSelectedModule(null)}
                className="absolute top-6 right-6 h-8 w-8 rounded-full bg-purple-900/50 border border-purple-500/30 flex items-center justify-center text-slate-300 hover:text-white hover:bg-purple-800 transition-all"
              >
                ✕
              </button>

              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-pink-400 font-bold block mb-1">
                  MODULE {selectedModule.number} • {selectedModule.category}
                </span>
                <h3 className="text-2xl sm:text-3xl font-display font-bold text-white">
                  {selectedModule.title}
                </h3>
                <p className="text-xs text-purple-300 mt-1">{selectedModule.subtitle}</p>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
                {selectedModule.description}
              </p>

              <div className="p-4 rounded-2xl bg-[#0e091d] border border-purple-500/20">
                <span className="text-[11px] uppercase tracking-wider text-pink-300 font-bold block mb-1">Impact at KPRCAS</span>
                <p className="text-xs text-slate-200">{selectedModule.impact}</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(selectedModule.stats || {}).map(([k, v]) => (
                  <div key={k} className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/20 text-center">
                    <p className="text-base font-bold font-display text-pink-400">{v}</p>
                    <p className="text-[10px] text-slate-400 uppercase mt-0.5">{k}</p>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-purple-500/20">
                <div className="flex flex-wrap gap-1.5">
                  {selectedModule.tags.map(t => (
                    <span key={t} className="px-2.5 py-1 rounded-md bg-purple-900/40 text-[10px] text-purple-300">
                      {t}
                    </span>
                  ))}
                </div>

                <Link
                  to="/auth"
                  onClick={() => setSelectedModule(null)}
                  className="px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider bg-gradient-to-r from-pink-500 to-purple-600 text-white flex items-center justify-center"
                >
                  Open in Portal ➔
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
