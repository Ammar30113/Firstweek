# FirstWeek — Monetization & Unit Economics

> Focus: keep OpenAI cost per assessment low enough that every tier has a fat
> gross margin. Grounded in the **actual** pipeline we built (`src/lib/ai/stages.ts`),
> not a generic estimate.

---

## TL;DR

- **One full assessment = ~8 OpenAI calls** (job extract, candidate extract, match, simulation, 3× task eval, report).
- **Today (default `gpt-4o`): ~$0.19 / assessment.** Output tokens dominate the bill.
- **Biggest lever is model choice, and it's a one-line env change.** Moving the default to `gpt-4.1-mini` drops it to **~$0.03** (≈84% cut); `gpt-4o-mini` to **~$0.011**.
- **Recommended:** `gpt-4.1-mini` as the default for all stages, with an optional **premium tier** that upgrades only *evaluation + report* to `gpt-4.1` (~$0.08) and sells that as higher-fidelity scoring.
- At ~$0.03 COGS, **every pricing tier clears 90%+ gross margin.** The constraint isn't cost — it's distribution. The real money is the **employer/B2B** side (~99% margin per candidate).

---

## 1. What an assessment actually costs

Per-stage token estimates (from `docs/AI_WORKFLOWS.md`; replace with measured numbers once we log token usage — see §5). A 3-task assessment:

| Stage | Calls | Input tok | Output tok |
|---|---|---|---|
| Job extraction | 1 | 2,000 | 1,500 |
| Candidate extraction | 1 | 2,500 | 1,500 |
| Role match | 1 | 3,000 | 1,500 |
| Simulation generation | 1 | 3,500 | 3,000 |
| Task evaluation | 3 | 6,000 | 3,000 |
| Report generation | 1 | 5,000 | 2,500 |
| **Total** | **8** | **~22,000** | **~13,000** |

**Output is ~70% of the cost** (it's priced 4× input), so cheap-output models and tighter outputs matter most.

### Cost per assessment by model

Using per-1M-token rates (June 2026 — verify before relying, see sources):

| Model (all stages) | Input $/1M | Output $/1M | **$ / assessment** |
|---|---|---|---|
| `gpt-4o` (current default) | 2.50 | 10.00 | **~$0.185** |
| `gpt-4.1` | 2.00 | 8.00 | ~$0.148 |
| **`gpt-4.1-mini`** ⭐ | 0.40 | 1.60 | **~$0.030** |
| `gpt-4o-mini` | 0.15 | 0.60 | ~$0.011 |
| Tiered: `4.1-mini` extract/match/sim + `4.1` eval+report | — | — | ~$0.082 |

So the spread between "all premium" and "all mini" is **~17×**. We don't have to pick one globally — we tier (next section).

---

## 2. Cost-optimization roadmap (ranked by impact)

| # | Lever | Cost impact | Effort | Code touchpoint | Quality risk |
|---|---|---|---|---|---|
| L1 | **Default model → `gpt-4.1-mini`** | −84% | 1 line (`OPENAI_MODEL` env) | none | low–med (test eval quality) |
| L2 | **Per-stage model tiering** | tune per stage | small | `stages.ts` + `client.ts` (pass model per call) | low |
| L3 | **Prompt caching** (stable prefixes) | −25–50% on repeated input | medium | reorder prompts in `stages.ts` | none |
| L4 | **Trim output** (rubric/report verbosity, `max_tokens`) | −10–30% | small | prompts + `maxTokens` | low |
| L5 | **Cache job analysis by JD hash** | skips 1 call on repeat JDs | medium | new lookup in `analyze` route | none |
| L6 | **Input length caps** (truncate JD/resume) | prevents blowups + abuse | small | `analyze` route | none |
| L7 | **3 tasks, not 5**, on free tier | −2 eval calls | none (already 3) | — | none |
| L8 | **Per-user/tier rate limits + global kill-switch** | caps worst case | medium | middleware / route guard | none |

**Details on the two big ones:**

- **L1 — default model.** The single highest-leverage change. Extraction and structuring (stages 1–4) are easy for a mini model; the risk concentrates in *evaluation credibility* and *report polish*. Recommendation: set `OPENAI_MODEL=gpt-4.1-mini`, then spot-check 5–10 evaluations against `gpt-4.1` to confirm scoring quality holds. If it does, you've cut COGS ~84% for free.
- **L2 — per-stage tiering.** `callStructured` already takes a `temperature`/`maxTokens` per call; add an optional `model` param and let each stage choose. Run extraction/match/simulation on `gpt-4.1-mini`, and **only** evaluation + report on `gpt-4.1` when the user is on a paid tier. This makes "premium-grade evaluation" a *sellable feature*, not just a cost.

- **L3 — caching.** Stages 3–6 all re-send the same job + candidate JSON (~5.5k tokens). If that block sits at the **start** of the prompt (stable prefix), OpenAI prompt caching discounts it automatically (~50–75% off the cached portion, model-dependent). Reorder the user prompts so the big stable context leads and the per-stage instruction trails.

---

## 3. Pricing & packaging

Assume the optimized **~$0.03/assessment** (mini default) or **~$0.08** (premium eval/report).

| Tier | Price | Included | COGS/mo | Gross margin |
|---|---|---|---|---|
| **Free** | $0 | 1 assessment (mini) | ~$0.03 | acquisition cost |
| **Pro (job seeker)** | $19/mo (or $144/yr) | ~25 assessments, premium eval/report, PDF, history | $0.75–$2.00 | **89–96%** |
| **Credits / one-off** | $5 single · $20 / 5-pack | pay-as-you-go, premium quality | $0.08–$0.40 | **92–98%** |
| **Employer / B2B** | $15–40 / candidate (or seat-based) | candidate work-sample assessment, role-fit report | ~$0.08 | **~99%** |

Notes:
- **Even a heavy Pro user (100 assessments on the premium path = ~$8 COGS) still clears ~58% margin on $19.** Cost is not the risk; abuse and over-generous "unlimited" framing are. Use "unlimited, fair use" with a soft cap (§4).
- **Stripe fees (~2.9% + $0.30) hurt small one-offs** — a $5 charge nets ~$4.55. Prefer **credit packs** (one $20 charge for 5) to dilute the fixed fee.
- **B2B is the business.** Job seekers are price-sensitive and churn after they land a job; employers have budget and recurring need. The job-seeker side is the funnel and the brand; the employer side is the margin. Same engine, ~99% margin per paid candidate.

---

## 4. Free-tier protection & spend controls

The free tier is the main cost-leak vector. Controls:

- **1 free assessment per account**, not per session (we have auth + DB — gate on a count of `assessments` for the user).
- **Require verified email** in production. ⚠️ We disabled email confirmation for dev testing (`mailer_autoconfirm: true`) — **re-enable before launch**, or free-tier abuse via throwaway emails is trivial.
- **Input length caps** (L6): reject/truncate job descriptions and resumes past ~8k chars — stops both cost blowups and prompt-stuffing.
- **Per-user monthly cap** even on paid (fair use), enforced from the `assessments` count.
- **Global daily spend kill-switch**: sum `ai_logs` cost for the day; if over budget, return a friendly "at capacity" message. Cheap insurance against a runaway loop or attack.

---

## 5. Cost observability (instrument what we already log)

We log `ai_logs` (step, model, duration) but **not tokens or cost** — so we're flying blind on real COGS. Concrete upgrade:

- OpenAI returns `completion.usage` (`prompt_tokens`, `completion_tokens`, plus cached-token counts). Capture it in `callStructured`, thread it into `runAiStage`, and add `prompt_tokens` / `completion_tokens` / `cost_usd` columns to `ai_logs`.
- Then real per-assessment and per-user cost is a single SQL query, and the kill-switch in §4 becomes trivial.

This turns every number in this doc from an estimate into a measured fact — do it before you tune models, so you can A/B cost vs. quality with data.

---

## 6. Break-even & KPIs

- **Fixed infra:** Vercel Pro (~$20/mo) + Supabase Pro (~$25/mo) + domain ≈ **~$50/mo**. Break-even is **~3 Pro subscribers**. Cost is not the obstacle.
- **Track:** COGS/assessment (from §5), assessments/active user, free→paid conversion, Pro churn, and **B2B candidate volume** (the margin driver).
- **LTV/CAC:** job-seeker LTV is short (they leave when hired) — keep CAC low (SEO, "see example report," referral). Employer LTV is long — worth real CAC.

---

## 7. Recommended sequence (do this first)

1. **Instrument cost** (§5) — add token/cost logging to `ai_logs`. ~1 hour, unblocks everything.
2. **Flip default to `gpt-4.1-mini`** (L1) and spot-check evaluation quality vs. `gpt-4.1`. ~84% cost cut if quality holds.
3. **Add per-stage tiering** (L2) so paid tiers get `gpt-4.1` eval+report as a feature.
4. **Re-enable email confirmation** + **1-free-per-account** gate (§4) before any public launch.
5. **Ship Pro (credits or $19/mo)** once 2–4 are in place; start the **B2B** conversation in parallel — that's where the margin lives.

---

## Pricing sources & caveats

Prices are **as of June 2026** from secondary trackers (OpenAI's pricing page was not directly reachable when this was written) and **must be verified** at the official pricing page before you commit. The GPT-4.1 family rates below match OpenAI's published launch pricing and are the basis for the math above:

- GPT-4.1 $2 / $8, GPT-4.1-mini $0.40 / $1.60, GPT-4.1-nano $0.10 / $0.40 (per 1M input/output)
- GPT-4o $2.50 / $10, GPT-4o-mini $0.15 / $0.60
- Prompt caching discounts repeated input ~50–75% (model-dependent); Batch API ~50% off (async, not for the live flow)
- A GPT-5 family may now exist (reported ~$1.25/1M input) — evaluate it against `gpt-4.1` for the premium tier, but verify rates first.

Sources: [pecollective OpenAI pricing](https://pecollective.com/tools/openai-api-pricing/), [aipricing.guru OpenAI](https://www.aipricing.guru/openai-pricing/), [Inworld GPT-4.1-mini](https://inworld.ai/models/openai-gpt-4-1-mini). Verify against `https://openai.com/api/pricing`.
