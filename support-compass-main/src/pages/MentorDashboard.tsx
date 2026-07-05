import { Users, AlertTriangle, Calendar, TrendingUp, Upload, Download } from "lucide-react";
import { StatsCard } from "@/components/StatsCard";
import { StudentTable } from "@/components/StudentTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Papa from 'papaparse';
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/services/api";

interface Student {
  id: string;
  student_id: string;
  name: string;
  risk_score: number;
  gpa?: number;
  attendance?: number;
  email?: string;
  grade?: string;
  created_at?: string;
}

export default function MentorDashboard() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    highRisk: 0,
    sessionsThisWeek: 5,
    avgGpa: 2.8
  });
  
  const { toast } = useToast();

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const data = await api.getStudents();
      setStudents(data);
      const highRiskCount = data.filter((s: any) => s.risk_score >= 75).length;
      const avgGpa = data.reduce((acc: number, s: any) => acc + (s.gpa || 0), 0) / (data.length || 1);
      setStats({
        total: data.length,
        highRisk: highRiskCount,
        sessionsThisWeek: 5,
        avgGpa: Number(avgGpa.toFixed(1)) || 2.8,
      });
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStudents(); }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadLoading(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const students = results.data as Student[];
          const validStudents = students.filter(s => s.student_id && s.name);
          if (validStudents.length === 0) throw new Error('No valid student data found');

          await api.bulkUploadStudents(validStudents);

          toast({ title: "Success!", description: `Imported ${validStudents.length} students` });
          fetchStudents();
        } catch (error: unknown) {
          toast({ title: "Upload Failed", description: error instanceof Error ? error.message : 'Failed to import', variant: "destructive" });
        } finally {
          setUploadLoading(false);
          event.target.value = '';
        }
      },
      error: () => {
        toast({ title: "Parse Error", description: 'Failed to parse CSV file.', variant: "destructive" });
        setUploadLoading(false);
      }
    });
  };

  const downloadTemplate = () => {
    const headers = ['student_id', 'name', 'risk_score', 'gpa', 'attendance', 'email', 'grade'];
    const sampleData = [
      ['STU001', 'Arjun Patel', '85', '2.1', '95', 'arjun@example.com', '12th'],
      ['STU002', 'Vikram Singh', '92', '1.8', '45', 'vikram@example.com', '11th'],
      ['STU003', 'Rahul Kumar', '45', '3.2', '88', 'rahul@example.com', '10th'],
    ];
    const csvContent = [headers.join(','), ...sampleData.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    toast({ title: "Template Downloaded", description: "CSV template has been downloaded" });
  };

  const getRecommendations = () => {
    const recommendations: { student: string; action: string; priority: string }[] = [];
    students.filter(s => s.risk_score >= 75).slice(0, 2).forEach(student => {
      recommendations.push({ student: student.name, action: `Schedule urgent counseling session. Risk score: ${student.risk_score}`, priority: "high" });
    });
    students.filter(s => s.attendance && s.attendance < 60).slice(0, 1).forEach(student => {
      recommendations.push({ student: student.name, action: "Contact parent about attendance. Below 60% threshold.", priority: "high" });
    });
    if (recommendations.length < 3) {
      recommendations.push({ student: "General", action: "Assign study groups for Math and Science support.", priority: "medium" });
    }
    return recommendations.slice(0, 3);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-display font-bold">Mentor Dashboard</h1>
          <p className="text-muted-foreground text-sm">Manage your assigned students and sessions</p>
        </div>
        <div className="flex gap-2">
          <button onClick={downloadTemplate} className="flex items-center gap-2 px-3 py-2 text-sm bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors">
            <Download className="h-4 w-4" /> Template
          </button>
          <div className="relative">
            <input type="file" accept=".csv" onChange={handleFileUpload} disabled={uploadLoading} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" id="csv-upload" />
            <label htmlFor="csv-upload" className={`flex items-center gap-2 px-3 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors cursor-pointer ${uploadLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <Upload className="h-4 w-4" /> {uploadLoading ? 'Uploading...' : 'Import CSV'}
            </label>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Assigned Students" value={stats.total.toString()} icon={Users} variant="primary" />
        <StatsCard title="High Risk Students" value={stats.highRisk.toString()} icon={AlertTriangle} variant="danger" />
        <StatsCard title="Sessions This Week" value={stats.sessionsThisWeek.toString()} icon={Calendar} variant="success" />
        <StatsCard title="Avg Student GPA" value={stats.avgGpa.toString()} icon={TrendingUp} trend={{ value: 2, positive: false }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <h3 className="font-display font-semibold text-sm mb-3">My Students</h3>
          {loading ? (
            <div className="flex justify-center items-center p-8 bg-card rounded-lg border">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <StudentTable students={students.slice(0, 5)} />
          )}
        </div>
        <Card className="glass-card border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Recommendations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {getRecommendations().map((rec, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                className={`p-3 rounded-lg border text-sm ${rec.priority === "high" ? "bg-destructive/5 border-destructive/20" : "bg-warning/5 border-warning/20"}`}>
                <p className="font-medium text-xs">{rec.student}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{rec.action}</p>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
