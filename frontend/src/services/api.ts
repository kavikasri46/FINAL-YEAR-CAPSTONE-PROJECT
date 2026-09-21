const API_BASE = "http://localhost:5001/api";

function getToken(): string | null {
  return localStorage.getItem("token");
}

async function ensureToken(): Promise<string> {
  let token = getToken();
  if (token) return token;
  try {
    const res = await fetch(`${API_BASE}/auth/demo-token`, { method: "POST", headers: { "Content-Type": "application/json" } });
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem("token", data.token);
      return data.token;
    }
  } catch {}
  return "";
}

async function request(path: string, options: RequestInit = {}): Promise<any> {
  const token = await ensureToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),

  register: (name: string, email: string, password: string, role: string) =>
    request("/auth/register", { method: "POST", body: JSON.stringify({ name, email, password, role }) }),

  // Students
  getStudents: () => request("/students"),
  createStudent: (data: any) => request("/students", { method: "POST", body: JSON.stringify(data) }),
  bulkUploadStudents: (students: any[]) =>
    request("/students/bulk", { method: "POST", body: JSON.stringify({ students }) }),

  // Sessions
  getSessions: () => request("/sessions"),
  createSession: (data: any) => request("/sessions", { method: "POST", body: JSON.stringify(data) }),
  updateSession: (id: string, data: any) =>
    request(`/sessions/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  // Timetable
  getTimetable: () => request("/timetable"),
  bulkUploadTimetable: (entries: any[]) =>
    request("/timetable/bulk", { method: "POST", body: JSON.stringify({ entries }) }),

  // Alerts
  getAlerts: () => request("/alerts"),
  createAlert: (data: any) => request("/alerts", { method: "POST", body: JSON.stringify(data) }),
  bulkCreateAlerts: (alerts: any[]) =>
    request("/alerts/bulk", { method: "POST", body: JSON.stringify({ alerts }) }),
  markAlertRead: (id: string) =>
    request(`/alerts/${id}`, { method: "PUT", body: JSON.stringify({ is_read: true }) }),

  // Leaves
  getLeaves: () => request("/leaves"),
  createLeave: (data: any) => request("/leaves", { method: "POST", body: JSON.stringify(data) }),
  updateLeave: (id: string, data: any) =>
    request(`/leaves/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  // Documents
  getDocuments: () => request("/documents"),
  uploadDocument: (data: any) => request("/documents", { method: "POST", body: JSON.stringify(data) }),
  deleteDocument: (id: string) =>
    request(`/documents/${id}`, { method: "DELETE" }),
};
