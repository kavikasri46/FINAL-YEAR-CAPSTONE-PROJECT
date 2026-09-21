import { Users, GraduationCap, AlertTriangle, TrendingDown, UserCheck, Bell } from "lucide-react";
import { StatsCard } from "@/components/StatsCard";
import { StudentTable } from "@/components/StudentTable";
import { RiskBadge } from "@/components/RiskBadge";
import { mockStudents, mockNotifications, riskDistribution, attendanceTrend } from "@/lib/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from "recharts";
import { motion } from "framer-motion";

/* NEW IMPORTS (ADDED) */
import * as XLSX from "xlsx";
import KNN from "ml-knn";
import { useState } from "react";
import { NotificationBanner } from "@/components/NotificationBanner";
import { api } from "@/services/api";

interface TimetableEntry {
  class?: string;
  subject?: string;
  mentor?: string;
  day?: string;
  time?: string;
  room?: string;
  status?: string;
}

export default function AdminDashboard() {
  const highRisk = mockStudents.filter(s => s.riskLevel === "high");
  const unreadAlerts = mockNotifications.filter(n => !n.read);

  /* NEW STATE (ADDED) */
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [uploadStatus, setUploadStatus] = useState("");
  const [notification, setNotification] = useState<{show: boolean, message: string}>({show: false, message: ""});

  /* EXCEL TIMETABLE UPLOAD FUNCTION */
  const handleTimetableUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {

    const file = event.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = async (e: ProgressEvent<FileReader>) => {

      const data = new Uint8Array(e.target?.result as ArrayBuffer);

      const workbook = XLSX.read(data, { type: "array" });

      const sheet = workbook.Sheets[workbook.SheetNames[0]];

      const rows: TimetableEntry[] = XLSX.utils.sheet_to_json(sheet);

      setTimetable(rows);

      // Check for free classes and show notification
      const freeClass = rows.find((row: TimetableEntry) => row.status === "Free");
      if (freeClass) {
        setNotification({
          show: true,
          message: `Sir, ${freeClass.mentor} sir, ${freeClass.class} class is free now. You can take the session now if you are free.`
        });
      } else {
        setNotification({show: false, message: ""});
      }

      try {
        await api.bulkUploadTimetable(rows.map(r => ({
          class: r.class, subject: r.subject, mentor: r.mentor,
          day: r.day, time: r.time, room: r.room
        })));
        setUploadStatus("Timetable uploaded successfully");
      } catch (error) {
        console.error(error);
        setUploadStatus("Upload failed");
      }

    };

    reader.readAsArrayBuffer(file);

  };

  /* AI MENTOR PREDICTION */
  const predictFreeMentor = () => {

    const trainingData = [
      [1,0],
      [2,1],
      [3,0],
      [4,1]
    ];

    const mentors = [
      "Ravi",
      "Meena",
      "Arjun",
      "Kumar"
    ];

    const knn = new KNN(trainingData, mentors);

    const result = knn.predict([[2,0]]);

    alert("AI Assigned Mentor: " + result + ". CSDA class is free now. A mentor can take the session.");

  };

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-2xl font-display font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground text-sm">Overview of student dropout risk analytics</p>
      </div>

      {/* Notification Alert */}
      <NotificationBanner show={notification.show} message={notification.message} />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Students" value="2,456" icon={GraduationCap} trend={{ value: 3.2, positive: true }} />
        <StatsCard title="High Risk" value={highRisk.length} icon={AlertTriangle} variant="danger" subtitle="Immediate attention needed" />
        <StatsCard title="Avg Attendance" value="76%" icon={TrendingDown} variant="warning" trend={{ value: 4.5, positive: false }} />
        <StatsCard title="Active Mentors" value="24" icon={UserCheck} variant="success" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        <Card className="lg:col-span-2 glass-card border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Attendance Trend (Weekly)</CardTitle>
          </CardHeader>

          <CardContent>

            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={attendanceTrend}>

                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />

                <XAxis dataKey="week" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />

                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" domain={[60, 100]} />

                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />

                <Line type="monotone" dataKey="attendance" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ fill: "hsl(var(--primary))", r: 4 }} />

              </LineChart>
            </ResponsiveContainer>

          </CardContent>
        </Card>

        <Card className="glass-card border-border/50">

          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Risk Distribution</CardTitle>
          </CardHeader>

          <CardContent className="flex justify-center">

            <ResponsiveContainer width="100%" height={240}>

              <PieChart>

                <Pie data={riskDistribution} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">

                  {riskDistribution.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}

                </Pie>

                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />

              </PieChart>

            </ResponsiveContainer>

          </CardContent>

        </Card>

      </div>

      {/* Alerts + High Risk Students */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        <div className="lg:col-span-2">

          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-semibold text-sm">High Risk Students</h3>
            <RiskBadge level="high" />
          </div>

          <StudentTable students={mockStudents.sort((a, b) => b.riskScore - a.riskScore).slice(0, 5)} compact />

        </div>

        <Card className="glass-card border-border/50">

          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" /> Recent Alerts
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">

            {mockNotifications.slice(0, 4).map((n, i) => (

              <motion.div
                key={n.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-3 rounded-lg border text-sm"
              >

                <p className="font-medium text-xs">{n.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>

              </motion.div>

            ))}

          </CardContent>

        </Card>

      </div>

      {/* NEW FEATURE : TIMETABLE UPLOAD */}

      <Card className="glass-card border-border/50">

        <CardHeader>
          <CardTitle className="text-sm font-semibold">
            Upload Timetable (Excel)
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">

          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleTimetableUpload}
          />

          <button
            onClick={predictFreeMentor}
            className="px-4 py-2 bg-primary text-white rounded"
          >
            Predict Free Mentor
          </button>

          <p className="text-xs text-muted-foreground">
            {uploadStatus}
          </p>

        </CardContent>

      </Card>

    </div>
  );
}
