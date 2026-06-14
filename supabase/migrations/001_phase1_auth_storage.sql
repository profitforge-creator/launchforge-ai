-- LaunchForge Phase 1 persistence schema.
-- Apply manually in Supabase after review. This file is not executed by the app.

create extension if not exists pgcrypto;

create table if not exists public.generations (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  result jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create index if not exists generations_user_created_idx
  on public.generations (user_id, created_at desc)
  where archived_at is null;

alter table public.generations enable row level security;

drop policy if exists generations_select_own on public.generations;
create policy generations_select_own
  on public.generations for select
  using (auth.uid() = user_id);

drop policy if exists generations_insert_own on public.generations;
create policy generations_insert_own
  on public.generations for insert
  with check (auth.uid() = user_id);

drop policy if exists generations_update_own on public.generations;
create policy generations_update_own
  on public.generations for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table if not exists public.lf_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  slug text not null,
  description text,
  github_repo_name text,
  github_repo_url text,
  github_repo_full_name text,
  github_clone_url text,
  vercel_project_id text,
  vercel_project_name text,
  vercel_project_url text,
  stripe_product_id text,
  stripe_product_name text,
  stripe_dashboard_url text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create index if not exists lf_projects_user_created_idx
  on public.lf_projects (user_id, created_at desc)
  where archived_at is null;

create unique index if not exists lf_projects_user_slug_active_idx
  on public.lf_projects (user_id, slug)
  where archived_at is null;

alter table public.lf_projects enable row level security;

drop policy if exists lf_projects_select_own on public.lf_projects;
create policy lf_projects_select_own
  on public.lf_projects for select
  using (auth.uid() = user_id);

drop policy if exists lf_projects_insert_own on public.lf_projects;
create policy lf_projects_insert_own
  on public.lf_projects for insert
  with check (auth.uid() = user_id);

drop policy if exists lf_projects_update_own on public.lf_projects;
create policy lf_projects_update_own
  on public.lf_projects for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table if not exists public.deployments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id text not null,
  platform text not null,
  status text not null,
  url text not null,
  domain text,
  environment text not null check (environment in ('production', 'preview')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  unique (user_id, project_id)
);

create index if not exists deployments_user_created_idx
  on public.deployments (user_id, created_at desc)
  where archived_at is null;

alter table public.deployments enable row level security;

drop policy if exists deployments_select_own on public.deployments;
create policy deployments_select_own
  on public.deployments for select
  using (auth.uid() = user_id);

drop policy if exists deployments_insert_own on public.deployments;
create policy deployments_insert_own
  on public.deployments for insert
  with check (auth.uid() = user_id);

drop policy if exists deployments_update_own on public.deployments;
create policy deployments_update_own
  on public.deployments for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
