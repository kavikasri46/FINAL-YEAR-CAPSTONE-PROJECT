import { BookOpen, Clock, AlertTriangle, MessageSquare } from "lucide-react";
import { StatsCard } from "@/components/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RiskBadge } from "@/components/RiskBadge";
import { mockPerformance, mockNotifications } from "@/lib/mockData";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { motion } from "framer-motion";

export default function ParentDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Parent Dashboard</h1>
          <p className="text-muted-foreground text-sm">Monitor your child's academic progress</p>
        </div>
        <RiskBadge level="high" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Child's GPA" value="2.1" icon={BookOpen} variant="danger" trend={{ value: 8, positive: false }} />
        <StatsCard title="Attendance" value="62%" icon={Clock} variant="warning" />
        <StatsCard title="Risk Level" value="High" icon={AlertTriangle} variant="danger" subtitle="Score: 87/100" />
        <StatsCard title="Mentor Sessions" value="2" icon={MessageSquare} variant="primary" subtitle="This month" />
      </div>

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
            <CardTitle className="text-sm font-semibold">Alerts & Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockNotifications.filter(n => n.recipientRole === "parent" || n.type === "alert").slice(0, 4).map((n, i) => (
              <motion.div key={n.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.1 }}
                className={`p-3 rounded-lg border text-sm ${
                  n.type === "alert" ? "bg-destructive/5 border-destructive/20" : "bg-warning/5 border-warning/20"
                }`}>
                <p className="font-medium text-xs">{n.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{new Date(n.timestamp).toLocaleString()}</p>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
