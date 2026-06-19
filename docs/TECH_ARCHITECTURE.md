# FirstWeek — Technical Architecture

## System Overview

FirstWeek is a web-based SaaS application that converts job descriptions into practical work simulations, evaluates user responses, and generates readiness reports. The system uses a multi-stage AI pipeline with structured JSON outputs at every step.

---

## Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| Framework | Next.js 15 (App Router) | Server components, API routes, SSR, industry standard |
| Language | TypeScript | Type safety for AI JSON schemas |
| Styling | Tailwind CSS v4 + shadcn/ui | Rapid UI development, professional components |
| Forms | React Hook Form + Zod | Validated forms with typed schemas |
| AI | OpenAI GPT-4o | Structured JSON output mode, reliable for extraction tasks |
| Database | Supabase (PostgreSQL) | Auth + DB + storage in one, generous free tier |
| Auth | Supabase Auth | Email/password + OAuth, Row Level Security |
| File Storage | Supabase Storage | Resume PDF uploads |
| PDF Export | Printable HTML → `window.print()` | MVP simplicity; upgrade to `@react-pdf/renderer` later |
| Deployment | Vercel | Zero-config Next.js hosting, edge functions |
| Validation | Zod | Runtime validation of all AI outputs |

---

## System Pipeline

```
User Input (Job Description + Resume)
        │
        ▼
┌─────────────────────┐    ┌──────────────────────┐
│  Job Extraction AI   │    │ Candidate Extract AI  │
│  (Prompt 1)          │    │ (Prompt 2)            │
└────────┬────────────┘    └──────────┬───────────┘
         │                            │
         └──────────┬─────────────────┘
                    ▼
         ┌─────────────────────┐
         │ Role-Candidate Match │
         │ (Prompt 3)           │
         └──────────┬──────────┘
                    ▼
         ┌─────────────────────┐
         │ Simulation Generator │
         │ (Prompt 4)           │
         └──────────┬──────────┘
                    ▼
         ┌─────────────────────┐
         │ User Completes Tasks │
         │ (Frontend UI)        │
         └──────────┬──────────┘
                    ▼
         ┌─────────────────────┐
         │ Task Evaluator       │
         │ (Prompt 5, per task) │
         └──────────┬──────────┘
                    ▼
         ┌─────────────────────┐
         │ Scoring Engine       │
         │ (Pure TypeScript)    │
         └──────────┬──────────┘
                    ▼
         ┌─────────────────────┐
         │ Report Generator     │
         │ (Prompt 6)           │
         └──────────┬──────────┘
                    ▼
         ┌─────────────────────┐
         │ Readiness Dashboard  │
         │ + Report Preview     │
         └─────────────────────┘
```

---

## Module Architecture

### Core Modules

| Module | Location | Purpose |
|---|---|---|
| `job-extraction` | `src/lib/ai/job-extraction.ts` | Parse job description → structured role profile |
| `profile-extraction` | `src/lib/ai/profile-extraction.ts` | Parse resume → structured candidate profile |
| `role-match` | `src/lib/ai/role-match.ts` | Compare job + candidate → match analysis |
| `simulation-generator` | `src/lib/ai/simulation-generator.ts` | Generate role-specific work tasks |
| `evaluator` | `src/lib/ai/evaluator.ts` | Evaluate individual task responses |
| `report-generator` | `src/lib/ai/report-generator.ts` | Synthesize evaluations → final report |
| `scoring-engine` | `src/lib/scoring/scoring-engine.ts` | Pure logic: weighted scores, bands, confidence |
| `schemas` | `src/lib/schemas/*.ts` | Zod schemas for all data shapes |

### Frontend Modules

| Module | Location | Purpose |
|---|---|---|
| `layout` | `src/components/layout/` | Navbar, Footer, PageHeader, StepIndicator |
| `assessment` | `src/components/assessment/` | Job input form, resume form, analysis cards |
| `simulation` | `src/components/simulation/` | Task cards, response inputs, progress |
| `dashboard` | `src/components/dashboard/` | Score display, competency charts, recommendations |
| `report` | `src/components/report/` | Report preview, printable version |

---

## API Routes

All AI-powered operations go through server-side API routes to protect API keys.

| Method | Route | Input | Output |
|---|---|---|---|
| POST | `/api/job/analyze` | `{ job_description, title?, company?, url? }` | Structured role analysis JSON |
| POST | `/api/profile/analyze` | `{ resume_text, current_role?, years_experience? }` | Structured candidate profile JSON |
| POST | `/api/simulation/generate` | `{ job_analysis, candidate_profile, match_analysis }` | Array of simulation tasks |
| POST | `/api/evaluation/evaluate` | `{ task, user_response, rubric }` | Structured evaluation JSON |
| POST | `/api/report/generate` | `{ assessment_data, evaluations[], job_analysis, candidate_profile }` | Final report JSON |

---

## State Management

### Phase 1–6 (No Database)

Assessment state is managed client-side using React Context + `useReducer`. The full assessment flows through a single session without persistence.

```typescript
interface AssessmentState {
  step: 'input' | 'analyzing' | 'analysis' | 'simulating' | 'simulation' | 'evaluating' | 'results' | 'report';
  jobDescription: string;
  resumeText: string;
  jobAnalysis: JobAnalysis | null;
  candidateProfile: CandidateProfile | null;
  roleMatch: RoleMatch | null;
  simulationTasks: SimulationTask[];
  taskResponses: Map<string, string>;
  evaluations: TaskEvaluation[];
  overallScore: number | null;
  report: Report | null;
}
```

### Phase 7+ (Supabase)

State moves to database. Each step writes to the appropriate table. The client fetches state from the database on page load, enabling assessment resumption and history.

---

## AI Integration Design

### Principles

1. **Separate prompts** — One prompt per pipeline stage. No mega-prompts.
2. **Structured outputs** — Use OpenAI's JSON mode with Zod schemas.
3. **Validation** — Every AI response is validated against a Zod schema before use.
4. **Logging** — Every AI call (input, output, model, duration, errors) is logged to `ai_logs` table.
5. **Error handling** — Retry once on failure; surface clear error to user on second failure.
6. **No hallucination** — Prompts explicitly instruct the model to cite evidence and mark uncertainty.

### AI Call Pattern

```typescript
async function callAI<T>(
  prompt: string,
  systemPrompt: string,
  schema: z.ZodSchema<T>,
  stepName: string
): Promise<T> {
  const start = Date.now();
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' }
    });
    
    const parsed = JSON.parse(response.choices[0].message.content);
    const validated = schema.parse(parsed);
    
    // Log success
    await logAICall(stepName, prompt, validated, null, Date.now() - start);
    
    return validated;
  } catch (error) {
    // Log failure
    await logAICall(stepName, prompt, null, error, Date.now() - start);
    throw error;
  }
}
```

---

## Scoring Engine Design

### Pure TypeScript, No AI

The scoring engine is deterministic — no AI involved. It takes competency scores from the evaluator and applies weighted calculations.

```
1. Each task has competencies with weights (must sum to 1.0)
2. Evaluator scores each competency 1–5
3. Convert: score × 20 = normalized (1→20, 2→40, 3→60, 4→80, 5→100)
4. Task score = Σ(normalized × weight) for each competency
5. Overall score = average of all task scores (rounded to integer)
6. Readiness band = lookup from score ranges
7. Confidence level = f(input quality, response completeness, score consistency)
```

### Confidence Calculation

```
Confidence factors:
- Job description length > 200 chars: +1
- Resume text length > 300 chars: +1
- All tasks completed: +1
- Average response length > 150 chars: +1
- Score standard deviation < 20: +1

High = 4-5 factors met
Medium = 2-3 factors met
Low = 0-1 factors met
```

---

## Security Considerations

1. **API keys** — Server-side only, never exposed to client
2. **Input sanitization** — All user input validated with Zod before processing
3. **Rate limiting** — Per-user limits on AI calls (post-MVP)
4. **Row Level Security** — Supabase RLS ensures users only access their own data
5. **File uploads** — Size limits, type validation, virus scanning (post-MVP)
6. **No PII in logs** — AI logs store assessment IDs, not raw personal data

---

## Error Handling Strategy

| Error Type | Handling |
|---|---|
| AI API timeout | Retry once → show "Please try again" with retry button |
| AI returns invalid JSON | Retry once → show error with option to re-run step |
| Zod validation failure | Log full response, show generic error, alert team |
| User submits empty response | Client-side validation prevents submission |
| Rate limit hit | Show friendly message with cooldown timer |
| Network error | Show offline banner, enable retry |
| Supabase error | Log error, show generic message |

---

## Deployment Architecture

```
┌──────────────┐     ┌─────────────┐     ┌──────────────┐
│   Vercel      │────▶│  OpenAI API  │     │  Supabase    │
│  (Next.js)    │     │  (GPT-4o)    │     │  (PostgreSQL │
│               │────▶│              │     │   + Auth     │
│  - SSR pages  │     └─────────────┘     │   + Storage) │
│  - API routes │                          │              │
│  - Edge funcs │─────────────────────────▶│              │
└──────────────┘                          └──────────────┘
```

---

## Performance Targets

| Metric | Target |
|---|---|
| Landing page load | < 2s |
| Job analysis AI call | < 15s |
| Simulation generation | < 20s |
| Per-task evaluation | < 10s |
| Report generation | < 15s |
| Full assessment flow | < 5 minutes (excluding user work time) |

---

## Future Architecture Considerations

1. **Queue system** — For long AI calls, move to background jobs with status polling
2. **Caching** — Cache job analyses for identical job descriptions
3. **Multi-model** — Abstract AI provider to swap between OpenAI/Anthropic/Gemini
4. **Webhooks** — Notify users when async assessments complete
5. **CDN** — Cache generated reports for fast re-access
6. **Multi-tenant** — Employer accounts with separate data isolation
