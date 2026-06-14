import Link from "next/link";
import { actionResetPassword } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; message?: string }>;
}) {
  const params = await searchParams;
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "hsl(220 13% 8%)" }}>
      <div className="flex items-center justify-between px-6 h-14" style={{ borderBottom: "1px solid hsl(220 13% 13%)" }}>
        <Link href="/" className="flex items-center gap-2">
          <div className="w-6 h-6 rounded flex items-center justify-center" style={{ backgroundColor: "hsl(213 94% 62%)" }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1L12.196 4V10L7 13L1.804 10V4L7 1Z" fill="hsl(220 13% 8%)" />
            </svg>
          </div>
          <span className="text-sm font-semibold" style={{ color: "hsl(220 9% 93%)" }}>LaunchForge</span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight mb-1.5" style={{ color: "hsl(220 9% 93%)" }}>
              Reset your password
            </h1>
            <p className="text-sm" style={{ color: "hsl(220 9% 50%)" }}>
              Enter your email and we&apos;ll send you a reset link.
            </p>
          </div>

          {params?.error && (
            <p className="text-xs mb-4 rounded-lg px-3 py-2" style={{ color: "hsl(0 72% 65%)", backgroundColor: "hsl(0 72% 58% / 0.08)", border: "1px solid hsl(0 72% 58% / 0.2)" }}>
              {params.error}
            </p>
          )}
          {params?.message && (
            <p className="text-xs mb-4 rounded-lg px-3 py-2" style={{ color: "hsl(151 60% 55%)", backgroundColor: "hsl(151 60% 48% / 0.08)", border: "1px solid hsl(151 60% 48% / 0.2)" }}>
              {params.message}
            </p>
          )}

          <form action={actionResetPassword} className="space-y-4">
            <Input name="email" label="Email" type="email" placeholder="you@example.com" autoComplete="email" required />
            <Button className="w-full" size="md" type="submit">Send reset link</Button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/login" className="text-xs" style={{ color: "hsl(213 94% 62%)" }}>
              ← Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
