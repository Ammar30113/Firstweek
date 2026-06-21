# FirstWeek

**Simulate the job before you apply.**

FirstWeek is a job-readiness simulation platform for job seekers who find a job posting but aren't sure whether they can actually perform the role in real life.

Paste a job description → upload your resume → complete realistic work simulations → get a readiness report showing your strengths, gaps, and fit.

---

## What It Does

1. **Job Analysis** — paste a job posting (or import it from a URL) and AI extracts role requirements, day-to-day work, skills, tools, and hidden expectations
2. **Candidate Profiling** — AI maps your resume to a structured capability profile
3. **Work Simulations** — Generates 3–5 realistic tasks you'd actually face in the role
4. **Evidence-Based Evaluation** — Scores your responses against role-specific rubrics with real evidence
5. **Readiness Report** — Professional report with readiness score, strengths, gaps, and preparation recommendations

## The Core Question

> "Can I actually do this job?"

This is **not** a resume optimizer, ATS keyword matcher, or interview question generator. FirstWeek evaluates **practical work capability** through role-specific simulations.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Forms | React Hook Form + Zod |
| AI | OpenAI GPT-4o (structured JSON outputs) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Deployment | Vercel |

---

## Documentation

All product and technical documentation lives in [`/docs`](./docs/):

| Document | Description |
|---|---|
| [PRODUCT_SPEC.md](./docs/PRODUCT_SPEC.md) | Product strategy, target user, positioning, and core flow |
| [TECH_ARCHITECTURE.md](./docs/TECH_ARCHITECTURE.md) | System architecture, pipeline design, module breakdown |
| [AI_WORKFLOWS.md](./docs/AI_WORKFLOWS.md) | All 6 AI prompt templates with input/output JSON schemas |
| [DATABASE_SCHEMA.md](./docs/DATABASE_SCHEMA.md) | Complete database schema with tables, relationships, indexes |
| [MVP_TASKS.md](./docs/MVP_TASKS.md) | Phase-by-phase build plan and task checklist |

---

## Status

🟡 **Pre-development** — Documentation complete, awaiting technical review before implementation begins.

---

## License

Private. All rights reserved.
