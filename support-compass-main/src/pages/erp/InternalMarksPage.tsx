import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Search, Filter, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { RiskCategoryBadge } from "@/components/erp/RiskCategoryBadge";
import { erpApi } from "@/services/erpApi";

const RISKS = ["", "high", "medium", "low", "safe"];

interface MarkRecord {
  _id: string;
  studentId: string;
  subjectCode: string;
  subjectName: string;
  semester: number;
  cia1: number;
  cia2: number;
  assignment: number;
  quiz: number;
  lab: number;
  practical: number;
  seminar: number;
  miniProject: number;
  internalTotal: number;
  average: number;
  percentage: number;
  grade: string;
  rank: number;
  riskLevel: string;
  student?: { name: string; department: string };
}

const GRADE_COLORS: Record<string, string> = {
  O: "#10b981", "A+": "#3b82f6", A: "#06b6d4",
  "B+": "#8b5cf6", B: "#f59e0b", C: "#f97316", F: "#ef4444",
};

export default function InternalMarksPage() {
  const [records, setRecords] = useState<MarkRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [risk, setRisk] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const res = await erpApi.getInternalMarks({ page, limit: 15, search, risk });
      setRecords(res.data || []);
      setTotal(res.total || 0);
      setPages(res.pages || 1);
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, risk]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const markBar = (val: number, max: number, color: string) => (
    <div className="flex items-center gap-1.5">
      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${(val / max) * 100}%`, background: color }} />
      </div>
      <span className="text-[11px] w-5 text-right text-muted-foreground">{val}</span>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-gradient">Internal Marks</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {total} records • Risk: ≤40 High · ≤60 Medium · ≤70 Low · &gt;70 Safe
          </p>
        </div>
        <button onClick={fetchRecords} className="p-2 glass-card rounded-lg border border-border/50 hover:border-primary/40 transition-colors">
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] glass-card rounded-xl border border-border/50 px-3 py-2">
          <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <input
            placeholder="Search subject name..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="bg-transparent text-sm outline-none w-full text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex items-center gap-2 glass-card rounded-xl border border-border/50 px-3 py-2">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          <select
            value={risk}
            onChange={(e) => { setRisk(e.target.value); setPage(1); }}
            className="bg-transparent text-sm outline-none text-foreground cursor-pointer"
          >
            {RISKS.map((r) => <option key={r} value={r} className="bg-black">{r ? r.charAt(0).toUpperCase() + r.slice(1) + " Risk" : "All Risk Levels"}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <Card className="glass-card border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/40">
                {["Student","Subject","CIA1","CIA2","Assign","Quiz","Lab","Practical","Seminar","Mini Proj","Total","Avg","Grade","Risk","Rank"].map((h) => (
                  <th key={h} className="text-left px-3 py-3 text-[10px] text-muted-foreground font-medium uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/20 animate-pulse">
                    {Array.from({ length: 15 }).map((__, j) => (
                      <td key={j} className="px-3 py-2"><div className="h-3 bg-white/5 rounded w-10" /></td>
                    ))}
                  </tr>
                ))
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={15} className="px-4 py-12 text-center text-muted-foreground text-sm">
                    No records found. Please sync ERP first.
                  </td>
                </tr>
              ) : (
                records.map((r, i) => (
                  <motion.tr
                    key={r._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="border-b border-border/20 hover:bg-white/3 transition-colors"
                  >
                    <td className="px-3 py-2.5">
                      <p className="text-[11px] font-medium">{r.student?.name ?? r.studentId}</p>
                      <p className="text-[10px] text-muted-foreground">{r.student?.department}</p>
                    </td>
                    <td className="px-3 py-2.5">
                      <p className="text-[11px] font-medium whitespace-nowrap">{r.subjectName}</p>
                      <p className="text-[10px] text-muted-foreground">{r.subjectCode}</p>
                    </td>
                    {/* Mark bars */}
                    <td className="px-3 py-2.5 min-w-[60px]">{markBar(r.cia1, 25, "#8b5cf6")}</td>
                    <td className="px-3 py-2.5 min-w-[60px]">{markBar(r.cia2, 25, "#8b5cf6")}</td>
                    <td className="px-3 py-2.5 min-w-[50px]">{markBar(r.assignment, 10, "#3b82f6")}</td>
                    <td className="px-3 py-2.5 min-w-[50px]">{markBar(r.quiz, 10, "#06b6d4")}</td>
                    <td className="px-3 py-2.5 min-w-[60px]">{markBar(r.lab, 25, "#10b981")}</td>
                    <td className="px-3 py-2.5 min-w-[60px]">{markBar(r.practical, 25, "#10b981")}</td>
                    <td className="px-3 py-2.5 min-w-[50px]">{markBar(r.seminar, 10, "#f59e0b")}</td>
                    <td className="px-3 py-2.5 min-w-[60px]">{markBar(r.miniProject, 10, "#f97316")}</td>
                    <td className="px-3 py-2.5 text-xs font-bold text-white">{r.internalTotal}</td>
                    <td className="px-3 py-2.5 text-xs text-muted-foreground">{r.average.toFixed(1)}</td>
                    <td className="px-3 py-2.5">
                      <span
                        className="px-1.5 py-0.5 rounded text-[11px] font-bold"
                        style={{
                          color: GRADE_COLORS[r.grade] || "#fff",
                          background: `${GRADE_COLORS[r.grade] || "#fff"}18`,
                        }}
                      >
                        {r.grade}
                      </span>
                    </td>
                    <td className="px-3 py-2.5"><RiskCategoryBadge category={r.riskLevel} size="sm" /></td>
                    <td className="px-3 py-2.5 text-xs text-muted-foreground">#{r.rank}</td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border/30">
            <p className="text-xs text-muted-foreground">Page {page} of {pages} ({total} records)</p>
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
