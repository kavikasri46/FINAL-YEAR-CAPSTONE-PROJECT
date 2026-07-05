import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Users, Video, Plus, X, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { api } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

const statusStyles: Record<string, string> = {
  scheduled: "bg-primary/10 text-primary border-primary/20",
  completed: "bg-success/10 text-success border-success/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

interface Session {
  _id: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  youtubeUrl?: string;
  type: string;
  status: string;
  createdBy: string;
  assignedTo: string[];
  createdAt: string;
}

function getYoutubeEmbed(url: string): string {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : url;
}

export default function Sessions() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", description: "", date: "", time: "", youtubeUrl: "" });

  const fetchSessions = async () => {
    try {
      const data = await api.getSessions();
      setSessions(data);
    } catch (err) {
      console.error("Failed to fetch sessions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSessions(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createSession(form);
      setForm({ title: "", description: "", date: "", time: "", youtubeUrl: "" });
      setShowForm(false);
      fetchSessions();
    } catch (err) {
      console.error("Failed to create session:", err);
    }
  };

  const isMentor = user?.role === "mentor";
  const isStudent = user?.role === "student";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Sessions</h1>
          <p className="text-muted-foreground text-sm">Mentor-student meetings with video resources</p>
        </div>
        {isMentor && (
          <Button size="sm" className="gap-1.5" onClick={() => setShowForm(!showForm)}>
            {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showForm ? "Cancel" : "New Session"}
          </Button>
        )}
      </div>

      {showForm && isMentor && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Create New Session</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Math Revision Session" required />
                </div>
                <div className="space-y-2">
                  <Label>YouTube URL</Label>
                  <Input value={form.youtubeUrl} onChange={(e) => setForm({ ...form, youtubeUrl: e.target.value })} placeholder="https://youtube.com/watch?v=..." />
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Time</Label>
                  <Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Session description..." />
              </div>
              <Button type="submit" className="gap-2"><Video className="h-4 w-4" /> Create Session</Button>
            </form>
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
              <iframe src={selectedVideo} className="w-full h-full" allowFullScreen title="Video" />
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
      ) : sessions.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">No sessions yet.</CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sessions.map((s, i) => (
            <motion.div key={s._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="glass-card border-border/50 hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-sm font-semibold">{s.title}</CardTitle>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium capitalize ${statusStyles[s.status] || ""}`}>{s.status}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground"><Calendar className="h-3.5 w-3.5" /> {s.date}</div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground"><Clock className="h-3.5 w-3.5" /> {s.time}</div>
                  {s.description && <p className="text-xs text-muted-foreground">{s.description}</p>}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground"><Users className="h-3.5 w-3.5" /> {s.type.replace(/-/g, " → ")}</div>
                  {s.youtubeUrl && (
                    <Button onClick={() => setSelectedVideo(getYoutubeEmbed(s.youtubeUrl!))} variant="outline" size="sm" className="w-full mt-2 gap-1.5">
                      <Play className="h-3.5 w-3.5" /> Watch Video
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
