-- LaunchForge Lead Ops MVP schema.
-- Do not apply without review. This migration creates tables and RLS policies only.

create extension if not exists pgcrypto;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  company text not null,
  website text,
  -- budget_cents stores whole cents converted from the UI dollar amount.
  -- Example: UI budget "5000" is stored as 500000 cents.
  budget_cents integer not null default 0,
  urgency text not null check (urgency in ('this-week', 'this-month', 'later')),
  need text not null,
  status text not null default 'new' check (status in ('new', 'qualified', 'nurture', 'low-fit', 'closed')),
  priority text not null default 'medium' check (priority in ('high', 'medium', 'low')),
  score integer not null default 0 check (score >= 0 and score <= 100),
  classification_reasons jsonb not null default '[]'::jsonb,
  follow_up_draft text not null default '',
  follow_up_state text not null default 'draft' check (follow_up_state in ('draft', 'approved', 'sent', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  check (budget_cents >= 0)
);

create index if not exists leads_user_created_idx
  on public.leads (user_id, created_at desc)
  where archived_at is null;

create index if not exists leads_user_status_idx
  on public.leads (user_id, status)
  where archived_at is null;

alter table public.leads enable row level security;

drop policy if exists leads_select_own on public.leads;
create policy leads_select_own
  on public.leads for select
  using (auth.uid() = user_id);

drop policy if exists leads_insert_own on public.leads;
create policy leads_insert_own
  on public.leads for insert
  with check (auth.uid() = user_id);

drop policy if exists leads_update_own on public.leads;
create policy leads_update_own
  on public.leads for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'leads_set_updated_at'
  ) then
    create trigger leads_set_updated_at
      before update on public.leads
      for each row
      execute function public.set_updated_at();
  end if;
end $$;

create table if not exists public.weekly_lead_digests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start date not null,
  total_leads integer not null default 0,
  qualified_count integer not null default 0,
  nurture_count integer not null default 0,
  low_fit_count integer not null default 0,
  average_score integer not null default 0,
  top_opportunities jsonb not null default '[]'::jsonb,
  summary text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  unique (user_id, week_start)
);

create index if not exists weekly_lead_digests_user_week_idx
  on public.weekly_lead_digests (user_id, week_start desc);

alter table public.weekly_lead_digests enable row level security;

drop policy if exists weekly_lead_digests_select_own on public.weekly_lead_digests;
create policy weekly_lead_digests_select_own
  on public.weekly_lead_digests for select
  using (auth.uid() = user_id);

drop policy if exists weekly_lead_digests_insert_own on public.weekly_lead_digests;
create policy weekly_lead_digests_insert_own
  on public.weekly_lead_digests for insert
  with check (auth.uid() = user_id);

drop policy if exists weekly_lead_digests_update_own on public.weekly_lead_digests;
create policy weekly_lead_digests_update_own
  on public.weekly_lead_digests for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'weekly_lead_digests_set_updated_at'
  ) then
    create trigger weekly_lead_digests_set_updated_at
      before update on public.weekly_lead_digests
      for each row
      execute function public.set_updated_at();
  end if;
end $$;
