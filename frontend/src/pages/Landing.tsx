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
  ExternalLink,
  ChevronRight,
  Globe,
  Mail,
  MapPin,
  Shield,
  Zap,
  Code,
  Palette,
  Eye,
  Sliders
} from "lucide-react";
import { api } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import heroPortrait from "@/images/hero_portrait.jpg";
import portalArch from "@/images/portal_arch.jpg";

interface Project {
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
  const [message, setMessage] = useState("");
  const [service, setService] = useState("UI/UX & AI Architecture");
  const [submitting, setSubmitting] = useState(false);
  const [formStatus, setFormStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterMsg, setNewsletterMsg] = useState("");

  // Selected project modal
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "fintech" | "wellness" | "ai">("all");
  const [activeProcessStep, setActiveProcessStep] = useState(0);

  // Dynamic portfolio data
  const [portfolioData, setPortfolioData] = useState<any>(null);

  useEffect(() => {
    // Load dynamic data from backend API
    api.getLandingData()
      .then((data) => setPortfolioData(data))
      .catch(() => {
        // Fallback data if backend is offline
        setPortfolioData(null);
      });
  }, []);

  const projects: Project[] = portfolioData?.projects || [
    {
      id: "nexora",
      number: "01",
      title: "NEXORA",
      subtitle: "Fintech Dashboard & Risk Analytics Redesign",
      category: "Fintech",
      tags: ["UX Research", "UI Design", "Prototyping"],
      description: "High-density transactional risk analytics and predictive student financial aid disbursement interface with sub-millisecond data visualization.",
      impact: "42% increase in advisor task completion speed and 98.4% user satisfaction rate.",
      stats: { accuracy: "99.1%", latency: "< 45ms", users: "18.5k" },
      color: "from-purple-500/20 to-pink-500/10",
      featured: true,
    },
    {
      id: "mindful",
      number: "02",
      title: "MINDFUL",
      subtitle: "Mental Wellness & Early Warning App",
      category: "Wellness & EdTech",
      tags: ["UX Research", "UI Design", "Interaction"],
      description: "AI-guided mental health companion featuring adaptive sentiment assessment, burnout detection, and instant mentor escalation pathways.",
      impact: "Adopted across 4 universities, reducing critical stress interventions by 65%.",
      stats: { rating: "4.9/5", dailyActive: "8.2k", retention: "84%" },
      color: "from-pink-500/20 to-purple-500/10",
      featured: true,
    },
    {
      id: "roamia",
      number: "03",
      title: "ROAMIA",
      subtitle: "Travel & Smart Campus Navigation Platform",
      category: "Campus AI",
      tags: ["UX Research", "UI Design", "Prototyping"],
      description: "Intelligent timetable scheduling and conflict-free room allocation engine with real-time push alerts and live student attendance tracking.",
      impact: "Zero scheduling conflicts recorded across 120+ faculty members and 2,400 students.",
      stats: { accuracy: "100%", schedules: "1,200+", timeSaved: "14 hrs/wk" },
      color: "from-violet-500/20 to-fuchsia-500/10",
      featured: true,
    }
  ];

  const services = portfolioData?.services || [
    {
      id: "user-research",
      title: "User Research",
      description: "Uncover insights that drive meaningful products with behavioral interviews & data modeling.",
      icon: Search,
      tags: ["Persona Mapping", "Data Synthesis", "Usability Testing"]
    },
    {
      id: "interaction-design",
      title: "Interaction Design",
      description: "Design intuitive flows and micro-interactions that users naturally fall in love with.",
      icon: Sparkles,
      tags: ["Design Systems", "Prototyping", "Motion Physics"]
    },
    {
      id: "ui-visual-design",
      title: "UI Visual Design",
      description: "Create beautiful, consistent, and on-brand interfaces with futuristic glassmorphism.",
      icon: Layers,
      tags: ["Dark Luxe UI", "Neon Cybernetics", "Design Tokens"]
    },
    {
      id: "prototyping",
      title: "Prototyping",
      description: "Bring ideas to life with high-fidelity functional models and validate before development.",
      icon: Cpu,
      tags: ["React & TypeScript", "REST APIs", "AI Integrations"]
    }
  ];

  const tools = [
    { name: "Figma", category: "Design", color: "#F24E1E", icon: "🎨" },
    { name: "Sketch", category: "Vector", color: "#F7B500", icon: "💎" },
    { name: "Adobe XD", category: "Prototypes", color: "#FF61F6", icon: "⚡" },
    { name: "Photoshop", category: "Creative", color: "#31A8FF", icon: "✨" },
    { name: "Illustrator", category: "Graphics", color: "#FF9A00", icon: "📐" },
    { name: "ProtoPie", category: "Motion", color: "#EA2E7B", icon: "📱" },
  ];

  const processSteps = portfolioData?.process || [
    { step: "01", name: "EMPATHIZE", desc: "Understand users, their needs, and their deep pain points through empathy interviews." },
    { step: "02", name: "DEFINE", desc: "Synthesize insights and frame the core problem to achieve targeted impact." },
    { step: "03", name: "IDEATE", desc: "Brainstorm multi-dimensional solutions and explore bold creative directions." },
    { step: "04", name: "DESIGN", desc: "Craft intuitive interfaces, micro-animations, and delightful experiences." },
    { step: "05", name: "TEST & REFINE", desc: "Validate, iterate, and refine with real-world user metrics and feedback." }
  ];

  const testimonials = portfolioData?.testimonials || [
    {
      id: "t1",
      quote: "Liva transformed our complex product into a seamless experience. Her user insights and design vision are unmatched.",
      name: "Nathan Park",
      role: "Product Manager, Nexora",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
    },
    {
      id: "t2",
      quote: "Working with Liva was an absolute pleasure. She's insightful, proactive, and truly cares about the user.",
      name: "Sofia Martinez",
      role: "Founder, Mindful",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80"
    },
    {
      id: "t3",
      quote: "Her designs not only look beautiful but also drive results. Our engagement increased by 40% after the redesign.",
      name: "James Wilson",
      role: "CTO, Roamia",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
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
        service,
      });
      setFormStatus({ type: "success", text: res.message || "Thank you! Your message has been received." });
      setName("");
      setEmail("");
      setMessage("");
    } catch (err: any) {
      setFormStatus({ type: "error", text: err.message || "Failed to send message. Please try again." });
    }
    setSubmitting(false);
  };

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim() || !newsletterEmail.includes("@")) return;
    try {
      const res = await api.subscribeNewsletter(newsletterEmail.trim());
      setNewsletterMsg(res.message || "Subscribed successfully!");
      setNewsletterEmail("");
    } catch {
      setNewsletterMsg("Subscribed! We'll keep you updated.");
      setNewsletterEmail("");
    }
  };

  return (
    <div className="min-h-screen bg-[#080511] text-slate-100 selection:bg-pink-500/30 selection:text-pink-200 relative overflow-x-hidden font-sans">
      
      {/* Dynamic Ambient Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-40 left-1/4 w-[650px] h-[650px] bg-purple-600/15 rounded-full blur-[160px] animate-pulse-glow" />
        <div className="absolute top-[45%] -right-40 w-[550px] h-[550px] bg-pink-600/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-20 left-10 w-[600px] h-[600px] bg-indigo-700/10 rounded-full blur-[180px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          1. NAVIGATION BAR
      ────────────────────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#080511]/75 border-b border-purple-500/10 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-purple-600 via-pink-500 to-indigo-500 p-[1.5px] shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full bg-[#0d091a] rounded-[10px] flex items-center justify-center">
                <div className="w-4 h-4 rounded-full border-2 border-pink-400/80 border-t-transparent animate-spin duration-[4000ms]" />
              </div>
            </div>
            <div>
              <span className="font-display font-bold text-xl tracking-wider text-white flex items-center gap-1">
                L I V A
              </span>
              <p className="text-[9px] uppercase tracking-[0.25em] text-purple-300/60 font-medium -mt-0.5">
                UX SPECIALIST & AI
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs uppercase tracking-widest text-slate-300">
            <a href="#home" className="hover:text-pink-400 transition-colors flex items-center gap-1.5 font-medium text-white">
              <span className="h-1.5 w-1.5 rounded-full bg-pink-400 shadow-[0_0_8px_#f472b6]" /> Home
            </a>
            <a href="#work" className="hover:text-pink-400 transition-colors text-slate-400 hover:text-white">
              Work
            </a>
            <a href="#about" className="hover:text-pink-400 transition-colors text-slate-400 hover:text-white">
              About
            </a>
            <a href="#services" className="hover:text-pink-400 transition-colors text-slate-400 hover:text-white">
              Services
            </a>
            <a href="#process" className="hover:text-pink-400 transition-colors text-slate-400 hover:text-white">
              Process
            </a>
            <a href="#testimonials" className="hover:text-pink-400 transition-colors text-slate-400 hover:text-white">
              Kind Words
            </a>
          </nav>

          {/* CTA / Launch Portal */}
          <div className="flex items-center gap-3">
            {user ? (
              <Link
                to="/"
                className="px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-105 transition-all duration-300 flex items-center gap-2"
              >
                <Zap className="h-3.5 w-3.5 fill-current" /> Open App
              </Link>
            ) : (
              <>
                <Link
                  to="/auth"
                  className="hidden sm:inline-flex px-4 py-2 rounded-full text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 border border-purple-500/20 transition-all duration-200"
                >
                  Sign In
                </Link>
                <a
                  href="#contact"
                  className="px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-gradient-to-r from-purple-600 via-pink-600 to-pink-500 hover:opacity-90 text-white shadow-lg shadow-pink-500/20 hover:shadow-pink-500/35 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 border border-pink-400/30"
                >
                  Let's Connect
                </a>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ──────────────────────────────────────────────────────────────────────────
          2. HERO SECTION
      ────────────────────────────────────────────────────────────────────────── */}
      <section id="home" className="relative pt-12 pb-24 md:pt-20 md:pb-32 z-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-6 space-y-8">
            
            {/* Top Pill Tag */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 text-xs tracking-widest uppercase font-medium backdrop-blur-md shadow-sm"
            >
              <span className="w-2 h-2 rounded-full bg-pink-400 animate-ping" />
              | UX SPECIALIST & AI ARCHITECT |
            </motion.div>

            {/* Display Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl font-display font-extrabold leading-[1.12] tracking-tight text-white"
            >
              I design experiences <br />
              that feel like{" "}
              <span className="italic font-serif font-normal text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-300 to-indigo-300 drop-shadow-[0_0_35px_rgba(236,72,153,0.35)]">
                the future.
              </span>
            </motion.h1>

            {/* Subtext */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg text-slate-300/85 leading-relaxed max-w-xl font-light"
            >
              I craft intuitive digital experiences that merge human insight with elegant design—turning ambitious ideas into resilient products people love and remember.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap items-center gap-4 pt-2"
            >
              <a
                href="#work"
                className="px-8 py-3.5 rounded-full text-sm font-semibold tracking-wide uppercase bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:from-pink-400 hover:to-indigo-500 text-white shadow-xl shadow-pink-500/25 hover:shadow-pink-500/40 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-2 group"
              >
                View My Work
                <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>

              <a
                href="#about"
                className="px-7 py-3.5 rounded-full text-sm font-medium tracking-wide uppercase bg-[#140f26]/80 hover:bg-[#1c1536] text-slate-200 border border-purple-500/25 hover:border-purple-400/50 backdrop-blur-md transition-all duration-300 flex items-center gap-2 shadow-lg"
              >
                About Me
              </a>
            </motion.div>

            {/* Available for Projects Badge */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex items-center gap-3 pt-4 text-xs text-slate-400"
            >
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-pink-500"></span>
              </span>
              <div>
                <span className="text-pink-300 font-semibold uppercase tracking-wider">AVAILABLE FOR PROJECTS</span>
                <p className="text-slate-400 text-[11px]">Let's build something exceptional together</p>
              </div>
            </motion.div>
          </div>

          {/* Hero Right Visual Showcase (Matching Reference Exactly) */}
          <div className="lg:col-span-6 relative flex items-center justify-center">
            
            {/* Luminous Center Ring Glow */}
            <div className="absolute w-[360px] sm:w-[460px] h-[360px] sm:h-[460px] rounded-full border border-pink-500/30 bg-gradient-to-tr from-purple-600/20 via-pink-500/10 to-transparent blur-sm pointer-events-none animate-pulse-glow" />
            <div className="absolute w-[300px] sm:w-[380px] h-[300px] sm:h-[380px] rounded-full border-2 border-pink-400/40 shadow-[0_0_60px_rgba(244,114,182,0.35)] pointer-events-none" />

            {/* Main Portrait Mask Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative z-10 w-[300px] sm:w-[390px] h-[300px] sm:h-[390px] rounded-full overflow-hidden border-4 border-purple-500/30 shadow-[0_0_80px_rgba(168,85,247,0.3)] group"
            >
              <img
                src={heroPortrait}
                alt="Liva - UX Specialist"
                className="w-full h-full object-cover object-center scale-105 group-hover:scale-110 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080511] via-transparent to-purple-900/10" />
            </motion.div>

            {/* Floating Glass Card 1: Top Right */}
            <motion.div
              initial={{ opacity: 0, x: 30, y: -20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="absolute -top-4 right-0 sm:right-4 z-20 p-4 rounded-2xl bg-[#17102c]/85 border border-pink-500/30 backdrop-blur-xl shadow-2xl shadow-purple-950/80 max-w-[200px]"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-pink-300">DESIGNING</span>
                <Heart className="h-3 w-3 text-pink-400 fill-pink-400/40" />
              </div>
              <p className="text-xs font-medium text-slate-200 leading-snug">
                with purpose <br />and empathy.
              </p>
            </motion.div>

            {/* Floating Glass Card 2: Bottom Right */}
            <motion.div
              initial={{ opacity: 0, x: 30, y: 30 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="absolute -bottom-6 right-0 sm:right-6 z-20 p-4 rounded-2xl bg-[#17102c]/90 border border-purple-500/30 backdrop-blur-xl shadow-2xl shadow-purple-950/80 max-w-[210px]"
            >
              <span className="text-[10px] font-bold uppercase tracking-widest text-purple-300 block mb-2">
                FOCUS AREAS
              </span>
              <ul className="text-xs text-slate-300 space-y-1 font-light">
                <li className="flex items-center gap-1.5">
                  <span className="h-1 w-1 rounded-full bg-pink-400" /> User Research
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="h-1 w-1 rounded-full bg-purple-400" /> Interaction Design
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="h-1 w-1 rounded-full bg-indigo-400" /> Visual Design
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="h-1 w-1 rounded-full bg-pink-300" /> Prototyping
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
                EXPERIENCE
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-xl font-bold font-display text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-300">
                  7+ YEARS
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-light mt-0.5">creating digital products</p>
            </motion.div>
          </div>

        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          3. FEATURED CASE STUDIES / WORK
      ────────────────────────────────────────────────────────────────────────── */}
      <section id="work" className="py-20 relative z-10 border-t border-purple-500/10">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
            <div>
              <span className="text-xs uppercase tracking-widest text-purple-400 font-bold mb-2 block">
                FEATURED CASE STUDIES
              </span>
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
                Designing impact <br className="hidden sm:inline" />
                through <span className="italic font-serif text-pink-400">meaningful</span> solutions.
              </h2>
            </div>
            
            <a
              href="#contact"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-purple-300 hover:text-pink-300 group transition-colors"
            >
              View All Projects
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          {/* 3 Project Showcase Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {projects.map((proj, idx) => (
              <motion.div
                key={proj.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                whileHover={{ y: -8 }}
                onClick={() => setSelectedProject(proj)}
                className="group relative rounded-3xl bg-[#130d24]/80 border border-purple-500/20 hover:border-pink-500/50 p-6 backdrop-blur-xl overflow-hidden cursor-pointer shadow-xl hover:shadow-purple-500/20 transition-all duration-300 flex flex-col justify-between"
              >
                {/* Glow Backdrop */}
                <div className={`absolute inset-0 bg-gradient-to-br ${proj.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                {/* Card Top Preview Mockup Banner */}
                <div className="relative h-48 rounded-2xl bg-[#0d081b] border border-purple-500/20 overflow-hidden mb-6 flex items-center justify-center p-4">
                  {/* Decorative Mockup UI elements */}
                  <div className="w-full h-full rounded-xl bg-gradient-to-br from-purple-950/60 to-black/80 border border-purple-400/20 p-4 flex flex-col justify-between relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="h-2 w-2 rounded-full bg-pink-400" />
                        <div className="h-2 w-2 rounded-full bg-purple-400" />
                        <div className="h-2 w-2 rounded-full bg-indigo-400" />
                      </div>
                      <span className="text-[9px] uppercase tracking-wider text-purple-300/80 font-mono">{proj.category}</span>
                    </div>

                    <div className="my-auto text-center space-y-1">
                      <p className="text-lg font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-200 to-white">
                        {proj.title}
                      </p>
                      <p className="text-[10px] text-slate-400 line-clamp-1">{proj.subtitle}</p>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-purple-500/20 pt-2">
                      <span>Impact Metric</span>
                      <span className="text-pink-300 font-mono font-semibold">{proj.stats?.accuracy || proj.stats?.rating || "100%"}</span>
                    </div>
                  </div>
                </div>

                {/* Card Bottom Meta */}
                <div className="relative z-10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-purple-400 font-bold">{proj.number}</span>
                    <div className="h-8 w-8 rounded-full bg-purple-900/40 border border-purple-500/30 flex items-center justify-center text-slate-300 group-hover:text-pink-300 group-hover:border-pink-500/60 group-hover:scale-110 transition-all">
                      <ArrowUpRight className="h-4 w-4" />
                    </div>
                  </div>

                  <h3 className="text-xl font-display font-bold text-white group-hover:text-pink-200 transition-colors">
                    {proj.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2">
                    {proj.subtitle}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {proj.tags.map((tag) => (
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
          4. SERVICES & TOOLS SECTION
      ────────────────────────────────────────────────────────────────────────── */}
      <section id="services" className="py-20 relative z-10 border-t border-purple-500/10">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left Headline & Services Cards */}
            <div className="lg:col-span-8 space-y-10">
              <div>
                <span className="text-xs uppercase tracking-widest text-purple-400 font-bold mb-2 block">
                  SERVICES
                </span>
                <h2 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
                  End-to-end design <br />
                  solutions tailored <span className="italic font-serif text-pink-400">to your goals.</span>
                </h2>
              </div>

              {/* 4 Service Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {services.map((srv: any, idx: number) => {
                  const Icon = srv.icon || Sparkles;
                  return (
                    <motion.div
                      key={srv.id || idx}
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
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Right Tools I Use Card */}
            <div className="lg:col-span-4 p-8 rounded-3xl bg-[#140d28]/80 border border-purple-500/25 backdrop-blur-xl shadow-2xl space-y-6">
              <span className="text-xs uppercase tracking-widest text-purple-300 font-bold block">
                TOOLS I USE
              </span>

              <div className="grid grid-cols-3 gap-4">
                {tools.map((tool) => (
                  <motion.div
                    key={tool.name}
                    whileHover={{ scale: 1.08 }}
                    className="p-3.5 rounded-2xl bg-[#0e091d] border border-purple-500/20 hover:border-pink-500/50 flex flex-col items-center justify-center text-center gap-1.5 group cursor-default transition-all shadow-md"
                  >
                    <span className="text-2xl">{tool.icon}</span>
                    <span className="text-xs font-semibold text-slate-200 group-hover:text-pink-300 transition-colors">
                      {tool.name}
                    </span>
                    <span className="text-[9px] text-slate-500 uppercase">{tool.category}</span>
                  </motion.div>
                ))}
              </div>

              <div className="pt-4 border-t border-purple-500/20">
                <p className="text-xs text-slate-400 leading-relaxed">
                  Leveraging modern production stacks with React, TypeScript, Tailwind CSS, Express, and Vite for lightning-fast digital solutions.
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          5. PROCESS SECTION (Matching Reference)
      ────────────────────────────────────────────────────────────────────────── */}
      <section id="process" className="py-20 relative z-10 border-t border-purple-500/10">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Process Left Pipeline */}
            <div className="lg:col-span-7 space-y-10">
              <div>
                <span className="text-xs uppercase tracking-widest text-purple-400 font-bold mb-2 block">
                  MY PROCESS
                </span>
                <h2 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
                  A human-centered <br />
                  approach to <span className="italic font-serif text-pink-400">digital design.</span>
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

            {/* Process Right Archway Portal Graphic (Matching Reference Image) */}
            <div className="lg:col-span-5 flex items-center justify-center relative">
              <div className="relative w-full max-w-[380px] h-[480px] rounded-3xl overflow-hidden border border-pink-500/30 shadow-[0_0_60px_rgba(236,72,153,0.25)] group">
                <img
                  src={portalArch}
                  alt="Ethereal Portal"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#080511] via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-6 inset-x-6 p-4 rounded-2xl bg-[#100a20]/90 border border-pink-500/30 backdrop-blur-md text-center">
                  <p className="text-xs uppercase tracking-widest text-pink-300 font-bold">THE EXPERIENCE PORTAL</p>
                  <p className="text-[11px] text-slate-300 mt-1 font-light">Transforming visions into immersive reality.</p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          6. TESTIMONIALS / KIND WORDS
      ────────────────────────────────────────────────────────────────────────── */}
      <section id="testimonials" className="py-20 relative z-10 border-t border-purple-500/10">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
            <div>
              <span className="text-xs uppercase tracking-widest text-purple-400 font-bold mb-2 block">
                KIND WORDS
              </span>
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
                Stories from <span className="italic font-serif text-pink-400">amazing people</span> <br />
                I've had the pleasure to work with.
              </h2>
            </div>
            
            <a
              href="#contact"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-purple-300 hover:text-pink-300 group transition-colors"
            >
              View All Testimonials
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </a>
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
          7. CONTACT BANNER ("Let's Build Something Meaningful Together")
      ────────────────────────────────────────────────────────────────────────── */}
      <section id="contact" className="py-20 relative z-10 border-t border-purple-500/10">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="relative rounded-3xl bg-gradient-to-br from-[#170e2f]/95 via-[#120a22]/95 to-[#0b0617]/95 border border-purple-500/30 p-8 sm:p-12 backdrop-blur-2xl shadow-2xl overflow-hidden">
            
            {/* Left Vertical Badge */}
            <div className="hidden xl:flex absolute left-4 top-1/2 -translate-y-1/2 -rotate-90 origin-center text-[10px] uppercase tracking-[0.3em] font-mono text-purple-400/50 font-bold whitespace-nowrap pointer-events-none">
              LET'S CREATE TOGETHER
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              
              {/* Contact Left Information */}
              <div className="lg:col-span-5 space-y-6">
                <div>
                  <span className="text-xs uppercase tracking-widest text-pink-400 font-bold mb-2 block">
                    HAVE A PROJECT IN MIND?
                  </span>
                  <h3 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
                    Let's build something <br />
                    <span className="italic font-serif text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-300 to-indigo-300">
                      meaningful
                    </span> together.
                  </h3>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
                  Whether you're looking for full end-to-end design systems, AI platform interfaces, or student success systems, I'm here to bring your vision to life.
                </p>

                <div className="space-y-3 pt-2 text-xs text-slate-300">
                  <a href="mailto:hello@liva.design" className="flex items-center gap-3 hover:text-pink-300 transition-colors">
                    <div className="h-8 w-8 rounded-lg bg-purple-900/40 border border-purple-500/30 flex items-center justify-center text-pink-400">
                      <Mail className="h-4 w-4" />
                    </div>
                    <span>hello@liva.design</span>
                  </a>

                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-purple-900/40 border border-purple-500/30 flex items-center justify-center text-purple-400">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <span>Based in San Francisco, CA (Available Globally)</span>
                  </div>
                </div>
              </div>

              {/* Contact Right Form (Working API /api/contact) */}
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
                      <label className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">Your Name</label>
                      <input
                        type="text"
                        required
                        placeholder="Alex Morgan"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#160f2b] border border-purple-500/30 focus:border-pink-500 focus:outline-none text-xs text-white placeholder:text-slate-500 transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">Your Email</label>
                      <input
                        type="email"
                        required
                        placeholder="alex@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#160f2b] border border-purple-500/30 focus:border-pink-500 focus:outline-none text-xs text-white placeholder:text-slate-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">Service Needed</label>
                    <select
                      value={service}
                      onChange={(e) => setService(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#160f2b] border border-purple-500/30 focus:border-pink-500 focus:outline-none text-xs text-white transition-colors"
                    >
                      <option value="UI/UX & AI Architecture">UI/UX & AI Architecture</option>
                      <option value="Fintech & SaaS Design System">Fintech & SaaS Design System</option>
                      <option value="EduGuard Campus Integration">EduGuard Campus Integration</option>
                      <option value="User Research & Prototyping">User Research & Prototyping</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">Tell me about your project</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="We're launching a new digital platform and looking for high-end UX design..."
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
                    {submitting ? (
                      "Sending Message..."
                    ) : (
                      <>
                        Send Message <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          8. FOOTER
      ────────────────────────────────────────────────────────────────────────── */}
      <footer className="py-12 border-t border-purple-500/15 bg-[#06040d] relative z-10 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-purple-600 to-pink-500 p-[1px]">
              <div className="w-full h-full bg-[#0d091a] rounded-[7px] flex items-center justify-center font-bold text-xs text-pink-300">
                L
              </div>
            </div>
            <div>
              <p className="font-display font-bold text-white tracking-wider">LIVA UX SPECIALIST</p>
              <p className="text-[10px] text-slate-500">Designing the future, one experience at a time.</p>
            </div>
          </div>

          {/* Footer Nav */}
          <div className="flex flex-wrap items-center gap-6 text-[11px] uppercase tracking-wider">
            <a href="#home" className="hover:text-pink-400 transition-colors">Home</a>
            <a href="#work" className="hover:text-pink-400 transition-colors">Work</a>
            <a href="#about" className="hover:text-pink-400 transition-colors">About</a>
            <a href="#services" className="hover:text-pink-400 transition-colors">Services</a>
            <a href="#process" className="hover:text-pink-400 transition-colors">Process</a>
            <Link to="/auth" className="text-purple-400 hover:text-pink-300 transition-colors">Portal Login</Link>
          </div>

          <p className="text-[11px] text-slate-500">
            © {new Date().getFullYear()} Liva UX Specialist. All rights reserved.
          </p>
        </div>
      </footer>

      {/* ──────────────────────────────────────────────────────────────────────────
          9. PROJECT DETAIL MODAL
      ────────────────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-[#140d28] border border-purple-500/40 rounded-3xl p-8 shadow-2xl space-y-6 overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setSelectedProject(null)}
                className="absolute top-6 right-6 h-8 w-8 rounded-full bg-purple-900/50 border border-purple-500/30 flex items-center justify-center text-slate-300 hover:text-white hover:bg-purple-800 transition-all"
              >
                ✕
              </button>

              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-pink-400 font-bold block mb-1">
                  CASE STUDY {selectedProject.number}
                </span>
                <h3 className="text-2xl sm:text-3xl font-display font-bold text-white">
                  {selectedProject.title}
                </h3>
                <p className="text-xs text-purple-300 mt-1">{selectedProject.subtitle}</p>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
                {selectedProject.description}
              </p>

              <div className="p-4 rounded-2xl bg-[#0e091d] border border-purple-500/20">
                <span className="text-[11px] uppercase tracking-wider text-pink-300 font-bold block mb-1">Key Impact</span>
                <p className="text-xs text-slate-200">{selectedProject.impact}</p>
              </div>

              {/* Project Stats */}
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(selectedProject.stats || {}).map(([k, v]) => (
                  <div key={k} className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/20 text-center">
                    <p className="text-base font-bold font-display text-pink-400">{v}</p>
                    <p className="text-[10px] text-slate-400 uppercase mt-0.5">{k}</p>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-purple-500/20">
                <div className="flex flex-wrap gap-1.5">
                  {selectedProject.tags.map(t => (
                    <span key={t} className="px-2.5 py-1 rounded-md bg-purple-900/40 text-[10px] text-purple-300">
                      {t}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => setSelectedProject(null)}
                  className="px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider bg-gradient-to-r from-pink-500 to-purple-600 text-white"
                >
                  Close Preview
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
