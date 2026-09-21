import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Download, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RiskCategoryBadge } from "@/components/erp/RiskCategoryBadge";
import { erpApi } from "@/services/erpApi";

const DEPTS = ["", "CSE", "ECE", "EEE", "MECH", "CIVIL", "IT", "AIDS", "AIML"];
const RISKS = ["", "high", "medium", "low", "safe"];

interface Record {
  _id: string;
  studentId: string;
  registerNo: string;
  name: string;
  department: string;
  year: number;
  semester: number;
  section: string;
  riskLevel: string;
  markScore: number;
  report?: { overallScore: number; attendanceScore: number; marksScore: number; riskCategory: string };
  result?: { gpa: number; cgpa: number; arrears: number };
}

export default function AcademicRecords() {
  const [records, setRecords] = useState<Record[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [dept, setDept] = useState("");
  const [risk, setRisk] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const res = await erpApi.getAcademicRecords({ page, limit: 15, search, dept, risk });
      setRecords(res.data || []);
      setTotal(res.total || 0);
      setPages(res.pages || 1);
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, dept, risk]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const exportCSV = () => {
    const header = ["Name","Register No","Department","Year","Semester","Section","Mark Score","Risk","GPA","CGPA","Arrears"];
    const rows = records.map((r) => [
      r.name, r.registerNo, r.department, r.year, r.semester, r.section,
      r.markScore, r.riskLevel, r.result?.gpa ?? "", r.result?.cgpa ?? "", r.result?.arrears ?? "",
    ]);
    const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "academic_records.csv"; a.click();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-gradient">Academic Records</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{total} students • Risk auto-calculated from marks</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchRecords} className="p-2 glass-card rounded-lg border border-border/50 hover:border-primary/40 transition-colors">
            <RefreshCw className="h-4 w-4" />
          </button>
          <button onClick={exportCSV} className="flex items-center gap-2 px-3 py-2 text-xs font-medium glass-card rounded-lg border border-border/50 hover:border-primary/40 transition-colors">
            <Download className="h-3.5 w-3.5" /> Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <Card className="glass-card border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-[200px] glass-card rounded-lg border border-border/50 px-3 py-2">
              <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <input
                type="text"
                placeholder="Search students..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="bg-transparent text-sm outline-none w-full text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="flex items-center gap-2 glass-card rounded-lg border border-border/50 px-3 py-2">
              <Filter className="h-3.5 w-3.5 text-muted-foreground" />
              <select
                value={dept}
                onChange={(e) => { setDept(e.target.value); setPage(1); }}
                className="bg-transparent text-sm outline-none text-foreground cursor-pointer"
              >
                {DEPTS.map((d) => <option key={d} value={d} className="bg-black">{d || "All Depts"}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2 glass-card rounded-lg border border-border/50 px-3 py-2">
              <select
                value={risk}
                onChange={(e) => { setRisk(e.target.value); setPage(1); }}
                className="bg-transparent text-sm outline-none text-foreground cursor-pointer"
              >
                {RISKS.map((r) => <option key={r} value={r} className="bg-black">{r ? r.charAt(0).toUpperCase() + r.slice(1) + " Risk" : "All Risk Levels"}</option>)}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Legend */}
      <div className="flex gap-3 text-xs">
        <span className="text-muted-foreground">Risk rule:</span>
        <span className="text-red-400 font-medium">mark ≤ 40 → High</span>
        <span className="text-yellow-400 font-medium">mark ≤ 60 → Medium</span>
        <span className="text-blue-400 font-medium">mark ≤ 70 → Low</span>
        <span className="text-green-400 font-medium">mark &gt; 70 → Safe</span>
      </div>

      {/* Table */}
      <Card className="glass-card border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/40">
                {["Student","Register No","Dept","Yr/Sem","Attendance %","Marks %","GPA","CGPA","Risk","Arrears"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs text-muted-foreground font-medium uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/20 animate-pulse">
                    {Array.from({ length: 10 }).map((__, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-white/5 rounded w-20" /></td>
                    ))}
                  </tr>
                ))
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-muted-foreground text-sm">
                    No records found. Sync ERP to load data.
                  </td>
                </tr>
              ) : (
                records.map((r, i) => (
                  <motion.tr
                    key={r._id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-border/20 hover:bg-white/3 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-xs">{r.name}</p>
                        <p className="text-[10px] text-muted-foreground">{r.studentId}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{r.registerNo}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-primary">{r.department}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{r.year}/{r.semester}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-green-500" style={{ width: `${r.report?.attendanceScore ?? 0}%` }} />
                        </div>
                        <span className="text-xs">{(r.report?.attendanceScore ?? 0).toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${r.markScore ?? 0}%`,
                              background: r.markScore <= 40 ? "#ef4444" : r.markScore <= 60 ? "#f59e0b" : r.markScore <= 70 ? "#3b82f6" : "#10b981",
                            }}
                          />
                        </div>
                        <span className="text-xs">{(r.markScore ?? 0).toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs font-medium">{r.result?.gpa?.toFixed(2) ?? "—"}</td>
                    <td className="px-4 py-3 text-xs font-medium">{r.result?.cgpa?.toFixed(2) ?? "—"}</td>
                    <td className="px-4 py-3"><RiskCategoryBadge category={r.riskLevel} size="sm" /></td>
                    <td className="px-4 py-3 text-xs">{r.result?.arrears ?? "—"}</td>
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
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg hover:bg-white/5 disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: Math.min(5, pages) }, (_, i) => {
                const pg = Math.max(1, Math.min(pages - 4, page - 2)) + i;
                return (
                  <button
                    key={pg}
                    onClick={() => setPage(pg)}
                    className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${pg === page ? "bg-primary text-white" : "hover:bg-white/5 text-muted-foreground"}`}
                  >
                    {pg}
                  </button>
                );
              })}
              <button
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page === pages}
                className="p-1.5 rounded-lg hover:bg-white/5 disabled:opacity-30 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
