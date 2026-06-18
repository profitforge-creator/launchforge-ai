import type { ReactNode } from "react";

export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "hsl(220 14% 7%)" }}>
      {children}
    </div>
  );
}
