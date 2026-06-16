# Vercel Preview Deployment Readiness

Status date: 2026-06-15

## Build Check

- `npm run build`: PASS
- Build output includes `/dashboard`, `/dashboard/leads`, `/dashboard/deployments`, `/dashboard/integrations`, auth pages, and workspace routes.

## Exact Vercel Environment Variables

Set these for a safe preview:

```env
NEXT_PUBLIC_APP_URL=https://<vercel-preview-domain>
NEXT_PUBLIC_SUPABASE_URL=https://<supabase-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase-anon-key>
GEMINI_API_KEY=<gemini-api-key>
```

Do not set these for the first safe preview:

```env
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_CLIENT_ID=
STRIPE_WEBHOOK_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
WEBFLOW_CLIENT_ID=
WEBFLOW_CLIENT_SECRET=
VERCEL_TOKEN=
```

Optional later, after explicit approval:

```env
LAUNCHFORGE_INTEGRATION_SECRET=<stable-random-secret>
NEXT_SERVER_ACTIONS_ENCRYPTION_KEY=<stable-random-secret>
```

## Supabase Auth Redirect URLs

Use the same value as `NEXT_PUBLIC_APP_URL` for `<preview-origin>`.

Add these to Supabase Auth URL configuration:

```text
Site URL:
<preview-origin>

Additional Redirect URLs:
<preview-origin>/api/auth/supabase/callback
<preview-origin>/login
<preview-origin>/dashboard
```

For Google OAuth through Supabase Auth, add this in Google Cloud as the OAuth client redirect URI:

```text
https://<supabase-project-ref>.supabase.co/auth/v1/callback
```

Do not add app-owned Google routes; the app uses Supabase Auth for Google sign-in.

## Supabase URL/Key Presence

Required for auth and database client creation:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

If missing, the app falls back to local-dev auth behavior in some server paths and is not a valid hosted preview.

## Migration Status

Do not execute these without approval.

- `002_lead_ops_mvp.sql`: DRAFT/PENDING. Required for durable Leads persistence.
- `003_fix_lf_projects_user_id.sql`: DRAFT/PENDING. Required to repair `public.lf_projects.user_id` on existing DBs.
- `004_multi_user_integrations.sql`: DRAFT/PENDING. Required for durable per-user integration records.

## Preview-Only Pages Until Migrations Apply

- `/dashboard/leads`: loads, classifies, drafts, and digests leads, but falls back to in-memory mock storage if `public.leads` or digest tables are missing.
- `/dashboard/deployments`: loads, but LaunchForge project rows can be empty if `public.lf_projects.user_id` is missing.
- `/dashboard/integrations`: preview-only until migration 004 and approved provider credentials exist.
- `/dashboard/history`, `/dashboard/analytics`, `/workspace/[id]`: can render empty or partial data if `public.generations` is missing.
- `/dashboard/demo`: works as a local/browser demo, not durable production storage.

## Landing Page Claim Status

Preview copy has been softened for the private Vercel preview:

- Trial/billing claims were replaced with private-preview language and explicit billing-disabled notes.
- Testimonials were replaced with labeled sample outcomes.
- Speculative revenue examples were replaced with sample forecast language.
- One-click/live deployment claims were changed to launch-prep and manual-review language.
- Stripe/payment integration copy remains framed as disabled until approved credentials and setup exist.

Before public marketing, pricing, testimonials, claims, and payment copy still need a separate product/legal review.

## Hardcoded Localhost URLs

Found:

- `app/actions/auth.ts` falls back to `http://localhost:3000` when `NEXT_PUBLIC_APP_URL` is absent.
- README local dev commands reference `http://localhost:3000`.

Preview mitigation:

- Set `NEXT_PUBLIC_APP_URL=https://<vercel-preview-domain>` in Vercel.

## What Will Work After Preview Deploy

Assuming required safe env vars are set:

- Public landing page renders.
- Email/password auth can work through Supabase Auth.
- Google sign-in can work if Supabase and Google redirect URLs are configured.
- Dashboard shell loads.
- Leads page loads with fallback behavior before migrations.
- Demo page works in browser-local storage.
- AI generation can work if `GEMINI_API_KEY` is set.

## What Will Not Work Until Migrations/Approvals

- Durable Leads storage until migration 002 is applied.
- Durable LaunchForge project ownership until migration 003 is applied.
- Durable multi-user integration records until migration 004 is applied.
- Stripe billing, Stripe Connect, live products, checkout, or subscriptions.
- Real GitHub/Webflow/social account connections.
- Public marketing readiness without landing-copy cleanup.

## Go/No-Go

Recommendation: GO for a private Vercel preview only.

Conditions:

- Set only the safe env vars listed above.
- Configure Supabase and Google redirect URLs.
- Do not enable Stripe, GitHub, Webflow, Vercel token automation, or social integrations.
- Treat Leads, Deployments, and Integrations as preview-only until migrations 002/003/004 are reviewed and applied with approval.

Recommendation: NO-GO for public launch or marketing.
