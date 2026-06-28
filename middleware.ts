import { NextRequest, NextResponse } from "next/server";

// ── Diagnostic-route protection ───────────────────────────────────────────────
// /api/env-check and /api/readiness reveal which env vars are set.
// In production, only allow requests that carry the internal secret header,
// or block entirely when the secret isn't configured.

const INTERNAL_SECRET = process.env.INTERNAL_DIAGNOSTIC_SECRET ?? "";

function isDiagnosticRoute(pathname: string): boolean {
  return pathname === "/api/env-check" || pathname === "/api/readiness";
}

function isDiagnosticAllowed(req: NextRequest): boolean {
  // Always open in development.
  if (process.env.NODE_ENV !== "production") return true;
  // In production, require the secret header if the secret is configured.
  if (!INTERNAL_SECRET) return false; // no secret = route disabled in prod
  return req.headers.get("x-internal-secret") === INTERNAL_SECRET;
}

// ── In-memory rate limiter (per IP, sliding window) ──────────────────────────
// Runs in the Node.js middleware process.  Not suitable for multi-instance
// deployments — swap for Upstash Redis when you scale past one Vercel region.

interface Window {
  count: number;
  resetAt: number;
}

const windows = new Map<string, Window>();

const RATE_LIMIT_RULES: Array<{ pattern: RegExp; limit: number; windowMs: number }> = [
  // Auth endpoints: 10 req / 60 s per IP
  { pattern: /^\/api\/auth\//,     limit: 10,  windowMs: 60_000 },
  // Sign-in / sign-up form actions also hit /login and /signup server actions
  { pattern: /^\/(login|signup)$/, limit: 10,  windowMs: 60_000 },
  // Default API rate limit: 120 req / 60 s per IP
  { pattern: /^\/api\//,           limit: 120, windowMs: 60_000 },
];

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

function checkRateLimit(
  ip: string,
  pathname: string
): { allowed: boolean; limit: number; remaining: number; reset: number } | null {
  const rule = RATE_LIMIT_RULES.find((r) => r.pattern.test(pathname));
  if (!rule) return null;

  const key = `${ip}:${rule.pattern.source}`;
  const now = Date.now();

  let win = windows.get(key);
  if (!win || now >= win.resetAt) {
    win = { count: 0, resetAt: now + rule.windowMs };
    windows.set(key, win);
  }

  win.count += 1;

  // Periodic cleanup: every 1000 requests wipe expired entries so the Map
  // doesn't grow unbounded on long-running instances.
  if (windows.size > 5_000) {
    for (const [k, w] of windows) {
      if (now >= w.resetAt) windows.delete(k);
    }
  }

  return {
    allowed: win.count <= rule.limit,
    limit: rule.limit,
    remaining: Math.max(0, rule.limit - win.count),
    reset: Math.ceil(win.resetAt / 1000),
  };
}

// ── Middleware ────────────────────────────────────────────────────────────────

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Block diagnostic routes in production without the secret.
  if (isDiagnosticRoute(pathname) && !isDiagnosticAllowed(req)) {
    return new NextResponse(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 2. Rate limiting.
  const ip = getClientIp(req);
  const rl = checkRateLimit(ip, pathname);
  if (rl && !rl.allowed) {
    return new NextResponse(JSON.stringify({ error: "Too many requests" }), {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(rl.reset - Math.floor(Date.now() / 1000)),
        "X-RateLimit-Limit": String(rl.limit),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": String(rl.reset),
      },
    });
  }

  // 3. Continue — security headers are added via next.config.ts headers().
  const res = NextResponse.next();

  // Attach rate-limit info headers even on allowed requests.
  if (rl) {
    res.headers.set("X-RateLimit-Limit",     String(rl.limit));
    res.headers.set("X-RateLimit-Remaining", String(rl.remaining));
    res.headers.set("X-RateLimit-Reset",     String(rl.reset));
  }

  return res;
}

export const config = {
  matcher: [
    // Match all paths except static assets and Next.js internals.
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
