interface CircularProgressProps {
  value: number; // 0–100
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  label?: string;
  sublabel?: string;
}

export function CircularProgress({
  value,
  size = 120,
  strokeWidth = 10,
  color = "hsl(285,80%,60%)",
  trackColor = "rgba(255,255,255,0.06)",
  label,
  sublabel,
}: CircularProgressProps) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (Math.min(100, Math.max(0, value)) / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.8s cubic-bezier(0.4,0,0.2,1)" }}
        />
      </svg>
      <div
        className="flex flex-col items-center gap-0.5"
        style={{ marginTop: -(size / 2 + 16) }}
      >
        <span className="text-xl font-bold text-white" style={{ fontFamily: "Space Grotesk, Inter, sans-serif" }}>
          {value.toFixed(1)}%
        </span>
        {label && <span className="text-[11px] text-white/60">{label}</span>}
        {sublabel && <span className="text-[10px] text-white/40">{sublabel}</span>}
      </div>
    </div>
  );
}
