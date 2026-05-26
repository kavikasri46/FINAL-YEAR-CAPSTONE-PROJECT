import { useState } from "react";
import Papa from "papaparse";
import { firebase, db } from "@/integrations/supabase/client";
import { collection, addDoc, setDoc, doc } from "firebase/firestore";

interface Student {
  student_id: string;
  name: string;
  risk_score: number;
}

const DatasetUpload: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setUploadStatus({ type: null, message: "" });

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const students = results.data as Student[];

          const batchSize = 100;

          for (let i = 0; i < students.length; i += batchSize) {
            const batch = students.slice(i, i + batchSize);

            // Use Promise.all to handle batch operations
            const batchPromises = batch.map(async (student) => {
              const studentRef = doc(db, "students", student.student_id);
              await setDoc(studentRef, student, { merge: true });
            });

            await Promise.all(batchPromises);
          }

          setUploadStatus({
            type: "success",
            message: `Successfully uploaded ${students.length} students!`,
          });
        } catch (error) {
          console.error("Upload error:", error);
          setUploadStatus({
            type: "error",
            message: "Failed to upload dataset. Please try again.",
          });
        } finally {
          setLoading(false);
          event.target.value = "";
        }
      },
      error: (error) => {
        console.error("CSV parsing error:", error);
        setUploadStatus({
          type: "error",
          message: "Failed to parse CSV file. Please check the format.",
        });
        setLoading(false);
      },
    });
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-lg font-bold mb-3">Upload Student Dataset</h2>

      <input
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        disabled={loading}
        className="mb-3 block w-full text-sm text-gray-500
        file:mr-4 file:py-2 file:px-4
        file:rounded-md file:border-0
        file:text-sm file:font-semibold
        file:bg-blue-50 file:text-blue-700
        hover:file:bg-blue-100"
      />

      {loading && (
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <p className="text-blue-600">Processing dataset...</p>
        </div>
      )}

      {uploadStatus.type === "success" && (
        <p className="text-green-600 mt-2">{uploadStatus.message}</p>
      )}

      {uploadStatus.type === "error" && (
        <p className="text-red-600 mt-2">{uploadStatus.message}</p>
      )}
    </div>
  );
};

export default DatasetUpload;