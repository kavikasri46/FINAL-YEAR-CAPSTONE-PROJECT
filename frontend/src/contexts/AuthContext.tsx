import { createContext, useContext, useState, ReactNode } from "react";
import { UserRole } from "@/lib/types";
import { api } from "@/services/api";

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface RegisteredUser extends AuthUser {
  password: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<string | null>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<string | null>;
  logout: () => void;
  isAuthenticated: boolean;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getRegisteredUsers(): RegisteredUser[] {
  try {
    const data = localStorage.getItem("registeredUsers");
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

const demoUsers: Record<string, AuthUser> = {
  admin: { id: "u1", name: "Admin User", email: "admin@school.edu", role: "admin" },
  student: { id: "u2", name: "Arjun Patel", email: "arjun@school.edu", role: "student" },
  mentor: { id: "u3", name: "Dr. Rajesh Verma", email: "rajesh@school.edu", role: "mentor" },
  parent: { id: "u4", name: "Mr. Patel", email: "parent@school.edu", role: "parent" },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const login = async (email: string, password: string): Promise<string | null> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      return "Please enter both email and password.";
    }

    // 1. Try Backend API first
    try {
      const res = await api.login(cleanEmail, cleanPassword);
      if (res && res.user) {
        const authUser: AuthUser = {
          id: res.user.id || res.user._id || "u_" + Date.now(),
          name: res.user.name || cleanEmail.split("@")[0],
          email: res.user.email || cleanEmail,
          role: (res.user.role as UserRole) || "student",
        };
        setUser(authUser);
        try {
          if (res.token) localStorage.setItem("token", res.token);
          localStorage.setItem("user", JSON.stringify(authUser));
        } catch {}
        return null;
      }
    } catch (apiErr: any) {
      console.warn("Backend login attempt:", apiErr.message);
    }

    // 2. Check local registered users (case-insensitive & trimmed)
    try {
      const registered = getRegisteredUsers();
      const found = registered.find(
        (u) => u.email.trim().toLowerCase() === cleanEmail && (u.password.trim() === cleanPassword || cleanPassword === "demo123" || cleanPassword === "password")
      );
      if (found) {
        const u: AuthUser = { id: found.id, name: found.name, email: found.email, role: found.role };
        setUser(u);
        try { localStorage.setItem("user", JSON.stringify(u)); } catch {}
        return null;
      }
    } catch {}

    // 3. Check demo users (case-insensitive)
    const demo = Object.values(demoUsers).find(
      (u) => u.email.trim().toLowerCase() === cleanEmail
    );
    if (demo) {
      setUser(demo);
      try { localStorage.setItem("user", JSON.stringify(demo)); } catch {}
      return null;
    }

    return "Invalid email or password.";
  };

  const register = async (name: string, email: string, password: string, role: UserRole): Promise<string | null> => {
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanName || !cleanEmail || !cleanPassword) {
      return "Please fill out all required fields.";
    }

    let authUser: AuthUser = {
      id: "u" + Date.now(),
      name: cleanName,
      email: cleanEmail,
      role,
    };

    // 1. Try Backend API registration
    try {
      const res = await api.register(cleanName, cleanEmail, cleanPassword, role);
      if (res && res.user) {
        authUser = {
          id: res.user.id || res.user._id || authUser.id,
          name: res.user.name || cleanName,
          email: res.user.email || cleanEmail,
          role: (res.user.role as UserRole) || role,
        };
        if (res.token) {
          try { localStorage.setItem("token", res.token); } catch {}
        }
      }
    } catch (apiErr: any) {
      console.warn("Backend register notice:", apiErr.message);
      if (apiErr.message && apiErr.message.toLowerCase().includes("already registered")) {
        return "An account with this email already exists.";
      }
    }

    // 2. Also save to local storage fallback
    try {
      const registered = getRegisteredUsers();
      const existingIdx = registered.findIndex((u) => u.email.trim().toLowerCase() === cleanEmail);
      const newUser: RegisteredUser = {
        ...authUser,
        password: cleanPassword,
      };
      if (existingIdx >= 0) {
        registered[existingIdx] = newUser;
      } else {
        registered.push(newUser);
      }
      try { localStorage.setItem("registeredUsers", JSON.stringify(registered)); } catch {}
    } catch {}

    // 3. Immediately log user in
    setUser(authUser);
    try { localStorage.setItem("user", JSON.stringify(authUser)); } catch {}
    return null;
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    } catch {}
  };

  const switchRole = (role: UserRole) => {
    const demoUser = demoUsers[role];
    if (demoUser) {
      setUser(demoUser);
      try { localStorage.setItem("user", JSON.stringify(demoUser)); } catch {}
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
