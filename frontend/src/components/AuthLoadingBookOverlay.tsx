import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Shield, Lock, Cpu, CheckCircle2 } from "lucide-react";
import collegeLogo from "@/images/kpr logo.jpg";

interface AuthLoadingBookOverlayProps {
  mode: "login" | "register";
  role?: string;
}

export default function AuthLoadingBookOverlay({ mode, role = "User" }: AuthLoadingBookOverlayProps) {
  const [step, setStep] = useState(0);

  const steps = [
    "Opening 3D Academic Dossier...",
    "Connecting to MongoDB Atlas Cluster...",
    `Authenticating ${role.toUpperCase()} Credentials...`,
    "Decrypting Early Warning Risk Vectors...",
    "Access Granted! Entering EduGuard Portal...",
  ];

  useEffect(() => {
    const timer1 = setTimeout(() => setStep(1), 700);
    const timer2 = setTimeout(() => setStep(2), 1500);
    const timer3 = setTimeout(() => setStep(3), 2300);
    const timer4 = setTimeout(() => setStep(4), 3100);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#070312]/90 backdrop-blur-2xl select-none"
    >
      {/* Background Radiance Glow */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.35, 0.7, 0.35],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="w-[500px] h-[500px] rounded-full blur-[140px] bg-gradient-to-tr from-pink-600/40 via-purple-600/40 to-cyan-500/30"
        />
      </div>

      {/* ────────────────────────────────────────────────────────────────────────
          3D ANIMATED BOOK OPENING STAGE
      ──────────────────────────────────────────────────────────────────────── */}
      <div
        className="relative z-10 flex flex-col items-center justify-center"
        style={{ perspective: "1500px" }}
      >
        <motion.div
          initial={{ scale: 0.8, rotateX: 20, y: 30 }}
          animate={{ scale: 1, rotateX: 0, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{ transformStyle: "preserve-3d" }}
          className="relative w-[340px] sm:w-[460px] h-[280px] sm:h-[320px] flex items-center justify-center"
        >
          {/* Book Depth Base */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#0c0519] via-[#1a0b36] to-[#0a0316] border border-pink-500/40 shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_40px_rgba(236,72,153,0.35)]" />

          {/* Left Page (Fixed) */}
          <div className="absolute top-0 bottom-0 left-0 right-1/2 rounded-l-2xl overflow-hidden bg-gradient-to-br from-[#120726] to-[#0a0318] p-5 sm:p-6 border-l border-t border-b border-purple-500/30 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <img src={collegeLogo} alt="KPRCAS" className="w-8 h-8 rounded-lg ring-1 ring-pink-500/40 p-0.5 bg-white" />
                <div>
                  <h4 className="text-xs font-display font-extrabold text-white">KPRCAS EduGuard</h4>
                  <p className="text-[8px] uppercase tracking-wider text-pink-400 font-bold">Learn Beyond</p>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/20 text-[10px]">
                <span className="text-[9px] uppercase tracking-wider text-purple-300 font-bold block mb-1">
                  Access Portal
                </span>
                <p className="text-slate-300 font-light text-[9px] leading-relaxed">
                  Initializing secure neural handshake for {role} role...
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono border-t border-purple-500/20 pt-2">
              <span>SEC: TLS 1.3</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-2.5 h-2.5" /> READY
              </span>
            </div>
          </div>

          {/* Center Spine Crease */}
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-6 bg-gradient-to-r from-black/80 via-black/95 to-black/80 z-40 pointer-events-none" />

          {/* Right Page with Laser Scanner Effect */}
          <div className="absolute top-0 bottom-0 right-0 left-1/2 rounded-r-2xl overflow-hidden bg-gradient-to-bl from-[#150a2e] to-[#080214] p-5 sm:p-6 border-r border-t border-b border-purple-500/30 flex flex-col justify-between">
            {/* Holographic Glowing Laser Scan Line */}
            <motion.div
              animate={{
                top: ["5%", "90%", "5%"],
              }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
              className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#00f0ff] to-transparent shadow-[0_0_20px_#00f0ff,0_0_40px_#ff2a85] z-30 pointer-events-none"
            >
              <div className="absolute -top-4 -bottom-4 left-0 right-0 bg-cyan-400/15 blur-sm pointer-events-none" />
            </motion.div>

            <div className="relative z-10 space-y-2.5">
              <div className="flex items-center justify-between border-b border-purple-500/20 pb-2">
                <span className="text-[9px] font-mono uppercase tracking-widest text-pink-300 font-bold">
                  VERIFICATION
                </span>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span className="text-[8px] font-mono text-cyan-300 font-bold">SCANNING</span>
                </div>
              </div>

              <div className="space-y-1.5 text-[9px] font-mono">
                <div className="flex items-center justify-between text-slate-300 p-1.5 rounded bg-purple-950/30">
                  <span>JWT Auth:</span>
                  <span className="text-cyan-300 font-bold">256-BIT</span>
                </div>
                <div className="flex items-center justify-between text-slate-300 p-1.5 rounded bg-purple-950/30">
                  <span>Database:</span>
                  <span className="text-emerald-400 font-bold">ATLAS LIVE</span>
                </div>
                <div className="flex items-center justify-between text-slate-300 p-1.5 rounded bg-purple-950/30">
                  <span>Prediction Engine:</span>
                  <span className="text-pink-400 font-bold">ACTIVE</span>
                </div>
              </div>
            </div>

            <div className="relative z-10 flex items-center justify-between text-[9px] text-slate-400 border-t border-purple-500/20 pt-2 font-mono">
              <span>FOLIO #2026</span>
              <span className="text-cyan-400">CONNECTING...</span>
            </div>
          </div>

          {/* 3D Animated Opening Cover */}
          <motion.div
            initial={{ rotateY: 0 }}
            animate={{ rotateY: -155 }}
            transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1] }}
            style={{
              transformOrigin: "left center",
              transformStyle: "preserve-3d",
              backfaceVisibility: "hidden",
            }}
            className="absolute top-0 bottom-0 left-1/2 w-1/2 rounded-r-2xl overflow-hidden bg-gradient-to-br from-[#1a0b38] via-[#100726] to-[#070214] border-2 border-pink-500/60 p-6 flex flex-col items-center justify-between text-center z-50 pointer-events-none shadow-2xl"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-pink-500 via-purple-600 to-cyan-500 p-0.5 shadow-lg shadow-pink-500/40 mt-3">
              <div className="w-full h-full rounded-[10px] bg-[#0c051a] flex items-center justify-center">
                <img src={collegeLogo} alt="KPRCAS" className="w-7 h-7 rounded-md object-contain" />
              </div>
            </div>

            <div>
              <h3 className="text-base font-display font-extrabold text-white">EduGuard</h3>
              <p className="text-[8px] uppercase tracking-widest text-pink-300 font-bold">
                Institutional Ledger
              </p>
            </div>

            <span className="text-[9px] font-mono text-purple-300">AUTHENTICATING</span>
          </motion.div>
        </motion.div>

        {/* Dynamic Status Progress Indicator */}
        <div className="mt-8 flex flex-col items-center text-center space-y-3 max-w-sm">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-4 h-4 border-2 border-pink-400 border-t-transparent rounded-full"
            />
            <span className="text-xs sm:text-sm font-display font-bold text-white tracking-wide">
              {steps[step]}
            </span>
          </div>

          {/* Glowing Animated Progress Bar */}
          <div className="w-64 h-1.5 bg-purple-950/80 rounded-full overflow-hidden border border-purple-500/30">
            <motion.div
              className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 shadow-[0_0_12px_#ff2a85]"
              initial={{ width: "10%" }}
              animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </div>

          <p className="text-[10px] text-slate-400 font-light">
            Connecting through secure TLS pipeline • Please do not refresh
          </p>
        </div>
      </div>
    </motion.div>
  );
}

