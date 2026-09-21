import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Search, Download, Printer, RefreshCw,
  ChevronLeft, ChevronRight, FileText, Activity, AlertTriangle, BookOpen, Brain, Zap, FileSpreadsheet
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { RiskCategoryBadge } from "@/components/erp/RiskCategoryBadge";
import { erpApi } from "@/services/erpApi";
import { toast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";

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
  generatedAt: string;
}

export default function AcademicReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [selected, setSelected] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [excelLoading, setExcelLoading] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

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

  const handlePrint = () => {
    window.print();
  };

  const exportCSV = () => {
    if (!reports.length) return;
    const headers = ["Name", "Student ID", "Academic Score", "Attendance %", "Marks %", "Risk Category", "Ranking"];
    const rows = reports.map((r) => [
      r.studentName, r.studentId, r.overallScore, r.attendanceScore, r.marksScore, r.riskCategory, r.studentRanking
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "student_academic_reports.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadPDF = async () => {
    if (!selected || !reportRef.current) return;
    setPdfLoading(true);
    try {
      toast({ title: "Generating PDF", description: "Please wait while the PDF is being created..." });
      const element = reportRef.current;
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

      pdf.save(`${selected.studentName.replace(/\s+/g, "_")}_Academic_Report.pdf`);
      toast({ title: "PDF Downloaded", description: `Report for ${selected.studentName} has been saved.` });
    } catch (err) {
      console.error("PDF generation failed:", err);
      toast({ title: "PDF Generation Failed", description: "An error occurred while generating the PDF.", variant: "destructive" });
    } finally {
      setPdfLoading(false);
    }
  };

  const handleExportExcel = async () => {
    setExcelLoading(true);
    try {
      let dataToExport = reports;

      if (reports.length === 0) {
        const res = await erpApi.getAcademicReports({ page: 1, limit: 1000, search, category });
        dataToExport = res.data || [];
      }

      if (!dataToExport.length) {
        toast({ title: "No Data", description: "No reports available to export.", variant: "destructive" });
        return;
      }

      const worksheetData = dataToExport.map((r) => ({
        "Student Name": r.studentName,
        "Student ID": r.studentId,
        "Overall Score": r.overallScore,
        "Attendance %": r.attendanceScore,
        "Marks %": r.marksScore,
        "Performance Score": r.performanceScore,
        "Learning Trend": r.learningTrend,
        "Improvement %": r.improvementPct,
        "Consistency": r.consistency,
        "Risk Score": r.riskScore,
        "Performance Index": r.performanceIndex,
        "Ranking": r.studentRanking,
        "Risk Category": r.riskCategory,
        "Weak Subjects": r.weakSubjects.join(", "),
        "Strong Subjects": r.strongSubjects.join(", "),
        "Teacher Recommendations": (r.recommendations?.teacher ?? []).join("; "),
        "Parent Recommendations": (r.recommendations?.parent ?? []).join("; "),
        "Student Recommendations": (r.recommendations?.student ?? []).join("; "),
        "AI Recommendations": (r.recommendations?.ai ?? []).join("; "),
        "Generated At": new Date(r.generatedAt).toLocaleString(),
      }));

      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Academic Reports");

      worksheet["!cols"] = [
        { wch: 22 }, { wch: 14 }, { wch: 12 }, { wch: 14 }, { wch: 10 },
        { wch: 16 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 10 },
        { wch: 16 }, { wch: 10 }, { wch: 14 }, { wch: 30 }, { wch: 30 },
        { wch: 40 }, { wch: 40 }, { wch: 40 }, { wch: 40 }, { wch: 22 },
      ];

      XLSX.writeFile(workbook, "student_academic_reports.xlsx");
      toast({ title: "Excel Exported", description: `${dataToExport.length} reports exported successfully.` });
    } catch (err) {
      console.error("Excel export failed:", err);
      toast({ title: "Export Failed", description: "An error occurred while exporting to Excel.", variant: "destructive" });
    } finally {
      setExcelLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 no-print">
        <div>
          <h1 className="text-2xl font-display font-bold text-gradient">ERP Academic Reports</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Generate, print or export A4 academic student reports</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchReports} className="p-2 glass-card rounded-lg border border-border/50 hover:border-primary/40 transition-colors">
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold glass-card rounded-lg border border-border/50 hover:border-primary/40 transition-colors"
          >
            <Download className="h-3.5 w-3.5" /> Export CSV
          </button>
          <button
            onClick={handleExportExcel}
            disabled={excelLoading}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold glass-card rounded-lg border border-border/50 hover:border-primary/40 transition-colors disabled:opacity-50"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            {excelLoading ? "Exporting..." : "Export Excel"}
          </button>
          {selected && (
            <>
              <button
                onClick={handleDownloadPDF}
                disabled={pdfLoading}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl text-white transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                style={{ background: "linear-gradient(135deg,#8b5cf6,#ec4899)" }}
              >
                <Download className="h-3.5 w-3.5" />
                {pdfLoading ? "Generating..." : "Download PDF"}
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl text-white transition-all hover:scale-105"
                style={{ background: "linear-gradient(135deg,#8b5cf6,#f43f5e)" }}
              >
                <Printer className="h-3.5 w-3.5" /> Print/Download PDF
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 no-print">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] glass-card rounded-xl border border-border/50 px-3 py-2">
          <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <input
            placeholder="Search student report..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="bg-transparent text-sm outline-none w-full text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Report View Panel */}
      {selected && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="report-content">
          <div ref={reportRef}>
            <Card className="glass-card border-primary/30 relative overflow-hidden bg-zinc-950 p-6 md:p-8 text-white">
              <div className="space-y-6">
                
                {/* College Logo / Header */}
                <div className="flex justify-between items-start border-b border-white/10 pb-6 flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    {/* College Logo Placeholder */}
                    <div className="h-14 w-14 rounded-full bg-white/5 border border-white/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-xl font-bold text-primary font-display">EDU</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold font-display tracking-wide uppercase text-white">EduGuard College of Engineering</h2>
                      <p className="text-xs text-muted-foreground">Affiliated to University of Data Sciences • Coimbatore</p>
                      <p className="text-[10px] text-muted-foreground font-mono mt-0.5">REPORT GENERATED BY COLLEGE ERP SYSTEM</p>
                    </div>
                  </div>
                  
                  {/* QR Code Placeholder */}
                  <div className="h-16 w-16 bg-white/5 border border-white/20 rounded-lg flex flex-col items-center justify-center text-center p-1.5">
                    <div className="grid grid-cols-3 gap-0.5 w-10 h-10 opacity-60">
                      {Array.from({ length: 9 }).map((_, i) => (
                        <div key={i} className={`bg-white rounded-sm ${(i % 2 === 0 || i === 0) ? "opacity-100" : "opacity-0"}`} />
                      ))}
                    </div>
                    <span className="text-[7px] text-muted-foreground mt-1 font-mono">VERIFIED</span>
                  </div>
                </div>

                {/* Student Profile Info */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center bg-white/2 p-4 rounded-xl border border-white/5">
                  {/* Student Photo Placeholder */}
                  <div className="h-28 w-28 mx-auto bg-white/5 border border-white/10 rounded-xl flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                    <div className="text-center space-y-1">
                      <span className="text-2xl font-bold text-muted-foreground">PHOTO</span>
                      <p className="text-[8px] text-muted-foreground">PLACEHOLDER</p>
                    </div>
                  </div>
                  <div className="md:col-span-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                    <div><span className="text-muted-foreground">Student Name:</span> <strong className="text-white font-medium">{selected.studentName}</strong></div>
                    <div><span className="text-muted-foreground">Register No:</span> <span className="font-mono">{selected.studentId}</span></div>
                    <div><span className="text-muted-foreground">Department:</span> <span>Computer Science with Data Analytics</span></div>
                    <div><span className="text-muted-foreground">Risk Category:</span> <strong className="text-red-400 font-semibold">{selected.riskCategory}</strong></div>
                    <div><span className="text-muted-foreground">Report Date:</span> <span>{new Date(selected.generatedAt).toLocaleDateString()}</span></div>
                    <div><span className="text-muted-foreground">Class Ranking:</span> <span>Class Rank #{selected.studentRanking}</span></div>
                  </div>
                </div>

                {/* Attendance & Marks Summaries */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white/2 p-4 rounded-xl border border-white/5 text-center space-y-1">
                    <p className="text-xs text-muted-foreground uppercase">Attendance Score</p>
                    <p className="text-2xl font-bold text-green-400">{selected.attendanceScore}%</p>
                    <p className="text-[10px] text-muted-foreground">Overall class participation</p>
                  </div>
                  <div className="bg-white/2 p-4 rounded-xl border border-white/5 text-center space-y-1">
                    <p className="text-xs text-muted-foreground uppercase">CIA Average</p>
                    <p className="text-2xl font-bold text-primary">{selected.marksScore.toFixed(1)}%</p>
                    <p className="text-[10px] text-muted-foreground">Internal assessment marks</p>
                  </div>
                  <div className="bg-white/2 p-4 rounded-xl border border-white/5 text-center space-y-1">
                    <p className="text-xs text-muted-foreground uppercase">Semester Score</p>
                    <p className="text-2xl font-bold text-orange-400">{selected.performanceScore.toFixed(1)}%</p>
                    <p className="text-[10px] text-muted-foreground">Current semester result</p>
                  </div>
                </div>

                {/* Subjects / Weak / Strong */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/2 p-4 rounded-xl border border-white/5 space-y-2">
                    <h4 className="text-xs font-semibold text-red-400 flex items-center gap-2">
                      <AlertTriangle className="h-3.5 w-3.5" /> Weak Subjects (Remedial Action)
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selected.weakSubjects.length === 0 ? (
                        <span className="text-xs text-muted-foreground">None</span>
                      ) : selected.weakSubjects.map((s) => (
                        <span key={s} className="bg-red-500/10 border border-red-500/20 text-red-300 text-[10px] px-2 py-0.5 rounded">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white/2 p-4 rounded-xl border border-white/5 space-y-2">
                    <h4 className="text-xs font-semibold text-green-400 flex items-center gap-2">
                      <Activity className="h-3.5 w-3.5" /> Strong Subjects (Advanced Learning)
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selected.strongSubjects.length === 0 ? (
                        <span className="text-xs text-muted-foreground">None</span>
                      ) : selected.strongSubjects.map((s) => (
                        <span key={s} className="bg-green-500/10 border border-green-500/20 text-green-300 text-[10px] px-2 py-0.5 rounded">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Teacher Remarks & Recommendations</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[
                      { title: "Teacher Remarks", list: selected.recommendations?.teacher, color: "#8b5cf6", icon: FileText },
                      { title: "Parent suggestions", list: selected.recommendations?.parent, color: "#f59e0b", icon: Brain },
                      { title: "Student guide", list: selected.recommendations?.student, color: "#10b981", icon: BookOpen },
                      { title: "AI Analytics recommendations", list: selected.recommendations?.ai, color: "#f43f5e", icon: Zap },
                    ].map((rec) => (
                      <div key={rec.title} className="bg-white/2 p-4 rounded-xl border border-white/5 space-y-2">
                        <p className="text-[11px] font-semibold flex items-center gap-1.5" style={{ color: rec.color }}>
                          <rec.icon className="h-3.5 w-3.5" />
                          {rec.title}
                        </p>
                        <div className="space-y-1">
                          {(rec.list ?? []).map((txt, i) => (
                            <p key={i} className="text-[10px] text-muted-foreground leading-relaxed">• {txt}</p>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center text-[10px] text-muted-foreground pt-6 border-t border-white/10 font-mono flex-wrap gap-2">
                  <span>SYSTEM ID: {selected._id}</span>
                  <span>EDU-GUARD PREDICTION SYSTEM</span>
                  <span>PAGE 1 OF 1</span>
                </div>

              </div>
            </Card>
          </div>
        </motion.div>
      )}

      {/* Reports Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 no-print">
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
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-xs text-white">{r.studentName}</p>
                  <p className="text-[10px] text-muted-foreground">Class Rank #{r.studentRanking}</p>
                </div>
                <RiskCategoryBadge category={r.riskCategory} size="sm" />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex justify-center gap-2 items-center no-print">
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
