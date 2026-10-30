import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Cpu,
  Activity,
  Sparkles,
  Zap,
  Clock,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  ShieldCheck,
  Radar,
  Radio,
  Sliders,
  Play,
  Pause,
  RefreshCw,
  BellRing,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";

interface StudentProfile {
  id: string;
  name: string;
  dept: string;
  rollNo: string;
  attendance: number;
  marks: number;
  arrears: number;
  label: string;
  tier: "high" | "medium" | "safe";
}

const PRESET_PROFILES: StudentProfile[] = [
  {
    id: "p1",
    name: "Vikram Raman",
    dept: "Computer Science & Eng",
    rollNo: "21CS042",
    attendance: 52,
    marks: 38,
    arrears: 3,
    label: "Critical Dropout Risk",
    tier: "high",
  },
  {
    id: "p2",
    name: "Sneha Krishnan",
    dept: "Electronics & Comm",
    rollNo: "21EC019",
    attendance: 72,
    marks: 58,
    arrears: 1,
    label: "Moderate Vulnerability",
    tier: "medium",
  },
  {
    id: "p3",
    name: "Ananya Sharma",
    dept: "AI & Data Science",
    rollNo: "21AD008",
    attendance: 96,
    marks: 89,
    arrears: 0,
    label: "Optimal Safe Status",
    tier: "safe",
  },
];

export default function AIPredictionAnimation() {
  const [selectedProfileId, setSelectedProfileId] = useState<string>("p1");
  const [attendance, setAttendance] = useState<number>(52);
  const [marks, setMarks] = useState<number>(38);
  const [arrears, setArrears] = useState<number>(3);
  const [isAutoSimulating, setIsAutoSimulating] = useState<boolean>(true);
  const [activeCycle, setActiveCycle] = useState<number>(0);

  // Sync profile when clicked
  const handleSelectProfile = (profile: StudentProfile) => {
    setSelectedProfileId(profile.id);
    setAttendance(profile.attendance);
    setMarks(profile.marks);
    setArrears(profile.arrears);
  };

  // Auto-simulation interval: cycles through student profiles every 6 seconds
  useEffect(() => {
    if (!isAutoSimulating) return;

    const interval = setInterval(() => {
      setActiveCycle((prev) => {
        const next = (prev + 1) % PRESET_PROFILES.length;
        const prof = PRESET_PROFILES[next];
        setSelectedProfileId(prof.id);
        setAttendance(prof.attendance);
        setMarks(prof.marks);
        setArrears(prof.arrears);
        return next;
      });
    }, 5500);

    return () => clearInterval(interval);
  }, [isAutoSimulating]);

  // Compute machine learning risk index dynamically (0 - 100)
  const riskIndex = Math.min(
    99,
    Math.max(
      4,
      Math.round(
        (100 - attendance) * 0.54 +
        (100 - marks) * 0.34 +
        arrears * 11
      )
    )
  );

  const isHigh = riskIndex >= 70;
  const isMed = riskIndex >= 40 && riskIndex < 70;
  const isSafe = riskIndex < 40;

  const currentTheme = isHigh
    ? {
        tier: "HIGH DROPOUT RISK",
        badgeBg: "bg-rose-950/70 border-rose-500/50 text-rose-300",
        glow: "shadow-[0_0_40px_rgba(244,63,94,0.35)]",
        ringColor: "#f43f5e",
        textGradient: "from-rose-400 via-pink-400 to-amber-300",
        radarColor: "#f43f5e",
        action: "Urgent Mentor Escalation & Automated Parent SMS Dispatch",
        actionIcon: AlertTriangle,
        actionColor: "text-rose-400",
        actionBorder: "border-rose-500/30 bg-rose-950/40",
      }
    : isMed
    ? {
        tier: "MODERATE RISK",
        badgeBg: "bg-amber-950/70 border-amber-500/50 text-amber-300",
        glow: "shadow-[0_0_40px_rgba(245,158,11,0.35)]",
        ringColor: "#f59e0b",
        textGradient: "from-amber-400 via-orange-300 to-yellow-200",
        radarColor: "#f59e0b",
        action: "Weekly Remedial Study Plan & Scheduled 1-on-1 Mentorship",
        actionIcon: ShieldAlert,
        actionColor: "text-amber-400",
        actionBorder: "border-amber-500/30 bg-amber-950/40",
      }
    : {
        tier: "SAFE & OPTIMAL",
        badgeBg: "bg-emerald-950/70 border-emerald-500/50 text-emerald-300",
        glow: "shadow-[0_0_40px_rgba(16,185,129,0.35)]",
        ringColor: "#10b981",
        textGradient: "from-emerald-400 via-cyan-300 to-teal-200",
        radarColor: "#10b981",
        action: "Optimal Progression • Dean's Honors List Candidate",
        actionIcon: ShieldCheck,
        actionColor: "text-emerald-400",
        actionBorder: "border-emerald-500/30 bg-emerald-950/40",
      };

  return (
    <div className="relative w-full overflow-hidden rounded-3xl bg-gradient-to-b from-[#0c051a]/95 via-[#090314]/98 to-[#06020e]/95 border border-purple-500/30 p-6 sm:p-8 xl:p-10 shadow-2xl backdrop-blur-2xl">
      {/* Background Animated Ambient Lights */}
      <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-pink-600/15 blur-[120px] pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full bg-cyan-600/10 blur-[140px] pointer-events-none" />

      {/* ────────────────────────────────────────────────────────────────────────
          1. HEADER TELEMETRY BAR
      ──────────────────────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-purple-500/20">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest bg-purple-950/80 border border-pink-500/40 text-pink-300 shadow-[0_0_12px_rgba(236,72,153,0.3)]">
              <Brain className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
              ML Prediction Vector Scanner
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono text-cyan-400 px-2.5 py-0.5 rounded-full bg-cyan-950/50 border border-cyan-500/30">
              <Radio className="w-3 h-3 text-cyan-400 animate-ping" />
              INFERENCE LIVE (14ms)
            </span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
            Real-Time AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-300 to-cyan-300">Dropout Prediction Animation</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 font-light max-w-2xl">
            Watch the neural network analyze multimodal academic telemetry in real-time. Select a student profile or drag the live parameters to see the neural tensors compute risk.
          </p>
        </div>

        {/* Live Simulation Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsAutoSimulating(!isAutoSimulating)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all ${
              isAutoSimulating
                ? "bg-pink-950/60 border-pink-500/40 text-pink-300 shadow-[0_0_15px_rgba(236,72,153,0.25)]"
                : "bg-purple-950/40 border-purple-500/25 text-slate-400 hover:text-white"
            }`}
          >
            {isAutoSimulating ? (
              <>
                <Pause className="w-3.5 h-3.5 text-pink-400" />
                <span>Auto-Cycle ON</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-purple-300" />
                <span>Auto-Cycle OFF</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────────────
          2. CASE STUDY / PRESET SELECTORS
      ──────────────────────────────────────────────────────────────────────── */}
      <div className="relative z-10 py-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {PRESET_PROFILES.map((p) => {
          const isSelected = selectedProfileId === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => handleSelectProfile(p)}
              className={`p-3.5 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden group ${
                isSelected
                  ? "bg-purple-900/35 border-pink-500/60 shadow-[0_0_20px_rgba(236,72,153,0.25)] ring-1 ring-pink-500/50"
                  : "bg-purple-950/20 border-purple-500/20 hover:border-purple-500/40 hover:bg-purple-900/20"
              }`}
            >
              {isSelected && (
                <motion.div
                  layoutId="active-profile-highlight"
                  className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-transparent pointer-events-none"
                />
              )}
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-white group-hover:text-pink-300 transition-colors">
                  {p.name}
                </span>
                <span
                  className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                    p.tier === "high"
                      ? "bg-rose-950 text-rose-300 border border-rose-500/40"
                      : p.tier === "medium"
                      ? "bg-amber-950 text-amber-300 border border-amber-500/40"
                      : "bg-emerald-950 text-emerald-300 border border-emerald-500/40"
                  }`}
                >
                  {p.tier}
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>{p.rollNo} • {p.dept.split(" ")[0]}</span>
                <span className="text-pink-400 font-semibold">{p.attendance}% Att</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* ────────────────────────────────────────────────────────────────────────
          3. MAIN NEURAL SYNAPSE NETWORK & RADAR STAGE
      ──────────────────────────────────────────────────────────────────────── */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch pt-2">
        
        {/* LEFT COLUMN: LIVE PARAMETER NEURONS (SLIDERS) */}
        <div className="lg:col-span-4 p-5 sm:p-6 rounded-2xl bg-[#0e071e]/90 border border-purple-500/25 flex flex-col justify-between space-y-5">
          <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-300 font-bold flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-pink-400" />
              Input Neural Vector
            </span>
            <span className="text-[9px] font-mono text-purple-300">W_GLOBAL: 1.0</span>
          </div>

          {/* ATTENDANCE SLIDER */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                Attendance Trajectory
              </span>
              <span className={`font-mono font-bold ${attendance < 75 ? "text-rose-400" : "text-emerald-400"}`}>
                {attendance}% {attendance < 75 ? "⚠ Below 75%" : "✓ Good"}
              </span>
            </div>
            <input
              type="range"
              min="35"
              max="100"
              value={attendance}
              onChange={(e) => setAttendance(Number(e.target.value))}
              className="w-full h-2 bg-purple-950/90 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="flex justify-between text-[9px] text-slate-500 font-mono">
              <span>Crit: 35%</span>
              <span>Req: 75%</span>
              <span>Max: 100%</span>
            </div>
          </div>

          {/* INTERNAL MARKS SLIDER */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-pink-400" />
                CIA Internal Test Average
              </span>
              <span className={`font-mono font-bold ${marks < 50 ? "text-amber-400" : "text-pink-300"}`}>
                {marks} / 100
              </span>
            </div>
            <input
              type="range"
              min="15"
              max="100"
              value={marks}
              onChange={(e) => setMarks(Number(e.target.value))}
              className="w-full h-2 bg-purple-950/90 rounded-lg appearance-none cursor-pointer accent-pink-500"
            />
            <div className="flex justify-between text-[9px] text-slate-500 font-mono">
              <span>Pass: 50</span>
              <span>Dean: 85+</span>
            </div>
          </div>

          {/* ARREARS COUNTER */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                Active Backlogs / Arrears
              </span>
              <span className="font-mono font-bold text-white">
                {arrears} {arrears === 1 ? "Subject" : "Subjects"}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {[0, 1, 2, 3, 4].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setArrears(num)}
                  className={`py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                    arrears === num
                      ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/30 ring-1 ring-pink-400"
                      : "bg-purple-950/40 text-slate-400 border border-purple-500/20 hover:text-white"
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Real-Time Metric Pill */}
          <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/20 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>TENSOR CONFIDENCE</span>
            <span className="text-cyan-300 font-bold">96.4%</span>
          </div>
        </div>

        {/* CENTER COLUMN: ANIMATED NEURAL PROCESSING CORE */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-gradient-to-b from-[#12082b]/95 via-[#0c051d]/95 to-[#080214]/95 border border-purple-500/30 flex flex-col items-center justify-center relative overflow-hidden text-center min-h-[340px]">
          {/* Laser Scanner Horizontal Sweep Line */}
          <motion.div
            animate={{ top: ["5%", "95%", "5%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#00f0ff] to-transparent shadow-[0_0_15px_#00f0ff,0_0_30px_#ff2a85] pointer-events-none z-20"
          />

          {/* Rotating Gyroscopic Holographic Rings */}
          <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center my-auto">
            {/* Outer Cyber Dashed Ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border border-dashed border-purple-400/30 pointer-events-none"
            />

            {/* Middle Counter-Rotating Neon Ring */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute inset-3 rounded-full border-2 border-t-pink-500 border-r-transparent border-b-cyan-400 border-l-transparent pointer-events-none opacity-80"
            />

            {/* Pulsing Core Energy Orb */}
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.9, 0.6] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              className={`absolute inset-8 rounded-full blur-xl bg-gradient-to-tr ${
                isHigh
                  ? "from-rose-600/50 via-pink-600/40 to-amber-500/30"
                  : isMed
                  ? "from-amber-600/40 via-purple-600/30 to-cyan-500/30"
                  : "from-emerald-600/40 via-cyan-500/40 to-teal-400/30"
              }`}
            />

            {/* Central Microprocessor Core */}
            <div className="relative z-10 w-24 h-24 rounded-2xl bg-[#090317] border-2 border-purple-500/50 flex flex-col items-center justify-center shadow-2xl p-2 group">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 to-purple-600 p-0.5 shadow-lg shadow-pink-500/40 flex items-center justify-center mb-1"
              >
                <div className="w-full h-full bg-[#0d051f] rounded-[10px] flex items-center justify-center">
                  <Brain className="w-5 h-5 text-pink-400" />
                </div>
              </motion.div>
              <span className="text-[8px] font-mono font-bold text-cyan-300 uppercase tracking-wider">
                KNN MODEL
              </span>
              <span className="text-[7px] font-mono text-slate-400">
                12 NEURONS
              </span>
            </div>
          </div>

          {/* Real-Time Tensor Activity Ticker */}
          <div className="relative z-10 mt-3 flex items-center justify-between w-full text-[9px] font-mono text-slate-400 border-t border-purple-500/20 pt-2 px-2">
            <span className="flex items-center gap-1 text-pink-400">
              <Activity className="w-3 h-3 animate-pulse" /> SCANNING
            </span>
            <span>VECTOR SYNAPSE ACTIVE</span>
          </div>
        </div>

        {/* RIGHT COLUMN: PREDICTIVE RISK OUTCOME GAUGE */}
        <div className={`lg:col-span-4 p-6 rounded-2xl bg-[#0e071e]/90 border border-purple-500/25 flex flex-col justify-between items-center text-center space-y-4 ${currentTheme.glow} transition-shadow duration-500`}>
          <div className="w-full flex items-center justify-between border-b border-purple-500/20 pb-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-300 font-bold flex items-center gap-1.5">
              <Radar className="w-3.5 h-3.5 text-pink-400" />
              Outcome Risk Index
            </span>
            <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold border ${currentTheme.badgeBg}`}>
              {currentTheme.tier}
            </span>
          </div>

          {/* Large Radial Display */}
          <div className="relative flex flex-col items-center justify-center py-2">
            <div className="relative flex items-center justify-center">
              {/* Circular SVG Gauge Meter */}
              <svg className="w-40 h-40 transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="66"
                  stroke="rgba(168, 85, 247, 0.15)"
                  strokeWidth="10"
                  fill="transparent"
                />
                <motion.circle
                  cx="80"
                  cy="80"
                  r="66"
                  stroke={currentTheme.ringColor}
                  strokeWidth="10"
                  strokeDasharray="415"
                  animate={{
                    strokeDashoffset: 415 - (415 * riskIndex) / 100,
                  }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-colors duration-500"
                />
              </svg>

              {/* Number In Center */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                  key={riskIndex}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`text-4xl sm:text-5xl font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-r ${currentTheme.textGradient}`}
                >
                  {riskIndex}%
                </motion.span>
                <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 font-bold mt-0.5">
                  DROPOUT RISK
                </span>
              </div>
            </div>
          </div>

          {/* Automated Action Card */}
          <div className={`w-full p-3.5 rounded-xl border ${currentTheme.actionBorder} text-left transition-colors duration-300`}>
            <div className="flex items-center gap-2 mb-1">
              <currentTheme.actionIcon className={`w-4 h-4 ${currentTheme.actionColor} shrink-0`} />
              <span className={`text-xs font-bold ${currentTheme.actionColor}`}>
                Automated System Response:
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-light leading-relaxed pl-6">
              {currentTheme.action}
            </p>
          </div>

          {/* Direct CTA into Auth / Login */}
          <div className="w-full pt-1">
            <Link
              to="/auth?mode=login"
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold uppercase tracking-wider text-white bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 hover:to-pink-500 transition-all duration-300 shadow-md shadow-pink-500/20 hover:scale-[1.02] flex items-center justify-center gap-1.5"
            >
              <span>Login to Deploy Prediction Models</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>

      {/* ────────────────────────────────────────────────────────────────────────
          4. BOTTOM SHAP CONTRIBUTING VECTOR BREAKDOWN
      ──────────────────────────────────────────────────────────────────────── */}
      <div className="relative z-10 mt-6 pt-5 border-t border-purple-500/20 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/15 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">Attendance Regression:</span>
          <span className={`font-bold ${attendance < 75 ? "text-rose-400" : "text-emerald-400"}`}>
            {attendance < 75 ? `-${Math.round((75 - attendance) * 1.2)}% Penalized` : "+18% Stabilized"}
          </span>
        </div>
        <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/15 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">CIA Test Trajectory:</span>
          <span className={`font-bold ${marks < 50 ? "text-amber-400" : "text-emerald-400"}`}>
            {marks < 50 ? `-${Math.round((50 - marks) * 0.8)}% Vulnerable` : "+14% Optimal"}
          </span>
        </div>
        <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/15 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">Arrears Multiplier:</span>
          <span className={`font-bold ${arrears > 0 ? "text-rose-400" : "text-emerald-400"}`}>
            {arrears > 0 ? `+${arrears * 11}% Risk Load` : "0% Clear (Safe)"}
          </span>
        </div>
      </div>
    </div>
  );
}

