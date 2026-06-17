# Production Readiness Runbook

Canonical production URL:

```text
https://launchforge-sib3.vercel.app
```

## Supabase SQL

The production Supabase project is reachable, but the LaunchForge tables must exist before Leads and per-user integrations can be durable.

Apply these files in Supabase SQL Editor, in this order:

```text
supabase/migrations/001_phase1_auth_storage.sql
supabase/migrations/002_lead_ops_mvp.sql
supabase/migrations/003_fix_lf_projects_user_id.sql
supabase/migrations/004_multi_user_integrations.sql
```

Then verify:

```text
https://launchforge-sib3.vercel.app/api/readiness
```

The `schema.ready` value should be `true`.

## Supabase Auth Redirects

Supabase Dashboard -> Authentication -> URL Configuration:

```text
Site URL:
https://launchforge-sib3.vercel.app

Redirect URLs:
https://launchforge-sib3.vercel.app/login
https://launchforge-sib3.vercel.app/dashboard
https://launchforge-sib3.vercel.app/api/auth/supabase/callback
```

Supabase Dashboard -> Authentication -> Providers -> Google:

```text
Callback URL to add in Google Cloud:
https://kphhqxjfmkkutmtqnxkp.supabase.co/auth/v1/callback
```

## Webflow OAuth

Webflow Dashboard -> Apps & Integrations -> Workspace app:

```text
Redirect URI:
https://launchforge-sib3.vercel.app/api/auth/webflow/callback
```

Required Vercel Production env vars:

```text
WEBFLOW_CLIENT_ID
WEBFLOW_CLIENT_SECRET
```

After adding env vars, redeploy Production and verify:

```text
https://launchforge-sib3.vercel.app/api/env-check
```

`webflowClientId` and `webflowClientSecret` should both be `true`.

## Google Account Linking

Google Cloud OAuth app redirect URI for LaunchForge account linking:

```text
https://launchforge-sib3.vercel.app/api/auth/google/callback
```

Required Vercel Production env vars:

```text
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_OAUTH_SCOPES
```

Suggested initial scopes:

```text
openid email profile
```
