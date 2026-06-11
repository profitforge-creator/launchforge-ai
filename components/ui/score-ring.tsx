"use client";

import { cn } from "@/lib/utils";

interface ScoreRingProps {
  score: number;
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
}

export function ScoreRing({ score, size = "md", label, className }: ScoreRingProps) {
  const sizes = {
    sm: { dim: 56, stroke: 4, r: 22, fontSize: "text-sm" },
    md: { dim: 80, stroke: 5, r: 32, fontSize: "text-xl" },
    lg: { dim: 112, stroke: 6, r: 46, fontSize: "text-3xl" },
  };

  const { dim, stroke, r, fontSize } = sizes[size];
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;

  const color =
    score >= 80 ? "hsl(151 60% 48%)" : score >= 60 ? "hsl(38 90% 55%)" : "hsl(0 72% 58%)";

  return (
    <div className={cn("flex flex-col items-center gap-1.5", className)}>
      <div className="relative" style={{ width: dim, height: dim }}>
        <svg width={dim} height={dim} className="-rotate-90">
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={r}
            stroke="hsl(220 13% 18%)"
            strokeWidth={stroke}
            fill="none"
          />
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={r}
            stroke={color}
            strokeWidth={stroke}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.8s ease-out" }}
          />
        </svg>
        <span
          className={cn(
            "absolute inset-0 flex items-center justify-center font-semibold tabular-nums",
            fontSize
          )}
          style={{ color }}
        >
          {score}
        </span>
      </div>
      {label && <span className="text-xs text-[hsl(220_9%_50%)]">{label}</span>}
    </div>
  );
}
