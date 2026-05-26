import { Users, AlertTriangle, Calendar, TrendingUp, Upload, Download } from "lucide-react";
import { StatsCard } from "@/components/StatsCard";
import { StudentTable } from "@/components/StudentTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useEffect, useState, useCallback } from "react";
import { firebase, db } from "@/integrations/supabase/client";
import { collection, onSnapshot, query, orderBy, getDocs } from "firebase/firestore";
import Papa from 'papaparse';
import { useToast } from "@/components/ui/use-toast";

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

  // Fetch students from Firestore
  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "students"), orderBy("risk_score", "desc"));
      const querySnapshot = await getDocs(q);
      const studentsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Student[];

      setStudents(studentsData);

      // Update stats based on real data
      const highRiskCount = studentsData.filter(s => s.risk_score >= 75).length;
      const avgGpa = studentsData.reduce((acc, s) => acc + (s.gpa || 0), 0) / (studentsData.length || 1);

      setStats({
        total: studentsData.length,
        highRisk: highRiskCount,
        sessionsThisWeek: 5, // This could also come from a sessions table
        avgGpa: Number(avgGpa.toFixed(1)) || 2.8
      });
    } catch (error) {
      console.error("Error fetching students:", error);
      toast({
        title: "Error",
        description: "Failed to fetch student data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Real-time subscription
  useEffect(() => {
    fetchStudents();

    const q = query(collection(db, "students"), orderBy("created_at", "desc"));
    const unsubscribe = onSnapshot(q, () => {
      fetchStudents();
      toast({
        title: "Data Updated",
        description: "Student data has been refreshed",
      });
    });

    return () => {
      unsubscribe();
    };
  }, [fetchStudents, toast]);

  // Handle CSV upload
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
          
          // Validate data
          const validStudents = students.filter(s => s.student_id && s.name);
          
          if (validStudents.length === 0) {
            throw new Error('No valid student data found');
          }

          // Upload in batches
          const batchSize = 50;
          let successCount = 0;
          
          for (let i = 0; i < validStudents.length; i += batchSize) {
            const batch = validStudents.slice(i, i + batchSize);
            
            const { error } = await supabase
              .from("students")
              .upsert(batch, { 
                onConflict: 'student_id',
                ignoreDuplicates: false 
              });

            if (error) throw error;
            successCount += batch.length;
          }

          toast({
            title: "Success!",
            description: `Successfully imported ${successCount} students`,
          });
          
        } catch (error: unknown) {
          console.error('Upload error:', error);
          toast({
            title: "Upload Failed",
            description: error instanceof Error ? error.message : 'Failed to import dataset',
            variant: "destructive",
          });
        } finally {
          setUploadLoading(false);
          event.target.value = '';
        }
      },
      error: (error) => {
        console.error('CSV parsing error:', error);
        toast({
          title: "Parse Error",
          description: 'Failed to parse CSV file. Please check the format.',
          variant: "destructive",
        });
        setUploadLoading(false);
      }
    });
  };

  // Download template
  const downloadTemplate = () => {
    const headers = ['student_id', 'name', 'risk_score', 'gpa', 'attendance', 'email', 'grade'];
    const sampleData = [
      ['STU001', 'Arjun Patel', '85', '2.1', '95', 'arjun@example.com', '12th'],
      ['STU002', 'Vikram Singh', '92', '1.8', '45', 'vikram@example.com', '11th'],
      ['STU003', 'Rahul Kumar', '45', '3.2', '88', 'rahul@example.com', '10th'],
    ];
    
    const csvContent = [
      headers.join(','),
      ...sampleData.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Template Downloaded",
      description: "CSV template has been downloaded",
    });
  };

  // Generate recommendations based on real data
  const getRecommendations = () => {
    const recommendations = [];
    
    // High risk students
    students.filter(s => s.risk_score >= 75).slice(0, 2).forEach(student => {
      recommendations.push({
        student: student.name,
        action: `Schedule urgent counseling session. Risk score: ${student.risk_score}`,
        priority: "high"
      });
    });
    
    // Attendance issues
    students.filter(s => s.attendance && s.attendance < 60).slice(0, 1).forEach(student => {
      recommendations.push({
        student: student.name,
        action: `Contact parent about attendance. Below 60% threshold.`,
        priority: "high"
      });
    });
    
    // GPA drop suggestions
    if (recommendations.length < 3) {
      recommendations.push({
        student: "General",
        action: "Assign study groups for Math and Science support.",
        priority: "medium"
      });
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
        
        {/* CSV Import Section */}
        <div className="flex gap-2">
          <button
            onClick={downloadTemplate}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
          >
            <Download className="h-4 w-4" />
            Template
          </button>
          <div className="relative">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={uploadLoading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              id="csv-upload"
            />
            <label
              htmlFor="csv-upload"
              className={`flex items-center gap-2 px-3 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors cursor-pointer ${
                uploadLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Upload className="h-4 w-4" />
              {uploadLoading ? 'Uploading...' : 'Import CSV'}
            </label>
          </div>
        </div>
      </div>

      {uploadLoading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <p className="text-sm text-blue-700">Processing CSV file...</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          title="Assigned Students" 
          value={stats.total.toString()} 
          icon={Users} 
          variant="primary" 
        />
        <StatsCard 
          title="High Risk Students" 
          value={stats.highRisk.toString()} 
          icon={AlertTriangle} 
          variant="danger" 
        />
        <StatsCard 
          title="Sessions This Week" 
          value={stats.sessionsThisWeek.toString()} 
          icon={Calendar} 
          variant="success" 
        />
        <StatsCard 
          title="Avg Student GPA" 
          value={stats.avgGpa.toString()} 
          icon={TrendingUp} 
          trend={{ value: 2, positive: false }} 
        />
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
              <motion.div 
                key={i} 
                initial={{ opacity: 0, x: 10 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ delay: i * 0.1 }}
                className={`p-3 rounded-lg border text-sm ${
                  rec.priority === "high" 
                    ? "bg-destructive/5 border-destructive/20" 
                    : "bg-warning/5 border-warning/20"
                }`}
              >
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