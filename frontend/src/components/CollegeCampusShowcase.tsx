import React from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Sparkles, MapPin, ShieldCheck, Radio, Eye, Layers } from "lucide-react";
import collegeLogo from "@/images/kpr logo.jpg";

interface CollegeCampusShowcaseProps {
  imageUrl?: string;
}

export default function CollegeCampusShowcase({
  imageUrl = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSdP-RRJw9azqzZPRS0X-mnx3PdXPS5QsgS4CX97vPFypWutU4AuuXr69W8&s=10",
}: CollegeCampusShowcaseProps) {
  // 3D Gyroscope Perspective Physics
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 90, damping: 16 });
  const springY = useSpring(mouseY, { stiffness: 90, damping: 16 });

  const rotateX = useTransform(springY, [-180, 180], [10, -10]);
  const rotateY = useTransform(springX, [-180, 180], [-12, 12]);

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
      className="relative w-full max-w-[420px] mx-auto select-none"
      style={{ perspective: "1200px" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Background Breathing Neon Aura */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.35, 0.65, 0.35],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 rounded-3xl blur-[80px] bg-gradient-to-tr from-pink-600/35 via-purple-600/30 to-cyan-500/25 pointer-events-none"
      />

      {/* Floating Sparkle Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#00f0ff]"
            style={{
              top: `${15 + i * 14}%`,
              left: `${8 + (i * 18) % 80}%`,
            }}
            animate={{
              y: [-12, 12, -12],
              x: [-8, 8, -8],
              opacity: [0.2, 0.9, 0.2],
            }}
            transition={{
              duration: 3 + i * 0.4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.3,
            }}
          />
        ))}
      </div>

      {/* 3D Tilted Card Container */}
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className="relative rounded-3xl overflow-hidden border-2 border-pink-500/40 bg-[#0d061c]/90 shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_40px_rgba(236,72,153,0.3)] transition-transform duration-150 ease-out group"
      >
        {/* Futuristic Laser Scanner Horizontal Sweep Line */}
        <motion.div
          animate={{
            top: ["0%", "100%", "0%"],
          }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
          className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#00f0ff] to-transparent shadow-[0_0_20px_#00f0ff,0_0_35px_#ff2a85] z-30 pointer-events-none"
        >
          <div className="absolute -top-3 -bottom-3 left-0 right-0 bg-cyan-400/15 blur-sm" />
        </motion.div>

        {/* Top High-Tech HUD Overlay */}
        <div className="absolute top-4 inset-x-4 z-20 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-black/60 border border-purple-500/30 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[9px] font-mono font-bold text-white tracking-widest uppercase">
              CAMPUS RADAR ACTIVE
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 border border-pink-500/30 backdrop-blur-md text-[9px] font-mono text-pink-300">
            <MapPin className="w-3 h-3 text-pink-400" />
            <span>KPRCAS • CBE</span>
          </div>
        </div>

        {/* HUD Targeting Corner Reticles */}
        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-cyan-400 z-20 pointer-events-none" />
        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-cyan-400 z-20 pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-cyan-400 z-20 pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-cyan-400 z-20 pointer-events-none" />

        {/* College Campus Image with Hover Zoom */}
        <div className="relative aspect-[4/5] overflow-hidden">
          <motion.img
            src={imageUrl}
            alt="KPR College of Arts & Science Campus"
            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
            initial={{ scale: 1 }}
            whileHover={{ scale: 1.06 }}
          />

          {/* Vignette & Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#080315] via-[#080315]/20 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#080315]/60 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* Central Subtle Scanning Crosshair Reticle */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 opacity-30 group-hover:opacity-60 transition-opacity">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="w-24 h-24 rounded-full border border-dashed border-cyan-400/60"
          />
        </div>

        {/* Bottom Glassmorphic Plaque */}
        <div className="absolute bottom-4 inset-x-4 p-4 rounded-2xl bg-[#0f0724]/90 border border-pink-500/40 backdrop-blur-xl shadow-2xl z-20">
          <div className="flex items-center gap-3 mb-2">
            <div className="relative">
              <div className="absolute inset-0 bg-pink-500/30 rounded-lg blur-sm" />
              <img
                src={collegeLogo}
                alt="KPRCAS Seal"
                className="w-8 h-8 rounded-lg object-contain relative bg-white p-0.5 ring-1 ring-pink-400/50"
              />
            </div>
            <div>
              <p className="text-xs font-display font-extrabold uppercase tracking-wider text-white">
                KPRCAS MAIN CAMPUS
              </p>
              <p className="text-[9px] uppercase tracking-widest text-pink-300 font-semibold">
                Autonomous • Coimbatore
              </p>
            </div>
          </div>

          <p className="text-[10px] text-slate-300 font-light leading-snug">
            Center of Student Retention, ML Risk Early Warning & Comprehensive Mentorship Guidance.
          </p>

          <div className="mt-2.5 pt-2 border-t border-purple-500/20 flex items-center justify-between text-[9px] font-mono text-slate-400">
            <span className="flex items-center gap-1 text-cyan-300">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              ZERO DROPOUT MISSION
            </span>
            <span className="text-pink-300">EST. 2019</span>
          </div>
        </div>
      </motion.div>

      {/* Bottom Hint */}
      <p className="text-[10px] text-center text-slate-400/80 mt-3 font-light flex items-center justify-center gap-1.5">
        <Sparkles className="w-3 h-3 text-pink-400" />
        Interactive Campus Hologram • Hover to tilt with 3D physics
      </p>
    </div>
  );
}

