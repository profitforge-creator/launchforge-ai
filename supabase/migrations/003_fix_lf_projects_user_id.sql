-- LaunchForge lf_projects ownership repair draft.
-- Do not apply without review. This file is not executed by the app.
--
-- Root issue this repairs:
--   The application expects public.lf_projects.user_id, matching
--   supabase/migrations/001_phase1_auth_storage.sql. Some existing databases
--   may already have public.lf_projects without that ownership column because
--   "create table if not exists" does not add missing columns to an existing table.
--
-- Safety:
--   This draft does not delete table data.
--   Existing rows will have user_id = null until manually backfilled.
--   Backfill legacy rows before enforcing NOT NULL.

alter table if exists public.lf_projects
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

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

-- After legacy rows are reviewed/backfilled, a later approved migration may run:
-- alter table public.lf_projects alter column user_id set not null;
