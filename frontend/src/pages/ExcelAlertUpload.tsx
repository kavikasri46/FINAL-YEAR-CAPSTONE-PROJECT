import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";
import { api } from "@/services/api";

export default function ExcelAlertUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setStatus("idle");
      setMessage("");
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setStatus("uploading");

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<any[]>(sheet);

      const students = rows.map((row: any) => ({
        name: row.student_name || row.name || "",
        email: row.email || "",
        grade: row.grade || "",
        gpa: parseFloat(row.gpa || row.marks || 0),
        attendance: parseFloat(row.attendance || 0),
        parent_phone: row.parent_mobile || row.parent_phone || "",
        parent_email: row.parent_email || "",
      }));

      const result = await api.bulkUploadStudents(students);
      setStatus("success");
      setMessage(`Excel processed successfully. ${result.count} student records uploaded.`);
      toast({ title: "Success", description: "Student data uploaded to database." });
    } catch (error) {
      console.error("Upload error:", error);
      setStatus("error");
      setMessage("Failed to process the Excel file.");
      toast({ title: "Error", description: "Failed to process the file.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Upload className="h-5 w-5" /> Excel Upload</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="file-upload">Select Excel File (.xlsx)</Label>
            <Input id="file-upload" type="file" accept=".xlsx,.xls,.csv" onChange={handleFileChange} className="mt-1" />
            <p className="text-sm text-muted-foreground mt-1">Supported columns: student_name, email, gpa, attendance, parent_phone</p>
          </div>
          {file && <div className="flex items-center gap-2 p-3 bg-muted rounded-lg"><FileText className="h-4 w-4" /><span className="text-sm">{file.name}</span></div>}
          <Button onClick={handleUpload} disabled={!file || loading} className="w-full">
            {loading ? "Processing..." : "Upload and Process"}
          </Button>
          {status !== "idle" && (
            <div className={`flex items-center gap-2 p-3 rounded-lg ${status === "success" ? "bg-green-50 text-green-700" : status === "error" ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700"}`}>
              {status === "success" && <CheckCircle className="h-4 w-4" />}
              {status === "error" && <AlertCircle className="h-4 w-4" />}
              {status === "uploading" && <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
              <span className="text-sm">{message}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
