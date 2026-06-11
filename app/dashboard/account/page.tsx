import { Badge } from "@/components/ui/badge";
import { MOCK_USER } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";

// AI INTEGRATION POINT: Fetch real user from Supabase session
// AI INTEGRATION POINT: Fetch subscription from Stripe customer portal

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "hsl(220 9% 40%)" }}>{title}</h2>
      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid hsl(220 13% 17%)" }}>
        {children}
      </div>
    </div>
  );
}

function Row({ label, value, action }: { label: string; value: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div
      className="flex items-center justify-between px-5 py-4"
      style={{ borderBottom: "1px solid hsl(220 13% 14%)" }}
    >
      <div className="flex items-center gap-4">
        <span className="text-xs w-28 shrink-0" style={{ color: "hsl(220 9% 45%)" }}>{label}</span>
        <span className="text-sm" style={{ color: "hsl(220 9% 80%)" }}>{value}</span>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

function ActionButton({ label }: { label: string }) {
  return (
    <button
      className="h-7 px-3 rounded text-xs font-medium transition-colors"
      style={{ border: "1px solid hsl(220 13% 22%)", backgroundColor: "transparent", color: "hsl(220 9% 60%)" }}
    >
      {label}
    </button>
  );
}

const planColors: Record<string, string> = {
  free: "neutral",
  pro: "accent",
  team: "success",
};

export default function AccountPage() {
  const planBadge = (planColors[MOCK_USER.plan] ?? "default") as "neutral" | "accent" | "success" | "default";

  return (
    <div className="space-y-8 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold tracking-tight" style={{ color: "hsl(220 9% 93%)" }}>Account</h1>
        <p className="text-sm mt-0.5" style={{ color: "hsl(220 9% 50%)" }}>
          Manage your profile, subscription, and settings.
        </p>
      </div>

      {/* Profile */}
      <Section title="Profile">
        <Row label="Name" value={MOCK_USER.name} action={<ActionButton label="Edit" />} />
        <Row label="Email" value={MOCK_USER.email} action={<ActionButton label="Change" />} />
        <Row label="Password" value="••••••••••••" action={<ActionButton label="Update" />} />
        <div className="px-5 py-4 flex items-center justify-between" style={{ backgroundColor: "hsl(220 13% 10%)" }}>
          <div className="flex items-center gap-4">
            <span className="text-xs w-28 shrink-0" style={{ color: "hsl(220 9% 45%)" }}>Member since</span>
            <span className="text-sm" style={{ color: "hsl(220 9% 80%)" }}>{formatDate(MOCK_USER.joinedAt)}</span>
          </div>
        </div>
      </Section>

      {/* Subscription */}
      <Section title="Subscription">
        <Row
          label="Current plan"
          value={
            <div className="flex items-center gap-2">
              <Badge variant={planBadge}>{MOCK_USER.plan.charAt(0).toUpperCase() + MOCK_USER.plan.slice(1)}</Badge>
              <span style={{ color: "hsl(220 9% 60%)" }}>· Active</span>
            </div>
          }
          action={<ActionButton label="Upgrade" />}
        />
        <Row
          label="Generations"
          value={
            <div className="flex items-center gap-3">
              <span>{MOCK_USER.generationsUsed} used</span>
              <div className="w-24 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "hsl(220 13% 18%)" }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(MOCK_USER.generationsUsed / MOCK_USER.generationsLimit) * 100}%`,
                    backgroundColor: "hsl(213 94% 62%)",
                  }}
                />
              </div>
              <span style={{ color: "hsl(220 9% 45%)" }}>of {MOCK_USER.generationsLimit}</span>
            </div>
          }
        />
        <Row label="Billing cycle" value="Monthly · renews Jul 1, 2026" action={<ActionButton label="Manage" />} />
        {/* AI INTEGRATION POINT: Redirect to Stripe Customer Portal for billing management */}
        <div className="px-5 py-4" style={{ backgroundColor: "hsl(220 13% 10%)" }}>
          <button
            className="text-xs transition-colors"
            style={{ color: "hsl(213 94% 62%)" }}
          >
            Open billing portal →
          </button>
        </div>
      </Section>

      {/* Settings */}
      <Section title="Settings">
        {[
          { label: "Email notifications", value: "Enabled", action: <ActionButton label="Configure" /> },
          { label: "Theme", value: "Dark (default)", action: <ActionButton label="Change" /> },
          { label: "Data export", value: "Export all generations as JSON", action: <ActionButton label="Export" /> },
        ].map((s) => (
          <Row key={s.label} label={s.label} value={s.value} action={s.action} />
        ))}
        <div className="px-5 py-4 flex items-center justify-between" style={{ backgroundColor: "hsl(220 13% 10%)" }}>
          <div className="flex items-center gap-4">
            <span className="text-xs w-28 shrink-0" style={{ color: "hsl(220 9% 45%)" }}>Danger zone</span>
            <button className="text-xs" style={{ color: "hsl(0 72% 58%)" }}>
              Delete account
            </button>
          </div>
        </div>
      </Section>
    </div>
  );
}
