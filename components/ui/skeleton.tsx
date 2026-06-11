import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn("rounded shimmer", className)}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-lg border border-[hsl(220_13%_18%)] bg-[hsl(220_13%_11%)] p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-3 w-2/5" />
          <Skeleton className="h-2.5 w-1/4" />
        </div>
      </div>
      <Skeleton className="h-2.5 w-full" />
      <Skeleton className="h-2.5 w-4/5" />
      <Skeleton className="h-2.5 w-3/5" />
    </div>
  );
}
