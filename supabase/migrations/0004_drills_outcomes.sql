-- FirstWeek — The Improvement Loop + Outcome tracking
-- Turns FirstWeek from a one-shot diagnosis into a practice→re-prove loop, and
-- captures whether prepping actually led to interviews/offers.
--
--   drills    : focused, single-competency practice generated from a report gap.
--               One generate + one evaluate AI call (cheap). Score is 0-100 for
--               that one competency, so repeated drills show "the climb".
--   outcomes  : append-only log of real-world progress on a role the user prepped
--               for (applied → interview → offer → hired / rejected). This is the
--               "did it actually work" signal — the testimonial + B2B + founder data.
--
-- Run this in the Supabase SQL editor (same path as 0003). Additive + safe:
-- no existing table is altered, so unrun = the new features 4xx gracefully.

-- ============================================================ drills

create table if not exists public.drills (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  -- the report whose gap spawned this drill (kept for "the climb" history;
  -- nullable so a drill survives if the assessment is later removed).
  assessment_id uuid references public.assessments(id) on delete set null,
  competency    text not null,                       -- the single skill being drilled
  source        text default 'skill_gap'
                  check (source in ('skill_gap','weak_competency','custom')),
  role_context  text,                                -- short target-role context for relevance
  drill_json    jsonb default '{}'::jsonb,           -- generated micro-scenario
  user_response text,
  evaluation_json jsonb,                             -- focused coaching feedback
  score         integer,                             -- 0-100 for this competency
  status        text not null default 'generated'
                  check (status in ('generated','completed')),
  created_at    timestamptz default now(),
  completed_at  timestamptz
);

-- ============================================================ outcomes

create table if not exists public.outcomes (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  stage         text not null
                  check (stage in ('applied','interview','offer','hired','rejected','no_response')),
  note          text,
  created_at    timestamptz default now()
);

-- ============================================================ indexes

create index if not exists idx_drills_user        on public.drills(user_id, created_at desc);
create index if not exists idx_drills_assessment  on public.drills(assessment_id);
create index if not exists idx_drills_competency  on public.drills(user_id, competency);
create index if not exists idx_outcomes_user      on public.outcomes(user_id, created_at desc);
create index if not exists idx_outcomes_assess    on public.outcomes(assessment_id);

-- ============================================================ row level security

alter table public.drills    enable row level security;
alter table public.outcomes  enable row level security;

-- Drills: owner full access. (No DELETE concern like assessments — drills don't
-- gate a free counter — but scope every op to the owner.)
drop policy if exists "own drills" on public.drills;
create policy "own drills" on public.drills
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Outcomes: owner full access, and the linked assessment must also belong to the
-- user (defense in depth so a row can't be attached to someone else's assessment).
drop policy if exists "own outcomes" on public.outcomes;
create policy "own outcomes" on public.outcomes
  for all using (
    user_id = auth.uid()
    and assessment_id in (select id from public.assessments where user_id = auth.uid())
  ) with check (
    user_id = auth.uid()
    and assessment_id in (select id from public.assessments where user_id = auth.uid())
  );
