import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Video, Plus, X, Play, Trash2, Edit, Save, CheckCircle2, Radio, Clock, Shield, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { SessionItem, getLocalSessions, saveLocalSessions, broadcastSessionUpdate, SESSIONS_UPDATE_EVENT } from "@/services/sessionSync";

const statusStyles: Record<string, string> = {
  scheduled: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  live: "bg-red-500/10 text-red-400 border-red-500/40 animate-pulse",
  completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  cancelled: "bg-muted text-muted-foreground border-border",
};

export function SessionManagerCard({ title = "Live Mentorship & Student Sessions Hub" }: { title?: string }) {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<SessionItem[]>(getLocalSessions());
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    time: "10:00 AM - 11:30 AM",
    youtubeUrl: "",
    type: "mentor-student",
  });

  const [editForm, setEditForm] = useState<{
    title: string;
    description: string;
    date: string;
    time: string;
    status: string;
    youtubeUrl: string;
  }>({
    title: "",
    description: "",
    date: "",
    time: "",
    status: "scheduled",
    youtubeUrl: "",
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const loadSessions = async () => {
    try {
      const data = await api.getSessions();
      if (Array.isArray(data) && data.length > 0) {
        setSessions(data);
        saveLocalSessions(data);
        return;
      }
    } catch {}
    setSessions(getLocalSessions());
  };

  useEffect(() => {
    loadSessions();

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<SessionItem[]>;
      if (customEvent.detail) {
        setSessions(customEvent.detail);
      } else {
        setSessions(getLocalSessions());
      }
    };

    window.addEventListener(SESSIONS_UPDATE_EVENT, handleUpdate);
    window.addEventListener("storage", handleUpdate);

    // Poll every 4 seconds for live sync
    const interval = setInterval(() => {
      setSessions(getLocalSessions());
    }, 4000);

    return () => {
      window.removeEventListener(SESSIONS_UPDATE_EVENT, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
      clearInterval(interval);
    };
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const newSession: SessionItem = {
      _id: "s" + Date.now(),
      title: form.title,
      description: form.description,
      date: form.date,
      time: form.time,
      youtubeUrl: form.youtubeUrl,
      type: form.type,
      status: "scheduled",
      createdBy: user?.id || "admin",
      createdByName: user?.name || (user?.role === "admin" ? "Admin User" : "Faculty Mentor"),
      assignedTo: [],
      createdAt: new Date().toISOString(),
    };

    const updated = [newSession, ...sessions];
    setSessions(updated);
    saveLocalSessions(updated);

    try {
      await api.createSession(newSession);
    } catch {}

    setForm({
      title: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      time: "10:00 AM - 11:30 AM",
      youtubeUrl: "",
      type: "mentor-student",
    });
    setShowCreate(false);
    showToast("Session scheduled & live updated on Student Dashboard!");
  };

  const handleStatusChange = async (id: string, status: string) => {
    const updated = sessions.map((s) => (s._id === id ? { ...s, status } : s));
    setSessions(updated);
    saveLocalSessions(updated);

    try {
      await api.updateSession(id, { status });
    } catch {}

    showToast(`Session marked as ${status.toUpperCase()} (synced to students)`);
  };

  const startEdit = (s: SessionItem) => {
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
    const updated = sessions.map((s) => (s._id === id ? { ...s, ...editForm } : s));
    setSessions(updated);
    saveLocalSessions(updated);
    setEditingId(null);

    try {
      await api.updateSession(id, editForm);
    } catch {}

    showToast("Session updated & broadcast to students!");
  };

  const handleDelete = async (id: string) => {
    const updated = sessions.filter((s) => s._id !== id);
    setSessions(updated);
    saveLocalSessions(updated);

    try {
      await api.updateSession(id, { status: "cancelled" });
    } catch {}

    showToast("Session removed.");
  };

  return (
    <Card className="glass-card border-purple-500/20 shadow-md">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Video className="h-4 w-4 text-purple-400" />
            {title}
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Sessions updated here appear <span className="text-purple-400 font-medium">instantly in real-time</span> on the Student Dashboard.
          </p>
        </div>
        <Button
          size="sm"
          className="gap-1.5 gradient-primary"
          onClick={() => setShowCreate(!showCreate)}
        >
          {showCreate ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showCreate ? "Cancel" : "Schedule Session"}
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        <AnimatePresence>
          {toastMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="p-2.5 rounded-lg bg-purple-950/70 border border-purple-500/40 text-purple-200 text-xs flex items-center gap-2"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-purple-400 shrink-0" />
              {toastMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Schedule Form */}
        <AnimatePresence>
          {showCreate && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleCreate}
              className="p-4 rounded-xl border border-purple-500/30 bg-card/90 space-y-3"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Session Topic / Title</Label>
                  <Input
                    placeholder="e.g. Calculus & Problem Solving Workshop"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">YouTube Video / Live Stream URL</Label>
                  <Input
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={form.youtubeUrl}
                    onChange={(e) => setForm({ ...form, youtubeUrl: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Date</Label>
                  <Input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Time Slot</Label>
                  <Input
                    placeholder="10:00 AM - 11:30 AM"
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Description & Student Instructions</Label>
                <Input
                  placeholder="Key concepts to cover, prerequisites, practice sheets..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <Button type="button" size="sm" variant="outline" onClick={() => setShowCreate(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="gap-1.5 gradient-primary">
                  <Radio className="h-3.5 w-3.5" /> Publish to Student Dashboard
                </Button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Sessions List */}
        <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
          {sessions.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">No sessions scheduled yet.</p>
          ) : (
            sessions.map((s) => (
              <motion.div
                key={s._id}
                layout
                className="p-3 rounded-lg border border-border/50 bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                {editingId === s._id ? (
                  <div className="space-y-2">
                    <Input
                      size={1}
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      placeholder="Title"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="date"
                        value={editForm.date}
                        onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                      />
                      <select
                        value={editForm.status}
                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                        className="bg-background border rounded-md px-2 text-xs"
                      >
                        <option value="scheduled">Scheduled</option>
                        <option value="live">Live Now 🔴</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    <Input
                      value={editForm.youtubeUrl}
                      onChange={(e) => setEditForm({ ...editForm, youtubeUrl: e.target.value })}
                      placeholder="YouTube URL"
                    />
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                        Cancel
                      </Button>
                      <Button size="sm" className="gradient-primary" onClick={() => saveEdit(s._id)}>
                        <Save className="h-3 w-3 mr-1" /> Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-foreground">{s.title}</p>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium capitalize ${statusStyles[s.status] || ""}`}>
                          {s.status === "live" ? "🔴 Live Now" : s.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-purple-400" /> {s.date} {s.time && `• ${s.time}`}
                        </span>
                        {s.createdByName && (
                          <span className="flex items-center gap-1 text-purple-300">
                            <Shield className="h-3 w-3" /> By {s.createdByName}
                          </span>
                        )}
                      </div>
                      {s.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{s.description}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                      {s.status !== "live" && s.status !== "completed" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs text-red-400 hover:bg-red-500/10 px-2"
                          onClick={() => handleStatusChange(s._id, "live")}
                        >
                          <Radio className="h-3 w-3 mr-1" /> Go Live
                        </Button>
                      )}
                      {s.status !== "completed" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs text-emerald-400 hover:bg-emerald-500/10 px-2"
                          onClick={() => handleStatusChange(s._id, "completed")}
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1" /> Done
                        </Button>
                      )}
                      {s.status === "completed" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs text-blue-400 hover:bg-blue-500/10 px-2"
                          onClick={() => handleStatusChange(s._id, "scheduled")}
                        >
                          <Clock className="h-3 w-3 mr-1" /> Reopen
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                        onClick={() => startEdit(s)}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-destructive/80 hover:text-destructive"
                        onClick={() => handleDelete(s._id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
