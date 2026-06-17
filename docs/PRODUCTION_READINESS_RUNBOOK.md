# Production Readiness Runbook

Canonical production URL:

```text
https://launchforge-ai-six.vercel.app
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
https://launchforge-ai-six.vercel.app/api/readiness
```

The `schema.ready` value should be `true`.

## Supabase Auth Redirects

Supabase Dashboard -> Authentication -> URL Configuration:

```text
Site URL:
https://launchforge-ai-six.vercel.app

Redirect URLs:
https://launchforge-ai-six.vercel.app/login
https://launchforge-ai-six.vercel.app/dashboard
https://launchforge-ai-six.vercel.app/api/auth/supabase/callback
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
https://launchforge-ai-six.vercel.app/api/auth/webflow/callback
```

Required Vercel Production env vars:

```text
WEBFLOW_CLIENT_ID
WEBFLOW_CLIENT_SECRET
```

After adding env vars, redeploy Production and verify:

```text
https://launchforge-ai-six.vercel.app/api/env-check
```

`webflowClientId` and `webflowClientSecret` should both be `true`.

## Google Account Linking

Google Cloud OAuth app redirect URI for LaunchForge account linking:

```text
https://launchforge-ai-six.vercel.app/api/auth/google/callback
https://launchforge-ai-six.vercel.app/api/auth/youtube/callback
```

Required Vercel Production env vars:

```text
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_OAUTH_SCOPES
YOUTUBE_OAUTH_SCOPES
```

Suggested initial scopes:

```text
openid email profile
```

Suggested YouTube scopes:

```text
openid email profile https://www.googleapis.com/auth/youtube.readonly
```

## Social OAuth

TikTok developer app:

```text
Redirect URI:
https://launchforge-ai-six.vercel.app/api/auth/tiktok/callback

Vercel Production env:
TIKTOK_CLIENT_KEY
TIKTOK_CLIENT_SECRET
TIKTOK_OAUTH_SCOPES
```

Meta app for Instagram and Facebook:

```text
Redirect URIs:
https://launchforge-ai-six.vercel.app/api/auth/instagram/callback
https://launchforge-ai-six.vercel.app/api/auth/facebook/callback

Vercel Production env:
META_CLIENT_ID
META_CLIENT_SECRET
INSTAGRAM_OAUTH_SCOPES
FACEBOOK_OAUTH_SCOPES
```

X / Twitter developer app:

```text
Redirect URI:
https://launchforge-ai-six.vercel.app/api/auth/x/callback

Vercel Production env:
X_CLIENT_ID
X_CLIENT_SECRET
X_OAUTH_SCOPES
```

LinkedIn developer app:

```text
Redirect URI:
https://launchforge-ai-six.vercel.app/api/auth/linkedin/callback

Vercel Production env:
LINKEDIN_CLIENT_ID
LINKEDIN_CLIENT_SECRET
LINKEDIN_OAUTH_SCOPES
```
