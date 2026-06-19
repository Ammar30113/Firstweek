-- FirstWeek — Phase 7 schema
-- Adapted from docs/DATABASE_SCHEMA.md with the auth fix: a `profiles` table
-- keyed to auth.users replaces the standalone `users` table. JSONB columns hold
-- the structured AI outputs; key columns are denormalized for listing/filtering.

-- ============================================================ tables

create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text,
  name       text,
  created_at timestamptz default now()
);

create table if not exists public.candidate_profiles (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  full_name        text,
  current_title    text,
  years_experience integer,
  resume_text      text,
  profile_json     jsonb default '{}'::jsonb,
  skills_json      jsonb default '[]'::jsonb,
  projects_json    jsonb default '[]'::jsonb,
  tools_json       jsonb default '[]'::jsonb,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

create table if not exists public.job_posts (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  source_url      text,
  title           text,
  company         text,
  location        text,
  raw_description text not null,
  analysis_json   jsonb default '{}'::jsonb,
  seniority       text,
  role_family     text,
  created_at      timestamptz default now()
);

create table if not exists public.assessments (
  id                         uuid primary key default gen_random_uuid(),
  user_id                    uuid not null references auth.users(id) on delete cascade,
  candidate_profile_id       uuid references public.candidate_profiles(id) on delete set null,
  job_post_id                uuid references public.job_posts(id) on delete set null,
  job_title                  text,
  status                     text not null default 'created'
                               check (status in ('created','analyzing','simulating','in_progress','evaluating','completed','error')),
  overall_score              integer,
  readiness_band             text,
  confidence_level           text,
  application_recommendation text,
  role_match_json            jsonb,
  created_at                 timestamptz default now(),
  completed_at               timestamptz
);

create table if not exists public.simulation_tasks (
  id                    uuid primary key default gen_random_uuid(),
  assessment_id         uuid not null references public.assessments(id) on delete cascade,
  title                 text not null,
  scenario              text not null,
  instructions          text not null,
  expected_deliverable  text,
  role_relevance        text,
  difficulty            text,
  time_estimate_minutes integer,
  competencies_json     jsonb default '[]'::jsonb,
  rubric_json           jsonb default '[]'::jsonb,
  task_json             jsonb default '{}'::jsonb,
  order_index           integer not null,
  created_at            timestamptz default now()
);

create table if not exists public.task_responses (
  id                 uuid primary key default gen_random_uuid(),
  simulation_task_id uuid not null references public.simulation_tasks(id) on delete cascade,
  assessment_id      uuid not null references public.assessments(id) on delete cascade,
  user_response      text not null,
  submitted_at       timestamptz default now()
);

create table if not exists public.task_evaluations (
  id                     uuid primary key default gen_random_uuid(),
  task_response_id       uuid references public.task_responses(id) on delete cascade,
  simulation_task_id     uuid references public.simulation_tasks(id) on delete set null,
  assessment_id          uuid not null references public.assessments(id) on delete cascade,
  score                  integer,
  evaluation_json        jsonb default '{}'::jsonb,
  competency_scores_json jsonb default '[]'::jsonb,
  confidence_level       text,
  created_at             timestamptz default now()
);

create table if not exists public.reports (
  id            uuid primary key default gen_random_uuid(),
  assessment_id uuid not null unique references public.assessments(id) on delete cascade,
  report_json   jsonb not null,
  created_at    timestamptz default now()
);

create table if not exists public.ai_logs (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete set null,
  assessment_id uuid references public.assessments(id) on delete set null,
  step_name     text not null,
  model         text,
  duration_ms   integer,
  error         text,
  created_at    timestamptz default now()
);

-- ============================================================ indexes

create index if not exists idx_assessments_user        on public.assessments(user_id);
create index if not exists idx_assessments_created      on public.assessments(created_at desc);
create index if not exists idx_simulation_tasks_assess  on public.simulation_tasks(assessment_id, order_index);
create index if not exists idx_task_responses_assess    on public.task_responses(assessment_id);
create index if not exists idx_task_evaluations_assess  on public.task_evaluations(assessment_id);
create index if not exists idx_ai_logs_assessment       on public.ai_logs(assessment_id);

-- ============================================================ row level security

alter table public.profiles           enable row level security;
alter table public.candidate_profiles enable row level security;
alter table public.job_posts          enable row level security;
alter table public.assessments        enable row level security;
alter table public.simulation_tasks   enable row level security;
alter table public.task_responses     enable row level security;
alter table public.task_evaluations   enable row level security;
alter table public.reports            enable row level security;
alter table public.ai_logs            enable row level security;

drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles
  for all using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "own candidate_profiles" on public.candidate_profiles;
create policy "own candidate_profiles" on public.candidate_profiles
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "own job_posts" on public.job_posts;
create policy "own job_posts" on public.job_posts
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "own assessments" on public.assessments;
create policy "own assessments" on public.assessments
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "own simulation_tasks" on public.simulation_tasks;
create policy "own simulation_tasks" on public.simulation_tasks
  for all using (assessment_id in (select id from public.assessments where user_id = auth.uid()))
  with check (assessment_id in (select id from public.assessments where user_id = auth.uid()));

drop policy if exists "own task_responses" on public.task_responses;
create policy "own task_responses" on public.task_responses
  for all using (assessment_id in (select id from public.assessments where user_id = auth.uid()))
  with check (assessment_id in (select id from public.assessments where user_id = auth.uid()));

drop policy if exists "own task_evaluations" on public.task_evaluations;
create policy "own task_evaluations" on public.task_evaluations
  for all using (assessment_id in (select id from public.assessments where user_id = auth.uid()))
  with check (assessment_id in (select id from public.assessments where user_id = auth.uid()));

drop policy if exists "own reports" on public.reports;
create policy "own reports" on public.reports
  for all using (assessment_id in (select id from public.assessments where user_id = auth.uid()))
  with check (assessment_id in (select id from public.assessments where user_id = auth.uid()));

-- ai_logs: RLS enabled, no policy -> only the service-role key can read/write.

-- ============================================================ auto-create profile on signup

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
