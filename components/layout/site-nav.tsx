"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function SiteNav() {
  return (
    <header className="h-14 border-b border-[hsl(220_13%_13%)] bg-[hsl(220_13%_8%/0.9)] backdrop-blur-sm sticky top-0 z-40">
      <div className="flex items-center h-full max-w-5xl mx-auto px-6 gap-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-6 h-6 bg-[hsl(213_94%_62%)] rounded flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1L12.196 4V10L7 13L1.804 10V4L7 1Z" fill="hsl(220 13% 8%)" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-[hsl(220_9%_93%)] tracking-tight">
            LaunchForge
          </span>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-6">
          {["Features", "How it Works", "Pricing"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
              className="text-sm text-[hsl(220_9%_55%)] hover:text-[hsl(220_9%_80%)] transition-colors"
            >
              {item}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link href="/login">
            <Button variant="ghost" size="sm">Sign in</Button>
          </Link>
          <Link href="/signup">
            <Button size="sm">Get started</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
