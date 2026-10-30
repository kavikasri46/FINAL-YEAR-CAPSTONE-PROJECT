import React, { useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  GraduationCap,
  Shield,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Lock,
  Cpu,
  Key,
  Users,
  Compass,
} from "lucide-react";
import collegeLogo from "@/images/kpr logo.jpg";

export default function AuthBookShowcase() {
  const [isOpen, setIsOpen] = useState(true);

  // Mouse 3D Gyroscope/Tilt
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 100, damping: 18 });
  const springY = useSpring(mouseY, { stiffness: 100, damping: 18 });
  const rotateX = useTransform(springY, [-180, 180], [10, -10]);
  const rotateY = useTransform(springX, [-180, 180], [-15, 15]);

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

  return (
    <div
      className="relative w-full h-full flex flex-col items-center justify-center p-6 select-none"
      style={{ perspective: "1400px" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Ambient Pulsing Aura Glow */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="w-[420px] h-[420px] rounded-full blur-[120px] bg-gradient-to-tr from-pink-600/30 via-purple-600/30 to-cyan-500/25"
        />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-pink-400/60 shadow-[0_0_8px_#ec4899]"
            style={{
              top: `${15 + i * 10}%`,
              left: `${10 + (i * 12) % 80}%`,
            }}
            animate={{
              y: [-15, 15, -15],
              x: [-10, 10, -10],
              opacity: [0.3, 0.9, 0.3],
            }}
            transition={{
              duration: 3 + (i % 3),
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.4,
            }}
          />
        ))}
      </div>

      {/* ────────────────────────────────────────────────────────────────────────
          3D BOOK WRAPPER
      ──────────────────────────────────────────────────────────────────────── */}
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className="relative transition-transform duration-200 ease-out flex items-center justify-center cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        {/* Book Body Container */}
        <div
          className={`relative transition-all duration-700 ease-in-out ${
            isOpen
              ? "w-[440px] xl:w-[480px] h-[360px]"
              : "w-[260px] h-[360px]"
          }`}
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Base Depth and Crease Drop Shadow */}
          <div
            className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#0c0618] via-[#160b2d] to-[#0a0416] border border-purple-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_30px_rgba(236,72,153,0.25)]"
          />

          {/* ─── A: CLOSED BOOK COVER ─────────────────────────────────────────── */}
          {!isOpen && (
            <motion.div
              initial={{ opacity: 0, rotateY: -110 }}
              animate={{ opacity: 1, rotateY: 0 }}
              exit={{ opacity: 0, rotateY: -110 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 rounded-2xl overflow-hidden bg-gradient-to-br from-[#1a0b38] via-[#100726] to-[#070214] border-2 border-pink-500/50 flex flex-col items-center justify-between p-7 text-center shadow-2xl group"
              style={{
                backfaceVisibility: "hidden",
                transformStyle: "preserve-3d",
              }}
            >
              <div className="absolute inset-3 rounded-xl border border-dashed border-pink-400/30 pointer-events-none" />

              <div className="flex flex-col items-center pt-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-600 to-cyan-500 p-0.5 shadow-lg shadow-pink-500/40 group-hover:scale-105 transition-transform">
                  <div className="w-full h-full rounded-[14px] bg-[#0c051a] flex items-center justify-center">
                    <img src={collegeLogo} alt="KPRCAS" className="w-8 h-8 rounded-lg object-contain" />
                  </div>
                </div>
                <span className="text-[9px] uppercase tracking-[0.25em] text-pink-300 font-extrabold mt-3">
                  INSTITUTIONAL PORTAL
                </span>
              </div>

              <div>
                <h3 className="text-xl font-display font-extrabold text-white tracking-wide">
                  EduGuard
                </h3>
                <p className="text-[10px] uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-300 font-bold mt-0.5">
                  Academic Ledger
                </p>
                <div className="flex items-center justify-center gap-1.5 mt-3 text-[10px] text-emerald-400 font-mono">
                  <Lock className="w-3 h-3" /> MongoDB Secured
                </div>
              </div>

              <div className="w-full">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-pink-300 uppercase tracking-wider group-hover:text-white transition-colors">
                  <BookOpen className="w-3.5 h-3.5 animate-bounce" /> Click to Open Book
                </span>
              </div>
            </motion.div>
          )}

          {/* ─── B: OPEN BOOK SPREAD (2-PAGE HOLOGRAPHIC DISPLAY) ────────────── */}
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 rounded-2xl overflow-hidden grid grid-cols-2 bg-[#0c0619] border border-purple-500/40"
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Spine Crease */}
              <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-6 bg-gradient-to-r from-black/70 via-black/90 to-black/70 z-30 pointer-events-none" />

              {/* LEFT PAGE: INSTITUTIONAL REGISTRY */}
              <div className="relative p-5 flex flex-col justify-between bg-gradient-to-br from-[#120926]/95 to-[#0b0518]/95 border-r border-purple-500/20">
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <img src={collegeLogo} alt="KPR" className="w-7 h-7 rounded-lg ring-1 ring-purple-400/40" />
                    <div>
                      <h4 className="text-xs font-display font-extrabold text-white tracking-wide">KPRCAS</h4>
                      <p className="text-[8px] uppercase tracking-wider text-pink-400 font-semibold">Learn Beyond</p>
                    </div>
                  </div>

                  <div className="space-y-2 mt-4">
                    <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/20 text-[11px]">
                      <span className="text-[9px] uppercase tracking-wider text-purple-300 font-bold block">
                        Portal Registry
                      </span>
                      <p className="text-slate-300 font-light text-[10px] mt-0.5">
                        Centralized Dropout Early Warning & Academic Mentorship Engine
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-pink-950/30 border border-pink-500/20 text-[11px]">
                      <span className="text-[9px] uppercase tracking-wider text-pink-300 font-bold block">
                        ML Risk Accuracy
                      </span>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-sm font-mono font-bold text-pink-400">94.8%</span>
                        <span className="text-[9px] text-slate-400">KNN Classifier</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative z-10 flex items-center justify-between text-[9px] text-slate-500 pt-2 border-t border-purple-500/15">
                  <span className="font-mono">FOLIO #2026-A</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5" /> ONLINE
                  </span>
                </div>
              </div>

              {/* RIGHT PAGE: ROLES & ACCESS MATRIX */}
              <div className="relative p-5 flex flex-col justify-between bg-gradient-to-bl from-[#140b2d]/95 to-[#090416]/95 overflow-hidden">
                {/* Laser scan line passing over page */}
                <motion.div
                  animate={{
                    top: ["0%", "100%", "0%"],
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#00f0ff] pointer-events-none z-20"
                />

                <div className="relative z-10">
                  <div className="flex items-center justify-between border-b border-purple-500/20 pb-2 mb-3">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-slate-300 font-bold">
                      ACCESS TIERS
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-400/30 text-[8px] font-mono text-cyan-300 font-bold">
                      4 ROLES
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {[
                      { role: "Admin", desc: "Full Analytics & ERP Sync", color: "#a855f7" },
                      { role: "Faculty Mentor", desc: "1-on-1 Student Guidance", color: "#ec4899" },
                      { role: "Student", desc: "Performance & Sessions", color: "#06b6d4" },
                      { role: "Parent", desc: "Attendance & SMS Alerts", color: "#10b981" },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-1.5 rounded-lg bg-[#160c30]/70 border border-purple-500/15 text-[10px]"
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="font-semibold text-white">{item.role}</span>
                        </div>
                        <span className="text-[8px] text-slate-400">{item.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative z-10 flex items-center justify-between pt-2 border-t border-purple-500/15 text-[9px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Key className="w-2.5 h-2.5 text-pink-400" /> JWT Encrypted
                  </span>
                  <span className="text-[8px] font-mono text-purple-300">CLICK TO CLOSE</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      <p className="text-[11px] text-slate-400/80 mt-5 font-light text-center flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-pink-400" />
        Interactive 3D Ledger: Tilt with cursor • Click to open & close
      </p>
    </div>
  );
}

