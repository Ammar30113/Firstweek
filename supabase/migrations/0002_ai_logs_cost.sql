-- Capture per-call token usage + cost so real COGS is measurable and a daily
-- spend kill-switch is possible.
alter table public.ai_logs
  add column if not exists prompt_tokens     integer,
  add column if not exists completion_tokens integer,
  add column if not exists cost_usd          numeric(12, 6);

-- Used by the daily-budget guard (sum cost_usd for today).
create index if not exists idx_ai_logs_created on public.ai_logs(created_at desc);
