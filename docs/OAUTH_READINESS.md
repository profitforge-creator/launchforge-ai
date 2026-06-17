# OAuth Readiness

This tracks account-linking OAuth readiness. Stripe billing/Connect remains excluded from this pass.

## Implemented

- Supabase Auth email/password sign-in.
- Supabase Auth Google sign-in through `/api/auth/supabase/callback`.
- Google account linking through `/api/auth/google`.
- YouTube account linking through `/api/auth/youtube`.
- TikTok account linking through `/api/auth/tiktok`.
- Instagram account linking through `/api/auth/instagram`.
- Facebook account linking through `/api/auth/facebook`.
- X / Twitter account linking through `/api/auth/x`.
- LinkedIn account linking through `/api/auth/linkedin`.
- GitHub account linking through `/api/auth/github`.
- Webflow account linking through `/api/auth/webflow`.
- Database-backed integration token storage through `user_integrations`.
- Encrypted token storage with `LAUNCHFORGE_INTEGRATION_SECRET`.
- Short-lived OAuth state storage in cookie plus `integration_oauth_states` when migration 004 exists.
- Clean callback redirects back to `/dashboard/integrations` or `/dashboard/deployments`.

## Production Requirements

Required for all durable OAuth connections:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_APP_URL
LAUNCHFORGE_INTEGRATION_SECRET
```

Required SQL migrations:

```text
supabase/migrations/001_phase1_auth_storage.sql
supabase/migrations/002_lead_ops_mvp.sql
supabase/migrations/003_fix_lf_projects_user_id.sql
supabase/migrations/004_multi_user_integrations.sql
```

## Provider Environment Variables

Google and YouTube:

```text
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_OAUTH_SCOPES
YOUTUBE_OAUTH_SCOPES
```

TikTok:

```text
TIKTOK_CLIENT_KEY
TIKTOK_CLIENT_SECRET
TIKTOK_OAUTH_SCOPES
```

Instagram and Facebook via Meta:

```text
META_CLIENT_ID
META_CLIENT_SECRET
INSTAGRAM_OAUTH_SCOPES
FACEBOOK_OAUTH_SCOPES
```

X / Twitter:

```text
X_CLIENT_ID
X_CLIENT_SECRET
X_OAUTH_SCOPES
```

LinkedIn:

```text
LINKEDIN_CLIENT_ID
LINKEDIN_CLIENT_SECRET
LINKEDIN_OAUTH_SCOPES
```

Webflow:

```text
WEBFLOW_CLIENT_ID
WEBFLOW_CLIENT_SECRET
```

GitHub:

```text
GITHUB_CLIENT_ID
GITHUB_CLIENT_SECRET
```

## Verification

After adding provider credentials and redeploying, verify:

```text
https://launchforge-sib3.vercel.app/api/env-check
https://launchforge-sib3.vercel.app/api/readiness
```

OAuth start routes should redirect to the provider when signed in. If credentials are missing, social routes send the user to the provider app dashboard instead of showing a raw application error.
