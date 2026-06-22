# FirstWeek

**Simulate the job before you apply.**

FirstWeek is a job-readiness simulator for people who find a job posting but aren't sure they can actually do the role. Paste a posting (or import it by URL) and your resume → do realistic work tasks from the role → get an honest readiness report with your strengths, gaps, and fit.

🔗 **Live:** [firstweekapp.vercel.app](https://firstweekapp.vercel.app)

---

## What it does

1. **Job analysis** — paste a posting or import it from a URL; AI extracts the real responsibilities, skills, tools, and hidden expectations.
2. **Candidate profiling** — AI maps your resume to a structured capability profile.
3. **Work simulations** — generates realistic tasks you'd actually face in week one.
4. **Evidence-based evaluation** — deterministic scoring of your responses against role-specific rubrics.
5. **Readiness report** — a 0–100 score with strengths, gaps, transferable skills, risks, and a prep plan.

The core question is **"can I actually do this job?"** — not "does my resume have the keywords?" This isn't a resume optimizer or interview-question generator.

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, RSC) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 · custom design system · Fraunces + Plus Jakarta Sans |
| AI | OpenAI (Structured Outputs via `zod`), per-stage model routing |
| Database / Auth | Supabase (Postgres + RLS, cookie auth via `@supabase/ssr`) |
| Billing | RevenueCat Web Billing (Stripe-backed) — *gated off until launch* |
| Analytics | Vercel Analytics + Speed Insights |
| Web deploy | Vercel |
| Mobile | Expo (React Native WebView shell) in [`/mobile`](./mobile) |

---

## Run locally

```bash
cp .env.example .env.local   # fill in OPENAI_API_KEY + the three SUPABASE_* vars
npm install
npm run dev                  # http://localhost:3000
```

Apply the DB schema from [`supabase/migrations`](./supabase/migrations) in the Supabase SQL editor. See [`.env.example`](./.env.example) for all (mostly optional) config — cost controls, billing, site URL.

```bash
npm run build       # production build
npm run typecheck   # tsc --noEmit
```

---

## Project layout

| Path | What's there |
|---|---|
| `src/app` | Routes: marketing `/`, `/assessment`, `/dashboard`, `/login`, `/story`, `/guides`, `/pricing`, API under `/api` |
| `src/lib/ai` | The 6-stage pipeline (extract → match → simulate → evaluate → report) |
| `src/lib/scoring.ts` | Deterministic scoring (recomputed from normalized rubric weights) |
| `src/lib/billing` | RevenueCat entitlement + free→Pro gate |
| `src/data/guides.ts` | SEO guides content hub (`/guides`) |
| `mobile/` | Expo native shell (separate app; EAS builds this folder) |
| `docs/` | Product, architecture, AI workflows, schema, monetization, launch checklist |

---

## Documentation

| Document | Description |
|---|---|
| [PRODUCT_SPEC.md](./docs/PRODUCT_SPEC.md) | Product strategy, target user, positioning |
| [TECH_ARCHITECTURE.md](./docs/TECH_ARCHITECTURE.md) | System architecture and pipeline design |
| [AI_WORKFLOWS.md](./docs/AI_WORKFLOWS.md) | AI prompt templates with input/output schemas |
| [DATABASE_SCHEMA.md](./docs/DATABASE_SCHEMA.md) | Tables, relationships, indexes, RLS |
| [MONETIZATION.md](./docs/MONETIZATION.md) | Unit economics and pricing tiers |
| [LAUNCH_CHECKLIST.md](./docs/LAUNCH_CHECKLIST.md) | Pre-launch hardening checklist |

---

## Status

🟢 **Live in production** — full AI pipeline, auth, persistence, cost controls, SEO content, and an installable PWA are shipped. Billing (RevenueCat) is wired but gated off until launch.

## License

Private. All rights reserved.
