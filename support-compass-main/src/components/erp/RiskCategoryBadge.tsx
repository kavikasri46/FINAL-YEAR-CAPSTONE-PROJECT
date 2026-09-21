interface RiskCategoryBadgeProps {
  category: "Excellent" | "Good" | "Average" | "Poor" | "Critical" | string;
  size?: "sm" | "md" | "lg";
}

const CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  Excellent: { label: "Excellent", color: "#10b981", bg: "rgba(16,185,129,0.12)", dot: "#10b981" },
  Good:      { label: "Good",      color: "#3b82f6", bg: "rgba(59,130,246,0.12)", dot: "#3b82f6" },
  Average:   { label: "Average",   color: "#f59e0b", bg: "rgba(245,158,11,0.12)", dot: "#f59e0b" },
  Poor:      { label: "Poor",      color: "#f97316", bg: "rgba(249,115,22,0.12)", dot: "#f97316" },
  Critical:  { label: "Critical",  color: "#ef4444", bg: "rgba(239,68,68,0.14)",  dot: "#ef4444" },
  // Map old risk levels to categories
  safe:   { label: "Safe",   color: "#10b981", bg: "rgba(16,185,129,0.12)", dot: "#10b981" },
  low:    { label: "Low",    color: "#3b82f6", bg: "rgba(59,130,246,0.12)", dot: "#3b82f6" },
  medium: { label: "Medium", color: "#f59e0b", bg: "rgba(245,158,11,0.12)", dot: "#f59e0b" },
  high:   { label: "High",   color: "#ef4444", bg: "rgba(239,68,68,0.14)",  dot: "#ef4444" },
};

const SIZE_CLS = {
  sm: "text-[10px] px-2 py-0.5 gap-1",
  md: "text-xs px-2.5 py-1 gap-1.5",
  lg: "text-sm px-3 py-1.5 gap-2",
};

export function RiskCategoryBadge({ category, size = "md" }: RiskCategoryBadgeProps) {
  const cfg = CONFIG[category] || CONFIG.Average;
  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold ${SIZE_CLS[size]}`}
      style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.color}30` }}
    >
      <span
        className="rounded-full"
        style={{ width: 6, height: 6, background: cfg.dot, flexShrink: 0 }}
      />
      {cfg.label}
    </span>
  );
}
