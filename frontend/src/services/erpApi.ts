const API_BASE =
  (import.meta.env.VITE_API_BASE as string) ||
  (import.meta.env.MODE === "production" ? "/api" : "http://localhost:5001/api");

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

export const erpApi = {
  // ── Fake ERP (no auth needed)
  getFakeStudents: () => request("/fake-erp/students"),
  getFakeAttendance: () => request("/fake-erp/attendance"),
  getFakeInternalMarks: () => request("/fake-erp/internal-marks"),
  getFakeSemesterResults: () => request("/fake-erp/semester-results"),
  getFakeSubjects: () => request("/fake-erp/subjects"),
  getFakeDepartments: () => request("/fake-erp/departments"),
  getFakeClassAdvisors: () => request("/fake-erp/class-advisors"),

  // ── Sync
  triggerSync: () => request("/erp/sync", { method: "POST" }),

  // ── Dashboard
  getDashboard: () => request("/erp/dashboard"),

  // ── Academic Records
  getAcademicRecords: (params: {
    page?: number;
    limit?: number;
    search?: string;
    dept?: string;
    risk?: string;
  } = {}) => {
    const q = new URLSearchParams();
    if (params.page) q.set("page", String(params.page));
    if (params.limit) q.set("limit", String(params.limit));
    if (params.search) q.set("search", params.search);
    if (params.dept) q.set("dept", params.dept);
    if (params.risk) q.set("risk", params.risk);
    return request(`/erp/academic-records?${q.toString()}`);
  },

  // ── Attendance
  getAttendanceRecords: (params: { page?: number; limit?: number; search?: string } = {}) => {
    const q = new URLSearchParams();
    if (params.page) q.set("page", String(params.page));
    if (params.limit) q.set("limit", String(params.limit));
    if (params.search) q.set("search", params.search);
    return request(`/erp/attendance-records?${q.toString()}`);
  },

  // ── Internal Marks
  getInternalMarks: (params: { page?: number; limit?: number; search?: string; risk?: string } = {}) => {
    const q = new URLSearchParams();
    if (params.page) q.set("page", String(params.page));
    if (params.limit) q.set("limit", String(params.limit));
    if (params.search) q.set("search", params.search);
    if (params.risk) q.set("risk", params.risk);
    return request(`/erp/internal-marks?${q.toString()}`);
  },

  // ── Semester Results
  getSemesterResults: (params: { page?: number; limit?: number; semester?: number } = {}) => {
    const q = new URLSearchParams();
    if (params.page) q.set("page", String(params.page));
    if (params.limit) q.set("limit", String(params.limit));
    if (params.semester) q.set("semester", String(params.semester));
    return request(`/erp/semester-results?${q.toString()}`);
  },

  // ── AI Analytics for one student
  getStudentAnalytics: (studentId: string) => request(`/erp/analytics/${studentId}`),

  // ── Reports
  getAcademicReports: (params: { page?: number; limit?: number; search?: string; category?: string } = {}) => {
    const q = new URLSearchParams();
    if (params.page) q.set("page", String(params.page));
    if (params.limit) q.set("limit", String(params.limit));
    if (params.search) q.set("search", params.search);
    if (params.category) q.set("category", params.category);
    return request(`/erp/reports?${q.toString()}`);
  },

  // ── Sync Logs
  getSyncLogs: () => request("/erp/sync-logs"),
};
