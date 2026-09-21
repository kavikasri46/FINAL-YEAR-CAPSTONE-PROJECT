import { useEffect, useState } from "react";
import { BookOpen, TrendingUp, Clock, Award, Play, X, CalendarPlus, FileText, Download, CheckCircle2, XCircle, AlertCircle, Radio, Shield, Calendar, Sparkles } from "lucide-react";
import { StatsCard } from "@/components/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RiskBadge } from "@/components/RiskBadge";
import { mockPerformance } from "@/lib/mockData";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { SessionItem, getLocalSessions, SESSIONS_UPDATE_EVENT } from "@/services/sessionSync";

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

const statusBadgeStyles: Record<string, string> = {
  scheduled: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  live: "bg-red-500/10 text-red-400 border-red-500/50 animate-pulse font-semibold",
  completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  cancelled: "bg-muted text-muted-foreground border-border",
};

function getYoutubeEmbed(url: string): string {
  if (!url) return "";
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/);
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
  const [sessions, setSessions] = useState<SessionItem[]>(getLocalSessions());
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [leaveForm, setLeaveForm] = useState({ startDate: "", endDate: "", reason: "" });
  const [myLeaves, setMyLeaves] = useState<LeaveRequest[]>([]);
  const [documents, setDocuments] = useState<Document[]>(loadDocuments());
  const [liveAlert, setLiveAlert] = useState<string | null>(null);

  const fetchLiveSessions = async () => {
    try {
      const data = await api.getSessions();
      if (Array.isArray(data) && data.length > 0) {
        setSessions(data);
        return;
      }
    } catch {}
    setSessions(getLocalSessions());
  };

  useEffect(() => {
    fetchLiveSessions();
    setMyLeaves(loadLeaves().filter((l) => l.studentEmail === user?.email));

    // Real-time synchronization event listener
    const handleSessionsUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<SessionItem[]>;
      if (customEvent.detail && Array.isArray(customEvent.detail)) {
        setSessions(customEvent.detail);
        setLiveAlert("🔔 Sessions updated live by Faculty / Admin!");
        setTimeout(() => setLiveAlert(null), 4000);
      } else {
        setSessions(getLocalSessions());
      }
    };

    window.addEventListener(SESSIONS_UPDATE_EVENT, handleSessionsUpdate);
    window.addEventListener("storage", handleSessionsUpdate);

    // Live polling every 3.5 seconds
    const interval = setInterval(() => {
      const fresh = getLocalSessions();
      setSessions(fresh);
    }, 3500);

    return () => {
      window.removeEventListener(SESSIONS_UPDATE_EVENT, handleSessionsUpdate);
      window.removeEventListener("storage", handleSessionsUpdate);
      clearInterval(interval);
    };
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

  const activeLiveSession = sessions.find((s) => s.status === "live");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold">My Student Dashboard</h1>
          <p className="text-muted-foreground text-sm">Live mentorship, sessions, performance metrics, and learning resources</p>
        </div>
        <RiskBadge level="high" />
      </div>

      {/* Live Alert Banner */}
      <AnimatePresence>
        {liveAlert && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 rounded-xl bg-purple-950/70 border border-purple-500/40 text-purple-200 text-sm flex items-center justify-between shadow-lg"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-400 shrink-0" />
              <span>{liveAlert}</span>
            </div>
            <Badge variant="outline" className="border-purple-400 text-purple-300 text-[10px]">Real-Time Sync</Badge>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live Session Active Banner */}
      {activeLiveSession && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg shadow-red-500/10"
        >
          <div className="flex items-center gap-3">
            <div className="h-3 w-3 rounded-full bg-red-500 animate-ping shrink-0" />
            <div>
              <p className="text-xs uppercase tracking-wider text-red-400 font-bold flex items-center gap-1.5">
                <Radio className="h-3.5 w-3.5" /> Live Mentorship Class In Progress
              </p>
              <h3 className="text-base font-semibold text-foreground mt-0.5">{activeLiveSession.title}</h3>
              <p className="text-xs text-muted-foreground">
                {activeLiveSession.createdByName ? `Instructor: ${activeLiveSession.createdByName}` : ""} {activeLiveSession.time && `• ${activeLiveSession.time}`}
              </p>
            </div>
          </div>
          {activeLiveSession.youtubeUrl && (
            <Button
              className="gap-1.5 bg-red-600 hover:bg-red-700 text-white shrink-0 shadow-md"
              onClick={() => setSelectedVideo(getYoutubeEmbed(activeLiveSession.youtubeUrl!))}
            >
              <Play className="h-4 w-4" /> Join / Watch Live Lecture
            </Button>
          )}
        </motion.div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Current GPA" value="2.1" icon={BookOpen} variant="danger" trend={{ value: 8, positive: false }} />
        <StatsCard title="Attendance" value="62%" icon={Clock} variant="warning" />
        <StatsCard title="Assignments Done" value="58%" icon={TrendingUp} trend={{ value: 12, positive: false }} />
        <StatsCard title="Risk Score" value="87/100" icon={Award} variant="danger" subtitle="High dropout risk" />
      </div>

      {/* Live Mentorship & Class Sessions Card */}
      <Card className="glass-card border-purple-500/20 shadow-md overflow-hidden">
        <CardHeader className="pb-3 flex flex-row items-center justify-between bg-muted/20">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Radio className="h-4 w-4 text-purple-400" />
              Live Mentorship & Class Sessions ({sessions.length})
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Sessions updated lively by Administrators and Faculty Mentors
            </p>
          </div>
          <Badge variant="outline" className="border-purple-500/30 text-purple-400 bg-purple-500/10 text-[11px]">
            ⚡ Live Synced
          </Badge>
        </CardHeader>
        <CardContent className="space-y-3 pt-4">
          {sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No sessions scheduled at the moment.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {sessions.map((s, i) => (
                <motion.div
                  key={s._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-3.5 rounded-xl border border-border/60 bg-muted/30 hover:bg-muted/50 transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-semibold text-foreground line-clamp-1">{s.title}</h4>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border capitalize shrink-0 ${statusBadgeStyles[s.status] || ""}`}>
                        {s.status === "live" ? "🔴 Live Now" : s.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-purple-400" /> {s.date} {s.time && `• ${s.time}`}
                      </span>
                      {s.createdByName && (
                        <span className="flex items-center gap-1 text-purple-300">
                          <Shield className="h-3 w-3" /> {s.createdByName}
                        </span>
                      )}
                    </div>

                    {s.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{s.description}</p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-border/30 flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground capitalize">
                      {s.type ? s.type.replace(/-/g, " ") : "Session"}
                    </span>
                    {s.youtubeUrl ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1 text-xs border-purple-500/30 hover:bg-purple-500/10 h-7"
                        onClick={() => setSelectedVideo(getYoutubeEmbed(s.youtubeUrl!))}
                      >
                        <Play className="h-3 w-3 text-purple-400" /> {s.status === "live" ? "Watch Live" : "Watch Lecture"}
                      </Button>
                    ) : (
                      <span className="text-[11px] text-muted-foreground">Classroom Session</span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Video Modal Player */}
      {selectedVideo && (
        <Card className="border-purple-500/40 shadow-2xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2 bg-muted/50">
            <CardTitle className="text-sm flex items-center gap-2">
              <Play className="h-4 w-4 text-purple-400" /> Video Lecture Stream
            </CardTitle>
            <Button size="sm" variant="ghost" onClick={() => setSelectedVideo(null)}><X className="h-4 w-4" /></Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="aspect-video w-full bg-black">
              <iframe src={selectedVideo} className="w-full h-full" allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" title="Session Video Player" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Analytics Charts */}
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

      {/* Leave Application & Status */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Leave Requests</h2>
        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setShowLeaveForm(!showLeaveForm)}>
          <CalendarPlus className="h-4 w-4" /> Apply for Leave
        </Button>
      </div>

      {showLeaveForm && (
        <Card className="border-purple-500/20">
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
                <Label>Reason</Label>
                <Input placeholder="Medical leave, family function..." value={leaveForm.reason} onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })} required />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowLeaveForm(false)}>Cancel</Button>
                <Button type="submit" size="sm" className="gradient-primary">Submit Leave Request</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {myLeaves.length > 0 && (
        <Card className="glass-card border-border/50">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">My Submitted Leave Requests</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {myLeaves.map((leave) => (
              <motion.div key={leave.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors">
                <div>
                  <p className="text-sm font-medium">{leave.reason}</p>
                  <p className="text-xs text-muted-foreground">{leave.startDate} to {leave.endDate}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  {statusIcon(leave.status)}
                  <span className={`text-xs capitalize font-medium ${leave.status === "approved" ? "text-green-500" : leave.status === "rejected" ? "text-red-500" : "text-yellow-500"}`}>
                    {leave.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Study Materials & Question Papers */}
      {documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4 text-purple-400" /> Study Materials & Question Papers ({documents.length})
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
