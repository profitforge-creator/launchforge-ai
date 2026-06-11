"use client";

import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, disabled, children, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2";

    const variants = {
      primary:
        "bg-[hsl(213_94%_62%)] text-[hsl(220_13%_8%)] hover:bg-[hsl(213_94%_55%)] active:bg-[hsl(213_94%_50%)] focus-visible:outline-[hsl(213_94%_62%)]",
      secondary:
        "bg-[hsl(220_13%_14%)] text-[hsl(220_9%_88%)] hover:bg-[hsl(220_13%_18%)] border border-[hsl(220_13%_20%)] focus-visible:outline-[hsl(213_94%_62%)]",
      outline:
        "bg-transparent text-[hsl(220_9%_88%)] border border-[hsl(220_13%_22%)] hover:border-[hsl(220_13%_35%)] hover:bg-[hsl(220_13%_12%)] focus-visible:outline-[hsl(213_94%_62%)]",
      ghost:
        "bg-transparent text-[hsl(220_9%_75%)] hover:bg-[hsl(220_13%_14%)] hover:text-[hsl(220_9%_93%)] focus-visible:outline-[hsl(213_94%_62%)]",
      danger:
        "bg-[hsl(0_72%_58%)] text-white hover:bg-[hsl(0_72%_52%)] focus-visible:outline-[hsl(0_72%_58%)]",
    };

    const sizes = {
      sm: "h-7 px-3 text-xs rounded",
      md: "h-8 px-4 text-sm rounded",
      lg: "h-10 px-5 text-sm rounded-md",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading && (
          <svg
            className="w-3.5 h-3.5 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };
