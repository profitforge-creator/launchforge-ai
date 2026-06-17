-- Migration 004: durable multi-user integration storage.
-- Status: approved for production.
-- Purpose:
--   Replace process memory and integration cookies with RLS-isolated,
--   per-user connection records for OAuth/provider integrations.

create table if not exists public.user_integrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null,
  provider_account_id text,
  provider_account_name text,
  status text not null default 'connected' check (status in ('connected', 'disabled', 'revoked', 'error')),
  enabled boolean not null default true,
  scopes text[] not null default '{}',
  access_token_encrypted text,
  refresh_token_encrypted text,
  token_type text,
  expires_at timestamptz,
  refresh_expires_at timestamptz,
  last_sync_at timestamptz,
  last_refresh_at timestamptz,
  last_error text,
  metadata jsonb not null default '{}'::jsonb,
  connected_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  constraint user_integrations_provider_check check (
    provider in (
      'google',
      'youtube',
      'tiktok',
      'instagram',
      'facebook',
      'x',
      'linkedin',
      'vercel',
      'webflow',
      'github',
      'stripe',
      'supabase',
      'supabase_auth'
    )
  )
);

create unique index if not exists user_integrations_user_provider_active_idx
  on public.user_integrations(user_id, provider)
  where archived_at is null;

create index if not exists user_integrations_user_id_idx
  on public.user_integrations(user_id);

create index if not exists user_integrations_provider_idx
  on public.user_integrations(provider);

create index if not exists user_integrations_sync_idx
  on public.user_integrations(user_id, provider, enabled, status, last_sync_at)
  where archived_at is null;

create table if not exists public.integration_oauth_states (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null,
  state_hash text not null,
  code_verifier_encrypted text,
  redirect_to text,
  scopes text[] not null default '{}',
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint integration_oauth_states_provider_check check (
    provider in (
      'google',
      'youtube',
      'tiktok',
      'instagram',
      'facebook',
      'x',
      'linkedin',
      'vercel',
      'webflow',
      'github',
      'stripe',
      'supabase',
      'supabase_auth'
    )
  )
);

create index if not exists integration_oauth_states_user_provider_idx
  on public.integration_oauth_states(user_id, provider, expires_at);

create unique index if not exists integration_oauth_states_state_hash_idx
  on public.integration_oauth_states(state_hash);

create table if not exists public.integration_sync_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  integration_id uuid references public.user_integrations(id) on delete set null,
  provider text not null,
  event_type text not null,
  status text not null check (status in ('success', 'error', 'skipped')),
  message text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists integration_sync_events_user_created_idx
  on public.integration_sync_events(user_id, created_at desc);

alter table public.user_integrations enable row level security;
alter table public.integration_oauth_states enable row level security;
alter table public.integration_sync_events enable row level security;

drop policy if exists "Users can read their integrations" on public.user_integrations;
create policy "Users can read their integrations"
  on public.user_integrations
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their integrations" on public.user_integrations;
create policy "Users can insert their integrations"
  on public.user_integrations
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their integrations" on public.user_integrations;
create policy "Users can update their integrations"
  on public.user_integrations
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can read their oauth states" on public.integration_oauth_states;
create policy "Users can read their oauth states"
  on public.integration_oauth_states
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their oauth states" on public.integration_oauth_states;
create policy "Users can insert their oauth states"
  on public.integration_oauth_states
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their oauth states" on public.integration_oauth_states;
create policy "Users can update their oauth states"
  on public.integration_oauth_states
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can read their integration sync events" on public.integration_sync_events;
create policy "Users can read their integration sync events"
  on public.integration_sync_events
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their integration sync events" on public.integration_sync_events;
create policy "Users can insert their integration sync events"
  on public.integration_sync_events
  for insert
  with check (auth.uid() = user_id);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_user_integrations_updated_at on public.user_integrations;
create trigger set_user_integrations_updated_at
before update on public.user_integrations
for each row execute function public.set_updated_at();
