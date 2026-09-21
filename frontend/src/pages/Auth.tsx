import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, ArrowRight, UserPlus, LogIn, GraduationCap, Users, Heart, AlertCircle, CheckCircle2 } from "lucide-react";
import { UserRole } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import loginBg from "@/images/login bacground.webp";
import registerBg from "@/images/registerback.webp";
import collegeLogo from "@/images/kpr logo.jpg";

const roles: { value: UserRole; label: string; icon: typeof GraduationCap; desc: string }[] = [
  { value: "admin", label: "Admin", icon: Shield, desc: "Full system access" },
  { value: "student", label: "Student", icon: GraduationCap, desc: "Track your performance" },
  { value: "mentor", label: "Mentor", icon: Users, desc: "Guide and monitor students" },
  { value: "parent", label: "Parent", icon: Heart, desc: "Monitor your child" },
];

export default function Auth() {
  const { login, register, isAuthenticated } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("student");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) return <Navigate to="/" />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setSubmitting(true);

    try {
      if (mode === "register") {
        if (!name.trim()) { setError("Name is required."); setSubmitting(false); return; }
        if (password.length < 6) { setError("Password must be at least 6 characters."); setSubmitting(false); return; }
        if (password !== confirmPassword) { setError("Passwords do not match."); setSubmitting(false); return; }
        const err = await register(name, email, password, selectedRole);
        if (err) {
          setError(err);
        } else {
          setSuccessMsg("Account created successfully! Please sign in.");
          setMode("login");
          setName("");
          setPassword("");
          setConfirmPassword("");
        }
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
    <div className="min-h-screen flex relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-950/40 via-black to-pink-950/30 animate-gradient-shift pointer-events-none" />
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] animate-pulse-glow pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-pink-500/10 rounded-full blur-[100px] animate-float pointer-events-none" />

      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src={mode === "login" ? loginBg : registerBg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-purple-900/30 via-transparent to-transparent" />
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <motion.div
              className="flex items-center gap-3 mb-8"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-purple-500/30 rounded-xl blur-md animate-pulse-glow" />
                <img src={collegeLogo} alt="KPR College" className="h-14 w-14 rounded-xl object-cover ring-2 ring-purple-400/50 relative" />
              </div>
              <div>
                <h1 className="text-2xl font-display font-bold text-gradient">EduGuard</h1>
                <p className="text-xs opacity-70 uppercase tracking-wider">Dropout Prevention System</p>
              </div>
            </motion.div>
            <motion.h2
              className="text-4xl font-display font-bold leading-tight mb-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              Predict. Prevent.<br />Protect futures.
            </motion.h2>
            <motion.p
              className="text-lg opacity-80 max-w-md"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              AI-powered early warning system that identifies at-risk students before it's too late.
            </motion.p>
            <motion.div
              className="mt-12 grid grid-cols-3 gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              {[
                { label: "Students Monitored", value: "2,400+" },
                { label: "Dropouts Prevented", value: "340" },
                { label: "Prediction Accuracy", value: "94%" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  className="text-center"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <p className="text-2xl font-display font-bold text-gradient">{stat.value}</p>
                  <p className="text-xs opacity-60 mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-background relative">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 pointer-events-none" />

        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md relative"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20 rounded-2xl blur-xl animate-pulse-glow pointer-events-none" />
          <div className="relative bg-card border border-purple-500/20 rounded-2xl p-8 backdrop-blur-sm">
            <div className="lg:hidden flex items-center gap-2 mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-purple-500/30 rounded-full blur-sm" />
                <img src={collegeLogo} alt="KPR" className="h-8 w-8 rounded-full object-cover relative" />
              </div>
              <h1 className="text-xl font-display font-bold text-gradient">EduGuard</h1>
            </div>

            <div className="flex border rounded-lg p-1 mb-6 bg-muted/50 relative">
              <div
                className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-background rounded-md shadow-sm transition-transform duration-300 ${mode === "register" ? "translate-x-[calc(100%+4px)]" : "translate-x-0"}`}
              />
              <button
                onClick={() => { setMode("login"); setError(""); setSuccessMsg(""); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all relative z-10 ${mode === "login" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                <LogIn className="h-4 w-4" /> Sign In
              </button>
              <button
                onClick={() => { setMode("register"); setError(""); setSuccessMsg(""); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all relative z-10 ${mode === "register" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                <UserPlus className="h-4 w-4" /> Register
              </button>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, x: mode === "login" ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: mode === "login" ? 20 : -20 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-2xl font-display font-bold mb-2">
                  {mode === "login" ? "Welcome back" : "Create an account"}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {mode === "login" ? "Enter your credentials to continue" : "Register to get started with EduGuard"}
                </p>
              </motion.div>
            </AnimatePresence>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-950/50 border border-red-500/30 text-red-300 text-sm rounded-lg p-3 mb-4 flex items-center gap-2"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </motion.div>
            )}

            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-950/50 border border-green-500/30 text-green-300 text-sm rounded-lg p-3 mb-4 flex items-center gap-2"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                {successMsg}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 mb-6">
              <AnimatePresence mode="wait">
                {mode === "register" && (
                  <motion.div
                    key="register-fields"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4 overflow-hidden"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" type="text" placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} className="neon-outline focus:animate-border-glow" />
                    </div>
                    <div className="space-y-2">
                      <Label>I am a</Label>
                      <div className="grid grid-cols-4 gap-2">
                        {roles.map(({ value, label, icon: Icon, desc }) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setSelectedRole(value)}
                            className={`p-3 rounded-xl border text-center transition-all duration-300 group ${
                              selectedRole === value
                                ? "border-purple-500 bg-purple-500/10 ring-1 ring-purple-500 shadow-lg shadow-purple-500/20"
                                : "border-border hover:border-purple-500/50 hover:bg-purple-500/5"
                            }`}
                          >
                            <Icon className={`h-5 w-5 mx-auto mb-1 ${selectedRole === value ? "text-purple-400" : "text-muted-foreground group-hover:text-purple-400"}`} />
                            <p className={`text-xs font-semibold ${selectedRole === value ? "text-purple-400" : ""}`}>{label}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@school.edu" value={email} onChange={(e) => setEmail(e.target.value)} className="neon-outline focus:animate-border-glow" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="neon-outline focus:animate-border-glow" />
              </div>

              <AnimatePresence mode="wait">
                {mode === "register" && (
                  <motion.div
                    key="confirm-password"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-2 overflow-hidden"
                  >
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input id="confirm-password" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="neon-outline focus:animate-border-glow" />
                  </motion.div>
                )}
              </AnimatePresence>

              <Button
                type="submit"
                className="w-full gap-2 gradient-primary hover:opacity-90 transition-all duration-300 animate-pulse-glow"
                disabled={submitting}
              >
                {submitting ? "Please wait..." : (mode === "login" ? <>Sign In <ArrowRight className="h-4 w-4" /></> : <>Create Account <ArrowRight className="h-4 w-4" /></>)}
              </Button>
            </form>

          </div>
        </motion.div>
      </div>
    </div>
  );
}
