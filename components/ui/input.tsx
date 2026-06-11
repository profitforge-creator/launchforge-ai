import { cn } from "@/lib/utils";
import { type InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium text-[hsl(220_9%_75%)]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "h-8 w-full rounded border bg-[hsl(220_13%_11%)] px-3 text-sm text-[hsl(220_9%_93%)]",
            "border-[hsl(220_13%_20%)] placeholder:text-[hsl(220_9%_40%)]",
            "transition-colors duration-150",
            "focus:outline-none focus:border-[hsl(213_94%_62%)] focus:ring-1 focus:ring-[hsl(213_94%_62%/0.2)]",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error && "border-[hsl(0_72%_58%)] focus:border-[hsl(0_72%_58%)]",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-[hsl(0_72%_58%)]">{error}</p>}
        {hint && !error && <p className="text-xs text-[hsl(220_9%_45%)]">{hint}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
