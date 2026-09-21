import { useState } from "react";
import Papa from "papaparse";
import { Upload } from "lucide-react";
import { api } from "@/services/api";

export default function DatasetUpload() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setMessage("");
    setError("");

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const students = results.data as any[];
          const count = await api.bulkUploadStudents(students);
          setMessage(`Successfully uploaded ${count.count} students.`);
        } catch (err: any) {
          setError(err.message || "Upload failed");
        } finally {
          setLoading(false);
        }
      },
      error: () => {
        setError("Failed to parse CSV file.");
        setLoading(false);
      },
    });
  };

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold mb-4">Upload Student Dataset (CSV)</h2>
      <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
        <input type="file" accept=".csv" onChange={handleFileUpload} disabled={loading} className="hidden" id="csv-input" />
        <label htmlFor="csv-input" className="cursor-pointer flex flex-col items-center gap-2">
          <Upload className="h-8 w-8 text-muted-foreground" />
          <span className="text-sm font-medium">{loading ? "Uploading..." : "Click to upload CSV"}</span>
          <span className="text-xs text-muted-foreground">Columns: student_id, name, risk_score</span>
        </label>
      </div>
      {message && <p className="mt-3 text-sm text-green-600">{message}</p>}
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </div>
  );
}
