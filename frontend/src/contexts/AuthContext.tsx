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
          id: res.user.id || res.user._id,
          name: res.user.name,
          email: res.user.email,
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
      // If API gave a direct invalid credentials response, we can also check local fallback
      console.warn("Backend login attempt:", apiErr.message);
    }

    // 2. Check local registered users (case-insensitive & trimmed)
    try {
      const registered = getRegisteredUsers();
      const found = registered.find(
        (u) => u.email.trim().toLowerCase() === cleanEmail && u.password.trim() === cleanPassword
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

    // 1. Try Backend API registration
    try {
      const res = await api.register(cleanName, cleanEmail, cleanPassword, role);
      if (res && res.user) {
        if (res.token) {
          try { localStorage.setItem("token", res.token); } catch {}
        }
      }
    } catch (apiErr: any) {
      console.warn("Backend register notice:", apiErr.message);
      if (apiErr.message && apiErr.message.includes("already registered")) {
        return "An account with this email already exists.";
      }
    }

    // 2. Also save to local storage fallback
    try {
      const registered = getRegisteredUsers();
      if (registered.some((u) => u.email.trim().toLowerCase() === cleanEmail)) {
        return "An account with this email already exists.";
      }
      const newUser: RegisteredUser = {
        id: "u" + Date.now(),
        name: cleanName,
        email: cleanEmail,
        role,
        password: cleanPassword,
      };
      registered.push(newUser);
      try { localStorage.setItem("registeredUsers", JSON.stringify(registered)); } catch {}
      return null;
    } catch {
      return "Unable to save user registration. Please try again.";
    }
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
