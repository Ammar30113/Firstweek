-- Cross-platform "pro" entitlement, synced from RevenueCat webhooks.
-- Keyed by app_user_id = the Supabase auth user UUID (stored as text, the way
-- RevenueCat sends it back). Only the service-role webhook writes here; users
-- may read their own row.

create table if not exists public.entitlements (
  app_user_id text        not null,
  entitlement text        not null default 'pro',
  is_active   boolean     not null default false,
  expires_at  timestamptz,
  store       text,
  updated_at  timestamptz not null default now(),
  primary key (app_user_id, entitlement)
);

alter table public.entitlements enable row level security;

-- Read-your-own. No write policy exists, so clients cannot insert/update/delete;
-- the webhook uses the service role, which bypasses RLS.
drop policy if exists "entitlements_self_read" on public.entitlements;
create policy "entitlements_self_read" on public.entitlements
  for select using (app_user_id = auth.uid()::text);
