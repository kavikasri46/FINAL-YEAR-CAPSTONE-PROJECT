import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, Video, Plus, X, Play, FileText, Upload, Trash2, Download, ShieldCheck, CheckCircle2, Clock, XCircle, Edit, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

const statusStyles: Record<string, string> = {
  scheduled: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  cancelled: "bg-red-500/10 text-red-400 border-red-500/30",
};

interface Session {
  _id: string;
  title: string;
  description?: string;
  date: string;
  time?: string;
  youtubeUrl?: string;
  type: string;
  status: string;
  createdBy: string;
  createdByName?: string;
  assignedTo?: string[];
  createdAt?: string;
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

const DEFAULT_SESSIONS: Session[] = [
  {
    _id: "s101",
    title: "Mathematics & Calculus Revision Session",
    description: "Deep dive into Differential Calculus, Integration concepts, and practice problems for upcoming midterms.",
    date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    time: "10:00 AM",
    youtubeUrl: "https://www.youtube.com/watch?v=WSpt44EZG1g",
    type: "mentor-student",
    status: "scheduled",
    createdBy: "u1",
    createdByName: "Admin User",
    assignedTo: ["u2"],
    createdAt: new Date().toISOString(),
  },
  {
    _id: "s102",
    title: "Data Structures & Algorithms - Trees & Graphs",
    description: "Comprehensive walkthrough of Binary Search Trees, BFS/DFS graph traversals and interview problem patterns.",
    date: new Date(Date.now() + 172800000).toISOString().split("T")[0],
    time: "02:00 PM",
    youtubeUrl: "https://www.youtube.com/watch?v=RBSGKlAnoiM",
    type: "group",
    status: "scheduled",
    createdBy: "u3",
    createdByName: "Dr. Rajesh Verma (Mentor)",
    assignedTo: ["u2"],
    createdAt: new Date().toISOString(),
  },
  {
    _id: "s103",
    title: "1-on-1 Academic Counseling & Study Plan",
    description: "Personalized mentorship discussion to address attendance, internal mark improvements, and study schedule optimization.",
    date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
    time: "11:30 AM",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    type: "counseling",
    status: "completed",
    createdBy: "u3",
    createdByName: "Dr. Rajesh Verma (Mentor)",
    assignedTo: ["u2"],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  }
];

function getYoutubeEmbed(url: string): string {
  if (!url) return "";
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : url;
}

function loadDocuments(): Document[] {
  try { return JSON.parse(localStorage.getItem("documents") || "[]"); }
  catch { return []; }
}

function saveDocuments(docs: Document[]) {
  localStorage.setItem("documents", JSON.stringify(docs));
}

function loadSavedSessions(): Session[] {
  try {
    const stored = localStorage.getItem("app_sessions");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return DEFAULT_SESSIONS;
}

export default function Sessions() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>(loadSavedSessions());
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ title: string; description: string; date: string; time: string; status: string; youtubeUrl: string }>({
    title: "",
    description: "",
    date: "",
    time: "",
    status: "scheduled",
    youtubeUrl: "",
  });
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    time: "10:00 AM",
    youtubeUrl: "",
    type: "mentor-student",
  });
  const [documents, setDocuments] = useState<Document[]>(loadDocuments());
  const [uploading, setUploading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Both ADMIN and MENTOR have rights to create, update, and manage sessions
  const canManageSessions = user?.role === "admin" || user?.role === "mentor";

  const showNotify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const data = await api.getSessions();
      if (Array.isArray(data) && data.length > 0) {
        setSessions(data);
        localStorage.setItem("app_sessions", JSON.stringify(data));
      } else {
        const saved = loadSavedSessions();
        setSessions(saved);
      }
    } catch (err) {
      console.warn("Using offline session store:", err);
      const saved = loadSavedSessions();
      setSessions(saved);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageSessions) {
      showNotify("Access denied: Only Admins and Mentors can create student sessions.");
      return;
    }

    const newSessionItem: Session = {
      _id: "s" + Date.now(),
      title: form.title,
      description: form.description,
      date: form.date,
      time: form.time,
      youtubeUrl: form.youtubeUrl,
      type: form.type,
      status: "scheduled",
      createdBy: user?.id || "u1",
      createdByName: user?.name || (user?.role === "admin" ? "Admin User" : "Faculty Mentor"),
      assignedTo: [],
      createdAt: new Date().toISOString(),
    };

    try {
      await api.createSession({
        ...form,
        createdBy: user?.id,
        createdByName: user?.name,
      });
      showNotify("Session created and published successfully!");
    } catch (err) {
      console.warn("Saved locally:", err);
      showNotify("Session saved successfully!");
    }

    const updated = [newSessionItem, ...sessions];
    setSessions(updated);
    localStorage.setItem("app_sessions", JSON.stringify(updated));
    setForm({
      title: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      time: "10:00 AM",
      youtubeUrl: "",
      type: "mentor-student",
    });
    setShowForm(false);
  };

  const startEdit = (s: Session) => {
    setEditingId(s._id);
    setEditForm({
      title: s.title,
      description: s.description || "",
      date: s.date,
      time: s.time || "10:00 AM",
      status: s.status || "scheduled",
      youtubeUrl: s.youtubeUrl || "",
    });
  };

  const saveEdit = async (id: string) => {
    if (!canManageSessions) {
      showNotify("Only Admins and Mentors can update sessions.");
      return;
    }

    const updatedList = sessions.map((s) => (s._id === id ? { ...s, ...editForm } : s));
    setSessions(updatedList);
    localStorage.setItem("app_sessions", JSON.stringify(updatedList));
    setEditingId(null);

    try {
      await api.updateSession(id, editForm);
      showNotify("Session updated successfully!");
    } catch (err) {
      console.warn("Updated locally:", err);
      showNotify("Session updated successfully!");
    }
  };

  const handleQuickStatusChange = async (id: string, newStatus: string) => {
    if (!canManageSessions) return;
    const updatedList = sessions.map((s) => (s._id === id ? { ...s, status: newStatus } : s));
    setSessions(updatedList);
    localStorage.setItem("app_sessions", JSON.stringify(updatedList));

    try {
      await api.updateSession(id, { status: newStatus });
      showNotify(`Session marked as ${newStatus}`);
    } catch {}
  };

  const handleDeleteSession = async (id: string) => {
    if (!canManageSessions) return;
    const updatedList = sessions.filter((s) => s._id !== id);
    setSessions(updatedList);
    localStorage.setItem("app_sessions", JSON.stringify(updatedList));
    showNotify("Session removed.");
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
      showNotify("Document uploaded successfully!");
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteDocument = (id: string) => {
    const updated = documents.filter((d) => d.id !== id);
    setDocuments(updated);
    saveDocuments(updated);
    showNotify("Document deleted.");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-display font-bold">Sessions & Resources</h1>
            {canManageSessions && (
              <Badge variant="outline" className="border-purple-500/40 text-purple-400 bg-purple-500/10 text-xs">
                <ShieldCheck className="h-3 w-3 mr-1" />
                {user?.role === "admin" ? "Admin Access" : "Mentor Access"}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground text-sm">
            {canManageSessions
              ? "Create, update, and manage student learning sessions, video lectures, and study materials"
              : "Access your assigned learning sessions, recorded video revision, and study resources"}
          </p>
        </div>

        {canManageSessions ? (
          <Button size="sm" className="gap-1.5 gradient-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showForm ? "Cancel" : "New Session"}
          </Button>
        ) : (
          <div className="text-xs px-3 py-1.5 rounded-lg bg-muted/60 border text-muted-foreground flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-purple-400" />
            Sessions updated by Admin & Faculty Mentors
          </div>
        )}
      </div>

      {/* Notification toast banner */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 rounded-lg bg-purple-950/60 border border-purple-500/40 text-purple-200 text-sm flex items-center gap-2 shadow-lg"
          >
            <CheckCircle2 className="h-4 w-4 text-purple-400 shrink-0" />
            {notification}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Session Form (Admin & Mentor Only) */}
      <AnimatePresence>
        {showForm && canManageSessions && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <Card className="border-purple-500/30 bg-card/90 backdrop-blur-sm shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Video className="h-4 w-4 text-purple-400" /> Schedule Student Session
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Session Title</Label>
                      <Input
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        placeholder="e.g. Data Structures Revision & Doubt Solving"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>YouTube / Recorded Video URL</Label>
                      <Input
                        value={form.youtubeUrl}
                        onChange={(e) => setForm({ ...form, youtubeUrl: e.target.value })}
                        placeholder="https://www.youtube.com/watch?v=..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Input
                        type="date"
                        value={form.date}
                        onChange={(e) => setForm({ ...form, date: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Time & Slot</Label>
                      <Input
                        value={form.time}
                        onChange={(e) => setForm({ ...form, time: e.target.value })}
                        placeholder="e.g. 10:00 AM - 11:30 AM"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Description & Learning Objectives</Label>
                    <Input
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Key topics, prerequisites, and instructions for students..."
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" size="sm" className="gap-2 gradient-primary">
                      <Video className="h-4 w-4" /> Publish Session
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Player Modal / Embed */}
      {selectedVideo && (
        <Card className="border-purple-500/30 overflow-hidden shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2 bg-muted/40">
            <CardTitle className="text-sm flex items-center gap-2">
              <Play className="h-4 w-4 text-purple-400" /> Now Playing Lecture
            </CardTitle>
            <Button size="sm" variant="ghost" onClick={() => setSelectedVideo(null)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="aspect-video w-full bg-black">
              <iframe
                src={selectedVideo}
                className="w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                title="Session Video Player"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Session Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="h-4 w-4 text-purple-400" />
            Available Sessions ({sessions.length})
          </h2>
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : sessions.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No sessions scheduled yet.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sessions.map((s, i) => (
              <motion.div
                key={s._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="glass-card border-border/50 hover:shadow-lg transition-all flex flex-col justify-between h-full group">
                  {editingId === s._id ? (
                    <CardContent className="p-4 space-y-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Title</Label>
                        <Input
                          size={1}
                          value={editForm.title}
                          onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Date</Label>
                        <Input
                          type="date"
                          value={editForm.date}
                          onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Status</Label>
                        <select
                          value={editForm.status}
                          onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                          className="w-full bg-background border rounded-md px-2 py-1.5 text-xs"
                        >
                          <option value="scheduled">Scheduled</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">YouTube URL</Label>
                        <Input
                          value={editForm.youtubeUrl}
                          onChange={(e) => setEditForm({ ...editForm, youtubeUrl: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Description</Label>
                        <Input
                          value={editForm.description}
                          onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        />
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                          Cancel
                        </Button>
                        <Button size="sm" className="gap-1 gradient-primary" onClick={() => saveEdit(s._id)}>
                          <Save className="h-3.5 w-3.5" /> Save
                        </Button>
                      </div>
                    </CardContent>
                  ) : (
                    <>
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-sm font-semibold leading-tight line-clamp-2">
                            {s.title}
                          </CardTitle>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full border font-medium capitalize shrink-0 ${
                              statusStyles[s.status] || ""
                            }`}
                          >
                            {s.status}
                          </span>
                        </div>
                        {s.createdByName && (
                          <p className="text-[11px] text-purple-400/80 font-medium mt-1 flex items-center gap-1">
                            <ShieldCheck className="h-3 w-3" /> By {s.createdByName}
                          </p>
                        )}
                      </CardHeader>

                      <CardContent className="space-y-2 flex-1 flex flex-col justify-between">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5 text-purple-400" /> {s.date} {s.time && `• ${s.time}`}
                          </div>
                          {s.description && (
                            <p className="text-xs text-muted-foreground line-clamp-3">
                              {s.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Users className="h-3.5 w-3.5 text-purple-400" />
                            <span className="capitalize">{s.type ? s.type.replace(/-/g, " → ") : "General"}</span>
                          </div>
                        </div>

                        <div className="pt-3 space-y-2">
                          {s.youtubeUrl && (
                            <Button
                              onClick={() => setSelectedVideo(getYoutubeEmbed(s.youtubeUrl!))}
                              variant="outline"
                              size="sm"
                              className="w-full gap-1.5 border-purple-500/30 hover:bg-purple-500/10"
                            >
                              <Play className="h-3.5 w-3.5 text-purple-400" /> Watch Recorded Video
                            </Button>
                          )}

                          {/* Admin & Mentor Management Actions */}
                          {canManageSessions && (
                            <div className="flex items-center justify-between pt-2 border-t border-border/40 gap-1">
                              <div className="flex items-center gap-1">
                                {s.status !== "completed" && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 px-2 text-[11px] text-emerald-400 hover:bg-emerald-500/10"
                                    onClick={() => handleQuickStatusChange(s._id, "completed")}
                                    title="Mark as Completed"
                                  >
                                    <CheckCircle2 className="h-3 w-3 mr-1" /> Complete
                                  </Button>
                                )}
                                {s.status === "completed" && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 px-2 text-[11px] text-blue-400 hover:bg-blue-500/10"
                                    onClick={() => handleQuickStatusChange(s._id, "scheduled")}
                                    title="Reopen as Scheduled"
                                  >
                                    <Clock className="h-3 w-3 mr-1" /> Scheduled
                                  </Button>
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                                  onClick={() => startEdit(s)}
                                  title="Edit Session"
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 w-7 p-0 text-destructive/80 hover:text-destructive"
                                  onClick={() => handleDeleteSession(s._id)}
                                  title="Delete Session"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Study Materials Card (Admin & Mentor Only) */}
      {canManageSessions && (
        <Card className="border-purple-500/20 bg-card/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Upload className="h-4 w-4 text-purple-400" /> Upload Study Materials & Lecture Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="doc-upload">Upload PDF, Question Papers, Slides, or ZIP archives</Label>
              <Input
                id="doc-upload"
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.zip"
                onChange={handleDocumentUpload}
                disabled={uploading}
                className="mt-1"
              />
              {uploading && <p className="text-xs text-purple-400">Uploading and saving document...</p>}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Document Library (Accessible to all roles) */}
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
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <a href={doc.dataUrl} download={doc.name}>
                    <Button size="sm" variant="outline" className="gap-1">
                      <Download className="h-3.5 w-3.5" /> Download
                    </Button>
                  </a>
                  {canManageSessions && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => handleDeleteDocument(doc.id)}
                    >
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
