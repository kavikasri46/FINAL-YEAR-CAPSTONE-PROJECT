import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { firebase, db } from "@/integrations/supabase/client";
import { collection, addDoc } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { getFunctions } from "firebase/functions";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";

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

interface ExcelRow {
  name?: string;
  Name?: string;
  email?: string;
  Email?: string;
  grade?: string;
  Grade?: string;
  gpa?: number | string;
  GPA?: number | string;
  attendance?: number | string;
  Attendance?: number | string;
  parent_phone?: string;
  ParentPhone?: string;
  parent_email?: string;
  ParentEmail?: string;
  assignments_completed?: number | string;
  AssignmentsCompleted?: number | string;
}

interface PredictionResult {
  name: string;
  risk_level: string;
  risk_score: number;
  factors: Record<string, string>;
  ai_analysis: string;
}

interface Alert {
  student_id: string;
  parent_phone?: string;
  parent_email?: string;
  alert_type: string;
  message: string;
  risk_level: string;
  sent_via: string;
}

const notifyMentors = async (alerts: Alert[]) => {
  // Mock mentor notification - in real app this would send emails/SMS
  console.log("Notifying mentors about high-risk students:", alerts);
};

export default function DataUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"upload" | "processing" | "results">("upload");
  const [parsedData, setParsedData] = useState<StudentData[]>([]);
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseExcelFile(selectedFile);
    }
  };

  const parseExcelFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows: ExcelRow[] = XLSX.utils.sheet_to_json(sheet);

      const parsed: StudentData[] = rows.map((row) => ({
        name: row.name || row.Name || "",
        email: row.email || row.Email || "",
        grade: row.grade || row.Grade || "",
        gpa: parseFloat(row.gpa || row.GPA || 0),
        attendance: parseFloat(row.attendance || row.Attendance || 0),
        parent_phone: row.parent_phone || row.ParentPhone || "",
        parent_email: row.parent_email || row.ParentEmail || "",
        assignments_completed: parseFloat(row.assignments_completed || row.AssignmentsCompleted || 0),
      }));

      setParsedData(parsed);
      toast({
        title: "File parsed successfully",
        description: `Found ${parsed.length} student records.`,
      });
    };
    reader.readAsArrayBuffer(file);
  };

  const runPrediction = async () => {
    setLoading(true);

    try {
      // NEW: Save uploaded students into database and capture their IDs
      const studentMap = new Map<string, { id: string; parent_phone?: string; parent_email?: string }>();

      try {
        const { data: savedStudents, error: saveStudentsError } = await supabase
          .from("students")
          .upsert(
            parsedData.map((s) => ({
              name: s.name,
              email: s.email,
              grade: s.grade,
              gpa: s.gpa,
              attendance: s.attendance,
              parent_phone: s.parent_phone,
              parent_email: s.parent_email,
            })),
            { onConflict: "email" }
          )
          .select("id,name,parent_phone,parent_email");

        if (saveStudentsError) {
          console.warn("Supabase students upsert failed", saveStudentsError);
        }

        if (savedStudents) {
          savedStudents.forEach((stu) => {
            if (stu.name && stu.id) {
              studentMap.set(stu.name, {
                id: stu.id,
                parent_phone: stu.parent_phone || "",
                parent_email: stu.parent_email || "",
              });
            }
          });
        }
      } catch (upsertErr) {
        console.warn("Supabase students upsert exception (likely network). Proceed in local mode.", upsertErr);
      }

      if (studentMap.size === 0) {
        // Fallback to local-generated IDs so predictions can continue when Supabase is unavailable.
        parsedData.forEach((s, index) => {
          studentMap.set(s.name, {
            id: `local-${index}-${Date.now()}`,
            parent_phone: s.parent_phone || "",
            parent_email: s.parent_email || "",
          });
        });
      }

      // Optional function call (do not block prediction). If not deployed, log warning and continue.
      if (file) {
        const fdata = new FormData();
        fdata.append("file", file);
        try {
          const functions = getFunctions(firebase.app);
          const processExcelAlerts = httpsCallable(functions, "processExcelAlerts");
          await processExcelAlerts({ file: fdata });
        } catch (fnErr) {
          console.warn("process-excel-alerts function failed (non-blocking)", fnErr);
        }
      }

      // Log upload (optional)
      try {
        await addDoc(collection(db, "data_uploads"), {
          filename: file?.name || "upload.xlsx",
          records_count: parsedData.length,
          uploaded_by: "admin",
          status: "processing",
        });
      } catch (logErr) {
        console.warn("data_uploads insert failed (non-blocking)", logErr);
      }

      // Prediction logic
      const results: PredictionResult[] = parsedData.map((student) => {
        let riskScore = 0;
        let riskLevel = "low";
        const factors: Record<string, string> = {};

        if (student.gpa < 2.0) {
          riskScore += 40;
          factors.gpa = "Low GPA";
        } else if (student.gpa < 3.0) {
          riskScore += 20;
          factors.gpa = "Average GPA";
        }

        if (student.attendance < 70) {
          riskScore += 40;
          factors.attendance = "Low attendance";
        } else if (student.attendance < 85) {
          riskScore += 20;
          factors.attendance = "Moderate attendance";
        }

        if (student.assignments_completed && student.assignments_completed < 50) {
          riskScore += 20;
          factors.assignments = "Low assignment completion";
        }

        if (riskScore >= 60) {
          riskLevel = "high";
        } else if (riskScore >= 30) {
          riskLevel = "medium";
        }

        return {
          name: student.name,
          risk_level: riskLevel,
          risk_score: riskScore,
          factors,
          ai_analysis: `Student shows ${riskLevel} risk based on academic performance.`,
        };
      });

      const alerts = results
        .filter((r) => r.risk_level === "high" || r.risk_level === "medium")
        .map((r) => {
          const student = studentMap.get(r.name);
          const alertMsg = `Your child ${r.name} scored ${r.risk_score}. Risk Level: ${r.risk_level}. Please take necessary action.`;
          const smsMsg = `Alert: ${r.name} scored ${r.risk_score}. Risk Level: ${r.risk_level}. Check dashboard.`;

          // Keep student_id optional: if no student row is found, leave null and still insert alert
          return {
            student_id: student?.id || null,
            parent_phone: student?.parent_phone || parsedData.find((s) => s.name === r.name)?.parent_phone || null,
            parent_email: student?.parent_email || parsedData.find((s) => s.name === r.name)?.parent_email || null,
            alert_type: "risk_alert",
            message: alertMsg,
            risk_level: r.risk_level,
            sent_via: "dashboard",
            student_name: r.name,
            parent_alert_message: alertMsg,
            sms_message: smsMsg,
          };
        });

      setPredictions(results);
      setAlerts(alerts);
      setStep("results");

      // Insert parent alerts
      if (alerts.length > 0) {
        try {
          const batch = alerts.map((alert) =>
            addDoc(collection(db, "parent_alerts"), {
              student_id: alert.student_id,
              parent_phone: alert.parent_phone,
              parent_email: alert.parent_email,
              alert_type: alert.alert_type,
              message: alert.message,
              risk_level: alert.risk_level,
              sent_via: alert.sent_via,
              is_read: false,
            })
          );
          await Promise.all(batch);
        } catch (alertErr) {
          console.warn("Failed to insert parent_alerts (non-blocking)", alertErr);
        }

        // NEW: Notify mentors
        await notifyMentors(alerts);
      }

      // Update upload status (optional)
      try {
        await supabase
          .from("data_uploads")
          .update({ status: "completed" })
          .eq("filename", file?.name || "upload.xlsx");
      } catch (updateErr) {
        console.warn("data_uploads update failed (non-blocking)", updateErr);
      }

      toast({
        title: "Prediction Complete",
        description: `Analyzed ${results.length} students. ${alerts.length} parent alerts generated.`,
      });

    } catch (err: unknown) {
      console.error(err);
      toast({
        title: "Prediction failed",
        description: err instanceof Error ? err.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (step === "results") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold">Analysis Results</h1>
            <p className="text-muted-foreground text-sm">AI-powered dropout risk assessment</p>
          </div>
          <Button onClick={() => setStep("upload")} variant="outline">
            Upload New Data
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Predictions Generated
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{predictions.length}</div>
              <p className="text-sm text-muted-foreground">Students analyzed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                Alerts Generated
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{alerts.length}</div>
              <p className="text-sm text-muted-foreground">Parent notifications sent</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Risk Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {predictions.slice(0, 10).map((pred, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="font-medium">{pred.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Risk Score: {pred.risk_score}/100
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    pred.risk_level === "high" ? "bg-red-100 text-red-800" :
                    pred.risk_level === "medium" ? "bg-yellow-100 text-yellow-800" :
                    "bg-green-100 text-green-800"
                  }`}>
                    {pred.risk_level.toUpperCase()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Data Upload</h1>
        <p className="text-muted-foreground text-sm">Upload student data for AI-powered risk analysis</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Student Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="file-upload">Excel File (.xlsx)</Label>
            <Input
              id="file-upload"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="mt-1"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Upload an Excel file with columns: name, email, grade, gpa, attendance, parent_phone, parent_email
            </p>
          </div>

          {file && (
            <div className="flex items-center gap-2 p-3 bg-muted rounded">
              <FileText className="h-4 w-4" />
              <span className="text-sm">{file.name}</span>
              <span className="text-xs text-muted-foreground">({parsedData.length} records)</span>
            </div>
          )}

          {parsedData.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Data Preview</span>
                <Button
                  onClick={runPrediction}
                  disabled={loading}
                  className="gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Run Analysis
                    </>
                  )}
                </Button>
              </div>

              {loading && (
                <div className="space-y-2">
                  <Progress value={66} />
                  <p className="text-sm text-muted-foreground">Running AI analysis...</p>
                </div>
              )}

              <div className="border rounded p-4 max-h-60 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Name</th>
                      <th className="text-left p-2">Grade</th>
                      <th className="text-left p-2">GPA</th>
                      <th className="text-left p-2">Attendance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedData.slice(0, 5).map((student, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2">{student.name}</td>
                        <td className="p-2">{student.grade}</td>
                        <td className="p-2">{student.gpa}</td>
                        <td className="p-2">{student.attendance}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {parsedData.length > 5 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    ... and {parsedData.length - 5} more records
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}