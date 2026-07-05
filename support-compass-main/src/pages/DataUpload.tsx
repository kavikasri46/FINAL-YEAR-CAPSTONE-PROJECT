import { useState, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, CheckCircle, TableIcon, Download, Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import collegeLogo from "@/images/kpr logo.jpg";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface StudentData {
  name: string;
  email: string;
  grade: string;
  gpa: number;
  attendance: number;
  parent_phone?: string;
  parent_email?: string;
  assignments_completed?: number;
}

interface PredictionResult {
  name: string;
  risk_level: string;
  risk_score: number;
  factors: Record<string, string>;
  gpa: number;
  attendance: number;
}

const PIE_COLORS: Record<string, string> = {
  "Very High": "#7c3aed",
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#3b82f6",
  safe: "#22c55e",
};

const today = new Date().toLocaleDateString("en-IN", {
  day: "numeric", month: "long", year: "numeric",
});

export default function DataUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [step, setStep] = useState<"upload" | "results">("upload");
  const [parsedData, setParsedData] = useState<StudentData[]>([]);
  const [rawRows, setRawRows] = useState<Record<string, unknown>[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);
  const reportRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const mapToStudentData = (rows: Record<string, unknown>[]): StudentData[] => {
    return rows.map((row) => ({
      name: String(row.name || row.Name || ""),
      email: String(row.email || row.Email || ""),
      grade: String(row.grade || row.Grade || ""),
      gpa: parseFloat(String(row.gpa || row.GPA || "0")),
      attendance: parseFloat(String(row.attendance || row.Attendance || "0")),
      parent_phone: String(row.parent_phone || row.ParentPhone || ""),
      parent_email: String(row.parent_email || row.ParentEmail || ""),
      assignments_completed: parseFloat(String(row.assignments_completed || row.AssignmentsCompleted || "0")),
    }));
  };

  const detectColumns = (rows: Record<string, unknown>[]): string[] => {
    if (rows.length === 0) return [];
    return Object.keys(rows[0]);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (selectedFile.name.endsWith(".csv")) {
        parseCsvFile(selectedFile);
      } else {
        parseExcelFile(selectedFile);
      }
    }
  };

  const parseCsvFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const rows = results.data as Record<string, unknown>[];
          setColumns(detectColumns(rows));
          setRawRows(rows);
          setParsedData(mapToStudentData(rows));
          toast({ title: "File parsed successfully", description: `Found ${rows.length} records.` });
        },
        error: () => toast({ title: "Parse error", description: "Failed to parse CSV file.", variant: "destructive" }),
      });
    };
    reader.readAsText(file);
  };

  const parseExcelFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);
      setColumns(detectColumns(rows));
      setRawRows(rows);
      setParsedData(mapToStudentData(rows));
      toast({ title: "File parsed successfully", description: `Found ${rows.length} records.` });
    };
    reader.readAsArrayBuffer(file);
  };

  const hasStudentColumns = (): boolean => {
    const lowerCols = columns.map((c) => c.toLowerCase());
    return lowerCols.includes("name") || lowerCols.includes("gpa") || lowerCols.includes("attendance");
  };

  const runPrediction = () => {
    const results: PredictionResult[] = parsedData.map((student) => {
      let cgpaPoints = 0;
      let attPoints = 0;
      const factors: Record<string, string> = {};

      if (student.gpa <= 5) { cgpaPoints = 60; factors.cgpa = "CGPA ≤ 5.0 — High Risk"; }
      else if (student.gpa <= 6) { cgpaPoints = 40; factors.cgpa = "CGPA ≤ 6.0 — Medium Risk"; }
      else if (student.gpa < 7) { cgpaPoints = 20; factors.cgpa = "CGPA < 7.0 — Low Risk"; }
      else factors.cgpa = "CGPA ≥ 7.0 — Safe";

      if (student.attendance >= 85) { attPoints = 0; factors.attendance = "Attendance ≥ 85% — Safe"; }
      else if (student.attendance >= 80) { attPoints = 20; factors.attendance = "Attendance < 85% — Low Risk"; }
      else if (student.attendance >= 75) { attPoints = 40; factors.attendance = "Attendance < 80% — Medium Risk"; }
      else { attPoints = 80; factors.attendance = "Attendance < 75% — Cannot write exam"; }

      const totalScore = Math.min(cgpaPoints + attPoints, 100);
      let riskLevel: string;

      if (student.attendance < 75) riskLevel = "Very High";
      else if (totalScore >= 80) riskLevel = "high";
      else if (totalScore >= 40) riskLevel = "medium";
      else if (totalScore >= 20) riskLevel = "low";
      else riskLevel = "safe";

      return {
        name: student.name,
        risk_level: riskLevel,
        risk_score: totalScore,
        factors,
        gpa: student.gpa,
        attendance: student.attendance,
      };
    });

    setPredictions(results);
    setStep("results");
    toast({ title: "Analysis Complete", description: `Analyzed ${results.length} students.` });
  };

  const riskDistribution = useMemo(() => {
    if (predictions.length === 0) return [];
    const counts: Record<string, number> = { "Very High": 0, high: 0, medium: 0, low: 0, safe: 0 };
    predictions.forEach((p) => {
      if (counts[p.risk_level] !== undefined) counts[p.risk_level]++;
    });
    return Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({
        name: name === "Very High" ? "Very High" : name.charAt(0).toUpperCase() + name.slice(1),
        value,
        color: PIE_COLORS[name],
      }));
  }, [predictions]);

  const topRisk = useMemo(() => {
    return [...predictions].sort((a, b) => b.risk_score - a.risk_score).slice(0, 10);
  }, [predictions]);

  const riskBadge = (level: string) => {
    const styles: Record<string, string> = {
      "Very High": "bg-purple-100 text-purple-800",
      high: "bg-red-100 text-red-800",
      medium: "bg-yellow-100 text-yellow-800",
      low: "bg-blue-100 text-blue-800",
      safe: "bg-green-100 text-green-800",
    };
    return styles[level] || "bg-gray-100 text-gray-800";
  };

  const handleDownload = async () => {
    const element = reportRef.current;
    if (!element) return;
    toast({ title: "Generating PDF...", description: "Please wait while we generate your report." });
    try {
      element.setAttribute("data-pdf", "true");
      const pdfScale = predictions.length > 50 ? 3 : 4;
      const canvas = await html2canvas(element, {
        scale: pdfScale,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });
      element.removeAttribute("data-pdf");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const usableW = pdfW - margin * 2;
      const usableH = pdfH - margin * 2;
      const cW = canvas.width;
      const cH = canvas.height;
      const ratio = usableW / cW;
      const pageH = usableH / ratio;
      const totalPages = Math.ceil(cH / pageH);
      for (let i = 0; i < totalPages; i++) {
        if (i > 0) pdf.addPage();
        const srcY = i * pageH;
        const srcH = Math.min(pageH, cH - srcY);
        const pageCanvas = document.createElement("canvas");
        pageCanvas.width = cW;
        pageCanvas.height = srcH;
        const ctx = pageCanvas.getContext("2d");
        if (!ctx) continue;
        ctx.drawImage(canvas, 0, srcY, cW, srcH, 0, 0, cW, srcH);
        const pageImg = pageCanvas.toDataURL("image/jpeg", 0.95);
        pdf.addImage(pageImg, "PNG", margin, margin, usableW, srcH * ratio);
      }
      pdf.save("KPR_College_Dropout_Prediction_Report.pdf");
      toast({ title: "Download complete", description: "PDF report has been downloaded." });
    } catch {
      toast({ title: "PDF generation failed", description: "Try using Print instead.", variant: "destructive" });
    }
  };

  const avgGPA = predictions.length > 0
    ? (predictions.reduce((s, p) => s + p.gpa, 0) / predictions.length).toFixed(2)
    : "0";
  const avgAtt = predictions.length > 0
    ? (predictions.reduce((s, p) => s + p.attendance, 0) / predictions.length).toFixed(1)
    : "0";

  const veryHighCount = predictions.filter((p) => p.risk_level === "Very High").length;
  const highCount = predictions.filter((p) => p.risk_level === "high").length;
  const mediumCount = predictions.filter((p) => p.risk_level === "medium").length;
  const lowCount = predictions.filter((p) => p.risk_level === "low").length;
  const safeCount = predictions.filter((p) => p.risk_level === "safe").length;

  if (step === "results") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between no-print">
          <div>
            <h1 className="text-2xl font-display font-bold">Analysis Results</h1>
            <p className="text-muted-foreground text-sm">CGPA & Attendance based risk assessment</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleDownload} variant="outline" className="gap-2">
              <Download className="h-4 w-4" /> Download Report
            </Button>
            <Button onClick={() => setStep("upload")} variant="outline">Upload New Data</Button>
          </div>
        </div>

        <div ref={reportRef} className="report-content space-y-6">
          <div className="text-center border-b border-primary/20 pb-5 mb-4 report-header">
            <div className="flex items-center justify-center gap-5 mb-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-full blur-md" />
                <img src={collegeLogo} alt="KPR College Logo" className="w-20 h-20 rounded-full object-cover ring-2 ring-purple-400/50 relative" />
              </div>
              <div className="text-left">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300 bg-clip-text text-transparent drop-shadow-glow">
                  KPR College of Arts<br />Science and Research
                </h2>
                <p className="text-sm text-purple-300/80 mt-1">Arasur, Coimbatore, Tamil Nadu</p>
              </div>
            </div>
            <div className="inline-block px-6 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30">
              <h3 className="text-lg font-semibold text-white">Student Dropout Prediction Report</h3>
            </div>
            <p className="text-sm text-purple-300/70 mt-3">Academic Year: 2026-2027 | Generated On: {today}</p>
          </div>

          <div className="grid gap-3 text-sm border rounded p-3 bg-muted/20">
            <div className="grid grid-cols-2 gap-x-8 gap-y-1">
              <span><strong>College Name:</strong> KPR College of Arts Science and Research</span>
              <span><strong>Address:</strong> Arasur, Coimbatore, Tamil Nadu</span>
              <span><strong>Report Generated By:</strong> AI Student Dropout Prediction System</span>
              <span><strong>Total Students:</strong> {predictions.length}</span>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Prediction Summary</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              <Card className="border-l-4 border-l-green-500">
                <CardHeader className="pb-1"><CardTitle className="text-xs text-muted-foreground">Total Students</CardTitle></CardHeader>
                <CardContent><div className="text-2xl font-bold">{predictions.length}</div></CardContent>
              </Card>
              <Card className="border-l-4 border-l-green-500">
                <CardHeader className="pb-1"><CardTitle className="text-xs text-muted-foreground">Safe</CardTitle></CardHeader>
                <CardContent><div className="text-2xl font-bold text-green-600">{safeCount}</div></CardContent>
              </Card>
              <Card className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-1"><CardTitle className="text-xs text-muted-foreground">Low Risk</CardTitle></CardHeader>
                <CardContent><div className="text-2xl font-bold text-blue-600">{lowCount}</div></CardContent>
              </Card>
              <Card className="border-l-4 border-l-yellow-500">
                <CardHeader className="pb-1"><CardTitle className="text-xs text-muted-foreground">Medium Risk</CardTitle></CardHeader>
                <CardContent><div className="text-2xl font-bold text-yellow-600">{mediumCount}</div></CardContent>
              </Card>
              <Card className="border-l-4 border-l-red-500">
                <CardHeader className="pb-1"><CardTitle className="text-xs text-muted-foreground">High Risk</CardTitle></CardHeader>
                <CardContent><div className="text-2xl font-bold text-red-600">{highCount}</div></CardContent>
              </Card>
              <Card className="border-l-4 border-l-purple-500">
                <CardHeader className="pb-1"><CardTitle className="text-xs text-muted-foreground">Very High</CardTitle></CardHeader>
                <CardContent><div className="text-2xl font-bold text-purple-600">{veryHighCount}</div></CardContent>
              </Card>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <Card>
                <CardHeader className="pb-1"><CardTitle className="text-xs text-muted-foreground">Average GPA</CardTitle></CardHeader>
                <CardContent><div className="text-2xl font-bold">{avgGPA}</div></CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-1"><CardTitle className="text-xs text-muted-foreground">Average Attendance</CardTitle></CardHeader>
                <CardContent><div className="text-2xl font-bold">{avgAtt}%</div></CardContent>
              </Card>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>Risk Distribution</CardTitle></CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={riskDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`}>
                      {riskDistribution.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Top 10 Risk Scores</CardTitle></CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topRisk} layout="vertical" margin={{ left: 100 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={90} />
                    <Tooltip formatter={(value: number) => [`${value}/100`, "Risk Score"]} />
                    <Bar dataKey="risk_score" radius={[0, 4, 4, 0]}>
                      {topRisk.map((entry, i) => {
                        const color =
                          entry.risk_level === "Very High" ? "#7c3aed" :
                          entry.risk_level === "high" ? "#ef4444" :
                          entry.risk_level === "medium" ? "#f59e0b" :
                          entry.risk_level === "low" ? "#3b82f6" : "#22c55e";
                        return <Cell key={i} fill={color} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {highCount + veryHighCount > 0 && (
            <Card className="border-2 border-red-500">
              <CardHeader>
                <CardTitle className="text-red-700">High Risk Students</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr className="border-b">
                        <th className="text-left p-2">Student Name</th>
                        <th className="text-left p-2">GPA</th>
                        <th className="text-left p-2">Attendance</th>
                        <th className="text-left p-2">Risk</th>
                        <th className="text-left p-2">Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {predictions.filter(p => p.risk_level === "high" || p.risk_level === "Very High").map((pred, i) => (
                        <tr key={i} className="border-b hover:bg-muted/30">
                          <td className="p-2 font-medium">{pred.name}</td>
                          <td className="p-2">{pred.gpa}</td>
                          <td className="p-2">{pred.attendance}%</td>
                          <td className="p-2">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${riskBadge(pred.risk_level)}`}>
                              {pred.risk_level === "Very High" ? "VERY HIGH" : "HIGH"}
                            </span>
                          </td>
                          <td className="p-2 text-xs text-muted-foreground">
                            {Object.values(pred.factors).join("; ")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {mediumCount > 0 && (
            <Card className="border-2 border-yellow-500">
              <CardHeader>
                <CardTitle className="text-yellow-700">Medium Risk Students</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr className="border-b">
                        <th className="text-left p-2">Student Name</th>
                        <th className="text-left p-2">GPA</th>
                        <th className="text-left p-2">Attendance</th>
                        <th className="text-left p-2">Risk</th>
                      </tr>
                    </thead>
                    <tbody>
                      {predictions.filter(p => p.risk_level === "medium").map((pred, i) => (
                        <tr key={i} className="border-b hover:bg-muted/30">
                          <td className="p-2 font-medium">{pred.name}</td>
                          <td className="p-2">{pred.gpa}</td>
                          <td className="p-2">{pred.attendance}%</td>
                          <td className="p-2">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${riskBadge(pred.risk_level)}`}>
                              MEDIUM
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {lowCount + safeCount > 0 && (
            <Card className="border-2 border-green-500">
              <CardHeader>
                <CardTitle className="text-green-700">Low Risk Students</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr className="border-b">
                        <th className="text-left p-2">Student Name</th>
                        <th className="text-left p-2">GPA</th>
                        <th className="text-left p-2">Attendance</th>
                        <th className="text-left p-2">Risk</th>
                      </tr>
                    </thead>
                    <tbody>
                      {predictions.filter(p => p.risk_level === "low" || p.risk_level === "safe").map((pred, i) => (
                        <tr key={i} className="border-b hover:bg-muted/30">
                          <td className="p-2 font-medium">{pred.name}</td>
                          <td className="p-2">{pred.gpa}</td>
                          <td className="p-2">{pred.attendance}%</td>
                          <td className="p-2">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${riskBadge(pred.risk_level)}`}>
                              {pred.risk_level === "safe" ? "SAFE" : "LOW"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader><CardTitle>AI Recommendations</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <h5 className="font-semibold text-red-600">High Risk & Very High Risk Students</h5>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-1">
                  <li>Arrange one-to-one faculty mentoring sessions.</li>
                  <li>Inform parents about academic performance and attendance.</li>
                  <li>Provide remedial coaching and additional study materials.</li>
                  <li>Monitor attendance weekly and intervene early.</li>
                  <li>Offer counseling support for personal and academic challenges.</li>
                </ul>
              </div>
              <div>
                <h5 className="font-semibold text-yellow-600">Medium Risk Students</h5>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-1">
                  <li>Encourage improvement in attendance and academic engagement.</li>
                  <li>Conduct monthly progress reviews with mentors.</li>
                  <li>Promote participation in academic support groups.</li>
                </ul>
              </div>
              <div>
                <h5 className="font-semibold text-green-600">Low Risk & Safe Students</h5>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-1">
                  <li>Continue current performance and maintain good habits.</li>
                  <li>Encourage leadership roles and peer mentoring programs.</li>
                  <li>Recognize and reward consistent academic achievement.</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <div className="text-center text-xs text-muted-foreground border-t pt-4 no-print">
            <p>AI Powered Student Dropout Prediction System | KPR College of Arts Science and Research</p>
            <p>Generated using Machine Learning | Report Date: {today}</p>
          </div>
        </div>

        <div className="flex justify-center gap-4 no-print">
          <Button onClick={handleDownload} className="gap-2" size="lg">
            <Download className="h-5 w-5" /> Download Report (PDF)
          </Button>
          <Button onClick={() => window.print()} variant="outline" size="lg" className="gap-2">
            <Printer className="h-5 w-5" /> Print Report
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Data Upload</h1>
        <p className="text-muted-foreground text-sm">Upload student data for CGPA & Attendance based risk assessment</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Upload className="h-5 w-5" /> Upload Student Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="file-upload">Student Data File (.xlsx, .csv)</Label>
            <Input id="file-upload" type="file" accept=".xlsx,.xls,.csv" onChange={handleFileUpload} className="mt-1" />
            <p className="text-sm text-muted-foreground mt-1">
              Upload with columns: name, email, grade, gpa (CGPA), attendance
            </p>
          </div>

          {file && (
            <div className="flex items-center gap-2 p-3 bg-muted rounded">
              <FileText className="h-4 w-4" />
              <span className="text-sm">{file.name}</span>
              <span className="text-xs text-muted-foreground">({rawRows.length} records)</span>
            </div>
          )}

          {rawRows.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center gap-2">
                  <TableIcon className="h-4 w-4" />
                  Data Preview ({rawRows.length} rows, {columns.length} columns)
                </span>
                {hasStudentColumns() && (
                  <Button onClick={runPrediction} className="gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Run Analysis
                  </Button>
                )}
              </div>

              {!hasStudentColumns() && (
                <div className="text-sm text-muted-foreground bg-muted p-3 rounded">
                  Showing raw data preview. Expected columns (name, gpa, attendance) not detected.
                </div>
              )}

              <div className="border rounded overflow-x-auto max-h-96">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 sticky top-0">
                    <tr className="border-b">
                      {columns.map((col) => (
                        <th key={col} className="text-left p-2 whitespace-nowrap font-medium">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rawRows.map((row, rowIndex) => (
                      <tr key={rowIndex} className="border-b hover:bg-muted/30">
                        {columns.map((col) => (
                          <td key={col} className="p-2 whitespace-nowrap">{String(row[col] ?? "")}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
