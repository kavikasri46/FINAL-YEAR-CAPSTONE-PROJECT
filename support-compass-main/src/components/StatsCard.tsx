import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: number; positive: boolean };
  variant?: "default" | "primary" | "success" | "warning" | "danger";
  className?: string;
}

const variantStyles = {
  default: "glass-card",
  primary: "gradient-primary text-primary-foreground",
  success: "gradient-success text-success-foreground",
  warning: "gradient-warning text-warning-foreground",
  danger: "gradient-danger text-destructive-foreground",
};

const iconBgStyles = {
  default: "bg-primary/10 text-primary",
  primary: "bg-white/20 text-white",
  success: "bg-white/20 text-white",
  warning: "bg-white/20 text-white",
  danger: "bg-white/20 text-white",
};

export function StatsCard({ title, value, subtitle, icon: Icon, trend, variant = "default", className }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn("rounded-xl p-5", variantStyles[variant], className)}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className={cn("text-sm font-medium", variant === "default" ? "text-muted-foreground" : "opacity-80")}>{title}</p>
          <p className="text-3xl font-bold font-display">{value}</p>
          {subtitle && (
            <p className={cn("text-xs", variant === "default" ? "text-muted-foreground" : "opacity-70")}>{subtitle}</p>
          )}
          {trend && (
            <p className={cn("text-xs font-medium", trend.positive ? "text-success" : "text-destructive")}>
              {trend.positive ? "↑" : "↓"} {Math.abs(trend.value)}% from last month
            </p>
          )}
        </div>
        <div className={cn("p-3 rounded-lg", iconBgStyles[variant])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </motion.div>
  );
}
