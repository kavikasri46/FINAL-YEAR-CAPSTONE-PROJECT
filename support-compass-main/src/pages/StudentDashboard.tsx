import { useEffect, useState } from "react";
import { BookOpen, TrendingUp, Clock, Award, Play, X, CalendarPlus, FileText, Download, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { StatsCard } from "@/components/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RiskBadge } from "@/components/RiskBadge";
import { mockPerformance } from "@/lib/mockData";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from "recharts";
import { motion } from "framer-motion";
import { api } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

interface Session {
  _id: string;
  title: string;
  description?: string;
  date: string;
  youtubeUrl?: string;
  type: string;
  status: string;
}

interface LeaveRequest {
  id: string;
  studentName: string;
  studentEmail: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
}

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedBy: string;
  uploadedByName: string;
  date: string;
  dataUrl: string;
}

function getYoutubeEmbed(url: string): string {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : url;
}

function loadLeaves(): LeaveRequest[] {
  try { return JSON.parse(localStorage.getItem("leaves") || "[]"); }
  catch { return []; }
}

function saveLeaves(leaves: LeaveRequest[]) {
  localStorage.setItem("leaves", JSON.stringify(leaves));
}

function loadDocuments(): Document[] {
  try { return JSON.parse(localStorage.getItem("documents") || "[]"); }
  catch { return []; }
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [leaveForm, setLeaveForm] = useState({ startDate: "", endDate: "", reason: "" });
  const [myLeaves, setMyLeaves] = useState<LeaveRequest[]>([]);
  const [documents, setDocuments] = useState<Document[]>(loadDocuments());

  useEffect(() => {
    api.getSessions().then(setSessions).catch(console.error);
    setMyLeaves(loadLeaves().filter((l) => l.studentEmail === user?.email));
  }, [user]);

  const handleLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const newLeave: LeaveRequest = {
      id: Date.now().toString(),
      studentName: user.name,
      studentEmail: user.email,
      startDate: leaveForm.startDate,
      endDate: leaveForm.endDate,
      reason: leaveForm.reason,
      status: "pending",
      submittedAt: new Date().toISOString(),
    };
    const allLeaves = loadLeaves();
    allLeaves.push(newLeave);
    saveLeaves(allLeaves);
    setMyLeaves([newLeave, ...myLeaves]);
    setLeaveForm({ startDate: "", endDate: "", reason: "" });
    setShowLeaveForm(false);
  };

  const statusIcon = (status: string) => {
    if (status === "approved") return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    if (status === "rejected") return <XCircle className="h-4 w-4 text-red-500" />;
    return <AlertCircle className="h-4 w-4 text-yellow-500" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">My Dashboard</h1>
          <p className="text-muted-foreground text-sm">Track your academic progress and resources</p>
        </div>
        <RiskBadge level="high" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Current GPA" value="2.1" icon={BookOpen} variant="danger" trend={{ value: 8, positive: false }} />
        <StatsCard title="Attendance" value="62%" icon={Clock} variant="warning" />
        <StatsCard title="Assignments Done" value="58%" icon={TrendingUp} trend={{ value: 12, positive: false }} />
        <StatsCard title="Risk Score" value="87/100" icon={Award} variant="danger" subtitle="High dropout risk" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="glass-card border-border/50">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">GPA Trend</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={mockPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" domain={[0, 4]} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                <Line type="monotone" dataKey="gpa" stroke="hsl(var(--destructive))" strokeWidth={2.5} dot={{ fill: "hsl(var(--destructive))", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-card border-border/50">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Monthly Attendance & Assignments</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={mockPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                <Bar dataKey="attendance" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="assignments" fill="hsl(var(--warning))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <Button onClick={() => setShowLeaveForm(!showLeaveForm)} className="gap-2" variant="outline">
          <CalendarPlus className="h-4 w-4" /> {showLeaveForm ? "Cancel" : "Apply for Leave"}
        </Button>
      </div>

      {showLeaveForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-purple-500/30">
            <CardHeader><CardTitle className="text-sm">Apply for Leave</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleLeaveSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input type="date" value={leaveForm.startDate} onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input type="date" value={leaveForm.endDate} onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Reason for Leave</Label>
                  <Input value={leaveForm.reason} onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })} placeholder="Enter reason for leave..." required />
                </div>
                <Button type="submit" className="gap-2"><CalendarPlus className="h-4 w-4" /> Submit Leave Request</Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {myLeaves.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-sm">My Leave Requests</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {myLeaves.map((leave) => (
              <motion.div key={leave.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{leave.reason}</p>
                  <p className="text-xs text-muted-foreground">{leave.startDate} to {leave.endDate}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  {statusIcon(leave.status)}
                  <span className={`text-xs capitalize ${leave.status === "approved" ? "text-green-500" : leave.status === "rejected" ? "text-red-500" : "text-yellow-500"}`}>
                    {leave.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      )}

      {selectedVideo && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Now Playing</CardTitle>
            <Button size="sm" variant="ghost" onClick={() => setSelectedVideo(null)}><X className="h-4 w-4" /></Button>
          </CardHeader>
          <CardContent>
            <div className="aspect-video rounded-lg overflow-hidden bg-black">
              <iframe src={selectedVideo} className="w-full h-full" allowFullScreen title="Session Video" />
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="glass-card border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">All Sessions & Videos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No sessions available yet.</p>
          ) : (
            sessions.map((s, i) => (
              <motion.div key={s._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.1 }}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{s.title}</p>
                  <p className="text-xs text-muted-foreground">{s.date}{s.description ? ` - ${s.description}` : ""}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  {s.youtubeUrl && (
                    <Button size="sm" variant="outline" className="gap-1" onClick={() => setSelectedVideo(getYoutubeEmbed(s.youtubeUrl!))}>
                      <Play className="h-3 w-3" /> Watch
                    </Button>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </CardContent>
      </Card>

      {documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4" /> Study Materials & Question Papers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {documents.map((doc) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <FileText className="h-5 w-5 text-purple-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Uploaded by {doc.uploadedByName} on {doc.date} | {(doc.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <a href={doc.dataUrl} download={doc.name} className="shrink-0 ml-3">
                  <Button size="sm" variant="outline" className="gap-1">
                    <Download className="h-3.5 w-3.5" /> Download
                  </Button>
                </a>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
