import Link from "next/link";
import { actionSignInWithGoogle, actionSignUp } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default async function SignUpPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
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
        <p className="text-xs" style={{ color: "hsl(220 9% 50%)" }}>
          Have an account?{" "}
          <Link href="/login" className="font-medium" style={{ color: "hsl(213 94% 62%)" }}>Sign in</Link>
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight mb-1.5" style={{ color: "hsl(220 9% 93%)" }}>
              Create your account
            </h1>
            <p className="text-sm" style={{ color: "hsl(220 9% 50%)" }}>
              Start with 3 free business generations.
            </p>
          </div>

          {/* AI INTEGRATION POINT: Wire to Supabase Auth signInWithOAuth */}
          <form action={actionSignInWithGoogle}>
          <button
            type="submit"
            className="w-full h-9 rounded flex items-center justify-center gap-2.5 text-sm font-medium transition-colors mb-6"
            style={{ border: "1px solid hsl(220 13% 22%)", backgroundColor: "hsl(220 13% 13%)", color: "hsl(220 9% 80%)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>
          </form>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px" style={{ backgroundColor: "hsl(220 13% 17%)" }} />
            <span className="text-xs" style={{ color: "hsl(220 9% 40%)" }}>or</span>
            <div className="flex-1 h-px" style={{ backgroundColor: "hsl(220 13% 17%)" }} />
          </div>

          {params?.error && (
            <p className="text-xs mb-4 rounded-lg px-3 py-2" style={{ color: "hsl(0 72% 65%)", backgroundColor: "hsl(0 72% 58% / 0.08)", border: "1px solid hsl(0 72% 58% / 0.2)" }}>
              {params.error}
            </p>
          )}

          <form action={actionSignUp} className="space-y-4">
            <Input name="full_name" label="Full name" type="text" placeholder="Alex Morgan" autoComplete="name" />
            <Input name="email" label="Email" type="email" placeholder="you@example.com" autoComplete="email" required />
            <Input name="password" label="Password" type="password" placeholder="At least 8 characters" autoComplete="new-password" required />

            <Button className="w-full mt-2" size="md" type="submit">
              Create account
            </Button>
          </form>

          <p className="text-xs text-center mt-6" style={{ color: "hsl(220 9% 40%)" }}>
            By creating an account, you agree to our{" "}
            <Link href="/legal/terms" className="underline" style={{ color: "hsl(220 9% 55%)" }}>Terms</Link>{" "}
            and{" "}
            <Link href="/legal/privacy" className="underline" style={{ color: "hsl(220 9% 55%)" }}>Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
