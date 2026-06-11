import { cn } from "@/lib/utils";
import { type HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "raised" | "outlined";
  padding?: "none" | "sm" | "md" | "lg";
}

function Card({ className, variant = "default", padding = "md", children, ...props }: CardProps) {
  const variants = {
    default: "bg-[hsl(220_13%_11%)] border border-[hsl(220_13%_18%)]",
    raised: "bg-[hsl(220_13%_14%)] border border-[hsl(220_13%_20%)]",
    outlined: "bg-transparent border border-[hsl(220_13%_18%)]",
  };
  const paddings = {
    none: "",
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  };
  return (
    <div
      className={cn("rounded-lg", variants[variant], paddings[padding], className)}
      {...props}
    >
      {children}
    </div>
  );
}

function CardHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex items-center justify-between mb-4", className)} {...props}>
      {children}
    </div>
  );
}

function CardTitle({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("text-sm font-semibold text-[hsl(220_9%_88%)]", className)} {...props}>
      {children}
    </h3>
  );
}

function CardDescription({ className, children, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-xs text-[hsl(220_9%_50%)]", className)} {...props}>
      {children}
    </p>
  );
}

function CardContent({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn(className)} {...props}>
      {children}
    </div>
  );
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent };
