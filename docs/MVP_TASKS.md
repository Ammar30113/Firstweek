# FirstWeek — MVP Build Tasks

## Build Phases

The MVP is built in 8 phases. Each phase is independently testable. Phases 1–6 do not require a database.

---

## Phase 0: Product Documentation

- [ ] Create `/docs/PRODUCT_SPEC.md`
- [ ] Create `/docs/TECH_ARCHITECTURE.md`
- [ ] Create `/docs/AI_WORKFLOWS.md`
- [ ] Create `/docs/DATABASE_SCHEMA.md`
- [ ] Create `/docs/MVP_TASKS.md` (this file)
- [ ] Update `README.md` with project overview

**Exit criteria:** All docs reviewed and approved by team.

---

## Phase 1: Project Setup + Static Prototype

### 1.1 Project Initialization
- [ ] Initialize Next.js 15 with TypeScript and App Router
- [ ] Configure Tailwind CSS v4
- [ ] Install and configure shadcn/ui
- [ ] Set up folder structure (`src/app`, `src/components`, `src/lib`, `src/data`)
- [ ] Configure ESLint and Prettier
- [ ] Set up `.env.example`
- [ ] Add Inter font from Google Fonts

### 1.2 Design System
- [ ] Define color palette (professional, calm — slate/zinc base, blue accent)
- [ ] Set up CSS custom properties and design tokens
- [ ] Create animation utilities (fade-in, slide-up, etc.)
- [ ] Install shadcn/ui components: Button, Card, Input, Textarea, Badge, Progress, Tabs

### 1.3 Layout Components
- [ ] `Navbar.tsx` — logo, navigation links, CTA button
- [ ] `Footer.tsx` — links, copyright, disclaimer
- [ ] `PageHeader.tsx` — consistent page headers with breadcrumbs
- [ ] `StepIndicator.tsx` — multi-step progress indicator

### 1.4 Type Definitions & Schemas
- [ ] `src/lib/schemas/job.ts` — Zod schema for job analysis
- [ ] `src/lib/schemas/candidate.ts` — Zod schema for candidate profile
- [ ] `src/lib/schemas/simulation.ts` — Zod schema for simulation tasks
- [ ] `src/lib/schemas/evaluation.ts` — Zod schema for task evaluations
- [ ] `src/lib/schemas/report.ts` — Zod schema for final report
- [ ] `src/lib/schemas/assessment.ts` — Zod schema for assessment state

### 1.5 Mock Data
- [ ] `src/data/sample-job.ts` — CS Ops Analyst job description + analysis
- [ ] `src/data/sample-candidate.ts` — Ammar's profile + extracted profile
- [ ] `src/data/sample-simulation.ts` — 3 tasks with mock evaluations
- [ ] `src/data/sample-report.ts` — Complete mock report

### 1.6 Landing Page
- [ ] Hero section with headline + CTA
- [ ] "How It Works" section (4 steps)
- [ ] Example simulation card
- [ ] Positioning statement section
- [ ] Footer with disclaimer
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Micro-animations (fade-in on scroll, hover effects)

### 1.7 Assessment Flow (Mock Data)
- [ ] `/assessment/new` — Multi-step form (job input → resume input)
- [ ] `/assessment/[id]` — Role analysis view with mock data
- [ ] `/assessment/[id]/simulation` — Task completion UI (one task at a time)
- [ ] `/assessment/[id]/results` — Results dashboard with mock scores
- [ ] `/assessment/[id]/report` — Report preview with print button

### 1.8 Assessment Components
- [ ] `JobInputForm.tsx` — textarea for job description, optional URL
- [ ] `ResumeInputForm.tsx` — textarea for resume paste
- [ ] `RoleAnalysisCard.tsx` — displays extracted role details
- [ ] `CandidateProfileCard.tsx` — displays candidate summary

### 1.9 Simulation Components
- [ ] `TaskCard.tsx` — scenario, instructions, competencies
- [ ] `TaskResponse.tsx` — text area with character count
- [ ] `SimulationProgress.tsx` — task N of M progress bar

### 1.10 Results Components
- [ ] `ReadinessScore.tsx` — animated circular/arc score display
- [ ] `CompetencyBreakdown.tsx` — horizontal bar chart
- [ ] `StrengthsList.tsx` — strengths with evidence bullets
- [ ] `GapsList.tsx` — gaps with recommendations
- [ ] `RecommendationCard.tsx` — apply/prepare/hold card

### 1.11 Report Components
- [ ] `ReportPreview.tsx` — full document layout
- [ ] `ReportSection.tsx` — reusable section wrapper
- [ ] `PrintableReport.tsx` — print-optimized CSS

**Exit criteria:** Full flow navigable with mock data. UI looks professional and production-ready. All pages responsive.

---

## Phase 2: Real AI Job Analysis

- [ ] Set up OpenAI SDK (`openai` package)
- [ ] Create `src/lib/ai/openai-client.ts` — shared client with error handling
- [ ] Create `src/lib/ai/job-extraction.ts` — job extraction AI function
- [ ] Create `src/app/api/job/analyze/route.ts` — API endpoint
- [ ] Wire `JobInputForm` to real API endpoint
- [ ] Add loading state during AI call (skeleton + progress message)
- [ ] Add error handling for failed AI calls
- [ ] Validate AI response with Zod schema
- [ ] Display real extracted analysis on role analysis page
- [ ] Test with 3+ different job descriptions

**Exit criteria:** Pasting any job description produces a structured role analysis displayed on the analysis page.

---

## Phase 3: Candidate Profile Parsing

- [ ] Create `src/lib/ai/profile-extraction.ts` — candidate extraction AI function
- [ ] Create `src/app/api/profile/analyze/route.ts` — API endpoint
- [ ] Create `src/lib/ai/role-match.ts` — role-candidate match AI function
- [ ] Wire `ResumeInputForm` to real API endpoint
- [ ] Display real candidate profile summary
- [ ] Run match analysis after both job + candidate are ready
- [ ] Display match results (strengths, gaps, transferable skills)
- [ ] Add loading states and error handling
- [ ] Test with seed candidate profile

**Exit criteria:** Pasting resume text produces candidate profile and match analysis.

---

## Phase 4: Simulation Generation

- [ ] Create `src/lib/ai/simulation-generator.ts` — simulation generator AI function
- [ ] Create `src/app/api/simulation/generate/route.ts` — API endpoint
- [ ] Wire "Generate Simulation" button to real API
- [ ] Replace mock tasks with real AI-generated tasks
- [ ] Validate generated tasks have proper rubrics
- [ ] Add loading state for generation (~15-20 seconds)
- [ ] Test generated tasks for realism and relevance

**Exit criteria:** AI generates 3-5 realistic tasks with proper rubrics for any job description.

---

## Phase 5: Evaluation Engine

- [ ] Create `src/lib/ai/evaluator.ts` — task evaluation AI function
- [ ] Create `src/lib/scoring/scoring-engine.ts` — pure scoring logic
- [ ] Create `src/app/api/evaluation/evaluate/route.ts` — API endpoint
- [ ] Wire task submission to evaluation API
- [ ] Evaluate each task response individually
- [ ] Calculate per-task weighted scores
- [ ] Calculate overall assessment score
- [ ] Determine readiness band and confidence level
- [ ] Display real scores on results dashboard
- [ ] Add evaluation progress indicator
- [ ] Test scoring engine with unit tests

**Exit criteria:** User responses are evaluated with evidence-based scoring. Overall score is calculated and displayed.

---

## Phase 6: Report Generation

- [ ] Create `src/lib/ai/report-generator.ts` — report generator AI function
- [ ] Create `src/app/api/report/generate/route.ts` — API endpoint
- [ ] Wire report generation to completed assessment
- [ ] Render full 15-section report
- [ ] Implement print-to-PDF via `window.print()` with print CSS
- [ ] Add "Copy Summary" button (clipboard API)
- [ ] Add "Start Another Simulation" button
- [ ] Include disclaimer in report
- [ ] Test report output quality

**Exit criteria:** Complete professional report generated and downloadable as PDF via print.

---

## Phase 7: Auth + Assessment History

- [ ] Set up Supabase project
- [ ] Configure Supabase client (`src/lib/db/supabase.ts`)
- [ ] Run database migrations (all tables from schema)
- [ ] Implement Supabase Auth (email/password)
- [ ] Create login/signup pages
- [ ] Add auth middleware for protected routes
- [ ] Create `src/lib/db/queries.ts` — CRUD functions
- [ ] Save assessments to database on completion
- [ ] Save AI logs on every AI call
- [ ] Create `/dashboard` — assessment history list
- [ ] Enable assessment resumption (save progress at each step)
- [ ] Apply Row Level Security policies
- [ ] Test RLS policies

**Exit criteria:** Users can sign up, log in, complete assessments, and view their history.

---

## Phase 8: Polish

### UX Polish
- [ ] Loading skeletons for all AI-waiting states
- [ ] Smooth page transitions
- [ ] Empty states (no assessments, no results)
- [ ] Error boundaries with retry buttons
- [ ] Toast notifications for save/submit actions
- [ ] Responsive design audit (mobile breakpoints)
- [ ] Keyboard navigation and focus management

### Content
- [ ] Pre-built demo assessment (viewable without creating one)
- [ ] "See Example Report" on landing page
- [ ] Better onboarding copy and instructions
- [ ] Helpful tooltips on competency scores

### Technical
- [ ] Meta tags + OG images for social sharing
- [ ] `robots.txt` and `sitemap.xml`
- [ ] Performance audit (Core Web Vitals)
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Error logging (console → structured logs)
- [ ] Rate limiting on AI endpoints
- [ ] Input length limits on text fields

### Testing
- [ ] Unit tests for scoring engine
- [ ] Zod schema validation tests
- [ ] Manual QA: full flow with 3+ different roles
- [ ] Mobile testing
- [ ] Cross-browser testing (Chrome, Safari, Firefox)

**Exit criteria:** Product feels professional, handles errors gracefully, passes accessibility audit.

---

## Acceptance Criteria (Overall MVP)

1. ✅ User can paste a job description
2. ✅ User can paste resume/profile text
3. ✅ App extracts role requirements with AI
4. ✅ App extracts candidate strengths/gaps with AI
5. ✅ App generates at least 3 realistic simulation tasks
6. ✅ User can answer the tasks in text form
7. ✅ App evaluates answers with evidence-based scoring
8. ✅ App generates overall readiness score (0-100)
9. ✅ App produces a professional 15-section report
10. ✅ Full flow works without manual database editing
11. ✅ Errors are handled gracefully
12. ✅ Results clearly communicate they are estimates, not guarantees

---

## Risk Mitigation Checklist

- [ ] AI outputs validated with Zod before display
- [ ] All AI calls have timeout and retry logic
- [ ] API keys are server-side only (never in client bundle)
- [ ] Disclaimer present on all reports
- [ ] No discriminatory language in AI prompts
- [ ] No guaranteed employment outcome language anywhere
- [ ] Rate limiting on AI endpoints (post-MVP acceptable)
- [ ] Input sanitization on all user inputs
