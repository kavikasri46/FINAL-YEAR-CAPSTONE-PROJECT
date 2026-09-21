import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, CheckCircle, AlertCircle, Clock, Database, Users, Activity, BarChart3, FileText, Cpu } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { erpApi } from "@/services/erpApi";
import { toast } from "@/hooks/use-toast";

interface SyncStep {
  id: string;
  label: string;
  icon: any;
  pct: number;
}

const STEPS: SyncStep[] = [
  { id: "connect",   label: "Connecting to ERP...",        icon: Database,   pct: 5  },
  { id: "students",  label: "Fetching Students...",         icon: Users,      pct: 15 },
  { id: "attend",    label: "Fetching Attendance...",       icon: Activity,   pct: 30 },
  { id: "marks",     label: "Fetching Internal Marks...",   icon: BarChart3,  pct: 50 },
  { id: "results",   label: "Fetching Results...",          icon: FileText,   pct: 65 },
  { id: "calc",      label: "Calculating Statistics...",    icon: Cpu,        pct: 78 },
  { id: "save",      label: "Saving into MongoDB...",       icon: Database,   pct: 88 },
  { id: "reports",   label: "Generating Reports...",        icon: FileText,   pct: 94 },
  { id: "predict",   label: "Prediction Updated...",        icon: Cpu,        pct: 98 },
  { id: "done",      label: "Completed ✓",                 icon: CheckCircle,pct: 100},
];

type SyncStatus = "idle" | "running" | "done" | "error";

interface SyncResult {
  studentsAdded: number;
  studentsUpdated: number;
  attendanceRecords: number;
  marksRecords: number;
  resultsRecords: number;
  reportsGenerated: number;
  duration: string;
  lastSyncTime: string;
}

export default function SyncERP() {
  const [status, setStatus] = useState<SyncStatus>("idle");
  const [currentStep, setCurrentStep] = useState(-1);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<SyncResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const cancelRef = useRef(false);

  const runSync = async () => {
    cancelRef.current = false;
    setStatus("running");
    setCurrentStep(0);
    setProgress(0);
    setResult(null);
    setError(null);

    toast({ title: "ERP Sync Started", description: "Connecting to ERP server..." });

    // Animate steps with delays
    for (let i = 0; i < STEPS.length - 1; i++) {
      if (cancelRef.current) break;
      setCurrentStep(i);
      setProgress(STEPS[i].pct);
      await new Promise((r) => setTimeout(r, 600 + Math.random() * 400));
    }

    try {
      const res = await erpApi.triggerSync();
      setCurrentStep(STEPS.length - 1);
      setProgress(100);
      setResult(res);
      setStatus("done");
      toast({ title: "ERP Sync Successful ✓", description: `${res.studentsAdded + res.studentsUpdated} students processed.` });
    } catch (err: any) {
      setError(err.message || "Sync failed. Please check your server connection.");
      setStatus("error");
      toast({ title: "Sync Failed", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-gradient">Sync ERP</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Fetch data from the College ERP, calculate performance metrics, and update predictions.
        </p>
      </div>

      {/* Main Sync Card */}
      <Card className="glass-card border-border/50 overflow-hidden">
        <CardContent className="p-8">
          {/* Sync Button */}
          <div className="flex flex-col items-center gap-6">
            <motion.button
              id="erp-sync-btn"
              onClick={runSync}
              disabled={status === "running"}
              whileTap={{ scale: 0.97 }}
              className="relative w-48 h-48 rounded-full flex flex-col items-center justify-center gap-3 font-bold text-white text-lg shadow-2xl transition-all"
              style={{
                background: status === "running"
                  ? "linear-gradient(135deg,#4c1d95,#7c3aed)"
                  : "linear-gradient(135deg,#8b5cf6,#f43f5e)",
                boxShadow: status === "running"
                  ? "0 0 40px rgba(139,92,246,0.5)"
                  : "0 0 60px rgba(139,92,246,0.6), 0 0 100px rgba(244,63,94,0.3)",
              }}
            >
              {status === "running" ? (
                <RefreshCw className="h-10 w-10 animate-spin" />
              ) : status === "done" ? (
                <CheckCircle className="h-10 w-10" />
              ) : status === "error" ? (
                <AlertCircle className="h-10 w-10" />
              ) : (
                <RefreshCw className="h-10 w-10" />
              )}
              <span className="text-base font-semibold">
                {status === "running" ? "Syncing..." : status === "done" ? "Sync Done!" : status === "error" ? "Retry Sync" : "Sync ERP"}
              </span>
              {/* Animated ring */}
              {status === "running" && (
                <motion.div
                  className="absolute inset-0 rounded-full border-4 border-purple-300/30"
                  animate={{ scale: [1, 1.12, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </motion.button>

            {/* Progress Bar */}
            {(status === "running" || status === "done") && (
              <div className="w-full space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Progress</span>
                  <span className="font-bold text-primary">{progress}%</span>
                </div>
                <div className="h-3 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: "linear-gradient(90deg,#8b5cf6,#f43f5e)" }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Step Tracker */}
          {(status === "running" || status === "done") && (
            <div className="mt-8 space-y-2">
              {STEPS.map((step, i) => {
                const isActive = i === currentStep;
                const isDone = i < currentStep || (status === "done" && i <= currentStep);
                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: isDone || isActive ? 1 : 0.3, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`flex items-center gap-3 p-3 rounded-lg text-sm transition-all ${
                      isActive ? "bg-primary/10 border border-primary/30" : isDone ? "bg-white/3" : ""
                    }`}
                  >
                    <div
                      className="h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        background: isDone
                          ? "linear-gradient(135deg,#10b981,#059669)"
                          : isActive
                          ? "linear-gradient(135deg,#8b5cf6,#f43f5e)"
                          : "rgba(255,255,255,0.05)",
                      }}
                    >
                      {isDone ? (
                        <CheckCircle className="h-4 w-4 text-white" />
                      ) : (
                        <step.icon className={`h-4 w-4 ${isActive ? "text-white animate-pulse" : "text-muted-foreground"}`} />
                      )}
                    </div>
                    <span className={isDone ? "text-green-400" : isActive ? "text-white font-medium" : "text-muted-foreground"}>
                      {step.label}
                    </span>
                    {isActive && (
                      <span className="ml-auto text-xs text-primary animate-pulse">{step.pct}%</span>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Error */}
          {status === "error" && error && (
            <div className="mt-6 p-4 rounded-xl border border-red-500/30 bg-red-500/10 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-400">Sync Failed</p>
                <p className="text-xs text-muted-foreground mt-1">{error}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Make sure the backend server is running on port 5001.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Success Summary */}
      <AnimatePresence>
        {status === "done" && result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <Card className="glass-card border-green-500/30 overflow-hidden">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-green-400">ERP Sync Successful</h3>
                    <p className="text-xs text-muted-foreground">
                      Last Sync: {new Date(result.lastSyncTime).toLocaleString()}
                    </p>
                  </div>
                  <div className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    {result.duration}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { label: "Students Added", value: result.studentsAdded, color: "#8b5cf6" },
                    { label: "Students Updated", value: result.studentsUpdated, color: "#3b82f6" },
                    { label: "Attendance Records", value: result.attendanceRecords, color: "#10b981" },
                    { label: "Marks Records", value: result.marksRecords, color: "#f59e0b" },
                    { label: "Semester Results", value: result.resultsRecords, color: "#06b6d4" },
                    { label: "Reports Generated", value: result.reportsGenerated, color: "#f43f5e" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-xl p-3 text-center"
                      style={{ background: `${item.color}12`, border: `1px solid ${item.color}25` }}
                    >
                      <p className="text-xl font-bold font-display" style={{ color: item.color }}>
                        {item.value.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{item.label}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info */}
      {status === "idle" && (
        <Card className="glass-card border-border/50">
          <CardContent className="p-5 space-y-3">
            <h3 className="text-sm font-semibold">What happens during sync?</h3>
            <div className="space-y-2">
              {[
                "Connects to the College ERP system",
                "Fetches 200+ student profiles with attendance, marks, and results",
                "Auto-calculates attendance %, internal %, GPA, CGPA",
                "Applies risk rules: mark≤40→High, mark≤60→Medium, mark≤70→Low",
                "Generates AI academic analytics and dropout risk features",
                "Saves all data into MongoDB (upsert — no duplicates)",
                "Updates the dropout prediction model inputs",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
