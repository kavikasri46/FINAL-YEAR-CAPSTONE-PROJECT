import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Search, Filter, RefreshCw, ChevronLeft, ChevronRight, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RiskCategoryBadge } from "@/components/erp/RiskCategoryBadge";
import { erpApi } from "@/services/erpApi";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const SEMESTERS = ["", "1", "2", "3", "4", "5", "6", "7", "8"];

interface SubjectResult {
  subjectCode: string;
  subjectName: string;
  credits: number;
  grade: string;
  gradePoints: number;
  passFail: "Pass" | "Fail";
}

interface SemResult {
  _id: string;
  studentId: string;
  semester: number;
  academicYear: string;
  subjects: SubjectResult[];
  gpa: number;
  cgpa: number;
  arrears: number;
  backlogs: number;
  failedSubjects: string[];
  creditEarned: number;
  totalCredits: number;
  riskLevel: string;
  student?: { name: string; department: string; year: number };
}

const GRADE_COLORS: Record<string, string> = {
  O: "#10b981", "A+": "#3b82f6", A: "#06b6d4",
  "B+": "#8b5cf6", B: "#f59e0b", C: "#f97316", F: "#ef4444",
};

export default function SemesterResults() {
  const [records, setRecords] = useState<SemResult[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sem, setSem] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const res = await erpApi.getSemesterResults({ page, limit: 15, semester: sem ? parseInt(sem) : undefined });
      setRecords(res.data || []);
      setTotal(res.total || 0);
      setPages(res.pages || 1);
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [page, sem]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const gpaChartData = records.slice(0, 10).map((r) => ({
    name: r.student?.name?.split(" ")[0] ?? r.studentId,
    gpa: r.gpa,
    cgpa: r.cgpa,
  }));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-gradient">Semester Results</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{total} results • GPA/CGPA auto-calculated</p>
        </div>
        <button onClick={fetchRecords} className="p-2 glass-card rounded-lg border border-border/50 hover:border-primary/40">
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* GPA Chart */}
      {records.length > 0 && (
        <Card className="glass-card border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              GPA vs CGPA Comparison (Top 10)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={gpaChartData} barSize={14}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis domain={[0, 10]} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", fontSize: 12 }} />
                <Bar dataKey="gpa" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="GPA" />
                <Bar dataKey="cgpa" fill="#10b981" radius={[4, 4, 0, 0]} name="CGPA" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] glass-card rounded-xl border border-border/50 px-3 py-2">
          <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <input
            placeholder="Search student..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm outline-none w-full text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex items-center gap-2 glass-card rounded-xl border border-border/50 px-3 py-2">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          <select value={sem} onChange={(e) => { setSem(e.target.value); setPage(1); }} className="bg-transparent text-sm outline-none text-foreground cursor-pointer">
            {SEMESTERS.map((s) => <option key={s} value={s} className="bg-black">{s ? `Semester ${s}` : "All Semesters"}</option>)}
          </select>
        </div>
      </div>

      {/* Results Table */}
      <Card className="glass-card border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/40">
                {["Student","Dept","Sem","GPA","CGPA","Credits","Arrears","Backlogs","Risk","Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] text-muted-foreground font-medium uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/20 animate-pulse">
                    {Array.from({ length: 10 }).map((__, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-white/5 rounded w-16" /></td>
                    ))}
                  </tr>
                ))
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-sm text-muted-foreground">
                    No semester results found. Please sync ERP first.
                  </td>
                </tr>
              ) : (
                records.map((r, i) => (
                  <>
                    <motion.tr
                      key={r._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.025 }}
                      className="border-b border-border/20 hover:bg-white/3 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <p className="text-xs font-medium">{r.student?.name ?? r.studentId}</p>
                        <p className="text-[10px] text-muted-foreground">{r.studentId}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-primary">{r.student?.department}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">Sem {r.semester}</td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-bold" style={{ color: r.gpa >= 8 ? "#10b981" : r.gpa >= 6 ? "#3b82f6" : r.gpa >= 5 ? "#f59e0b" : "#ef4444" }}>
                          {r.gpa.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-bold" style={{ color: r.cgpa >= 8 ? "#10b981" : r.cgpa >= 6 ? "#3b82f6" : r.cgpa >= 5 ? "#f59e0b" : "#ef4444" }}>
                          {r.cgpa.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs">{r.creditEarned}/{r.totalCredits}</td>
                      <td className="px-4 py-3 text-xs text-red-400 font-medium">{r.arrears}</td>
                      <td className="px-4 py-3 text-xs text-orange-400 font-medium">{r.backlogs}</td>
                      <td className="px-4 py-3"><RiskCategoryBadge category={r.riskLevel} size="sm" /></td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setExpanded(expanded === r._id ? null : r._id)}
                          className="text-[10px] text-primary hover:underline"
                        >
                          {expanded === r._id ? "Hide" : "Subjects"}
                        </button>
                      </td>
                    </motion.tr>

                    {/* Expanded subject rows */}
                    {expanded === r._id && (
                      <tr className="bg-white/2 border-b border-border/20">
                        <td colSpan={10} className="px-6 py-3">
                          <div className="flex flex-wrap gap-2">
                            {r.subjects.map((s) => (
                              <div
                                key={s.subjectCode}
                                className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[10px]"
                                style={{
                                  background: s.passFail === "Fail" ? "rgba(239,68,68,0.1)" : "rgba(255,255,255,0.05)",
                                  border: `1px solid ${s.passFail === "Fail" ? "#ef444430" : "rgba(255,255,255,0.07)"}`,
                                }}
                              >
                                <span className="text-muted-foreground">{s.subjectName}</span>
                                <span
                                  className="font-bold px-1 rounded"
                                  style={{ color: GRADE_COLORS[s.grade] || "#fff", background: `${GRADE_COLORS[s.grade] || "#fff"}18` }}
                                >
                                  {s.grade}
                                </span>
                                <span className="text-muted-foreground">{s.credits}cr</span>
                              </div>
                            ))}
                          </div>
                          {r.failedSubjects.length > 0 && (
                            <p className="text-[10px] text-red-400 mt-2">Failed: {r.failedSubjects.join(", ")}</p>
                          )}
                        </td>
                      </tr>
                    )}
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border/30">
            <p className="text-xs text-muted-foreground">Page {page} of {pages}</p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg hover:bg-white/5 disabled:opacity-30">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs px-2">{page}</span>
              <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages} className="p-1.5 rounded-lg hover:bg-white/5 disabled:opacity-30">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
