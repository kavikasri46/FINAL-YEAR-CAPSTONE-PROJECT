import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Search, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { CircularProgress } from "@/components/erp/CircularProgress";
import { erpApi } from "@/services/erpApi";

interface AttRecord {
  _id: string;
  studentId: string;
  academicYear: string;
  semester: number;
  workingDays: number;
  presentDays: number;
  absentDays: number;
  lateEntry: number;
  medicalLeave: number;
  od: number;
  attendancePercentage: number;
  student?: { name: string; department: string; year: number; section: string };
}

export default function AttendancePage() {
  const [records, setRecords] = useState<AttRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const res = await erpApi.getAttendanceRecords({ page, limit: 12, search });
      setRecords(res.data || []);
      setTotal(res.total || 0);
      setPages(res.pages || 1);
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const attColor = (pct: number) => {
    if (pct < 60) return "#ef4444";
    if (pct < 75) return "#f59e0b";
    if (pct < 85) return "#3b82f6";
    return "#10b981";
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-gradient">Attendance</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{total} records • Auto-calculated from ERP sync</p>
        </div>
        <button onClick={fetchRecords} className="p-2 glass-card rounded-lg border border-border/50 hover:border-primary/40 transition-colors">
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 glass-card rounded-xl border border-border/50 px-4 py-2.5">
        <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <input
          type="text"
          placeholder="Search by student name..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="bg-transparent text-sm outline-none w-full text-foreground placeholder:text-muted-foreground"
        />
      </div>

      {/* Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass-card border border-border/50 rounded-xl p-5 animate-pulse h-48" />
          ))}
        </div>
      ) : records.length === 0 ? (
        <Card className="glass-card border-border/50">
          <CardContent className="py-16 text-center text-muted-foreground text-sm">
            No attendance records found. Please sync ERP first.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {records.map((r, i) => (
            <motion.div
              key={r._id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Card className="glass-card border-border/50 hover:border-primary/30 transition-all duration-300 overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="font-semibold text-sm">{r.student?.name ?? r.studentId}</p>
                      <p className="text-[10px] text-muted-foreground">
                        Roll: {r.student?.rollNo ?? "N/A"} • Advisor: {r.student?.advisor ?? "N/A"}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Yr {r.student?.year} Sem {r.semester} Sec {r.student?.section}
                      </p>
                    </div>
                    <div className="flex flex-col items-center">
                      <CircularProgress
                        value={r.attendancePercentage}
                        size={80}
                        strokeWidth={7}
                        color={attColor(r.attendancePercentage)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    {[
                      { label: "Working", value: r.workingDays, color: "#8b5cf6" },
                      { label: "Present", value: r.presentDays, color: "#10b981" },
                      { label: "Absent", value: r.absentDays, color: "#ef4444" },
                      { label: "Late", value: r.lateEntry, color: "#f59e0b" },
                      { label: "Medical", value: r.medicalLeave, color: "#3b82f6" },
                      { label: "OD", value: r.od, color: "#06b6d4" },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="rounded-lg py-1.5 px-1"
                        style={{ background: `${item.color}12`, border: `1px solid ${item.color}20` }}
                      >
                        <p className="text-sm font-bold" style={{ color: item.color }}>{item.value}</p>
                        <p className="text-[9px] text-muted-foreground">{item.label}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg hover:bg-white/5 disabled:opacity-30 transition-colors">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-xs text-muted-foreground">Page {page} of {pages}</span>
          <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages} className="p-1.5 rounded-lg hover:bg-white/5 disabled:opacity-30 transition-colors">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
