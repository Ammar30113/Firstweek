# FirstWeek — Database Schema

## Overview

FirstWeek uses PostgreSQL (via Supabase) with 9 tables. The schema supports the full assessment lifecycle from job input through report generation.

Database is introduced in Phase 7. Phases 1–6 use client-side state management with mock/in-memory data.

---

## Entity Relationship Diagram

```
users
  │
  ├── candidate_profiles (1:many)
  ├── job_posts (1:many)
  ├── assessments (1:many)
  │     │
  │     ├── simulation_tasks (1:many)
  │     │     │
  │     │     └── task_responses (1:1 per task per assessment)
  │     │           │
  │     │           └── task_evaluations (1:1)
  │     │
  │     └── reports (1:1)
  │
  └── ai_logs (1:many)
```

---

## Tables

### users

Extends Supabase Auth's `auth.users` with application-specific fields.

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK, DEFAULT gen_random_uuid() | Primary key |
| email | TEXT | UNIQUE, NOT NULL | User's email |
| name | TEXT | | Display name |
| created_at | TIMESTAMPTZ | DEFAULT now() | Account creation time |

---

### candidate_profiles

Stores structured candidate information extracted from resumes.

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK, DEFAULT gen_random_uuid() | Primary key |
| user_id | UUID | FK → users(id) ON DELETE CASCADE | Owner |
| full_name | TEXT | | Candidate's full name |
| current_title | TEXT | | Current job title |
| years_experience | INTEGER | | Estimated years of experience |
| resume_text | TEXT | | Raw resume text |
| skills_json | JSONB | DEFAULT '[]' | Extracted skills array |
| projects_json | JSONB | DEFAULT '[]' | Extracted projects array |
| tools_json | JSONB | DEFAULT '[]' | Tools/technologies array |
| created_at | TIMESTAMPTZ | DEFAULT now() | |
| updated_at | TIMESTAMPTZ | DEFAULT now() | |

---

### job_posts

Stores job descriptions and their AI-extracted analysis.

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK, DEFAULT gen_random_uuid() | Primary key |
| user_id | UUID | FK → users(id) ON DELETE CASCADE | Owner |
| source_url | TEXT | | Original job posting URL |
| title | TEXT | | Job title |
| company | TEXT | | Company name |
| location | TEXT | | Job location |
| raw_description | TEXT | NOT NULL | Original job description text |
| extracted_summary_json | JSONB | | AI-extracted role summary |
| responsibilities_json | JSONB | DEFAULT '[]' | Core responsibilities |
| required_skills_json | JSONB | DEFAULT '[]' | Required skills |
| preferred_skills_json | JSONB | DEFAULT '[]' | Preferred skills |
| tools_json | JSONB | DEFAULT '[]' | Tools mentioned |
| seniority | TEXT | | Seniority level |
| role_family | TEXT | | Role category |
| created_at | TIMESTAMPTZ | DEFAULT now() | |

---

### assessments

The central table linking a candidate profile to a job post with overall results.

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK, DEFAULT gen_random_uuid() | Primary key |
| user_id | UUID | FK → users(id) ON DELETE CASCADE | Owner |
| candidate_profile_id | UUID | FK → candidate_profiles(id) | Candidate being assessed |
| job_post_id | UUID | FK → job_posts(id) | Job being assessed against |
| status | TEXT | DEFAULT 'created', CHECK IN ('created', 'analyzing', 'simulating', 'in_progress', 'evaluating', 'completed', 'error') | Assessment lifecycle status |
| overall_score | INTEGER | | Final readiness score (0-100) |
| readiness_band | TEXT | | Score band label |
| confidence_level | TEXT | | High / Medium / Low |
| application_recommendation | TEXT | | Apply / prepare / hold |
| role_match_json | JSONB | | Role-candidate match analysis |
| created_at | TIMESTAMPTZ | DEFAULT now() | |
| completed_at | TIMESTAMPTZ | | When assessment was finished |

**Status lifecycle:**
```
created → analyzing → simulating → in_progress → evaluating → completed
                                                              → error (from any state)
```

---

### simulation_tasks

Individual simulation tasks generated for an assessment.

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK, DEFAULT gen_random_uuid() | Primary key |
| assessment_id | UUID | FK → assessments(id) ON DELETE CASCADE | Parent assessment |
| title | TEXT | NOT NULL | Task title |
| scenario | TEXT | NOT NULL | Business scenario description |
| instructions | TEXT | NOT NULL | What the user should do |
| expected_deliverable | TEXT | | What the output should look like |
| role_relevance | TEXT | | Why this task matters for the role |
| difficulty | TEXT | | beginner / intermediate / advanced |
| time_estimate_minutes | INTEGER | | Suggested completion time |
| competencies_json | JSONB | DEFAULT '[]' | Competencies being tested |
| rubric_json | JSONB | DEFAULT '[]' | Scoring rubric with weights |
| order_index | INTEGER | NOT NULL | Display order (0-based) |
| created_at | TIMESTAMPTZ | DEFAULT now() | |

---

### task_responses

User's text responses to simulation tasks.

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK, DEFAULT gen_random_uuid() | Primary key |
| simulation_task_id | UUID | FK → simulation_tasks(id) ON DELETE CASCADE | Which task |
| assessment_id | UUID | FK → assessments(id) ON DELETE CASCADE | Which assessment |
| user_response | TEXT | NOT NULL | User's answer text |
| submitted_at | TIMESTAMPTZ | DEFAULT now() | Submission time |

---

### task_evaluations

AI evaluation results for each task response.

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK, DEFAULT gen_random_uuid() | Primary key |
| task_response_id | UUID | FK → task_responses(id) ON DELETE CASCADE | Which response |
| simulation_task_id | UUID | FK → simulation_tasks(id) | Which task |
| assessment_id | UUID | FK → assessments(id) ON DELETE CASCADE | Which assessment |
| score | INTEGER | | Normalized task score (0-100) |
| competency_scores_json | JSONB | DEFAULT '[]' | Per-competency scores and evidence |
| strengths_json | JSONB | DEFAULT '[]' | What was done well |
| weaknesses_json | JSONB | DEFAULT '[]' | What was missed |
| evidence_json | JSONB | DEFAULT '[]' | Evidence from response |
| ideal_answer_summary | TEXT | | What a stronger answer includes |
| improvement_suggestions_json | JSONB | DEFAULT '[]' | Specific improvement recommendations |
| confidence_level | TEXT | | High / Medium / Low |
| created_at | TIMESTAMPTZ | DEFAULT now() | |

---

### reports

Generated readiness reports for completed assessments.

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK, DEFAULT gen_random_uuid() | Primary key |
| assessment_id | UUID | FK → assessments(id) ON DELETE CASCADE, UNIQUE | One report per assessment |
| report_json | JSONB | NOT NULL | Complete report data |
| report_html | TEXT | | Pre-rendered HTML version |
| pdf_url | TEXT | | URL to generated PDF (future) |
| created_at | TIMESTAMPTZ | DEFAULT now() | |

---

### ai_logs

Audit log for all AI API calls.

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | PK, DEFAULT gen_random_uuid() | Primary key |
| user_id | UUID | FK → users(id) ON DELETE SET NULL | Who triggered the call |
| assessment_id | UUID | FK → assessments(id) ON DELETE SET NULL | Related assessment |
| step_name | TEXT | NOT NULL | Pipeline stage name |
| model | TEXT | | AI model used |
| input_json | JSONB | | Prompt/input sent to AI |
| output_json | JSONB | | Response from AI |
| error | TEXT | | Error message if failed |
| duration_ms | INTEGER | | Call duration in milliseconds |
| created_at | TIMESTAMPTZ | DEFAULT now() | |

---

## Indexes

```sql
-- Performance indexes
CREATE INDEX idx_assessments_user ON assessments(user_id);
CREATE INDEX idx_assessments_status ON assessments(status);
CREATE INDEX idx_assessments_created ON assessments(created_at DESC);
CREATE INDEX idx_simulation_tasks_assessment ON simulation_tasks(assessment_id);
CREATE INDEX idx_simulation_tasks_order ON simulation_tasks(assessment_id, order_index);
CREATE INDEX idx_task_responses_assessment ON task_responses(assessment_id);
CREATE INDEX idx_task_responses_task ON task_responses(simulation_task_id);
CREATE INDEX idx_task_evaluations_assessment ON task_evaluations(assessment_id);
CREATE INDEX idx_ai_logs_assessment ON ai_logs(assessment_id);
CREATE INDEX idx_ai_logs_step ON ai_logs(step_name);
CREATE INDEX idx_ai_logs_created ON ai_logs(created_at DESC);
```

---

## Row Level Security (RLS) Policies

```sql
-- Users can only read/write their own data
ALTER TABLE candidate_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own profiles" ON candidate_profiles
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

ALTER TABLE job_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own job posts" ON job_posts
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own assessments" ON assessments
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

ALTER TABLE simulation_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own simulation tasks" ON simulation_tasks
  USING (assessment_id IN (SELECT id FROM assessments WHERE user_id = auth.uid()));

ALTER TABLE task_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own responses" ON task_responses
  USING (assessment_id IN (SELECT id FROM assessments WHERE user_id = auth.uid()))
  WITH CHECK (assessment_id IN (SELECT id FROM assessments WHERE user_id = auth.uid()));

ALTER TABLE task_evaluations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own evaluations" ON task_evaluations
  USING (assessment_id IN (SELECT id FROM assessments WHERE user_id = auth.uid()));

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own reports" ON reports
  USING (assessment_id IN (SELECT id FROM assessments WHERE user_id = auth.uid()));

-- AI logs are server-side only, no client access
ALTER TABLE ai_logs ENABLE ROW LEVEL SECURITY;
-- No client-side policy — accessed only via service role key
```

---

## Migration Strategy

1. **Phase 1–6:** No database. All state in React Context.
2. **Phase 7:** Run initial migration to create all tables and indexes.
3. **RLS policies** applied immediately after table creation.
4. **Seed data** includes sample assessment for demo purposes.

---

## JSONB Schema Documentation

### skills_json (candidate_profiles)
```json
[
  { "skill": "string", "proficiency": "string", "evidence": "string" }
]
```

### competencies_json (simulation_tasks)
```json
["string", "string"]
```

### rubric_json (simulation_tasks)
```json
[
  {
    "competency": "string",
    "weight": 0.25,
    "excellent": "string",
    "good": "string",
    "acceptable": "string",
    "weak": "string",
    "poor": "string"
  }
]
```

### competency_scores_json (task_evaluations)
```json
[
  {
    "competency": "string",
    "score_1_to_5": 4,
    "weight": 0.25,
    "reason": "string",
    "evidence_from_response": "string"
  }
]
```

### report_json (reports)
See `AI_WORKFLOWS.md` Stage 6 output schema for the complete report structure.
