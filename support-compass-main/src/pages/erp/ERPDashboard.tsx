import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users, RefreshCw, BarChart3, TrendingUp, Award, AlertTriangle,
  Activity, CheckCircle, Clock, Database, Target, ArrowUpRight, ArrowDownRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RiskCategoryBadge } from "@/components/erp/RiskCategoryBadge";
import { erpApi } from "@/services/erpApi";
import { useNavigate } from "react-router-dom";

interface StudentReport {
  studentId: string;
  studentName: string;
  overallScore: number;
  riskCategory: string;
  studentRanking: number;
}

interface DashboardData {
  totalStudents: number;
  syncedToday: number;
  avgAttendance: number;
  avgCia: number;
  avgGpa: number;
  avgCgpa: number;
  highRisk: number;
  top10: StudentReport[];
  lowPerf: StudentReport[];
  pendingSync: boolean;
  lastSync: { time: string; duration: number } | null;
}

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.35 } }),
};

export default function ERPDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    erpApi
      .getDashboard()
      .then((res) => {
        if (res.data && res.data.totalStudents === 0) {
          erpApi.triggerSync().then(() => {
            erpApi.getDashboard().then((res2) => setData(res2.data)).catch(() => {});
          }).catch(() => {});
        }
        setData(res.data);
      })
      .catch(() => {
        erpApi.triggerSync().then(() => {
          erpApi.getDashboard().then((res2) => setData(res2.data)).catch(() => {});
        }).catch(() => setData(null));
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-white/5 rounded-lg w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-28 bg-white/5 rounded-xl border border-border/50" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-gradient">ERP Analytics Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            B.Sc Computer Science with Data Analytics • Real-time Sync & Predictions
          </p>
        </div>
        <div className="flex items-center gap-3">
          {data?.lastSync && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground glass-card px-3 py-2 rounded-xl border border-border/50">
              <Clock className="h-3.5 w-3.5 text-primary animate-pulse" />
              <span>Synced {new Date(data.lastSync.time).toLocaleTimeString()}</span>
            </div>
          )}
          <button
            onClick={() => navigate("/erp/sync")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105"
            style={{ background: "linear-gradient(135deg,#8b5cf6,#f43f5e)" }}
          >
            <RefreshCw className="h-4 w-4" />
            Sync ERP
          </button>
        </div>
      </div>

      {/* Sync Status Banner */}
      {(!data || data.totalStudents === 0) && (
        <Card className="glass-card border-primary/30 text-center py-10">
          <CardContent className="space-y-3">
            <Database className="h-12 w-12 text-primary mx-auto mb-2 animate-bounce" />
            <h3 className="font-semibold text-lg">No synchronized data available</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              You haven't synchronized data with the College ERP yet today. Synchronize now to run the risk calculations and populate this dashboard.
            </p>
            <button
              onClick={() => navigate("/erp/sync")}
              className="mt-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-primary hover:bg-primary/80 transition-colors"
            >
              Synchronize ERP Database
            </button>
          </CardContent>
        </Card>
      )}

      {data && data.totalStudents > 0 && (
        <>
          {/* Dashboard KPIs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: "Total Students", value: data.totalStudents, desc: "Master List Database", icon: Users, color: "#8b5cf6" },
              { title: "Synced Today", value: data.syncedToday, desc: "Records Updated", icon: RefreshCw, color: "#10b981" },
              { title: "Average Attendance", value: `${data.avgAttendance}%`, desc: "Required Target: 75%", icon: Activity, color: "#3b82f6" },
              { title: "Average CIA", value: `${data.avgCia.toFixed(1)}%`, desc: "Internal Marks Avg", icon: BarChart3, color: "#f59e0b" },
              { title: "Average GPA", value: data.avgGpa, desc: "Current Sem Score", icon: TrendingUp, color: "#06b6d4" },
              { title: "Average CGPA", value: data.avgCgpa, desc: "Overall GPA Average", icon: Award, color: "#84cc16" },
              { title: "High Risk Students", value: data.highRisk, desc: "Immediate Action Needed", icon: AlertTriangle, color: "#ef4444" },
              { title: "Sync Pending", value: data.pendingSync ? "Yes" : "No", desc: "Status Update", icon: Clock, color: "#a855f7" },
            ].map((card, i) => (
              <motion.div key={card.title} custom={i} variants={cardVariants} initial="hidden" animate="visible">
                <Card className="glass-card border-border/50 overflow-hidden relative group hover:border-primary/20 transition-all duration-300">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ background: `${card.color}05` }} />
                  <CardContent className="p-5 flex justify-between items-start">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{card.title}</p>
                      <p className="text-2xl font-bold font-display text-white">{card.value}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">{card.desc}</p>
                    </div>
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${card.color}15` }}>
                      <card.icon className="h-5 w-5" style={{ color: card.color }} />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Top 10 vs Low Performing lists */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top 10 Performers */}
            <Card className="glass-card border-border/50 overflow-hidden">
              <CardHeader className="pb-3 border-b border-border/20">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Award className="h-4 w-4 text-green-400" />
                  Top 10 Performers (Data Analytics)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/20">
                  {data.top10.map((s, idx) => (
                    <div key={s.studentId} className="flex items-center justify-between px-4 py-3 hover:bg-white/2 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground w-4">#{idx + 1}</span>
                        <div>
                          <p className="text-xs font-semibold text-white">{s.studentName}</p>
                          <p className="text-[10px] text-muted-foreground">{s.studentId}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-green-400">{s.overallScore}%</span>
                        <ArrowUpRight className="h-3.5 w-3.5 text-green-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Low Performing Students */}
            <Card className="glass-card border-border/50 overflow-hidden">
              <CardHeader className="pb-3 border-b border-border/20">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-400 animate-pulse" />
                  Students Requiring Remedial Attention
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/20">
                  {data.lowPerf.map((s, idx) => (
                    <div key={s.studentId} className="flex items-center justify-between px-4 py-3 hover:bg-white/2 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground w-4">#{idx + 1}</span>
                        <div>
                          <p className="text-xs font-semibold text-white">{s.studentName}</p>
                          <p className="text-[10px] text-muted-foreground">{s.studentId}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-red-400">{s.overallScore}%</span>
                        <RiskCategoryBadge category={s.riskCategory} size="sm" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Quick Navigation Items */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Sync Status", path: "/erp/sync", icon: RefreshCw, color: "#8b5cf6" },
          { label: "Attendance Overview", path: "/erp/attendance", icon: Activity, color: "#10b981" },
          { label: "Internal Marks", path: "/erp/internal-marks", icon: BarChart3, color: "#f59e0b" },
          { label: "Semester Results", path: "/erp/semester-results", icon: TrendingUp, color: "#06b6d4" },
          { label: "Academic Reports", path: "/erp/reports", icon: CheckCircle, color: "#f43f5e" },
        ].map((item) => (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className="glass-card border border-border/50 p-4 rounded-xl flex flex-col items-center gap-2 text-xs font-medium text-muted-foreground hover:border-primary/40 hover:text-white transition-all duration-200 hover:scale-105"
          >
            <item.icon className="h-5 w-5" style={{ color: item.color }} />
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
