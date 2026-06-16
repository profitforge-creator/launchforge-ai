# Multi-User OAuth Architecture Draft

Status: draft. Do not deploy, apply SQL, connect real accounts, or change provider credentials without explicit approval.

## Current OAuth Audit

Implemented OAuth-style routes:

- GitHub: `/api/auth/github` and `/api/auth/github/callback`
- Stripe: `/api/auth/stripe` and `/api/auth/stripe/callback`
- Webflow: `/api/auth/webflow` and `/api/auth/webflow/callback`
- Supabase Auth callback: `/api/auth/supabase/callback`

Not implemented yet:

- Google account linking beyond Supabase Auth provider sign-in
- YouTube
- TikTok
- Instagram
- Facebook
- X/Twitter
- LinkedIn

Current token persistence:

- `lib/storage/integration-store.ts` uses a module-level `Map`.
- `lib/auth/persist-integration.ts` can restore encrypted httpOnly integration cookies into that map.
- Existing storage is scoped by `ownerId`, but it is not production durable and still relies on process memory/cookies.

## Architecture Problems Remaining

- No database-backed token vault or encrypted per-user integration table is active.
- OAuth state is stored in short-lived cookies, not a database table tied to user/session/provider.
- Integration status does not survive server restarts unless the browser still has encrypted cookies.
- Refresh tokens, expiration, scope changes, disable state, last sync, revocation, and reconnect history are not persisted durably.
- Dashboard data cannot yet be guaranteed to come from linked-account data only.
- The Deployments page mixes deployment tracking and integration settings; production needs a dedicated Integrations surface.
- Social/provider integrations are not accessible through the web app yet.
- Token refresh and sync jobs are not implemented.

## Required Tables

Draft migration: `supabase/migrations/004_multi_user_integrations.sql`

Tables:

- `user_integrations`: one active row per `user_id + provider`, encrypted tokens, scopes, enabled/disabled state, status, timestamps, metadata.
- `integration_oauth_states`: per-user OAuth CSRF/PKCE state, scope request, redirect target, expiration/consumption.
- `integration_sync_events`: per-user audit trail for sync, refresh, disconnect, reconnect, and provider errors.

All tables require RLS ownership isolation through `auth.uid() = user_id`.

## Provider Model

Supported provider keys:

- `google`
- `youtube`
- `tiktok`
- `instagram`
- `facebook`
- `x`
- `linkedin`
- `github`
- `stripe`
- `supabase_auth`

Stripe remains excluded from implementation work until separately approved.

## Integration Settings Page

Create `/dashboard/integrations` with one card per provider:

- Connected / Disconnected / Disabled / Error
- Last Sync
- Scopes Granted
- Connect Button
- Disconnect Button
- Refresh Connection Button
- Enable / Disable toggle

The page must only read rows where `user_integrations.user_id = currentUser.id`.

## Account Linking Flow

1. User clicks Connect for one provider.
2. Server creates `integration_oauth_states` row with hashed state, encrypted PKCE verifier when needed, scopes, provider, user id, and expiry.
3. User is redirected to provider authorization URL.
4. Callback validates signed-in user, provider, state, and expiry.
5. Server exchanges code for tokens.
6. Server stores encrypted token fields in `user_integrations`.
7. Server redirects to `/dashboard/integrations?connected=provider`.

## Disconnect/Reconnect Flow

- Disconnect should mark the row `archived_at = now()`, clear token fields, set `enabled = false`, and record a sync event.
- Reconnect should start a fresh OAuth flow and replace the active provider row.
- Disable should keep tokens but set `enabled = false`.
- Enable should set `enabled = true` only if tokens are valid or successfully refreshed.

## Token Refresh Flow

- Store `expires_at`, `refresh_expires_at`, `last_refresh_at`, and granted scopes.
- Before any provider API read, load the current user's enabled provider row.
- If the access token is expired or near expiry, refresh it server-side.
- Persist the rotated access/refresh tokens and update `last_refresh_at`.
- If refresh fails, set `status = 'error'`, `enabled = false`, and write an `integration_sync_events` row.

## Required File Changes

- Replace `lib/storage/integration-store.ts` memory store with Supabase-backed integration storage.
- Replace integration cookies in `lib/auth/persist-integration.ts` with database OAuth state and token persistence.
- Add provider definitions and scope registry, for example `lib/integrations/providers.ts`.
- Add server actions for list/connect/disconnect/reconnect/enable/disable/refresh.
- Add `/dashboard/integrations/page.tsx`.
- Update OAuth callback routes to read/write `integration_oauth_states` and `user_integrations`.
- Update dashboard analytics/import features to load linked-account data only from the authenticated user's enabled integrations.

## Launch Rule

Until migration 004 is reviewed, applied, and the code uses it, LaunchForge must not claim production-ready OAuth account linking for any provider.
