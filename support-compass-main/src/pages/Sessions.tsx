import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, Video, Plus, X, Play, FileText, Upload, Trash2, Download } from "lucide-react";
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
  youtubeUrl?: string;
  type: string;
  status: string;
  createdBy: string;
  assignedTo: string[];
  createdAt: string;
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

function loadDocuments(): Document[] {
  try { return JSON.parse(localStorage.getItem("documents") || "[]"); }
  catch { return []; }
}

function saveDocuments(docs: Document[]) {
  localStorage.setItem("documents", JSON.stringify(docs));
}

export default function Sessions() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", description: "", date: "", youtubeUrl: "" });
  const [documents, setDocuments] = useState<Document[]>(loadDocuments());
  const [uploading, setUploading] = useState(false);

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
      setForm({ title: "", description: "", date: "", youtubeUrl: "" });
      setShowForm(false);
      fetchSessions();
    } catch (err) {
      console.error("Failed to create session:", err);
    }
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      const newDoc: Document = {
        id: Date.now().toString(),
        name: file.name,
        type: file.type,
        size: file.size,
        uploadedBy: user.id,
        uploadedByName: user.name,
        date: new Date().toISOString().split("T")[0],
        dataUrl,
      };
      const updated = [newDoc, ...documents];
      setDocuments(updated);
      saveDocuments(updated);
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteDocument = (id: string) => {
    const updated = documents.filter((d) => d.id !== id);
    setDocuments(updated);
    saveDocuments(updated);
  };

  const isMentor = user?.role === "mentor";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Sessions & Resources</h1>
          <p className="text-muted-foreground text-sm">Learning sessions, videos and study materials</p>
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
                  {s.description && <p className="text-xs text-muted-foreground">{s.description}</p>}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground"><Users className="h-3.5 w-3.5" /> {s.type && s.type.replace(/-/g, " → ")}</div>
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

      {isMentor && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Upload className="h-4 w-4" /> Upload Study Materials
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="doc-upload">Upload PDF, Word, or other documents</Label>
              <Input id="doc-upload" type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.zip" onChange={handleDocumentUpload} disabled={uploading} className="mt-1" />
              {uploading && <p className="text-xs text-muted-foreground">Uploading...</p>}
            </div>
          </CardContent>
        </Card>
      )}

      {documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4" /> Study Materials & Question Papers ({documents.length})
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
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <a href={doc.dataUrl} download={doc.name}>
                    <Button size="sm" variant="outline" className="gap-1">
                      <Download className="h-3.5 w-3.5" /> Download
                    </Button>
                  </a>
                  {isMentor && (
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDeleteDocument(doc.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
