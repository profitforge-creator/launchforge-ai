"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { MOCK_USER } from "@/lib/mock-data";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/history", label: "History" },
  { href: "/dashboard/account", label: "Account" },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <header className="h-12 border-b border-[hsl(220_13%_15%)] bg-[hsl(220_13%_8%)] flex items-center px-6 sticky top-0 z-40">
      <div className="flex items-center gap-8 w-full max-w-6xl mx-auto">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
          <div className="w-6 h-6 bg-[hsl(213_94%_62%)] rounded flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1L12.196 4V10L7 13L1.804 10V4L7 1Z" fill="hsl(220 13% 8%)" strokeWidth="0"/>
            </svg>
          </div>
          <span className="text-sm font-semibold text-[hsl(220_9%_93%)] tracking-tight">
            LaunchForge
          </span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "h-7 px-3 rounded text-sm transition-colors duration-150",
                  "flex items-center",
                  isActive
                    ? "bg-[hsl(220_13%_16%)] text-[hsl(220_9%_93%)]"
                    : "text-[hsl(220_9%_55%)] hover:text-[hsl(220_9%_80%)] hover:bg-[hsl(220_13%_13%)]"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs text-[hsl(220_9%_45%)]">
            {MOCK_USER.generationsUsed}/{MOCK_USER.generationsLimit} generations
          </span>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[hsl(213_94%_62%/0.2)] border border-[hsl(213_94%_62%/0.3)] flex items-center justify-center">
              <span className="text-2xs font-semibold text-[hsl(213_94%_65%)]">
                {MOCK_USER.name.charAt(0)}
              </span>
            </div>
            <span className="text-xs text-[hsl(220_9%_65%)]">{MOCK_USER.name}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
