import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, ArrowRight } from "lucide-react";
import { UserRole } from "@/lib/types";
import { motion } from "framer-motion";

export default function Auth() {
  const { login, isAuthenticated, switchRole } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (isAuthenticated) return <Navigate to="/" />;

  const quickLogin = (role: UserRole) => {
    switchRole(role);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-16 text-primary-foreground">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex items-center gap-3 mb-8">
              <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <Shield className="h-7 w-7" />
              </div>
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

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-display font-bold">EduGuard</h1>
          </div>

          <h3 className="text-2xl font-display font-bold mb-2">Sign in to your account</h3>
          <p className="text-muted-foreground mb-8">Enter your credentials or use a demo account below</p>

          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" placeholder="admin@school.edu" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <Button type="submit" className="w-full gap-2">
              Sign In <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Quick Demo Access</span></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {([
              { role: "admin" as UserRole, label: "Admin", desc: "Full access" },
              { role: "student" as UserRole, label: "Student", desc: "View grades" },
              { role: "mentor" as UserRole, label: "Mentor", desc: "Guide students" },
              { role: "parent" as UserRole, label: "Parent", desc: "Monitor child" },
            ]).map(({ role, label, desc }) => (
              <button
                key={role}
                onClick={() => quickLogin(role)}
                className="p-3 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-left group"
              >
                <p className="text-sm font-semibold group-hover:text-primary">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
} 