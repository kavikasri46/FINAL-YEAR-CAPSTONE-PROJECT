import { mockNotifications } from "@/lib/mockData";
import { Bell, AlertTriangle, Info, CheckCircle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

const typeConfig = {
  alert: { icon: AlertTriangle, bg: "bg-destructive/5 border-destructive/20", iconColor: "text-destructive" },
  warning: { icon: AlertCircle, bg: "bg-warning/5 border-warning/20", iconColor: "text-warning" },
  success: { icon: CheckCircle, bg: "bg-success/5 border-success/20", iconColor: "text-success" },
  info: { icon: Info, bg: "bg-primary/5 border-primary/20", iconColor: "text-primary" },
};

export default function Notifications() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Notifications</h1>
        <p className="text-muted-foreground text-sm">All alerts, warnings, and updates</p>
      </div>

      <div className="space-y-3 max-w-2xl">
        {mockNotifications.map((n, i) => {
          const config = typeConfig[n.type];
          const Icon = config.icon;
          return (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`p-4 rounded-xl border ${config.bg} flex gap-3 ${!n.read ? "ring-1 ring-primary/20" : ""}`}
            >
              <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${config.iconColor}`} />
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <p className="font-semibold text-sm">{n.title}</p>
                  {!n.read && <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                <p className="text-xs text-muted-foreground mt-2">{new Date(n.timestamp).toLocaleString()}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
