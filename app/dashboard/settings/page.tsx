"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PLAN_LIMITS } from "@/lib/account/types";
import {
  actionGetAllIntegrationStatuses,
  type IntegrationKey,
  type IntegrationStatus,
} from "@/app/actions/integrations";

// ── Local profile store (localStorage) ───────────────────────────────────────

interface ProfileState {
  displayName: string;
  username: string;
  bio: string;
  email: string;
  createdAt: string;
}

function loadProfile(): ProfileState {
  if (typeof window === "undefined") return defaultProfile();
  try {
    const raw = localStorage.getItem("lf_profile");
    if (raw) return { ...defaultProfile(), ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return defaultProfile();
}

function defaultProfile(): ProfileState {
  return {
    displayName: "Your Name",
    username: "user",
    bio: "",
    email: "hesirq@gmail.com",
    createdAt: new Date().toISOString(),
  };
}

function saveProfile(p: ProfileState) {
  try { localStorage.setItem("lf_profile", JSON.stringify(p)); } catch { /* ignore */ }
}

// ── Notification prefs ────────────────────────────────────────────────────────

interface NotifState {
  projectComplete: boolean;
  deployments: boolean;
  marketingUpdates: boolean;
  productUpdates: boolean;
  emailDigest: boolean;
}

const defaultNotifs: NotifState = {
  projectComplete: true,
  deployments: true,
  marketingUpdates: false,
  productUpdates: true,
  emailDigest: false,
};

// ── UI atoms ──────────────────────────────────────────────────────────────────

function SectionTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-base font-semibold" style={{ color: "hsl(220 9% 88%)" }}>{title}</h2>
      {sub && <p className="text-xs mt-0.5" style={{ color: "hsl(220 9% 40%)" }}>{sub}</p>}
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: "1px solid hsl(220 13% 15%)", backgroundColor: "hsl(220 13% 9%)" }}
    >
      {children}
    </div>
  );
}

function Row({
  label,
  sub,
  value,
  action,
  last = false,
}: {
  label: string;
  sub?: string;
  value?: React.ReactNode;
  action?: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div
      className="flex items-center justify-between px-5 py-4"
      style={{ borderBottom: last ? "none" : "1px solid hsl(220 13% 13%)" }}
    >
      <div className="flex-1 min-w-0 mr-4">
        <p className="text-sm font-medium" style={{ color: "hsl(220 9% 76%)" }}>{label}</p>
        {sub && <p className="text-xs mt-0.5" style={{ color: "hsl(220 9% 36%)" }}>{sub}</p>}
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {value && <span className="text-sm" style={{ color: "hsl(220 9% 48%)" }}>{value}</span>}
        {action}
      </div>
    </div>
  );
}

function Btn({
  children,
  onClick,
  variant = "default",
  disabled = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "default" | "primary" | "danger";
  disabled?: boolean;
}) {
  const styles: Record<string, React.CSSProperties> = {
    default: { border: "1px solid hsl(220 13% 22%)", color: "hsl(220 9% 58%)", backgroundColor: "transparent" },
    primary: { backgroundColor: "hsl(220 9% 94%)", color: "hsl(220 14% 7%)" },
    danger:  { border: "1px solid hsl(0 72% 40% / 0.3)", color: "hsl(0 72% 58%)", backgroundColor: "transparent" },
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="h-8 px-4 rounded-lg text-xs font-medium transition-colors"
      style={{ ...styles[variant], opacity: disabled ? 0.4 : 1, cursor: disabled ? "not-allowed" : "pointer" }}
    >
      {children}
    </button>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  multiline = false,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
}) {
  const base: React.CSSProperties = {
    backgroundColor: "hsl(220 13% 12%)",
    border: "1px solid hsl(220 13% 18%)",
    color: "hsl(220 9% 80%)",
    borderRadius: 8,
    fontSize: 13,
    width: "100%",
    outline: "none",
  };
  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="px-3 py-2 resize-none"
        style={base}
      />
    );
  }
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-9 px-3"
      style={base}
    />
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="relative w-9 h-5 rounded-full transition-colors shrink-0"
      style={{ backgroundColor: checked ? "hsl(213 94% 58%)" : "hsl(220 13% 22%)" }}
    >
      <span
        className="absolute top-0.5 w-4 h-4 rounded-full transition-transform"
        style={{
          backgroundColor: "hsl(220 9% 90%)",
          left: 2,
          transform: checked ? "translateX(16px)" : "translateX(0px)",
        }}
      />
    </button>
  );
}

function SaveBar({ onSave, saved }: { onSave: () => void; saved: boolean }) {
  return (
    <div className="flex items-center justify-between mt-6">
      {saved ? (
        <p className="text-xs" style={{ color: "hsl(151 60% 48%)" }}>Changes saved</p>
      ) : (
        <span />
      )}
      <Btn variant="primary" onClick={onSave}>Save changes</Btn>
    </div>
  );
}

// ── Nav ───────────────────────────────────────────────────────────────────────

type SettingsSection =
  | "profile"
  | "account"
  | "plan"
  | "notifications"
  | "security"
  | "support"
  | "about";

const NAV_ITEMS: { id: SettingsSection; label: string }[] = [
  { id: "profile",       label: "Profile"       },
  { id: "account",       label: "Account"       },
  { id: "plan",          label: "Plan"          },
  { id: "notifications", label: "Notifications" },
  { id: "security",      label: "Security"      },
  { id: "support",       label: "Support"       },
  { id: "about",         label: "About"         },
];

// ── Sections ──────────────────────────────────────────────────────────────────

function ProfileSection() {
  const [profile, setProfile] = useState<ProfileState>(defaultProfile());
  const [saved, setSaved] = useState(false);

  useEffect(() => { setProfile(loadProfile()); }, []);

  function set(key: keyof ProfileState, value: string) {
    setProfile((p) => ({ ...p, [key]: value }));
    setSaved(false);
  }

  function handleSave() {
    saveProfile(profile);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const joined = new Date(profile.createdAt).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });

  return (
    <div className="space-y-5">
      <SectionTitle title="Profile" sub="Your public profile information." />

      {/* Avatar */}
      <Card>
        <div className="flex items-center gap-5 px-5 py-5" style={{ borderBottom: "1px solid hsl(220 13% 13%)" }}>
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold shrink-0"
            style={{ backgroundColor: "hsl(220 13% 18%)", color: "hsl(220 9% 55%)" }}
          >
            {profile.displayName?.[0]?.toUpperCase() ?? "U"}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium" style={{ color: "hsl(220 9% 76%)" }}>Profile picture</p>
            <p className="text-xs mt-0.5" style={{ color: "hsl(220 9% 36%)" }}>
              Photo uploads available after account verification.
            </p>
          </div>
          <Btn disabled>Upload photo</Btn>
        </div>

        <div className="px-5 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium" style={{ color: "hsl(220 9% 46%)" }}>Display name</label>
              <Input value={profile.displayName} onChange={(v) => set("displayName", v)} placeholder="Your Name" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium" style={{ color: "hsl(220 9% 46%)" }}>Username</label>
              <Input value={profile.username} onChange={(v) => set("username", v)} placeholder="username" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium" style={{ color: "hsl(220 9% 46%)" }}>Bio</label>
            <Input value={profile.bio} onChange={(v) => set("bio", v)} placeholder="A short description about yourself" multiline />
          </div>
        </div>
      </Card>

      <Card>
        <Row label="Email address"    value={profile.email} sub="Sign-in email — contact support to change" />
        <Row label="Member since"     value={joined} last />
      </Card>

      <SaveBar onSave={handleSave} saved={saved} />
    </div>
  );
}

// Real integration status pulled from server on mount.
// "Connected" is only shown when a token has been authenticated against the real API.
function AccountSection() {
  const [statuses, setStatuses] = useState<Record<IntegrationKey, IntegrationStatus> | null>(null);

  useEffect(() => {
    actionGetAllIntegrationStatuses().then(setStatuses);
  }, []);

  const SERVICES: { id: IntegrationKey; label: string; description: string }[] = [
    { id: "github",   label: "GitHub",   description: "Source control and deployment triggers" },
    { id: "vercel",   label: "Vercel",   description: "One-click website deployment"           },
    { id: "stripe",   label: "Stripe",   description: "Payment and subscription management"    },
    { id: "supabase", label: "Supabase", description: "Database and authentication"            },
    { id: "webflow",  label: "Webflow",  description: "No-code website publishing"            },
  ];

  return (
    <div className="space-y-5">
      <SectionTitle title="Account" sub="Account details, plan status, and connected services." />

      <Card>
        <Row label="Email"          value="hesirq@gmail.com" sub="Primary sign-in address" />
        <Row label="Account status" value="Active"           sub="Your account is in good standing" />
        <Row label="Current plan"   value="3-Day Trial"      sub="Full access trial" action={<Btn>Upgrade</Btn>} last />
      </Card>

      <div>
        <div className="flex items-center justify-between mb-3 px-0.5">
          <p className="text-xs font-medium" style={{ color: "hsl(220 9% 40%)" }}>Connected services</p>
          <Link
            href="/dashboard/deployments"
            className="text-xs font-medium transition-colors"
            style={{ color: "hsl(213 94% 56%)" }}
          >
            Manage in Deployments →
          </Link>
        </div>
        <Card>
          {SERVICES.map((svc, i) => {
            const status = statuses?.[svc.id];
            const isConnected = status?.connected === true;
            const isLoading   = statuses === null;

            return (
              <Row
                key={svc.id}
                label={svc.label}
                sub={svc.description}
                last={i === SERVICES.length - 1}
                value={
                  isLoading ? (
                    <span className="text-xs" style={{ color: "hsl(220 9% 28%)" }}>—</span>
                  ) : isConnected ? (
                    <span
                      className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md"
                      style={{ backgroundColor: "hsl(151 60% 48% / 0.1)", color: "hsl(151 60% 50%)", border: "1px solid hsl(151 60% 48% / 0.2)" }}
                    >
                      <span className="w-1 h-1 rounded-full" style={{ backgroundColor: "hsl(151 60% 48%)" }} />
                      Connected
                    </span>
                  ) : (
                    <span className="text-xs" style={{ color: "hsl(220 9% 30%)" }}>Not connected</span>
                  )
                }
                action={
                  <Link
                    href="/dashboard/deployments"
                    className="h-8 px-4 rounded-lg text-xs font-medium flex items-center transition-colors"
                    style={{
                      border: "1px solid hsl(220 13% 22%)",
                      color: "hsl(220 9% 58%)",
                      backgroundColor: "transparent",
                    }}
                  >
                    {isConnected ? "Manage" : "Connect"}
                  </Link>
                }
              />
            );
          })}
        </Card>
        <p className="text-xs mt-2 px-0.5" style={{ color: "hsl(220 9% 26%)", lineHeight: 1.6 }}>
          Connections are authenticated against each platform's API. Status reflects real account authentication.
        </p>
      </div>
    </div>
  );
}

function PlanSection() {
  const limits = PLAN_LIMITS["trial"];
  const unlimited = (n: number) => n === -1;

  return (
    <div className="space-y-5">
      <SectionTitle title="Plan" sub="Your current subscription and usage summary." />

      {/* Current plan card */}
      <div
        className="rounded-xl px-6 py-5"
        style={{ border: "1px solid hsl(213 94% 62% / 0.2)", backgroundColor: "hsl(213 94% 62% / 0.04)" }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium mb-1" style={{ color: "hsl(213 94% 65%)" }}>Current plan</p>
            <h3 className="text-xl font-bold" style={{ color: "hsl(220 9% 90%)" }}>3-Day Free Trial</h3>
            <p className="text-sm mt-1" style={{ color: "hsl(220 9% 44%)" }}>
              Full access to all features. No credit card required.
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-2xl font-bold tabular-nums" style={{ color: "hsl(220 9% 88%)" }}>Free</p>
            <p className="text-xs mt-0.5" style={{ color: "hsl(220 9% 36%)" }}>3 days remaining</p>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <Btn variant="primary">Upgrade plan</Btn>
          <Btn>View all plans</Btn>
        </div>
      </div>

      {/* Usage bars */}
      <Card>
        {[
          { label: "Projects",    used: 0, limit: "Unlimited during trial" },
          { label: "Generations", used: 0, limit: "Unlimited during trial" },
          { label: "Deployments", used: 0, limit: "Unlimited during trial" },
        ].map((item, i, arr) => (
          <div
            key={item.label}
            className="px-5 py-4"
            style={{ borderBottom: i < arr.length - 1 ? "1px solid hsl(220 13% 13%)" : "none" }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium" style={{ color: "hsl(220 9% 72%)" }}>{item.label}</span>
              <span className="text-xs" style={{ color: "hsl(220 9% 36%)" }}>{item.limit}</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "hsl(220 13% 15%)" }}>
              <div
                className="h-full rounded-full"
                style={{ width: "0%", backgroundColor: "hsl(213 94% 58%)" }}
              />
            </div>
            <p className="text-xs mt-1.5" style={{ color: "hsl(220 9% 30%)" }}>{item.used} used</p>
          </div>
        ))}
      </Card>

      {/* Plan features */}
      <Card>
        {[
          { label: "Website generation",  enabled: limits.analytics },
          { label: "AI advisor",          enabled: limits.aiAdvisor },
          { label: "Deployments",         enabled: limits.deployments },
          { label: "Analytics",           enabled: limits.analytics },
          { label: "Priority support",    enabled: limits.prioritySupport },
          { label: "Unlimited projects",  enabled: unlimited(limits.projectsPerMonth) },
        ].map((f, i, arr) => (
          <div
            key={f.label}
            className="flex items-center justify-between px-5 py-3"
            style={{ borderBottom: i < arr.length - 1 ? "1px solid hsl(220 13% 13%)" : "none" }}
          >
            <span className="text-sm" style={{ color: "hsl(220 9% 66%)" }}>{f.label}</span>
            {f.enabled ? (
              <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20" style={{ color: "hsl(151 60% 48%)" }}>
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20" style={{ color: "hsl(220 9% 28%)" }}>
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        ))}
      </Card>
    </div>
  );
}

function NotificationsSection() {
  const [notifs, setNotifs] = useState<NotifState>(defaultNotifs);
  const [saved, setSaved] = useState(false);

  function toggle(key: keyof NotifState) {
    setNotifs((n) => ({ ...n, [key]: !n[key] }));
    setSaved(false);
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const items: { key: keyof NotifState; label: string; sub: string }[] = [
    { key: "projectComplete",  label: "Project completion",   sub: "Notified when a business generation finishes" },
    { key: "deployments",      label: "Deployment updates",   sub: "Status updates for Vercel deployments" },
    { key: "productUpdates",   label: "Product updates",      sub: "New features and improvements to LaunchForge" },
    { key: "marketingUpdates", label: "Marketing updates",    sub: "Tips, templates, and launch resources" },
    { key: "emailDigest",      label: "Weekly digest",        sub: "Summary of your project activity each week" },
  ];

  return (
    <div className="space-y-5">
      <SectionTitle title="Notifications" sub="Control which notifications you receive." />
      <Card>
        {items.map((item, i) => (
          <div
            key={item.key}
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: i < items.length - 1 ? "1px solid hsl(220 13% 13%)" : "none" }}
          >
            <div className="flex-1 mr-6">
              <p className="text-sm font-medium" style={{ color: "hsl(220 9% 76%)" }}>{item.label}</p>
              <p className="text-xs mt-0.5" style={{ color: "hsl(220 9% 36%)" }}>{item.sub}</p>
            </div>
            <Toggle checked={notifs[item.key]} onChange={() => toggle(item.key)} />
          </div>
        ))}
      </Card>
      <SaveBar onSave={handleSave} saved={saved} />
    </div>
  );
}

function SecuritySection() {
  return (
    <div className="space-y-5">
      <SectionTitle title="Security" sub="Manage your password, authentication, and active sessions." />

      <Card>
        <Row label="Password"             sub="Last changed — never"                   action={<Btn>Change password</Btn>} />
        <Row label="Two-factor auth"      sub="Add an extra layer of account security" action={<Btn>Enable 2FA</Btn>} last />
      </Card>

      <div>
        <p className="text-xs font-medium mb-3 px-0.5" style={{ color: "hsl(220 9% 40%)" }}>Active sessions</p>
        <Card>
          <div className="px-5 py-4" style={{ borderBottom: "1px solid hsl(220 13% 13%)" }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: "hsl(220 9% 76%)" }}>Current session</p>
                <p className="text-xs mt-0.5" style={{ color: "hsl(220 9% 36%)" }}>Windows 11 · Chrome · Active now</p>
              </div>
              <span
                className="text-xs font-medium px-2 py-0.5 rounded-full"
                style={{ backgroundColor: "hsl(151 60% 48% / 0.1)", color: "hsl(151 60% 48%)" }}
              >
                Active
              </span>
            </div>
          </div>
          <div className="px-5 py-4">
            <Btn variant="danger">Sign out of all devices</Btn>
          </div>
        </Card>
      </div>

      <div>
        <p className="text-xs font-medium mb-3 px-0.5" style={{ color: "hsl(0 72% 58%)" }}>Danger zone</p>
        <Card>
          <Row
            label="Delete account"
            sub="Permanently delete your account and all data. This cannot be undone."
            last
            action={<Btn variant="danger">Delete account</Btn>}
          />
        </Card>
      </div>
    </div>
  );
}

function SupportSection() {
  const cards = [
    { title: "Help Center",       sub: "Browse articles and guides",     action: "Open" },
    { title: "Documentation",     sub: "API reference and integration",  action: "View docs" },
    { title: "Contact Support",   sub: "Get help from our team",         action: "Send message" },
    { title: "Report a Bug",      sub: "Tell us what went wrong",        action: "Report" },
    { title: "Feature Request",   sub: "Suggest new functionality",      action: "Submit" },
    { title: "FAQ",               sub: "Common questions answered",      action: "View FAQ" },
  ];

  return (
    <div className="space-y-5">
      <SectionTitle title="Support" sub="Get help, report issues, or request features." />
      <div className="grid grid-cols-2 gap-3">
        {cards.map((c) => (
          <div
            key={c.title}
            className="rounded-xl px-5 py-4 flex flex-col gap-3"
            style={{ border: "1px solid hsl(220 13% 15%)", backgroundColor: "hsl(220 13% 9%)" }}
          >
            <div>
              <p className="text-sm font-semibold" style={{ color: "hsl(220 9% 80%)" }}>{c.title}</p>
              <p className="text-xs mt-0.5" style={{ color: "hsl(220 9% 36%)" }}>{c.sub}</p>
            </div>
            <Btn>{c.action}</Btn>
          </div>
        ))}
      </div>
    </div>
  );
}

function AboutSection() {
  const info = [
    { label: "Version",       value: "1.0.0-beta" },
    { label: "Build",         value: "2026.06.11" },
    { label: "Environment",   value: "Production" },
    { label: "Region",        value: "US East" },
  ];

  const links = [
    { label: "Terms of Service",   href: "#" },
    { label: "Privacy Policy",     href: "#" },
    { label: "Release Notes",      href: "#" },
    { label: "Status Page",        href: "#" },
  ];

  return (
    <div className="space-y-5">
      <SectionTitle title="About" sub="Platform information and legal." />
      <Card>
        {info.map((item, i) => (
          <Row key={item.label} label={item.label} value={item.value} last={i === info.length - 1} />
        ))}
      </Card>
      <Card>
        {links.map((link, i) => (
          <div
            key={link.label}
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: i < links.length - 1 ? "1px solid hsl(220 13% 13%)" : "none" }}
          >
            <span className="text-sm font-medium" style={{ color: "hsl(220 9% 70%)" }}>{link.label}</span>
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: "hsl(220 9% 32%)" }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

function SettingsNavButton({
  item,
  isActive,
  onClick,
}: {
  item: { id: SettingsSection; label: string };
  isActive: boolean;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const bg = isActive ? "hsl(220 13% 15%)" : hovered ? "hsl(220 13% 12%)" : "transparent";
  const fg = isActive ? "hsl(220 9% 88%)" : hovered ? "hsl(220 9% 70%)" : "hsl(220 9% 46%)";
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative w-full flex items-center h-8 pl-3.5 pr-3 rounded-lg text-sm text-left transition-colors"
      style={{ backgroundColor: bg, color: fg, fontWeight: isActive ? 500 : 400 }}
    >
      <span
        className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full transition-all"
        style={{ width: 3, height: isActive ? 15 : 0, backgroundColor: "hsl(213 94% 62%)", opacity: isActive ? 1 : 0 }}
      />
      {item.label}
    </button>
  );
}

export default function SettingsPage() {
  const [active, setActive] = useState<SettingsSection>("profile");

  return (
    <div className="max-w-5xl mx-auto px-8 py-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-xl font-semibold" style={{ color: "hsl(220 9% 88%)", letterSpacing: "-0.01em" }}>
          Settings
        </h1>
        <p className="text-xs mt-0.5" style={{ color: "hsl(220 9% 36%)" }}>
          Manage your profile, plan, integrations, and preferences
        </p>
      </div>

      <div className="flex gap-8">
        {/* Left nav */}
        <nav className="shrink-0 w-44 pt-1">
          <div className="space-y-0.5">
            {NAV_ITEMS.map((item) => (
              <SettingsNavButton
                key={item.id}
                item={item}
                isActive={active === item.id}
                onClick={() => setActive(item.id)}
              />
            ))}
          </div>
        </nav>

        {/* Content */}
        <div key={active} className="flex-1 min-w-0 animate-rise-in">
          {active === "profile"       && <ProfileSection />}
          {active === "account"       && <AccountSection />}
          {active === "plan"          && <PlanSection />}
          {active === "notifications" && <NotificationsSection />}
          {active === "security"      && <SecuritySection />}
          {active === "support"       && <SupportSection />}
          {active === "about"         && <AboutSection />}
        </div>
      </div>
    </div>
  );
}
