import { useEffect, useState, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import {
  BarChart3, TrendingUp, AlertTriangle, Database, RefreshCw,
  PieChart as PieChartIcon, Activity, Target, Layers,
  Download, FileSpreadsheet, Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { erpApi } from "@/services/erpApi";
import { toast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area,
  LineChart, Line,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";

const COLORS = {
  purple: "#8b5cf6",
  pink: "#f43f5e",
  green: "#10b981",
  blue: "#3b82f6",
  amber: "#f59e0b",
  cyan: "#06b6d4",
  red: "#ef4444",
};

const PIE_COLORS = [COLORS.green, COLORS.blue, COLORS.amber, COLORS.pink, COLORS.red, COLORS.cyan, COLORS.purple];

const tooltipStyle = {
  contentStyle: {
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(10,10,20,0.95)",
    fontSize: 12,
    color: "#fff",
  },
};

interface AcademicRecord {
  studentId: string;
  name?: string;
  markScore?: number;
  report?: {
    overallScore: number;
    attendanceScore: number;
    marksScore: number;
    riskCategory: string;
  };
  result?: { gpa: number; cgpa: number };
}

interface AttendanceRecord {
  studentId: string;
  attendancePercentage: number;
  workingDays: number;
  presentDays: number;
}

interface InternalMark {
  studentId: string;
  subjectName: string;
  cia1: number;
  cia2: number;
  internalPercentage: number;
  grade: string;
}

interface SemesterResult {
  studentId: string;
  gpa: number;
  cgpa: number;
  subjects: { subjectName: string; grade: string; gradePoint: number; passFail: string }[];
  student?: { name: string };
}

interface Report {
  studentId: string;
  studentName: string;
  overallScore: number;
  attendanceScore: number;
  marksScore: number;
  performanceScore: number;
  riskCategory: string;
  riskScore: number;
  learningTrend: string;
  weakSubjects: string[];
  strongSubjects: string[];
  dropoutRiskFeatures?: {
    attendancePct: number;
    ciaTotal: number;
    semesterMarks: number;
    cgpa: number;
  };
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.4, ease: "easeOut" },
  }),
};

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-10 bg-white/5 rounded-lg w-1/3" />
      <div className="h-12 bg-white/5 rounded-xl w-96" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="h-72 bg-white/5 rounded-xl border border-white/5" />
        ))}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-gradient">ERP Charts & Analytics</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Comprehensive visualizations of academic data
        </p>
      </div>
      <Card className="glass-card border-primary/30 text-center py-16">
        <CardContent className="space-y-3">
          <Database className="h-14 w-14 text-primary mx-auto mb-2 animate-bounce" />
          <h3 className="font-semibold text-lg">No ERP data available</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Synchronize your College ERP data first to unlock comprehensive academic charts and visualizations.
          </p>
          <p className="text-xs text-muted-foreground">
            Navigate to <span className="text-primary font-medium">ERP Sync</span> and click "Synchronize ERP Database" to get started.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function ChartCard({
  index,
  title,
  description,
  children,
  className = "",
}: {
  index: number;
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div custom={index} variants={cardVariants} initial="hidden" animate="visible">
      <Card className={`glass-card border-border/50 overflow-hidden hover:border-primary/20 transition-all duration-300 ${className}`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">{title}</CardTitle>
          <p className="text-[11px] text-muted-foreground">{description}</p>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </motion.div>
  );
}

export default function ERPCharts() {
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [excelLoading, setExcelLoading] = useState(false);
  const chartsRef = useRef<HTMLDivElement>(null);

  const [academicRecords, setAcademicRecords] = useState<AcademicRecord[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [internalMarks, setInternalMarks] = useState<InternalMark[]>([]);
  const [semesterResults, setSemesterResults] = useState<SemesterResult[]>([]);
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [acadRes, attRes, intRes, semRes, repRes] = await Promise.allSettled([
          erpApi.getAcademicRecords({ limit: 200 }),
          erpApi.getAttendanceRecords({ limit: 200 }),
          erpApi.getInternalMarks({ limit: 200 }),
          erpApi.getSemesterResults({ limit: 200 }),
          erpApi.getAcademicReports({ limit: 200 }),
        ]);

        const a = acadRes.status === "fulfilled" ? acadRes.value?.data ?? [] : [];
        const b = attRes.status === "fulfilled" ? attRes.value?.data ?? [] : [];
        const c = intRes.status === "fulfilled" ? intRes.value?.data ?? [] : [];
        const d = semRes.status === "fulfilled" ? semRes.value?.data ?? [] : [];
        const e = repRes.status === "fulfilled" ? repRes.value?.data ?? [] : [];

        setAcademicRecords(a);
        setAttendanceRecords(b);
        setInternalMarks(c);
        setSemesterResults(d);
        setReports(e);
        setHasData(a.length + b.length + c.length + d.length + e.length > 0);
      } catch {
        setHasData(false);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // ── Computed chart data ──

  // Tab 1: Risk Distribution
  const riskDistributionData = useMemo(() => {
    const counts: Record<string, number> = {};
    reports.forEach((r) => {
      const cat = r.riskCategory || "Unknown";
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [reports]);

  // Tab 1: Department GPA
  const departmentGpaData = useMemo(() => {
    if (semesterResults.length === 0) return [];
    const grouped: Record<string, { total: number; count: number }> = {};
    semesterResults.forEach((r) => {
      const name = r.student?.name ?? r.studentId;
      const short = name.split(" ")[0];
      if (!grouped[short]) grouped[short] = { total: 0, count: 0 };
      grouped[short].total += r.gpa;
      grouped[short].count += 1;
    });
    return Object.entries(grouped)
      .map(([name, { total, count }]) => ({ name, gpa: +(total / count).toFixed(2) }))
      .sort((a, b) => b.gpa - a.gpa)
      .slice(0, 15);
  }, [semesterResults]);

  // Tab 1: Attendance Distribution
  const attendanceDistributionData = useMemo(() => {
    if (attendanceRecords.length === 0) return [];
    const buckets: Record<string, number> = {};
    for (let i = 0; i < 100; i += 10) {
      buckets[`${i}-${i + 10}`] = 0;
    }
    attendanceRecords.forEach((r) => {
      const pct = r.attendancePercentage;
      const lo = Math.floor(pct / 10) * 10;
      const key = `${Math.min(lo, 90)}-${Math.min(lo + 10, 100)}`;
      if (buckets[key] !== undefined) buckets[key] += 1;
    });
    return Object.entries(buckets).map(([range, count]) => ({ range, count }));
  }, [attendanceRecords]);

  // Tab 2: CIA Comparison (top 15 by marksScore)
  const ciaComparisonData = useMemo(() => {
    return academicRecords
      .filter((r) => r.report?.marksScore != null)
      .sort((a, b) => (b.report?.marksScore ?? 0) - (a.report?.marksScore ?? 0))
      .slice(0, 15)
      .map((r) => ({
        name: (r.name ?? r.studentId).split(" ")[0],
        marks: r.report?.marksScore ?? 0,
      }));
  }, [academicRecords]);

  // Tab 2: Semester Performance (GPA vs CGPA)
  const semesterPerformanceData = useMemo(() => {
    return semesterResults
      .sort((a, b) => b.gpa - a.gpa)
      .slice(0, 15)
      .map((r) => ({
        name: (r.student?.name ?? r.studentId).split(" ")[0],
        gpa: r.gpa,
        cgpa: r.cgpa,
      }));
  }, [semesterResults]);

  // Tab 2: Subject-wise Radar
  const subjectRadarData = useMemo(() => {
    if (internalMarks.length === 0) return [];
    const grouped: Record<string, { total: number; count: number }> = {};
    internalMarks.forEach((m) => {
      const subj = m.subjectName || "Unknown";
      if (!grouped[subj]) grouped[subj] = { total: 0, count: 0 };
      grouped[subj].total += m.internalPercentage;
      grouped[subj].count += 1;
    });
    return Object.entries(grouped)
      .map(([subject, { total, count }]) => ({
        subject: subject.length > 18 ? subject.slice(0, 16) + "…" : subject,
        avgInternal: +(total / count).toFixed(1),
        fullMark: 100,
      }))
      .sort((a, b) => b.avgInternal - a.avgInternal)
      .slice(0, 8);
  }, [internalMarks]);

  // Tab 3: CGPA Trend
  const cgpaTrendData = useMemo(() => {
    return semesterResults
      .slice(0, 40)
      .map((r, i) => ({
        idx: i + 1,
        name: (r.student?.name ?? r.studentId).split(" ")[0],
        cgpa: r.cgpa,
      }));
  }, [semesterResults]);

  // Tab 3: Performance Index Distribution
  const performanceIndexData = useMemo(() => {
    if (reports.length === 0) return [];
    const buckets: Record<string, number> = {};
    for (let i = 0; i < 100; i += 10) {
      buckets[`${i}-${i + 10}`] = 0;
    }
    reports.forEach((r) => {
      const lo = Math.floor(r.overallScore / 10) * 10;
      const key = `${Math.min(lo, 90)}-${Math.min(lo + 10, 100)}`;
      if (buckets[key] !== undefined) buckets[key] += 1;
    });
    return Object.entries(buckets).map(([range, count]) => ({ range, count }));
  }, [reports]);

  // Tab 3: Learning Trend
  const learningTrendData = useMemo(() => {
    const counts: Record<string, number> = { Improving: 0, Stable: 0, Declining: 0 };
    reports.forEach((r) => {
      const trend = r.learningTrend || "Stable";
      if (counts[trend] !== undefined) counts[trend] += 1;
    });
    return Object.entries(counts)
      .map(([trend, count]) => ({ trend, count }));
  }, [reports]);

  // Tab 4: Average Risk Score
  const avgRiskScore = useMemo(() => {
    if (reports.length === 0) return 0;
    const sum = reports.reduce((acc, r) => acc + (r.riskScore || 0), 0);
    return +(sum / reports.length).toFixed(1);
  }, [reports]);

  // Tab 4: Risk Factors
  const riskFactorsData = useMemo(() => {
    if (reports.length === 0) return [];
    let attSum = 0, ciaSum = 0, semSum = 0, cgpaSum = 0, n = 0;
    reports.forEach((r) => {
      const f = r.dropoutRiskFeatures;
      if (f) {
        attSum += f.attendancePct || 0;
        ciaSum += f.ciaTotal || 0;
        semSum += f.semesterMarks || 0;
        cgpaSum += (f.cgpa || 0) * 10;
        n++;
      }
    });
    if (n === 0) return [];
    return [
      { factor: "Attendance %", avg: +(attSum / n).toFixed(1) },
      { factor: "CIA Total", avg: +(ciaSum / n).toFixed(1) },
      { factor: "Semester Marks", avg: +(semSum / n).toFixed(1) },
      { factor: "CGPA (×10)", avg: +(cgpaSum / n).toFixed(1) },
    ];
  }, [reports]);

  // Tab 4: Risk Category Donut
  const riskCategoryDonutData = useMemo(() => {
    const counts: Record<string, number> = {};
    reports.forEach((r) => {
      const cat = r.riskCategory || "Unknown";
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [reports]);

  // ── Export: PDF ──
  const handleDownloadPDF = async () => {
    if (!chartsRef.current) return;
    setPdfLoading(true);
    try {
      toast({ title: "Generating PDF Report", description: "Capturing charts and building document..." });
      const element = chartsRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#09090b",
        logging: false,
      });
      const imgData = canvas.toDataURL("image/png");
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pdf = new jsPDF("p", "mm", "a4");
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const date = new Date().toISOString().slice(0, 10);
      pdf.save(`ERP_Charts_Report_${date}.pdf`);
      toast({ title: "PDF Downloaded", description: "ERP Charts report has been saved." });
    } catch (err) {
      console.error("PDF generation failed:", err);
      toast({ title: "PDF Failed", description: "An error occurred while generating the PDF.", variant: "destructive" });
    } finally {
      setPdfLoading(false);
    }
  };

  // ── Export: Excel ──
  const handleExportExcel = async () => {
    setExcelLoading(true);
    try {
      const wb = XLSX.utils.book_new();

      // Sheet 1: Summary KPIs
      const avgAtt = reports.length ? +(reports.reduce((s, r) => s + r.attendanceScore, 0) / reports.length).toFixed(2) : 0;
      const avgCia = reports.length ? +(reports.reduce((s, r) => s + r.marksScore, 0) / reports.length).toFixed(2) : 0;
      const avgGpa = semesterResults.length ? +(semesterResults.reduce((s, r) => s + r.gpa, 0) / semesterResults.length).toFixed(2) : 0;
      const avgCgpa = semesterResults.length ? +(semesterResults.reduce((s, r) => s + r.cgpa, 0) / semesterResults.length).toFixed(2) : 0;
      const highRisk = reports.filter((r) => ["High", "Critical"].includes(r.riskCategory)).length;
      const avgRisk = reports.length ? +(reports.reduce((s, r) => s + (r.riskScore || 0), 0) / reports.length).toFixed(1) : 0;
      const kpiData = [
        { Metric: "Total Students", Value: reports.length },
        { Metric: "Average Attendance %", Value: avgAtt },
        { Metric: "Average CIA %", Value: avgCia },
        { Metric: "Average GPA", Value: avgGpa },
        { Metric: "Average CGPA", Value: avgCgpa },
        { Metric: "High Risk Students", Value: highRisk },
        { Metric: "Average Risk Score", Value: avgRisk },
        { Metric: "Report Generated", Value: new Date().toLocaleString() },
      ];
      const kpiSheet = XLSX.utils.json_to_sheet(kpiData);
      kpiSheet["!cols"] = [{ wch: 25 }, { wch: 20 }];
      XLSX.utils.book_append_sheet(wb, kpiSheet, "Summary KPIs");

      // Sheet 2: Risk Distribution
      const riskCounts: Record<string, number> = {};
      reports.forEach((r) => { riskCounts[r.riskCategory] = (riskCounts[r.riskCategory] || 0) + 1; });
      const riskData = Object.entries(riskCounts).map(([Category, Count]) => ({ Category, Count }));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(riskData), "Risk Distribution");

      // Sheet 3: Attendance Distribution
      const attBuckets: Record<string, number> = {};
      for (let i = 0; i < 100; i += 10) attBuckets[`${i}-${i + 10}%`] = 0;
      attendanceRecords.forEach((r) => {
        const lo = Math.floor(r.attendancePercentage / 10) * 10;
        const key = `${Math.min(lo, 90)}-${Math.min(lo + 10, 100)}%`;
        if (attBuckets[key] !== undefined) attBuckets[key] += 1;
      });
      const attData = Object.entries(attBuckets).map(([Range, Count]) => ({ Range, Count }));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(attData), "Attendance Distribution");

      // Sheet 4: Learning Trends
      const trendCounts: Record<string, number> = { Improving: 0, Stable: 0, Declining: 0 };
      reports.forEach((r) => { const t = r.learningTrend || "Stable"; if (trendCounts[t] !== undefined) trendCounts[t]++; });
      const trendData = Object.entries(trendCounts).map(([Trend, Count]) => ({ Trend, Count }));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(trendData), "Learning Trends");

      // Sheet 5: Subject-wise Internal Averages
      const subjGrouped: Record<string, { total: number; count: number }> = {};
      internalMarks.forEach((m) => {
        if (!subjGrouped[m.subjectName]) subjGrouped[m.subjectName] = { total: 0, count: 0 };
        subjGrouped[m.subjectName].total += m.internalPercentage;
        subjGrouped[m.subjectName].count += 1;
      });
      const subjData = Object.entries(subjGrouped)
        .map(([Subject, { total, count }]) => ({ Subject, "Avg Internal %": +(total / count).toFixed(1), Students: count }))
        .sort((a, b) => b["Avg Internal %"] - a["Avg Internal %"]);
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(subjData), "Subject Averages");

      // Sheet 6: All Student Reports
      const reportRows = reports.map((r) => ({
        "Student ID": r.studentId,
        "Student Name": r.studentName,
        "Overall Score": r.overallScore,
        "Attendance %": r.attendanceScore,
        "Marks %": r.marksScore,
        "Performance Score": r.performanceScore,
        "Learning Trend": r.learningTrend,
        "Risk Score": r.riskScore,
        "Risk Category": r.riskCategory,
        "Weak Subjects": (r.weakSubjects || []).join(", "),
        "Strong Subjects": (r.strongSubjects || []).join(", "),
      }));
      const reportSheet = XLSX.utils.json_to_sheet(reportRows);
      reportSheet["!cols"] = [
        { wch: 14 }, { wch: 24 }, { wch: 14 }, { wch: 14 }, { wch: 10 },
        { wch: 16 }, { wch: 14 }, { wch: 10 }, { wch: 14 }, { wch: 35 }, { wch: 35 },
      ];
      XLSX.utils.book_append_sheet(wb, reportSheet, "Student Reports");

      // Sheet 7: Semester Results
      const semRows = semesterResults.map((r) => ({
        "Student ID": r.studentId,
        "Student Name": r.student?.name || r.studentId,
        GPA: r.gpa,
        CGPA: r.cgpa,
        Backlogs: r.backlogs,
        "Subjects Passed": (r.subjects || []).filter((s) => s.passFail === "Pass").length,
        "Subjects Failed": (r.subjects || []).filter((s) => s.passFail === "Fail").length,
      }));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(semRows), "Semester Results");

      const date = new Date().toISOString().slice(0, 10);
      XLSX.writeFile(wb, `ERP_Charts_Report_${date}.xlsx`);
      toast({ title: "Excel Exported", description: "All chart data exported across 7 sheets." });
    } catch (err) {
      console.error("Excel export failed:", err);
      toast({ title: "Export Failed", description: "An error occurred while exporting.", variant: "destructive" });
    } finally {
      setExcelLoading(false);
    }
  };

  if (loading) return <LoadingSkeleton />;
  if (!hasData) return <EmptyState />;

  const gaugeAngle = (avgRiskScore / 100) * 180 - 90;
  const getGaugeColor = (score: number) => {
    if (score < 20) return COLORS.green;
    if (score < 40) return COLORS.blue;
    if (score < 60) return COLORS.amber;
    if (score < 80) return "#f97316";
    return COLORS.red;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-gradient">ERP Charts & Analytics</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Comprehensive academic visualizations across {reports.length || "—"} student reports
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportExcel}
              disabled={excelLoading}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold glass-card rounded-lg border border-border/50 hover:border-primary/40 transition-colors disabled:opacity-50"
            >
              {excelLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileSpreadsheet className="h-3.5 w-3.5" />}
              {excelLoading ? "Exporting..." : "Export Excel"}
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={pdfLoading}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl text-white transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              style={{ background: "linear-gradient(135deg,#8b5cf6,#f43f5e)" }}
            >
              {pdfLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
              {pdfLoading ? "Generating..." : "Download PDF Report"}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div ref={chartsRef}>
      <Tabs defaultValue="overview">
        <TabsList className="glass-card border border-border/50 p-1 h-auto flex-wrap">
          <TabsTrigger value="overview" className="gap-1.5 text-xs data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            <PieChartIcon className="h-3.5 w-3.5" /> Overview
          </TabsTrigger>
          <TabsTrigger value="performance" className="gap-1.5 text-xs data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            <BarChart3 className="h-3.5 w-3.5" /> Performance
          </TabsTrigger>
          <TabsTrigger value="trends" className="gap-1.5 text-xs data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            <TrendingUp className="h-3.5 w-3.5" /> Trends
          </TabsTrigger>
          <TabsTrigger value="risk" className="gap-1.5 text-xs data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            <AlertTriangle className="h-3.5 w-3.5" /> Risk Analysis
          </TabsTrigger>
        </TabsList>

        {/* ═══════════════════════ TAB 1: Overview ═══════════════════════ */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-4">
            {/* Risk Distribution Pie */}
            <ChartCard
              index={0}
              title="Risk Distribution"
              description="Student count by risk category from academic reports"
            >
              {riskDistributionData.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-10">No report data</p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={riskDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={95}
                      paddingAngle={4}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {riskDistributionData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip
                      {...tooltipStyle}
                      formatter={(value: number, name: string) => [`${value} students`, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            {/* Department GPA Bar */}
            <ChartCard
              index={1}
              title="Student GPA Comparison"
              description="GPA values for top students from semester results"
            >
              {departmentGpaData.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-10">No semester data</p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={departmentGpaData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis type="number" domain={[0, 10]} tick={{ fontSize: 10, fill: "rgba(255,255,255,0.5)" }} />
                    <YAxis type="category" dataKey="name" width={60} tick={{ fontSize: 10, fill: "rgba(255,255,255,0.5)" }} />
                    <Tooltip {...tooltipStyle} />
                    <Bar dataKey="gpa" radius={[0, 6, 6, 0]} maxBarSize={18}>
                      {departmentGpaData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} fillOpacity={0.85} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            {/* Attendance Distribution Area */}
            <ChartCard
              index={2}
              title="Attendance Distribution"
              description="Histogram of attendance percentages across all students"
            >
              {attendanceDistributionData.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-10">No attendance data</p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={attendanceDistributionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="range" tick={{ fontSize: 9, fill: "rgba(255,255,255,0.5)" }} />
                    <YAxis tick={{ fontSize: 10, fill: "rgba(255,255,255,0.5)" }} />
                    <Tooltip {...tooltipStyle} />
                    <defs>
                      <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={COLORS.green} stopOpacity={0.5} />
                        <stop offset="100%" stopColor={COLORS.green} stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke={COLORS.green}
                      fill="url(#attGrad)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </div>
        </TabsContent>

        {/* ═══════════════════════ TAB 2: Performance ═══════════════════════ */}
        <TabsContent value="performance">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-4">
            {/* CIA Comparison Bar */}
            <ChartCard
              index={3}
              title="CIA Marks Comparison"
              description="Top 15 students by internal assessment scores"
            >
              {ciaComparisonData.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-10">No academic record data</p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={ciaComparisonData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="name" tick={{ fontSize: 9, fill: "rgba(255,255,255,0.5)" }} angle={-35} textAnchor="end" height={60} />
                    <YAxis tick={{ fontSize: 10, fill: "rgba(255,255,255,0.5)" }} domain={[0, 100]} />
                    <Tooltip {...tooltipStyle} />
                    <Bar dataKey="marks" radius={[6, 6, 0, 0]} maxBarSize={24}>
                      {ciaComparisonData.map((_, i) => (
                        <Cell key={i} fill={COLORS.purple} fillOpacity={0.6 + (i / ciaComparisonData.length) * 0.4} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            {/* Semester Performance Line */}
            <ChartCard
              index={4}
              title="GPA vs CGPA Performance"
              description="Comparing semester GPA with cumulative CGPA for top students"
            >
              {semesterPerformanceData.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-10">No semester data</p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={semesterPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="name" tick={{ fontSize: 9, fill: "rgba(255,255,255,0.5)" }} angle={-35} textAnchor="end" height={60} />
                    <YAxis domain={[0, 10]} tick={{ fontSize: 10, fill: "rgba(255,255,255,0.5)" }} />
                    <Tooltip {...tooltipStyle} />
                    <Line type="monotone" dataKey="gpa" stroke={COLORS.cyan} strokeWidth={2} dot={{ r: 3, fill: COLORS.cyan }} name="GPA" />
                    <Line type="monotone" dataKey="cgpa" stroke={COLORS.pink} strokeWidth={2} dot={{ r: 3, fill: COLORS.pink }} name="CGPA" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            {/* Subject-wise Radar */}
            <ChartCard
              index={5}
              title="Subject-wise Internal Analysis"
              description="Average internal assessment percentage per subject"
            >
              {subjectRadarData.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-10">No internal marks data</p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <RadarChart data={subjectRadarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.06)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fill: "rgba(255,255,255,0.6)" }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9, fill: "rgba(255,255,255,0.4)" }} />
                    <Radar name="Avg Internal %" dataKey="avgInternal" stroke={COLORS.purple} fill={COLORS.purple} fillOpacity={0.2} strokeWidth={2} />
                    <Tooltip {...tooltipStyle} />
                  </RadarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </div>
        </TabsContent>

        {/* ═══════════════════════ TAB 3: Trends ═══════════════════════ */}
        <TabsContent value="trends">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-4">
            {/* CGPA Trend Line */}
            <ChartCard
              index={6}
              title="CGPA Trend"
              description="CGPA values spread across the student cohort"
            >
              {cgpaTrendData.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-10">No semester data</p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={cgpaTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="idx" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.5)" }} label={{ value: "Student #", position: "bottom", offset: -5, style: { fontSize: 10, fill: "rgba(255,255,255,0.4)" } }} />
                    <YAxis domain={[0, 10]} tick={{ fontSize: 10, fill: "rgba(255,255,255,0.5)" }} />
                    <Tooltip
                      {...tooltipStyle}
                      formatter={(val: number) => [val.toFixed(2), "CGPA"]}
                      labelFormatter={(label) => `Student #${label}`}
                    />
                    <Line type="monotone" dataKey="cgpa" stroke={COLORS.blue} strokeWidth={2} dot={{ r: 3, fill: COLORS.blue }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            {/* Performance Index Area */}
            <ChartCard
              index={7}
              title="Performance Index Distribution"
              description="Distribution of overall academic scores across the cohort"
            >
              {performanceIndexData.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-10">No report data</p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={performanceIndexData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="range" tick={{ fontSize: 9, fill: "rgba(255,255,255,0.5)" }} />
                    <YAxis tick={{ fontSize: 10, fill: "rgba(255,255,255,0.5)" }} />
                    <Tooltip {...tooltipStyle} />
                    <defs>
                      <linearGradient id="perfGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={COLORS.amber} stopOpacity={0.5} />
                        <stop offset="100%" stopColor={COLORS.amber} stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="count" stroke={COLORS.amber} fill="url(#perfGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            {/* Learning Trend Bar */}
            <ChartCard
              index={8}
              title="Learning Trend"
              description="Count of students with Improving, Stable, or Declining trends"
            >
              {learningTrendData.every((d) => d.count === 0) ? (
                <p className="text-xs text-muted-foreground text-center py-10">No trend data</p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={learningTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="trend" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.5)" }} />
                    <YAxis tick={{ fontSize: 10, fill: "rgba(255,255,255,0.5)" }} />
                    <Tooltip {...tooltipStyle} />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={50}>
                      {learningTrendData.map((entry) => (
                        <Cell
                          key={entry.trend}
                          fill={
                            entry.trend === "Improving"
                              ? COLORS.green
                              : entry.trend === "Stable"
                              ? COLORS.blue
                              : COLORS.red
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </div>
        </TabsContent>

        {/* ═══════════════════════ TAB 4: Risk Analysis ═══════════════════════ */}
        <TabsContent value="risk">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-4">
            {/* Dropout Risk Gauge */}
            <ChartCard
              index={9}
              title="Average Dropout Risk"
              description="Semicircular gauge of average risk score across all students"
            >
              <div className="flex flex-col items-center py-4">
                <div className="relative w-52 h-28 overflow-hidden flex items-end justify-center">
                  <svg width="200" height="100" className="overflow-visible">
                    <path
                      d="M 10 100 A 90 90 0 0 1 190 100"
                      fill="none"
                      stroke="rgba(255,255,255,0.06)"
                      strokeWidth="18"
                      strokeLinecap="round"
                    />
                    <path d="M 10 100 A 90 90 0 0 1 46 52" fill="none" stroke={COLORS.green} strokeWidth="18" />
                    <path d="M 46 52 A 90 90 0 0 1 100 10" fill="none" stroke={COLORS.blue} strokeWidth="18" />
                    <path d="M 100 10 A 90 90 0 0 1 154 52" fill="none" stroke={COLORS.amber} strokeWidth="18" />
                    <path d="M 154 52 A 90 90 0 0 1 190 100" fill="none" stroke={COLORS.red} strokeWidth="18" />
                    <circle cx="100" cy="100" r="6" fill="#fff" />
                  </svg>
                  <div
                    className="absolute bottom-0 origin-bottom rounded-full"
                    style={{
                      height: "85px",
                      width: "4px",
                      background: "#fff",
                      transform: `rotate(${gaugeAngle}deg)`,
                      transition: "transform 1.4s cubic-bezier(0.4, 0, 0.2, 1)",
                      boxShadow: "0 0 12px rgba(255,255,255,0.5)",
                    }}
                  />
                </div>
                <div className="mt-4 text-center">
                  <span className="text-3xl font-bold font-display" style={{ color: getGaugeColor(avgRiskScore) }}>
                    {avgRiskScore}%
                  </span>
                  <p className="text-[11px] text-muted-foreground mt-1">Average risk across {reports.length} students</p>
                </div>
              </div>
            </ChartCard>

            {/* Risk Factors Horizontal Bar */}
            <ChartCard
              index={10}
              title="Risk Factor Averages"
              description="Average values of dropout risk contributing factors"
            >
              {riskFactorsData.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-10">No dropout risk features</p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={riskFactorsData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: "rgba(255,255,255,0.5)" }} />
                    <YAxis type="category" dataKey="factor" width={100} tick={{ fontSize: 10, fill: "rgba(255,255,255,0.5)" }} />
                    <Tooltip {...tooltipStyle} />
                    <Bar dataKey="avg" radius={[0, 6, 6, 0]} maxBarSize={24}>
                      {riskFactorsData.map((_, i) => (
                        <Cell key={i} fill={[COLORS.green, COLORS.purple, COLORS.amber, COLORS.cyan][i % 4]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            {/* Risk Category Donut */}
            <ChartCard
              index={11}
              title="Risk Category Breakdown"
              description="Donut chart of student risk categories from reports"
            >
              {riskCategoryDonutData.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-10">No report data</p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={riskCategoryDonutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {riskCategoryDonutData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip
                      {...tooltipStyle}
                      formatter={(value: number, name: string) => [`${value} students`, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </div>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}
