import { createContext, useContext, useState, ReactNode } from "react";
import { UserRole } from "@/lib/types";
import { api } from "@/services/api";

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<string | null>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<string | null>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const demoUsers: Record<string, AuthUser> = {
  admin: { id: "u1", name: "Admin User", email: "admin@school.edu", role: "admin" },
  student: { id: "u2", name: "Arjun Patel", email: "arjun@school.edu", role: "student" },
  mentor: { id: "u3", name: "Dr. Rajesh Verma", email: "rajesh@school.edu", role: "mentor" },
  parent: { id: "u4", name: "Mr. Patel", email: "parent@school.edu", role: "parent" },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (email: string, password: string): Promise<string | null> => {
    const demo = Object.values(demoUsers).find((u) => u.email === email);
    if (demo) {
      setUser(demo);
      localStorage.setItem("user", JSON.stringify(demo));
      return null;
    }
    try {
      const data = await api.login(email, password);
      const u: AuthUser = { id: data.user.id, name: data.user.name, email: data.user.email, role: data.user.role };
      setUser(u);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(u));
      return null;
    } catch (err: any) {
      return err.message || "Login failed";
    }
  };

  const register = async (name: string, email: string, password: string, role: UserRole): Promise<string | null> => {
    try {
      const data = await api.register(name, email, password, role);
      const u: AuthUser = { id: data.user.id, name: data.user.name, email: data.user.email, role: data.user.role };
      setUser(u);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(u));
      return null;
    } catch (err: any) {
      return err.message || "Registration failed";
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const switchRole = (role: UserRole) => {
    const u = demoUsers[role];
    setUser(u);
    localStorage.setItem("user", JSON.stringify(u));
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, switchRole, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
