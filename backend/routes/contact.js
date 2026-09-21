import { Router } from "express";
import mongoose from "mongoose";

const router = Router();
const isMongoConnected = () => mongoose.connection.readyState === 1;

// In-memory store for contact inquiries and newsletter subscribers
const inquiries = [
  {
    id: "inq_1",
    name: "Sarah Lin",
    email: "sarah.lin@venturetech.io",
    message: "We love your AI & UX architecture work. We would like to collaborate on our upcoming education analytics platform.",
    service: "UI/UX & AI System Design",
    status: "new",
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: "inq_2",
    name: "David Miller",
    email: "david@apexpartners.com",
    message: "Requesting a demo for EduGuard system integration with existing college ERP.",
    service: "ERP Integration",
    status: "responded",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  }
];

const subscribers = new Set(["innovate@eduguard.edu", "contact@liva.design"]);

// Case studies and landing metadata
const portfolioData = {
  stats: [
    { label: "Students & Users Protected", value: "2,400+", change: "+18% this term" },
    { label: "Dropout Risk Prevented", value: "340+", change: "94% Model Accuracy" },
    { label: "System Uptime & Stability", value: "99.98%", change: "Zero Cold Hangs" },
    { label: "Partner Institutions", value: "14+", change: "Active Deployments" },
  ],
  projects: [
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
      subtitle: "Student Mental Wellness & Early Warning App",
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
      subtitle: "Smart Academic Campus & Timetable Navigator",
      category: "Campus AI",
      tags: ["UX Research", "UI Design", "Prototyping"],
      description: "Intelligent timetable scheduling and conflict-free room allocation engine with real-time push alerts and live student attendance tracking.",
      impact: "Zero scheduling conflicts recorded across 120+ faculty members and 2,400 students.",
      stats: { accuracy: "100%", schedules: "1,200+", timeSaved: "14 hrs/wk" },
      color: "from-violet-500/20 to-fuchsia-500/10",
      featured: true,
    }
  ],
  services: [
    {
      id: "user-research",
      title: "User Research",
      description: "Uncover deep behavioral insights and student engagement pain points to build truly meaningful solutions.",
      icon: "Search",
      features: ["Cognitive walkthroughs", "Dropout risk behavioral analysis", "Quantitative surveys"]
    },
    {
      id: "interaction-design",
      title: "Interaction Design",
      description: "Design intuitive, buttery smooth workflows that empower educators, mentors, and parents seamlessly.",
      icon: "Sparkles",
      features: ["Micro-interactions", "Responsive ergonomics", "Fluid state transitions"]
    },
    {
      id: "ui-visual-design",
      title: "UI Visual Design",
      description: "Craft breathtaking, state-of-the-art glassmorphic interfaces with cybernetic glowing accents.",
      icon: "Layers",
      features: ["Dark mode precision", "Custom design tokens", "High-conversion typography"]
    },
    {
      id: "prototyping",
      title: "Prototyping & AI",
      description: "Bring ambitious ideas to life with high-fidelity interactive models and live machine learning integrations.",
      icon: "Cpu",
      features: ["Live API simulation", "KNN & Random Forest analytics", "Instant cloud preview"]
    }
  ],
  process: [
    { step: "01", name: "EMPATHIZE", desc: "Understand students, mentors, and administrative pain points deeply." },
    { step: "02", name: "DEFINE", desc: "Synthesize academic behavioral data and define the exact dropout triggers." },
    { step: "03", name: "IDEATE", desc: "Brainstorm predictive algorithms, smart notifications, and visual dashboard architectures." },
    { step: "04", name: "DESIGN", desc: "Craft intuitive neon-glow interfaces with responsive glassmorphic cards." },
    { step: "05", name: "TEST & REFINE", desc: "Validate with real academic cohorts, verify API response latencies, and iterate." }
  ],
  testimonials: [
    {
      id: "t1",
      quote: "The interface transformed our student monitoring pipeline. Mentor engagement jumped 40% in just two weeks.",
      name: "Nathan Park",
      role: "Product Lead, Nexora",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
    },
    {
      id: "t2",
      quote: "Working with this system was an absolute pleasure. The predictive AI alerts prevented dozens of dropouts this semester.",
      name: "Sofia Martinez",
      role: "Founder, Mindful EdTech",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80"
    },
    {
      id: "t3",
      quote: "The visual design is unmatched—it feels like a glimpse into 2035 while delivering rock-solid reliability.",
      name: "James Wilson",
      role: "CTO, Roamia Tech",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
    }
  ]
};

// GET /api/landing/data - Dynamic landing page showcase data
router.get("/data", (req, res) => {
  res.json(portfolioData);
});

// POST /api/contact - Send message / inquiry
router.post("/", async (req, res) => {
  try {
    const { name, email, message, service } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: "Name, email, and message are required fields." });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanMsg = message.trim();
    const selectedService = service || "General Inquiry";

    const inquiry = {
      id: "inq_" + Date.now(),
      name: cleanName,
      email: cleanEmail,
      message: cleanMsg,
      service: selectedService,
      status: "new",
      createdAt: new Date().toISOString(),
    };

    inquiries.unshift(inquiry);

    return res.status(201).json({
      success: true,
      message: "Thank you for reaching out! Your message has been received.",
      inquiryId: inquiry.id,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to submit message. Please try again." });
  }
});

// GET /api/contact - List inquiries
router.get("/", (req, res) => {
  res.json(inquiries);
});

// POST /api/newsletter - Subscribe
router.post("/newsletter", (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes("@")) {
      return res.status(400).json({ error: "Please provide a valid email address." });
    }
    const cleanEmail = email.trim().toLowerCase();
    subscribers.add(cleanEmail);
    res.json({ success: true, message: "Successfully subscribed to futuristic product updates!" });
  } catch (err) {
    res.status(500).json({ error: "Subscription failed." });
  }
});

export default router;
