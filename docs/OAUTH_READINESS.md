# OAuth Readiness

This document tracks production readiness for sign-in and account-linking integrations.

## Current Local Status

- Supabase Auth email/password: implemented.
- Supabase Auth Google sign-in: locally wired through `/api/auth/supabase/callback`; requires Supabase provider configuration before production use.
- GitHub OAuth: implemented for deployment/source-control linking, but outside the current priority list.
- Stripe Connect OAuth: implemented for connected account linking; Stripe subscriptions/billing are a separate launch blocker.
- Supabase project token connection: implemented as token validation, not OAuth.
- Google account linking beyond sign-in: not implemented.
- YouTube account linking: not implemented.
- TikTok account linking: not implemented.
- Instagram account linking: not implemented.
- X/Twitter account linking: not implemented.
- LinkedIn account linking: not implemented.
- Facebook account linking: not implemented.
- Webflow: intentionally out of scope for this pass.

## Missing Production Pieces

- Database-backed integration token table with user ownership and RLS.
- Encrypted token storage or a managed secret vault for provider access and refresh tokens.
- Provider-specific OAuth callbacks for Google/YouTube, TikTok, Instagram, X/Twitter, LinkedIn, and Facebook.
- Provider app credentials and approved callback URLs in each provider dashboard.
- Refresh-token handling per provider where offline access is supported.
- Token revocation/disconnect flows that remove persisted credentials.
- Integration health checks that use real linked-account data without exposing raw tokens.

## Required Environment Variables

Existing/local:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL`
- `GEMINI_API_KEY`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `VERCEL_TOKEN`

Needed before the requested priority integrations can be production-ready:

- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_ID_STARTER` or equivalent price IDs
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `YOUTUBE_CLIENT_ID` or shared Google OAuth app credentials
- `YOUTUBE_CLIENT_SECRET` or shared Google OAuth app credentials
- `TIKTOK_CLIENT_KEY`
- `TIKTOK_CLIENT_SECRET`
- `FACEBOOK_CLIENT_ID`
- `FACEBOOK_CLIENT_SECRET`
- `INSTAGRAM_CLIENT_ID` or Facebook app credentials, depending on chosen API path
- `INSTAGRAM_CLIENT_SECRET` or Facebook app credentials, depending on chosen API path
- `TWITTER_CLIENT_ID`
- `TWITTER_CLIENT_SECRET`
- `LINKEDIN_CLIENT_ID`
- `LINKEDIN_CLIENT_SECRET`

## Integration Ranking

- Working locally: Supabase Auth email/password.
- Partially working: Supabase Auth Google sign-in, GitHub OAuth, Stripe Connect, Supabase token validation.
- Blocked: Stripe subscriptions, because live billing needs Stripe products/prices, webhook secret, webhook route, and approval to configure production.
- Not started: Google account linking, YouTube, TikTok, Instagram, X/Twitter, LinkedIn, Facebook.
