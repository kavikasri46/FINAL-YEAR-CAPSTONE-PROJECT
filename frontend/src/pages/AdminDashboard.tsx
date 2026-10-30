import { Users, GraduationCap, AlertTriangle, TrendingDown, UserCheck, Bell } from "lucide-react";
import { StatsCard } from "@/components/StatsCard";
import { StudentTable } from "@/components/StudentTable";
import { RiskBadge } from "@/components/RiskBadge";
import { mockStudents, mockNotifications, riskDistribution, attendanceTrend } from "@/lib/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from "recharts";
import { motion } from "framer-motion";

/* NEW IMPORTS */
import * as XLSX from "xlsx";
import KNN from "ml-knn";
import { useState } from "react";
import { NotificationBanner } from "@/components/NotificationBanner";
import { SessionManagerCard } from "@/components/SessionManagerCard";
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

const ADMIN_MENTORS = [
  { name: "Ramesh kumar", role: "Head of Mentorship & CSE Advisory", email: "ramesh.kumar@kprcas.ac.in", students: 14, status: "Available", color: "from-pink-500 to-purple-600" },
  { name: "Manoj", role: "Senior Mentor, AI & Data Science", email: "manoj@kprcas.ac.in", students: 12, status: "Active Session", color: "from-purple-500 to-indigo-600" },
  { name: "brindaa", role: "Faculty Counselor, ECE Department", email: "brindaa@kprcas.ac.in", students: 11, status: "Available", color: "from-cyan-500 to-blue-600" },
  { name: "sathayavathy", role: "Information Technology & Risk Mentor", email: "sathayavathy@kprcas.ac.in", students: 15, status: "In Counseling", color: "from-emerald-500 to-teal-600" },
  { name: "keerthi", role: "Commerce & Arrears Turnaround Lead", email: "keerthi@kprcas.ac.in", students: 10, status: "Available", color: "from-amber-500 to-orange-600" },
  { name: "jayathi", role: "Management Studies Retention Mentor", email: "jayathi@kprcas.ac.in", students: 13, status: "Available", color: "from-rose-500 to-pink-600" },
];

export default function AdminDashboard() {
  const highRisk = mockStudents.filter(s => s.riskLevel === "high");
  const unreadAlerts = mockNotifications.filter(n => !n.read);

  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [uploadStatus, setUploadStatus] = useState("");
  const [notification, setNotification] = useState<{show: boolean, message: string}>({show: false, message: ""});
  const [predictedMentorResult, setPredictedMentorResult] = useState<string | null>(null);

  /* EXCEL TIMETABLE UPLOAD FUNCTION */
  const handleTimetableUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
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

  /* AI MENTOR PREDICTION (ALL 6 MENTORS) */
  const predictFreeMentor = () => {
    const trainingData = [
      [1,0],
      [2,1],
      [3,0],
      [4,1],
      [5,0],
      [6,1]
    ];
    const mentors = ["Ramesh kumar", "Manoj", "brindaa", "sathayavathy", "keerthi", "jayathi"];
    const knn = new KNN(trainingData, mentors);
    const result = knn.predict([[2,0]]) as unknown as string;
    const msg = `AI Assigned Free Mentor: ${result}. CSDA class is free now. Mentor ${result} has been assigned to take the session.`;
    setPredictedMentorResult(msg);
    setNotification({
      show: true,
      message: `AI Prediction: Assigned Mentor ${result} to take the upcoming free session.`
    });
    alert(msg);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground text-sm">Real-time student risk monitoring, live sessions dispatch & analytics</p>
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

      {/* LIVE SESSIONS HUB (LIVELY SYNCED TO STUDENTS) */}
      <SessionManagerCard title="Admin Live Session Dispatcher" />

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

      {/* ASSIGNED FACULTY MENTORS DIRECTORY */}
      <Card className="glass-card border-border/50">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-pink-400" />
                <span>Assigned Faculty Mentors Directory ({ADMIN_MENTORS.length})</span>
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Real-time active mentors roster for student counseling & early warning interventions
              </p>
            </div>
            <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 w-fit">
              ● All 6 Mentors Synchronized
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {ADMIN_MENTORS.map((m, idx) => (
              <motion.div
                key={m.name}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.07 }}
                className="p-4 rounded-xl border border-border/60 bg-card/60 hover:border-pink-500/40 hover:bg-card/90 transition-all duration-200 space-y-3 shadow-sm hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${m.color} text-white font-bold text-xs flex items-center justify-center shadow-md`}>
                      {m.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-foreground">{m.name}</h4>
                      <p className="text-[11px] text-muted-foreground leading-tight">{m.role}</p>
                    </div>
                  </div>
                  <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold ${
                    m.status === "Available"
                      ? "bg-emerald-950/70 text-emerald-300 border border-emerald-500/30"
                      : "bg-purple-950/70 text-purple-300 border border-purple-500/30"
                  }`}>
                    {m.status}
                  </span>
                </div>

                <div className="pt-2.5 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1 font-mono text-[11px]">
                    <Users className="h-3.5 w-3.5 text-pink-400" />
                    <strong className="text-foreground">{m.students}</strong> students assigned
                  </span>
                  <span className="text-[10px] font-mono opacity-80">{m.email}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Timetable upload & AI Mentor Dispatch */}
      <Card className="glass-card border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <span>Upload Timetable & AI Mentor Dispatch</span>
            </CardTitle>
            <span className="text-xs text-muted-foreground">XLSX / XLS formats</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <input type="file" accept=".xlsx,.xls" onChange={handleTimetableUpload} className="text-xs" />
            <button
              onClick={predictFreeMentor}
              className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white text-xs font-semibold rounded-lg shadow-md hover:scale-105 transition-all"
            >
              Predict & Assign Free Mentor
            </button>
          </div>

          {predictedMentorResult && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-lg bg-pink-950/50 border border-pink-500/40 text-pink-200 text-xs font-mono"
            >
              ✓ {predictedMentorResult}
            </motion.div>
          )}

          {uploadStatus && (
            <p className="text-xs text-muted-foreground font-mono">{uploadStatus}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
