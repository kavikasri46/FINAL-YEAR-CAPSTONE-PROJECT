export interface SessionItem {
  _id: string;
  title: string;
  description?: string;
  date: string;
  time?: string;
  youtubeUrl?: string;
  type: string;
  status: "scheduled" | "live" | "completed" | "cancelled" | string;
  createdBy: string;
  createdByName?: string;
  assignedTo?: string[];
  createdAt?: string;
}

export const SESSIONS_UPDATE_EVENT = "app_sessions_updated";

export const DEFAULT_INITIAL_SESSIONS: SessionItem[] = [
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

export function getLocalSessions(): SessionItem[] {
  try {
    const raw = localStorage.getItem("app_sessions");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return DEFAULT_INITIAL_SESSIONS;
}

export function saveLocalSessions(sessions: SessionItem[]): void {
  localStorage.setItem("app_sessions", JSON.stringify(sessions));
  localStorage.setItem("app_sessions_last_update", Date.now().toString());
  broadcastSessionUpdate(sessions);
}

export function broadcastSessionUpdate(sessions?: SessionItem[]): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(SESSIONS_UPDATE_EVENT, { detail: sessions || getLocalSessions() }));
  }
}
