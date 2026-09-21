import { BookOpen, Clock, AlertTriangle, MessageSquare, Bell, XCircle, CheckCircle2 } from "lucide-react";
import { StatsCard } from "@/components/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RiskBadge } from "@/components/RiskBadge";
import { mockPerformance } from "@/lib/mockData";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface ParentAlert {
  id: string;
  studentName: string;
  riskScore: number;
  reason: string;
  timestamp: string;
  read: boolean;
}

export default function ParentDashboard() {
  const [alerts, setAlerts] = useState<ParentAlert[]>([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("parentAlerts") || "[]");
    setAlerts(stored);
  }, []);

  const dismissAlert = (id: string) => {
    const updated = alerts.map((a) => (a.id === id ? { ...a, read: true } : a));
    setAlerts(updated);
    localStorage.setItem("parentAlerts", JSON.stringify(updated));
  };

  const unreadAlerts = alerts.filter((a) => !a.read);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Parent Dashboard</h1>
          <p className="text-muted-foreground text-sm">Monitor your child's academic progress</p>
        </div>
        <RiskBadge level={unreadAlerts.length > 0 ? "high" : "low"} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Child's GPA" value="2.1" icon={BookOpen} variant={unreadAlerts.length > 0 ? "danger" : "primary"} trend={{ value: 8, positive: false }} />
        <StatsCard title="Attendance" value="62%" icon={Clock} variant="warning" />
        <StatsCard title="Risk Level" value={unreadAlerts.length > 0 ? "Alert!" : "Stable"} icon={AlertTriangle} variant={unreadAlerts.length > 0 ? "danger" : "success"} subtitle={`${unreadAlerts.length} unread alerts`} />
        <StatsCard title="Mentor Sessions" value="2" icon={MessageSquare} variant="primary" subtitle="This month" />
      </div>

      {unreadAlerts.length > 0 && (
        <Card className="border-2 border-red-500/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm text-red-500">
              <Bell className="h-4 w-4" /> Urgent Alerts ({unreadAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {unreadAlerts.map((alert, i) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-4 rounded-lg border border-red-500/20 bg-red-500/5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
                      <p className="font-semibold text-sm">{alert.studentName} - Very High Risk (Score: {alert.riskScore}/100)</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{alert.reason}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{new Date(alert.timestamp).toLocaleString()}</p>
                  </div>
                  <Button size="sm" variant="outline" className="shrink-0 gap-1" onClick={() => dismissAlert(alert.id)}>
                    <CheckCircle2 className="h-3 w-3" /> Dismiss
                  </Button>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="glass-card border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Academic Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={mockPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" domain={[0, 4]} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                <Line type="monotone" dataKey="gpa" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-card border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Alert History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No alerts yet. Your child's progress is being monitored.</p>
            ) : (
              alerts.slice(0, 10).map((alert, i) => (
                <motion.div key={alert.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                  className={`p-3 rounded-lg border text-sm flex items-center gap-3 ${alert.read ? "bg-muted/20 border-border" : "bg-red-500/5 border-red-500/20"}`}>
                  {alert.read ? <XCircle className="h-4 w-4 text-muted-foreground shrink-0" /> : <Bell className="h-4 w-4 text-red-500 shrink-0" />}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-xs">{alert.studentName} - Risk Score: {alert.riskScore}</p>
                    <p className="text-xs text-muted-foreground truncate">{alert.reason}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">{new Date(alert.timestamp).toLocaleDateString()}</span>
                </motion.div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
