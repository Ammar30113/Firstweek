# FirstWeek — Launch Checklist

Production hardening that's already done is checked. The unchecked items are
deliberate pre-launch toggles (several are off so you can keep testing now).

## Security / secrets
- [x] Secrets server-side only; `.env.local` gitignored (URL/anon/service keys)
- [x] RLS on all tables, verified (owner-only; cross-user blocked)
- [x] Security headers (`next.config.mjs`)
- [x] Job-URL ingestion SSRF guard (`src/lib/ingest/job-url.ts`): http(s) only, private/loopback/link-local/CGNAT/metadata ranges blocked (IPv4 + IPv6 + IPv4-mapped), DNS-resolved + every redirect hop re-validated, body cap + total-deadline timeout. Unit-tested (22/22 block cases).
- [ ] **Job-URL fetch: pin the validated IP** (custom `undici` dispatcher) to fully close the DNS-rebinding TOCTOU window between resolve and connect. Deferred hardening — the per-hop re-validation + literal checks close the trivially-exploitable holes; pinning needs an `undici` dep.
- [ ] **Rotate the OpenAI API key** (was pasted in chat)
- [ ] **Rotate the Supabase `sbp_` access token** (account-level, pasted in chat)
- [ ] Move secrets into Vercel project env vars (not `.env.local`) for deploy

## Auth
- [x] Email/password auth, route-protecting middleware, sign-out
- [x] Signup → profile trigger
- [ ] **Re-enable email confirmation** (`mailer_autoconfirm: false`) — currently OFF for dev testing
- [ ] Configure a custom SMTP sender for auth emails (Supabase default is rate-limited)
- [ ] Set Supabase **Site URL + redirect URLs** to the production domain

## Cost controls
- [x] Per-stage model routing (`gpt-4o-mini` base, `gpt-4o` eval/report)
- [x] Token + cost logging to `ai_logs` (`prompt_tokens`, `completion_tokens`, `cost_usd`)
- [x] Per-user rate limit (`RATE_LIMIT_PER_HOUR`, default 20)
- [x] Global daily spend kill-switch (`DAILY_BUDGET_USD`, default 25)
- [x] Input length caps (16k chars per field)
- [ ] **Request `gpt-4.1` access** from OpenAI, then switch the model env vars (cheaper-per-quality)
- [ ] Tune `RATE_LIMIT_PER_HOUR` / `DAILY_BUDGET_USD` for real traffic
- [ ] Add a "1 free assessment per account" gate once billing exists (free→paid)

## SEO / sharing
- [x] `robots.ts` + `sitemap.ts`
- [x] OpenGraph / Twitter metadata
- [ ] Set `NEXT_PUBLIC_SITE_URL` to the production domain
- [ ] Add an OG share image (`/opengraph-image`)

## Reliability
- [x] Error boundary (`error.tsx`) + 404 (`not-found.tsx`)
- [x] AI calls: Structured Outputs + retry-once + clean errors
- [x] `maxDuration` set on AI routes
- [ ] Spot-check `gpt-4o-mini` evaluation quality vs `gpt-4o`
- [ ] Verify behavior under a forced AI failure (kill network mid-run)

## Deploy
- [ ] Connect repo to Vercel; set all env vars
- [ ] Point a custom domain; confirm HTTPS + HSTS
- [ ] Smoke-test the full flow on the deployed URL
- [ ] (Recommended) error monitoring (Sentry) + uptime check

## UI (separate track — brainstorming first)
- [ ] Landing page, visual system, polish — see UI brainstorm
