import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, ArrowRight, UserPlus, LogIn, GraduationCap, Users, Heart, UserCog, AlertCircle } from "lucide-react";
import { UserRole } from "@/lib/types";
import { motion } from "framer-motion";
import loginBg from "@/images/login bacground.webp";
import registerBg from "@/images/registerback.webp";
import collegeLogo from "@/images/kpr logo.jpg";

const roles: { value: UserRole; label: string; icon: typeof GraduationCap; desc: string }[] = [
  { value: "student", label: "Student", icon: GraduationCap, desc: "Track your performance" },
  { value: "mentor", label: "Mentor", icon: Users, desc: "Guide and monitor students" },
  { value: "parent", label: "Parent", icon: Heart, desc: "Monitor your child" },
];

export default function Auth() {
  const { login, register, isAuthenticated, switchRole } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("student");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) return <Navigate to="/" />;

  const quickLogin = (role: UserRole) => switchRole(role);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      if (mode === "register") {
        if (!name.trim()) { setError("Name is required."); setSubmitting(false); return; }
        if (password.length < 6) { setError("Password must be at least 6 characters."); setSubmitting(false); return; }
        if (password !== confirmPassword) { setError("Passwords do not match."); setSubmitting(false); return; }
        const err = await register(name, email, password, selectedRole);
        if (err) setError(err);
      } else {
        const err = await login(email, password);
        if (err) setError(err);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src={mode === "login" ? loginBg : registerBg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent" />
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex items-center gap-3 mb-8">
              <img src={collegeLogo} alt="KPR College" className="h-14 w-14 rounded-xl object-cover ring-2 ring-white/20" />
              <div>
                <h1 className="text-2xl font-display font-bold">EduGuard</h1>
                <p className="text-xs opacity-70 uppercase tracking-wider">Dropout Prevention System</p>
              </div>
            </div>
            <h2 className="text-4xl font-display font-bold leading-tight mb-4">
              Predict. Prevent.<br />Protect futures.
            </h2>
            <p className="text-lg opacity-80 max-w-md">
              AI-powered early warning system that identifies at-risk students before it's too late.
            </p>
            <div className="mt-12 grid grid-cols-3 gap-6">
              {[
                { label: "Students Monitored", value: "2,400+" },
                { label: "Dropouts Prevented", value: "340" },
                { label: "Prediction Accuracy", value: "94%" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-2xl font-display font-bold">{stat.value}</p>
                  <p className="text-xs opacity-60 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <img src={collegeLogo} alt="KPR" className="h-8 w-8 rounded-full object-cover" />
            <h1 className="text-xl font-display font-bold">EduGuard</h1>
          </div>

          <div className="flex border rounded-lg p-1 mb-6 bg-muted/50">
            <button
              onClick={() => { setMode("login"); setError(""); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${mode === "login" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              <LogIn className="h-4 w-4" /> Sign In
            </button>
            <button
              onClick={() => { setMode("register"); setError(""); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${mode === "register" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              <UserPlus className="h-4 w-4" /> Register
            </button>
          </div>

          <h3 className="text-2xl font-display font-bold mb-2">
            {mode === "login" ? "Welcome back" : "Create an account"}
          </h3>
          <p className="text-muted-foreground mb-6">
            {mode === "login" ? "Enter your credentials to continue" : "Register to get started with EduGuard"}
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            {mode === "register" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" type="text" placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>I am a</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {roles.map(({ value, label, icon: Icon, desc }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setSelectedRole(value)}
                        className={`p-3 rounded-xl border text-center transition-all group ${
                          selectedRole === value
                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <Icon className={`h-5 w-5 mx-auto mb-1 ${selectedRole === value ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`} />
                        <p className={`text-xs font-semibold ${selectedRole === value ? "text-primary" : ""}`}>{label}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@school.edu" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            {mode === "register" && (
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input id="confirm-password" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </div>
            )}
            <Button type="submit" className="w-full gap-2" disabled={submitting}>
              {submitting ? "Please wait..." : (mode === "login" ? <>Sign In <ArrowRight className="h-4 w-4" /></> : <>Create Account <ArrowRight className="h-4 w-4" /></>)}
            </Button>
          </form>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Quick Demo Access</span></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {([
              { role: "admin" as UserRole, label: "Admin", desc: "Full access", icon: UserCog },
              { role: "student" as UserRole, label: "Student", desc: "View grades", icon: GraduationCap },
              { role: "mentor" as UserRole, label: "Mentor", desc: "Guide students", icon: Users },
              { role: "parent" as UserRole, label: "Parent", desc: "Monitor child", icon: Heart },
            ]).map(({ role, label, desc, icon: Icon }) => (
              <button
                key={role}
                onClick={() => quickLogin(role)}
                className="p-3 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-left group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                  <p className="text-sm font-semibold group-hover:text-primary">{label}</p>
                </div>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

