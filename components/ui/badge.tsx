import { cn } from "@/lib/utils";
import { type HTMLAttributes } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "accent" | "neutral";
}

function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
  const variants = {
    default: "bg-[hsl(220_13%_17%)] text-[hsl(220_9%_65%)] border border-[hsl(220_13%_22%)]",
    success: "bg-[hsl(151_60%_48%/0.12)] text-[hsl(151_60%_55%)] border border-[hsl(151_60%_48%/0.2)]",
    warning: "bg-[hsl(38_90%_55%/0.12)] text-[hsl(38_90%_60%)] border border-[hsl(38_90%_55%/0.2)]",
    danger: "bg-[hsl(0_72%_58%/0.12)] text-[hsl(0_72%_62%)] border border-[hsl(0_72%_58%/0.2)]",
    accent: "bg-[hsl(213_94%_62%/0.12)] text-[hsl(213_94%_65%)] border border-[hsl(213_94%_62%/0.2)]",
    neutral: "bg-[hsl(220_13%_14%)] text-[hsl(220_9%_60%)] border border-[hsl(220_13%_20%)]",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export { Badge };
