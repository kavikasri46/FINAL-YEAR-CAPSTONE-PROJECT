import { cn } from "@/lib/utils";
import { RiskLevel } from "@/lib/types";
import { AlertTriangle, AlertCircle, CheckCircle } from "lucide-react";

const riskConfig: Record<RiskLevel, { label: string; className: string; icon: typeof AlertTriangle }> = {
  high: { label: "High Risk", className: "bg-destructive/10 text-destructive border-destructive/20", icon: AlertTriangle },
  medium: { label: "Medium Risk", className: "bg-warning/10 text-warning border-warning/20", icon: AlertCircle },
  low: { label: "Low Risk", className: "bg-success/10 text-success border-success/20", icon: CheckCircle },
};

export function RiskBadge({ level, showIcon = true }: { level: RiskLevel; showIcon?: boolean }) {
  const config = riskConfig[level];
  const Icon = config.icon;
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border", config.className)}>
      {showIcon && <Icon className="h-3 w-3" />}
      {config.label}
    </span>
  );
}
