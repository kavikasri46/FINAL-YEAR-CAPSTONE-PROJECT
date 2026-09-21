import { createContext, useContext, useState, ReactNode } from "react";
import { UserRole } from "@/lib/types";

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
    // Check registered users first
    try {
      const registered = getRegisteredUsers();
      const found = registered.find((u) => u.email === email && u.password === password);
      if (found) {
        const u: AuthUser = { id: found.id, name: found.name, email: found.email, role: found.role };
        setUser(u);
        try { localStorage.setItem("user", JSON.stringify(u)); } catch {}
        return null;
      }
    } catch {}

    // Check demo users (allow login without password for demos)
    const demo = Object.values(demoUsers).find((u) => u.email === email);
    if (demo) {
      setUser(demo);
      try { localStorage.setItem("user", JSON.stringify(demo)); } catch {}
      return null;
    }
    return "Invalid email or password.";
  };

  const register = async (name: string, email: string, password: string, role: UserRole): Promise<string | null> => {
    try {
      const registered = getRegisteredUsers();
      if (registered.find((u) => u.email === email)) {
        return "An account with this email already exists.";
      }
      const newUser: RegisteredUser = {
        id: "u" + Date.now(),
        name,
        email,
        role,
        password,
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
    try { localStorage.removeItem("user"); } catch {}
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
