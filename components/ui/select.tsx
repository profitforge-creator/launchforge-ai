import { cn } from "@/lib/utils";
import { type SelectHTMLAttributes, forwardRef } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-xs font-medium text-[hsl(220_9%_75%)]">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              "h-8 w-full appearance-none rounded border bg-[hsl(220_13%_11%)] px-3 pr-8 text-sm text-[hsl(220_9%_93%)]",
              "border-[hsl(220_13%_20%)]",
              "transition-colors duration-150",
              "focus:outline-none focus:border-[hsl(213_94%_62%)] focus:ring-1 focus:ring-[hsl(213_94%_62%/0.2)]",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              error && "border-[hsl(0_72%_58%)]",
              className
            )}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-[hsl(220_13%_11%)]">
                {opt.label}
              </option>
            ))}
          </select>
          <svg
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[hsl(220_9%_45%)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        {error && <p className="text-xs text-[hsl(0_72%_58%)]">{error}</p>}
      </div>
    );
  }
);
Select.displayName = "Select";

export { Select };
