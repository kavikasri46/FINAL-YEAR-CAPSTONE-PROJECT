import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  Sparkles,
  BookOpen,
  Cpu,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  TrendingUp,
  Activity,
  User,
  GraduationCap,
  Layers,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Eye,
  CheckCircle2,
  Scan,
  Compass,
  Zap,
} from "lucide-react";

interface StudentSample {
  id: string;
  name: string;
  rollNo: string;
  dept: string;
  semester: string;
  attendance: number;
  cgpa: number;
  riskScore: number;
  riskTier: "Low" | "Medium" | "High";
  riskColor: string;
  accentGlow: string;
  subjects: { name: string; score: number; trend: string }[];
  diagnosis: string;
  intervention: string;
}

const SAMPLE_STUDENTS: StudentSample[] = [
  {
    id: "DA2024001",
    name: "Arjun Patel",
    rollNo: "21DA01",
    dept: "B.Sc. Data Analytics",
    semester: "Semester 4",
    attendance: 92.4,
    cgpa: 8.72,
    riskScore: 12,
    riskTier: "Low",
    riskColor: "#10b981", // Emerald
    accentGlow: "rgba(16, 185, 129, 0.5)",
    subjects: [
      { name: "Machine Learning", score: 88, trend: "+6%" },
      { name: "Python Analytics", score: 94, trend: "+4%" },
      { name: "Cloud Computing", score: 82, trend: "+2%" },
      { name: "DBMS Systems", score: 90, trend: "+5%" },
    ],
    diagnosis: "Optimal academic trajectory. High attendance consistency and robust CIA performance across all courses.",
    intervention: "Eligible for advanced research fellowship & peer mentorship role.",
  },
  {
    id: "DA2024002",
    name: "Vikram Singh",
    rollNo: "21DA02",
    dept: "B.Sc. Data Analytics",
    semester: "Semester 4",
    attendance: 58.2,
    cgpa: 5.64,
    riskScore: 88,
    riskTier: "High",
    riskColor: "#ef4444", // Red
    accentGlow: "rgba(239, 68, 68, 0.6)",
    subjects: [
      { name: "Machine Learning", score: 42, trend: "-14%" },
      { name: "Python Analytics", score: 48, trend: "-8%" },
      { name: "Cloud Computing", score: 51, trend: "-5%" },
      { name: "DBMS Systems", score: 38, trend: "-18%" },
    ],
    diagnosis: "Critical attendance anomaly (<75%) combined with sharp internal assessment drop in technical core.",
    intervention: "Immediate parent SMS alert dispatched. Mandatory 1-on-1 counseling scheduled with Dr. Rajesh Verma.",
  },
  {
    id: "DA2024005",
    name: "Meera Nair",
    rollNo: "21DA05",
    dept: "B.Sc. Data Analytics",
    semester: "Semester 4",
    attendance: 76.5,
    cgpa: 7.15,
    riskScore: 48,
    riskTier: "Medium",
    riskColor: "#f59e0b", // Amber
    accentGlow: "rgba(245, 158, 11, 0.5)",
    subjects: [
      { name: "Machine Learning", score: 68, trend: "+3%" },
      { name: "Python Analytics", score: 62, trend: "-6%" },
      { name: "Cloud Computing", score: 74, trend: "+7%" },
      { name: "DBMS Systems", score: 59, trend: "-4%" },
    ],
    diagnosis: "Moderate risk boundary. Fluctuating assignment performance with attendance hovering near 75% limit.",
    intervention: "Assigned remedial video modules and weekly progress checkpoint reviews.",
  },
];

export default function ThreeDBookAnalysis() {
  const [selectedStudentIdx, setSelectedStudentIdx] = useState(0);
  const [isOpen, setIsOpen] = useState(true);
  const [activePage, setActivePage] = useState<1 | 2>(1);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [laserY, setLaserY] = useState(0);

  const student = SAMPLE_STUDENTS[selectedStudentIdx];

  // Mouse 3D Gyroscope/Tilt
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 120, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 120, damping: 20 });
  const rotateX = useTransform(springY, [-250, 250], [12, -12]);
  const rotateY = useTransform(springX, [-250, 250], [-18, 18]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set(e.clientX - centerX);
    mouseY.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  // Trigger live AI Neural Scan
  const triggerScan = () => {
    if (isScanning) return;
    setIsScanning(true);
    setScanStep(0);

    const steps = [
      setTimeout(() => setScanStep(1), 500),
      setTimeout(() => setScanStep(2), 1200),
      setTimeout(() => setScanStep(3), 2000),
      setTimeout(() => setScanStep(4), 2800),
      setTimeout(() => {
        setIsScanning(false);
        setScanStep(0);
      }, 3600),
    ];

    return () => steps.forEach(clearTimeout);
  };

  // Run initial scan on load or student switch
  useEffect(() => {
    const timer = setTimeout(() => {
      triggerScan();
    }, 600);
    return () => clearTimeout(timer);
  }, [selectedStudentIdx]);

  return (
    <div className="relative w-full py-12 px-2 sm:px-6 flex flex-col items-center select-none overflow-hidden">
      
      {/* Dynamic Ambient Holographic Glow Backdrop */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <motion.div
          animate={{
            scale: [1, 1.25, 1],
            opacity: [0.35, 0.65, 0.35],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="w-[450px] sm:w-[650px] h-[350px] sm:h-[480px] rounded-full blur-[140px]"
          style={{
            background: `radial-gradient(circle, ${student.accentGlow} 0%, rgba(168, 85, 247, 0.25) 45%, rgba(6, 182, 212, 0.15) 75%, transparent 100%)`,
          }}
        />
      </div>

      {/* Header Badge */}
      <div className="relative z-10 flex flex-col items-center text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-cyan-500/20 border border-pink-500/40 backdrop-blur-xl shadow-[0_0_25px_rgba(236,72,153,0.3)]">
          <Sparkles className="w-4 h-4 text-pink-400 animate-spin" style={{ animationDuration: "5s" }} />
          <span className="text-xs uppercase tracking-[0.25em] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-300 to-cyan-300">
            3D Academic Dossier & AI Holographic Scanner
          </span>
          <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
        </div>
        <h3 className="text-2xl sm:text-4xl font-display font-extrabold text-white mt-3 tracking-tight">
          Watch AI Inspect & <span className="italic font-serif text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-fuchsia-300 to-cyan-400">Analyze Every Student.</span>
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl font-light mt-1">
          Open the holographic 3D student record book. Our neural scanner analyzes attendance drop velocity, internal test fluctuations, and predicts dropout probability in real-time.
        </p>

        {/* Student Selector Switcher */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-4 p-1.5 rounded-2xl bg-[#140c2a]/80 border border-purple-500/30 backdrop-blur-xl shadow-lg">
          {SAMPLE_STUDENTS.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => {
                setSelectedStudentIdx(idx);
                if (!isOpen) setIsOpen(true);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wider transition-all duration-300 flex items-center gap-2 ${
                selectedStudentIdx === idx
                  ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-[0_0_15px_rgba(236,72,153,0.4)] scale-105"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: s.riskColor }}
              />
              <span>{s.name}</span>
              <span className="text-[10px] opacity-75 font-mono">({s.riskTier} Risk)</span>
            </button>
          ))}
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────────────
          3D BOOK STAGE
      ──────────────────────────────────────────────────────────────────────── */}
      <div
        className="relative z-10 w-full max-w-4xl py-6 flex items-center justify-center cursor-pointer"
        style={{ perspective: "1500px" }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <motion.div
          style={{
            rotateX,
            rotateY,
            transformStyle: "preserve-3d",
          }}
          className="relative transition-transform duration-200 ease-out flex items-center justify-center"
        >
          {/* Outer Book Glow & Shadow */}
          <div
            className="absolute -inset-6 rounded-3xl blur-2xl opacity-60 transition-all duration-700 pointer-events-none"
            style={{
              background: `radial-gradient(circle, ${student.accentGlow} 0%, rgba(139, 92, 246, 0.3) 60%, transparent 100%)`,
            }}
          />

          {/* ══════════════════════════════════════════════════════════════════
              BOOK WRAPPER
          ══════════════════════════════════════════════════════════════════ */}
          <div
            className={`relative transition-all duration-700 ease-in-out ${
              isOpen
                ? "w-[94vw] max-w-[820px] h-[520px] sm:h-[480px]"
                : "w-[300px] sm:w-[360px] h-[480px]"
            }`}
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* 3D Spine & Page Thickness Base */}
            <div
              className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#0d071c] via-[#1a0f35] to-[#0a0516] border border-purple-500/40 shadow-[0_25px_60px_rgba(0,0,0,0.85)]"
              style={{
                boxShadow: `0 20px 50px rgba(0,0,0,0.9), 0 0 35px ${student.accentGlow}`,
              }}
            />

            {/* ─── CASE A: CLOSED COVER ───────────────────────────────────── */}
            <AnimatePresence>
              {!isOpen && (
                <motion.div
                  initial={{ opacity: 0, rotateY: -120 }}
                  animate={{ opacity: 1, rotateY: 0 }}
                  exit={{ opacity: 0, rotateY: -120 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  onClick={() => setIsOpen(true)}
                  className="absolute inset-0 rounded-2xl overflow-hidden bg-gradient-to-br from-[#1b0d38] via-[#120826] to-[#0a0418] border-2 border-pink-500/50 flex flex-col items-center justify-between p-8 text-center shadow-2xl group"
                  style={{
                    backfaceVisibility: "hidden",
                    transformStyle: "preserve-3d",
                  }}
                >
                  {/* Holographic foil frame */}
                  <div className="absolute inset-3 rounded-xl border border-dashed border-pink-400/30 pointer-events-none" />
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-pink-500/20 via-purple-500/10 to-transparent blur-xl pointer-events-none" />

                  {/* Top Emblem */}
                  <div className="relative pt-4 flex flex-col items-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 via-pink-600 to-cyan-500 p-0.5 shadow-[0_0_30px_rgba(236,72,153,0.5)] group-hover:scale-110 transition-transform duration-500">
                      <div className="w-full h-full rounded-2xl bg-[#0e071e] flex items-center justify-center">
                        <GraduationCap className="w-8 h-8 text-pink-400" />
                      </div>
                    </div>
                    <span className="text-[10px] tracking-[0.3em] uppercase text-pink-300 font-extrabold mt-3">
                      KPRCAS EDGUARD 2026
                    </span>
                  </div>

                  {/* Title */}
                  <div className="space-y-2 relative z-10">
                    <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-wider">
                      STUDENT ACADEMIC
                      <br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-fuchsia-300 to-cyan-300 drop-shadow-[0_0_20px_rgba(236,72,153,0.6)]">
                        CONFIDENTIAL DOSSIER
                      </span>
                    </h2>
                    <p className="text-xs text-slate-400 font-light">
                      Neural Dropout Predictor • Real-time ERP Integration
                    </p>
                  </div>

                  {/* Bottom Action */}
                  <div className="w-full pt-4">
                    <button className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 text-white text-xs font-bold uppercase tracking-widest shadow-lg shadow-pink-500/30 group-hover:shadow-pink-500/60 transition-all flex items-center justify-center gap-2">
                      <BookOpen className="w-4 h-4 animate-bounce" /> Click to Open Dossier
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ─── CASE B: OPEN BOOK SPREAD (LEFT + RIGHT PAGES) ─────────── */}
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.6 }}
                  className="absolute inset-0 rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 bg-[#0d071d] border border-purple-500/40"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  {/* Center Crease Shadow */}
                  <div className="hidden md:block absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-8 bg-gradient-to-r from-black/60 via-black/80 to-black/60 z-30 pointer-events-none shadow-inner" />

                  {/* ────────────────────────────────────────────────────────────
                      LEFT PAGE: STUDENT PROFILE & BIOMETRIC RADAR
                  ──────────────────────────────────────────────────────────── */}
                  <div className="relative p-5 sm:p-7 flex flex-col justify-between bg-gradient-to-br from-[#120926]/95 via-[#0e071f]/95 to-[#090416]/95 border-r border-purple-500/20 overflow-hidden">
                    {/* Background Hologram Rings */}
                    <div className="absolute -top-20 -left-20 w-52 h-52 rounded-full border border-pink-500/10 pointer-events-none" />
                    <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full border border-purple-500/15 pointer-events-none" />
                    
                    {/* Top Identity Header */}
                    <div className="relative z-10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 to-purple-600 p-0.5 shadow-md shadow-pink-500/20">
                            <div className="w-full h-full rounded-[10px] bg-[#0c061a] flex items-center justify-center font-display font-extrabold text-pink-300 text-sm">
                              {student.name.split(" ").map((n) => n[0]).join("")}
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-base font-bold text-white tracking-wide">{student.name}</h4>
                              <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-[9px] font-mono text-purple-300 font-bold border border-purple-400/30">
                                {student.rollNo}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 font-light">{student.dept} • {student.semester}</p>
                          </div>
                        </div>

                        {/* Risk Tier Badge */}
                        <div
                          className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border shadow-sm"
                          style={{
                            color: student.riskColor,
                            borderColor: student.accentGlow,
                            backgroundColor: `${student.riskColor}15`,
                          }}
                        >
                          {student.riskTier === "Low" ? (
                            <ShieldCheck className="w-3 h-3" />
                          ) : student.riskTier === "Medium" ? (
                            <AlertTriangle className="w-3 h-3" />
                          ) : (
                            <ShieldAlert className="w-3 h-3 animate-pulse" />
                          )}
                          <span>{student.riskTier} Risk</span>
                        </div>
                      </div>

                      {/* Main Metrics Radar Cards */}
                      <div className="grid grid-cols-3 gap-2.5 mt-5">
                        {/* Attendance Gauge */}
                        <div className="p-3 rounded-xl bg-[#160d2e]/80 border border-purple-500/20 text-center relative overflow-hidden group">
                          <span className="text-[9px] uppercase tracking-wider text-slate-400 block">Attendance</span>
                          <span
                            className="text-lg font-extrabold font-mono mt-0.5 block"
                            style={{ color: student.attendance >= 75 ? "#34d399" : "#f87171" }}
                          >
                            {student.attendance}%
                          </span>
                          <span className="text-[9px] text-slate-500 block">
                            {student.attendance >= 75 ? "Safe" : "Anomaly"}
                          </span>
                        </div>

                        {/* CGPA */}
                        <div className="p-3 rounded-xl bg-[#160d2e]/80 border border-purple-500/20 text-center">
                          <span className="text-[9px] uppercase tracking-wider text-slate-400 block">CGPA Score</span>
                          <span className="text-lg font-extrabold font-mono text-cyan-300 mt-0.5 block">
                            {student.cgpa}
                          </span>
                          <span className="text-[9px] text-slate-500 block">Scale 10.0</span>
                        </div>

                        {/* Dropout Risk Index */}
                        <div
                          className="p-3 rounded-xl border text-center relative overflow-hidden"
                          style={{
                            backgroundColor: `${student.riskColor}12`,
                            borderColor: `${student.riskColor}40`,
                          }}
                        >
                          <span className="text-[9px] uppercase tracking-wider text-slate-300 block">Risk Index</span>
                          <span
                            className="text-lg font-extrabold font-mono mt-0.5 block"
                            style={{ color: student.riskColor }}
                          >
                            {student.riskScore}%
                          </span>
                          <span className="text-[9px] text-slate-400 block font-semibold">
                            {student.riskTier.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Page Content: Switch between Subjects (P1) vs Details (P2) */}
                    <div className="relative z-10 my-3">
                      {activePage === 1 ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-widest font-semibold border-b border-purple-500/20 pb-1">
                            <span>Core Course Subjects</span>
                            <span>Score / Trend</span>
                          </div>
                          <div className="space-y-1.5">
                            {student.subjects.map((sub, i) => (
                              <div
                                key={i}
                                className="flex items-center justify-between p-2 rounded-lg bg-[#140b29]/70 border border-purple-500/10 hover:border-purple-500/30 transition-all text-xs"
                              >
                                <span className="text-slate-300 font-medium truncate max-w-[150px]">
                                  {sub.name}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-white">{sub.score}%</span>
                                  <span
                                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                                      sub.trend.startsWith("+")
                                        ? "text-emerald-400 bg-emerald-950/40"
                                        : "text-red-400 bg-red-950/40"
                                    }`}
                                  >
                                    {sub.trend}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 text-xs text-slate-300">
                            <span className="text-[10px] uppercase font-bold text-pink-400 tracking-wider block mb-1">
                              AI Diagnostic Summary
                            </span>
                            <p className="font-light leading-relaxed">{student.diagnosis}</p>
                          </div>
                          <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-xs text-slate-300">
                            <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider block mb-1">
                              Intervention Roadmap
                            </span>
                            <p className="font-light leading-relaxed">{student.intervention}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bottom Page Navigation */}
                    <div className="relative z-10 flex items-center justify-between pt-2 border-t border-purple-500/15 text-[10px] text-slate-400">
                      <div className="flex items-center gap-1 font-mono">
                        <Compass className="w-3 h-3 text-pink-400" /> Page {activePage} of 2
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setActivePage(1)}
                          className={`px-2 py-0.5 rounded ${activePage === 1 ? "bg-pink-500 text-white font-bold" : "hover:text-white"}`}
                        >
                          1
                        </button>
                        <button
                          onClick={() => setActivePage(2)}
                          className={`px-2 py-0.5 rounded ${activePage === 2 ? "bg-pink-500 text-white font-bold" : "hover:text-white"}`}
                        >
                          2
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* ────────────────────────────────────────────────────────────
                      RIGHT PAGE: LIVE AI NEURAL SCANNER & ANALYSIS
                  ──────────────────────────────────────────────────────────── */}
                  <div className="relative p-5 sm:p-7 flex flex-col justify-between bg-gradient-to-bl from-[#13092b]/95 via-[#0e0620]/95 to-[#070312]/95 overflow-hidden">
                    
                    {/* Glowing Laser Scan Beam Effect */}
                    <AnimatePresence>
                      {isScanning && (
                        <motion.div
                          initial={{ top: "0%", opacity: 0 }}
                          animate={{
                            top: ["0%", "92%", "8%", "85%", "0%"],
                            opacity: [0, 1, 1, 1, 0],
                          }}
                          transition={{ duration: 3.2, ease: "linear" }}
                          className="absolute left-0 right-0 h-1 z-30 pointer-events-none"
                          style={{
                            background: `linear-gradient(90deg, transparent 0%, #00f0ff 20%, #ff2a85 50%, #00f0ff 80%, transparent 100%)`,
                            boxShadow: `0 0 15px #ff2a85, 0 0 30px #00f0ff, 0 0 60px ${student.accentGlow}`,
                          }}
                        >
                          {/* Laser flare beam trailing light */}
                          <div className="absolute -top-8 -bottom-8 left-0 right-0 bg-gradient-to-b from-pink-500/15 via-cyan-400/20 to-transparent pointer-events-none" />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Holographic Watermark Grid Lines */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

                    {/* Top Scanner HUD Header */}
                    <div className="relative z-10 flex items-center justify-between border-b border-purple-500/20 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="relative flex h-3 w-3">
                          <span
                            className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                            style={{ backgroundColor: student.riskColor }}
                          />
                          <span
                            className="relative inline-flex rounded-full h-3 w-3"
                            style={{ backgroundColor: student.riskColor }}
                          />
                        </div>
                        <span className="text-[11px] font-mono uppercase tracking-widest text-slate-300 font-bold">
                          {isScanning ? "NEURAL SCANNING ACTIVE..." : "ANALYSIS ENGINE ONLINE"}
                        </span>
                      </div>
                      
                      <div className="px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-400/30 text-[9px] font-mono text-cyan-300 font-bold flex items-center gap-1">
                        <Cpu className="w-2.5 h-2.5" /> KNN 94.8%
                      </div>
                    </div>

                    {/* Scanner Steps Visualizer */}
                    <div className="relative z-10 my-4 space-y-2.5">
                      
                      {/* Step 1: Attendance Vector */}
                      <div
                        className={`p-2.5 rounded-xl border transition-all duration-300 ${
                          scanStep >= 1
                            ? "bg-purple-950/60 border-pink-500/40 text-white shadow-[0_0_15px_rgba(236,72,153,0.2)]"
                            : "bg-[#140b28]/50 border-purple-500/15 text-slate-400"
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-2 font-medium">
                            <Activity className="w-3.5 h-3.5 text-pink-400" />
                            1. Attendance Velocity Vector
                          </span>
                          <span className="font-mono text-[11px] font-bold">
                            {student.attendance}% {student.attendance < 75 ? "⚠ DROP" : "✓ VALID"}
                          </span>
                        </div>
                      </div>

                      {/* Step 2: CIA Marks Fluctuation */}
                      <div
                        className={`p-2.5 rounded-xl border transition-all duration-300 ${
                          scanStep >= 2
                            ? "bg-purple-950/60 border-purple-500/40 text-white shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                            : "bg-[#140b28]/50 border-purple-500/15 text-slate-400"
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-2 font-medium">
                            <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
                            2. CIA Assessment Fluctuations
                          </span>
                          <span className="font-mono text-[11px] font-bold">
                            CGPA {student.cgpa}
                          </span>
                        </div>
                      </div>

                      {/* Step 3: Predictive ML Weighting */}
                      <div
                        className={`p-2.5 rounded-xl border transition-all duration-300 ${
                          scanStep >= 3
                            ? "bg-cyan-950/60 border-cyan-500/40 text-white shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                            : "bg-[#140b28]/50 border-purple-500/15 text-slate-400"
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-2 font-medium">
                            <Scan className="w-3.5 h-3.5 text-cyan-400" />
                            3. KNN Classification Model
                          </span>
                          <span className="font-mono text-[11px] font-bold text-cyan-300">
                            {scanStep >= 3 ? "CALCULATED" : "READY"}
                          </span>
                        </div>
                      </div>

                      {/* Step 4: Final AI Verdict Box */}
                      <div
                        className="p-3.5 rounded-2xl border text-center transition-all duration-500 relative overflow-hidden"
                        style={{
                          backgroundColor: `${student.riskColor}18`,
                          borderColor: student.accentGlow,
                          boxShadow: `0 0 25px ${student.accentGlow}`,
                        }}
                      >
                        <span className="text-[10px] uppercase tracking-widest text-slate-300 font-extrabold block">
                          AI RISK ASSESSMENT VERDICT
                        </span>
                        <div className="flex items-center justify-center gap-2 mt-1">
                          <span
                            className="text-2xl font-display font-black tracking-wider"
                            style={{ color: student.riskColor }}
                          >
                            {student.riskScore}% {student.riskTier.toUpperCase()} RISK
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 font-light mt-1">
                          {student.riskTier === "Low"
                            ? "Student exhibits high academic retention & low vulnerability."
                            : student.riskTier === "Medium"
                            ? "Early warning flagged. Remedial revision intervention advised."
                            : "Critical dropout risk. Automated emergency parent alert triggered."}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Action Controls */}
                    <div className="relative z-10 flex items-center justify-between gap-2 pt-2 border-t border-purple-500/15">
                      <button
                        onClick={triggerScan}
                        disabled={isScanning}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                          isScanning
                            ? "bg-purple-900/50 text-purple-300 border border-purple-500/30 cursor-wait"
                            : "bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 text-white shadow-lg shadow-pink-500/25 hover:shadow-pink-500/50 hover:scale-[1.02] active:scale-95"
                        }`}
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? "animate-spin" : ""}`} />
                        {isScanning ? "Scanning Matrix..." : "Re-Scan Student"}
                      </button>

                      <button
                        onClick={() => setIsOpen(false)}
                        className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-purple-500/20 text-xs font-medium flex items-center gap-1 transition-all"
                        title="Close 3D Book"
                      >
                        <BookOpen className="w-3.5 h-3.5" /> Close
                      </button>
                    </div>

                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </motion.div>
      </div>

      {/* Quick Instructional Hint */}
      <div className="relative z-10 flex items-center gap-2 text-xs text-slate-400 mt-2 font-light">
        <Sparkles className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
        <span>Interact with the 3D book above: hover to tilt in 3D, flip pages, or select different students to watch the neural scanner analyze risk live.</span>
      </div>

    </div>
  );
}

