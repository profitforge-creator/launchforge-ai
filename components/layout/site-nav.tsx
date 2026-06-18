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
              <path d="M7 1.6L11.5 6H9.7L7 3.7L4.3 6H2.5ZM7 5.6L11.5 10H9.7L7 7.7L4.3 10H2.5Z" fill="hsl(220 13% 8%)" />
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
