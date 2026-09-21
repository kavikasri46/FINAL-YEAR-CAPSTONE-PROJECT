import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Search, RefreshCw, ChevronLeft, ChevronRight,
  AlertTriangle, Award, BookOpen, Brain, Activity, Zap
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RiskCategoryBadge } from "@/components/erp/RiskCategoryBadge";
import { CircularProgress } from "@/components/erp/CircularProgress";
import { erpApi } from "@/services/erpApi";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
} from "recharts";

interface Report {
  _id: string;
  studentId: string;
  studentName: string;
  overallScore: number;
  attendanceScore: number;
  marksScore: number;
  performanceScore: number;
  learningTrend: string;
  improvementPct: number;
  consistency: number;
  riskScore: number;
  performanceIndex: number;
  studentRanking: number;
  riskCategory: string;
  weakSubjects: string[];
  strongSubjects: string[];
  recommendations: {
    teacher: string[];
    parent: string[];
    student: string[];
    ai: string[];
  };
  dropoutRiskFeatures: Record<string, number>;
}

const CATEGORIES = ["", "Very Low", "Low", "Medium", "High", "Critical"];

export default function AIAnalytics() {
  const [reports, setReports] = useState<Report[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [selected, setSelected] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await erpApi.getAcademicReports({ page, limit: 12, search, category });
      setReports(res.data || []);
      setTotal(res.total || 0);
      setPages(res.pages || 1);
    } catch {
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [page, search, category]);

  // Risk levels config for the Gauge
  const GAUGE_LEVELS = [
    { label: "Very Low", min: 0, max: 20, color: "#10b981", angle: 18 },
    { label: "Low", min: 20, max: 40, color: "#3b82f6", angle: 54 },
    { label: "Medium", min: 40, max: 60, color: "#f59e0b", angle: 90 },
    { label: "High", min: 60, max: 80, color: "#f97316", angle: 126 },
    { label: "Critical", min: 80, max: 100, color: "#ef4444", angle: 162 },
  ];

  const getGaugePointerAngle = (score: number) => {
    // Maps score (0-100) to angle (-90deg to +90deg)
    return (score / 100) * 180 - 90;
  };

  const getGaugeColor = (score: number) => {
    if (score < 20) return "#10b981"; // Very Low
    if (score < 40) return "#3b82f6"; // Low
    if (score < 60) return "#f59e0b"; // Medium
    if (score < 80) return "#f97316"; // High
    return "#ef4444"; // Critical
  };

  const radarData = selected
    ? [
        { metric: "Attendance", value: selected.attendanceScore },
        { metric: "Marks", value: selected.marksScore },
        { metric: "Performance", value: selected.performanceScore },
        { metric: "Overall", value: selected.overallScore },
        { metric: "Stability", value: selected.consistency },
      ]
    : [];

  const featuresBar = selected
    ? [
        { name: "Attendance %", val: selected.dropoutRiskFeatures?.attendancePct ?? 0 },
        { name: "CIA Marks", val: selected.dropoutRiskFeatures?.ciaTotal ?? 0 },
        { name: "Semester %", val: selected.dropoutRiskFeatures?.semesterMarks ?? 0 },
        { name: "CGPA", val: (selected.dropoutRiskFeatures?.cgpa ?? 0) * 10 },
      ]
    : [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-gradient">AI Performance Analytics</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{total} student analytics profiles synced</p>
        </div>
        <button onClick={fetchReports} className="p-2 glass-card rounded-lg border border-border/50 hover:border-primary/40">
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] glass-card rounded-xl border border-border/50 px-3 py-2">
          <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <input
            placeholder="Search student name..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="bg-transparent text-sm outline-none w-full text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          className="glass-card rounded-xl border border-border/50 px-3 py-2 text-sm bg-transparent text-foreground cursor-pointer outline-none font-medium"
        >
          {CATEGORIES.map((c) => <option key={c} value={c} className="bg-black">{c || "All Risk Categories"}</option>)}
        </select>
      </div>

      {/* Selected Student Detail Panel */}
      {selected && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="glass-card border-primary/30 overflow-hidden relative">
            <CardContent className="p-6 space-y-6">
              <div className="flex justify-between items-start flex-wrap gap-4 border-b border-white/5 pb-4">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                    {selected.studentName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg text-white">{selected.studentName}</h3>
                    <p className="text-xs text-muted-foreground">Computer Science with Data Analytics • {selected.studentId}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Ranking: Class Rank #{selected.studentRanking}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-sm font-semibold text-muted-foreground">Dropout Probability</p>
                    <p className="text-2xl font-bold" style={{ color: getGaugeColor(selected.riskScore) }}>
                      {selected.riskScore}%
                    </p>
                  </div>
                  <button onClick={() => setSelected(null)} className="text-xs text-muted-foreground hover:text-white glass-card px-2.5 py-1 rounded-lg">Close ✕</button>
                </div>
              </div>

              {/* Analytics Dashboard Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Gauge Column */}
                <div className="flex flex-col items-center justify-center text-center">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">AI Dropout Risk Gauge</p>
                  
                  {/* Semicircular Gauge */}
                  <div className="relative w-48 h-28 overflow-hidden flex items-end justify-center">
                    <svg width="180" height="90" className="overflow-visible">
                      {/* Base Track */}
                      <path
                        d="M 10 90 A 80 80 0 0 1 170 90"
                        fill="none"
                        stroke="rgba(255,255,255,0.06)"
                        strokeWidth="16"
                        strokeLinecap="round"
                      />
                      {/* Segmented Gradient Sections */}
                      <path
                        d="M 10 90 A 80 80 0 0 1 42 50"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="16"
                      />
                      <path
                        d="M 42 50 A 80 80 0 0 1 90 10"
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="16"
                      />
                      <path
                        d="M 90 10 A 80 80 0 0 1 138 50"
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="16"
                      />
                      <path
                        d="M 138 50 A 80 80 0 0 1 170 90"
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="16"
                      />
                      {/* Needle Center Pivot */}
                      <circle cx="90" cy="90" r="8" fill="#fff" />
                    </svg>
                    
                    {/* Animated Needle */}
                    <div
                      className="absolute bottom-0 w-2 h-18 origin-bottom rounded-full"
                      style={{
                        height: "75px",
                        width: "4px",
                        background: "#fff",
                        transform: `rotate(${getGaugePointerAngle(selected.riskScore)}deg)`,
                        transition: "transform 1.2s cubic-bezier(0.4, 0, 0.2, 1)",
                        boxShadow: "0 0 10px rgba(255,255,255,0.5)"
                      }}
                    />
                  </div>

                  <div className="mt-3">
                    <span className="text-lg font-bold font-display" style={{ color: getGaugeColor(selected.riskScore) }}>
                      {selected.riskCategory} Risk
                    </span>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Based on Attendance, CIA, Semester marks & backlogs</p>
                  </div>
                </div>

                {/* Radar Chart */}
                <div className="flex flex-col items-center">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">Performance Vector</p>
                  <ResponsiveContainer width="100%" height={160}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="rgba(255,255,255,0.06)" />
                      <PolarAngleAxis dataKey="metric" tick={{ fontSize: 9, fill: "rgba(255,255,255,0.6)" }} />
                      <Radar dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                {/* Score Indicators */}
                <div className="space-y-4">
                  {[
                    { label: "Overall Score", value: selected.overallScore, color: "#8b5cf6" },
                    { label: "Attendance score", value: selected.attendanceScore, color: "#10b981" },
                    { label: "Performance score", value: selected.performanceScore, color: "#06b6d4" },
                  ].map((item) => (
                    <div key={item.label} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{item.label}</span>
                        <span className="font-semibold text-white">{item.value}%</span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${item.value}%`, background: item.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations Section */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-white/5">
                {[
                  { title: "For Teachers", icon: Activity, list: selected.recommendations.teacher, color: "#8b5cf6" },
                  { title: "For Parents", icon: Brain, list: selected.recommendations.parent, color: "#f59e0b" },
                  { title: "For Student", icon: BookOpen, list: selected.recommendations.student, color: "#10b981" },
                  { title: "AI suggestions", icon: Zap, list: selected.recommendations.ai, color: "#f43f5e" },
                ].map((rec) => (
                  <div key={rec.title} className="glass-card border border-border/40 p-4 rounded-xl">
                    <p className="text-xs font-semibold mb-2 flex items-center gap-1.5" style={{ color: rec.color }}>
                      <rec.icon className="h-3.5 w-3.5" />
                      {rec.title}
                    </p>
                    <div className="space-y-1">
                      {rec.list.map((txt, i) => (
                        <p key={i} className="text-[10px] text-muted-foreground leading-relaxed">• {txt}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Reports Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass-card border border-border/50 rounded-xl p-5 h-44 animate-pulse" />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <Card className="glass-card border-border/50">
          <CardContent className="py-16 text-center text-sm text-muted-foreground">
            No AI Analytics profiles found. Sync ERP first to build profiles.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map((r, i) => (
            <motion.div
              key={r._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Card
                className={`glass-card border-border/50 cursor-pointer hover:border-primary/40 transition-all duration-300 ${selected?._id === r._id ? "border-primary/60" : ""}`}
                onClick={() => setSelected(r)}
              >
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-xs text-white">{r.studentName}</p>
                      <p className="text-[10px] text-muted-foreground">Class Rank #{r.studentRanking}</p>
                    </div>
                    <RiskCategoryBadge category={r.riskCategory} size="sm" />
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Academic Score</span>
                    <span className="font-semibold text-white">{r.overallScore}%</span>
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                    <span>Consistency: {r.consistency.toFixed(0)}%</span>
                    <span className="text-primary hover:underline">Detail Analytics →</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex justify-center gap-2 items-center">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg hover:bg-white/5 disabled:opacity-30">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-xs text-muted-foreground">Page {page} of {pages}</span>
          <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages} className="p-1.5 rounded-lg hover:bg-white/5 disabled:opacity-30">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
