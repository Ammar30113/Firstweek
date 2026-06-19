# FirstWeek — AI Workflow Design

## Overview

FirstWeek uses a 6-stage AI pipeline. Each stage has its own prompt, structured JSON output schema, and Zod validation. No mega-prompts — every AI call has a single responsibility.

All prompts use OpenAI's JSON mode for reliable structured output.

---

## Pipeline Flow

```
Stage 1: Job Extraction ──────────┐
                                   ├── Stage 3: Role-Candidate Match ── Stage 4: Simulation Generator
Stage 2: Candidate Extraction ────┘                                              │
                                                                                  ▼
                                                                        Stage 5: Task Evaluator (per task)
                                                                                  │
                                                                                  ▼
                                                                        Stage 6: Report Generator
```

---

## Stage 1: Job Extraction

### Purpose
Turn raw job posting text into a structured role profile.

### System Prompt

```
You are a senior HR analyst and job market expert. Your task is to extract structured information from a job posting.

Rules:
- Extract only what is explicitly stated or clearly implied by the job description.
- For inferred fields, mark the source as "inferred" rather than "explicit".
- Do not invent requirements that are not mentioned or strongly implied.
- If information is missing, use null or empty arrays rather than guessing.
- Be specific about tools, technologies, and domain knowledge.
- Identify hidden expectations that aren't listed as requirements but are implied by the responsibilities.
- Estimate what the first 30 days would look like based on the role description.

Respond with a JSON object matching the exact schema specified.
```

### User Prompt Template

```
Analyze the following job posting and extract a structured role profile.

Job Title (if provided): {title}
Company (if provided): {company}
Location (if provided): {location}

Job Description:
---
{job_description}
---

Return a JSON object with the role profile.
```

### Output Schema

```json
{
  "job_title": "string",
  "company": "string | null",
  "location": "string | null",
  "role_family": "string (e.g., 'Customer Success Operations', 'Data Analyst', 'Software Engineer')",
  "seniority_level": "string (e.g., 'Junior', 'Mid', 'Senior', 'Lead', 'Manager')",
  "summary": "string (2-3 sentence role summary)",
  "day_to_day_work": ["string (specific daily activities)"],
  "core_responsibilities": ["string"],
  "required_skills": [
    {
      "skill": "string",
      "importance": "critical | important | nice_to_have",
      "source": "explicit | inferred"
    }
  ],
  "preferred_skills": [
    {
      "skill": "string",
      "source": "explicit | inferred"
    }
  ],
  "tools": [
    {
      "tool": "string",
      "source": "explicit | inferred"
    }
  ],
  "success_metrics": ["string (how performance would be measured)"],
  "hidden_expectations": ["string (unstated but implied requirements)"],
  "domain_knowledge": ["string (industry/domain expertise needed)"],
  "likely_challenges": ["string (difficulties the person would face)"],
  "red_flags": ["string (potential concerns about the posting)"],
  "interview_focus_areas": ["string (what interviews likely test)"],
  "first_30_day_tasks": ["string (what the new hire would do first)"],
  "simulation_recommendations": ["string (types of tasks to simulate)"]
}
```

---

## Stage 2: Candidate Extraction

### Purpose
Turn resume/profile text into a structured capability profile.

### System Prompt

```
You are a talent analyst who evaluates candidate backgrounds. Your task is to extract a structured profile from a resume or profile text.

Rules:
- Extract skills, experience, and capabilities that are demonstrated (not just listed).
- Identify transferable skills that apply across industries and roles.
- Note tools and technologies the candidate has actual experience with.
- Be honest about gaps — do not fill in skills that aren't evidenced.
- Estimate years of experience based on work history.
- Identify concrete evidence points (projects, achievements, metrics).
- Note possible gaps relative to common role requirements.

Respond with a JSON object matching the exact schema specified.
```

### User Prompt Template

```
Analyze the following resume/profile and extract a structured candidate profile.

Additional context provided by the candidate:
- Current role: {current_role}
- Target role: {target_role}
- Years of experience: {years_experience}
- Skills to consider: {additional_skills}

Resume/Profile:
---
{resume_text}
---

Return a JSON object with the candidate profile.
```

### Output Schema

```json
{
  "candidate_name": "string",
  "current_title": "string",
  "experience_summary": "string (2-3 sentence overview)",
  "years_experience_estimate": "number",
  "core_skills": [
    {
      "skill": "string",
      "proficiency": "beginner | intermediate | advanced | expert",
      "evidence": "string (brief evidence from resume)"
    }
  ],
  "tools": [
    {
      "tool": "string",
      "experience_level": "familiar | proficient | expert"
    }
  ],
  "domains": ["string (industries/domains worked in)"],
  "projects": [
    {
      "name": "string",
      "description": "string",
      "skills_demonstrated": ["string"],
      "relevance": "string"
    }
  ],
  "transferable_skills": [
    {
      "skill": "string",
      "from_context": "string (where they developed it)",
      "applicability": "string (how it transfers)"
    }
  ],
  "evidence_points": [
    {
      "claim": "string",
      "evidence": "string"
    }
  ],
  "possible_gaps": ["string (areas where evidence is weak or missing)"]
}
```

---

## Stage 3: Role-Candidate Match

### Purpose
Compare the job profile with the candidate profile to identify fit, gaps, and simulation focus areas.

### System Prompt

```
You are a hiring analyst comparing a candidate's capabilities against a specific role's requirements. Your task is to produce an honest, evidence-based match analysis.

Rules:
- Match skills and experience explicitly — do not assume capabilities not evidenced.
- Identify transferable skills that the candidate may not realize are relevant.
- Be specific about gaps — name the exact skill or knowledge area.
- Distinguish between "missing skill" and "unproven skill" (candidate might have it but didn't demonstrate it).
- Risk areas should be practical, not generic.
- Recommended simulation focus should target the areas most important for proving readiness.
- The initial fit estimate should be a rough range (e.g., "65-75"), not a precise number.
- Confidence level should reflect how much evidence is available.

Respond with a JSON object matching the exact schema specified.
```

### User Prompt Template

```
Compare this candidate profile against this job profile and produce a match analysis.

Job Profile:
---
{job_analysis_json}
---

Candidate Profile:
---
{candidate_profile_json}
---

Return a JSON object with the match analysis.
```

### Output Schema

```json
{
  "strong_matches": [
    {
      "requirement": "string",
      "candidate_evidence": "string",
      "strength": "string"
    }
  ],
  "partial_matches": [
    {
      "requirement": "string",
      "candidate_evidence": "string",
      "gap": "string"
    }
  ],
  "gaps": [
    {
      "requirement": "string",
      "importance": "critical | important | nice_to_have",
      "gap_type": "missing | unproven | weak",
      "recommendation": "string"
    }
  ],
  "transferable_experience": [
    {
      "candidate_skill": "string",
      "role_application": "string",
      "confidence": "high | medium | low"
    }
  ],
  "risk_areas": [
    {
      "area": "string",
      "reason": "string",
      "severity": "high | medium | low"
    }
  ],
  "recommended_simulation_focus": ["string (specific task types to test)"],
  "initial_fit_estimate": "string (range like '65-75')",
  "confidence_level": "high | medium | low"
}
```

---

## Stage 4: Simulation Generator

### Purpose
Create realistic, role-specific work simulation tasks with structured rubrics.

### System Prompt

```
You are a senior hiring manager and assessment designer. Your task is to create realistic work simulation tasks that a person would actually encounter in the given role.

Rules:
- Generate exactly {task_count} tasks (between 3 and 5).
- Tasks MUST be realistic scenarios the person would encounter in the actual role.
- Tasks must map directly to the job's core responsibilities.
- Tasks must NOT require access to private company data or systems.
- Tasks must be answerable based on general professional knowledge and the context provided.
- Include at least one communication-focused task and one analytical/problem-solving task.
- Each task must have a clear rubric with weighted competencies.
- Rubric weights for each task must sum to 1.0.
- Difficulty should be appropriate for the role's seniority level.
- Time estimates should be realistic (5-20 minutes per task for MVP).
- Scenarios should include enough context for the candidate to produce a meaningful response.
- Focus simulations on areas identified as most important for proving readiness.

Respond with a JSON object matching the exact schema specified.
```

### User Prompt Template

```
Generate realistic work simulation tasks for this role and candidate.

Job Profile:
---
{job_analysis_json}
---

Candidate Profile:
---
{candidate_profile_json}
---

Match Analysis:
---
{role_match_json}
---

Simulation Focus Areas:
{recommended_simulation_focus}

Generate {task_count} tasks. Return a JSON object with the tasks array.
```

### Output Schema

```json
{
  "tasks": [
    {
      "title": "string",
      "scenario": "string (detailed business context, 3-5 sentences)",
      "context": "string (any data, metrics, or details the candidate needs)",
      "instructions": "string (clear instructions on what to produce)",
      "expected_deliverable": "string (what the output should look like)",
      "competencies_tested": ["string"],
      "difficulty": "beginner | intermediate | advanced",
      "time_estimate_minutes": "number (5-20)",
      "role_relevance": "string (why this task matters for the role)",
      "rubric": [
        {
          "competency": "string",
          "weight": "number (0.0-1.0, all weights must sum to 1.0)",
          "excellent": "string (what a 5/5 answer looks like)",
          "good": "string (what a 4/5 answer looks like)",
          "acceptable": "string (what a 3/5 answer looks like)",
          "weak": "string (what a 2/5 answer looks like)",
          "poor": "string (what a 1/5 answer looks like)"
        }
      ]
    }
  ]
}
```

---

## Stage 5: Task Evaluator

### Purpose
Evaluate a single task response against its rubric. Called once per completed task.

### System Prompt

```
You are a fair, rigorous assessment evaluator. Your task is to evaluate a candidate's response to a work simulation task.

Rules:
- Score each competency from 1 to 5 based on the rubric provided.
- Every score MUST be justified with specific evidence from the candidate's response.
- Do NOT invent or assume things the candidate did not write.
- Do NOT penalize for missing information that was not provided in the task context.
- If the response is partially correct, give partial credit — do not round to extremes.
- Be specific about what was done well and what was missed.
- "What a stronger answer would include" should be practical and specific.
- Red flags are serious concerns only (e.g., fundamentally wrong understanding, dangerous recommendations).
- Confidence level reflects how clearly the response demonstrates competency (not your confidence in the scoring).
- Be balanced — acknowledge strengths even in weak responses, and note areas for improvement even in strong ones.

Respond with a JSON object matching the exact schema specified.
```

### User Prompt Template

```
Evaluate this candidate's response to the following simulation task.

Task:
---
Title: {task_title}
Scenario: {task_scenario}
Context: {task_context}
Instructions: {task_instructions}
Expected Deliverable: {task_expected_deliverable}
---

Rubric:
---
{rubric_json}
---

Candidate's Response:
---
{user_response}
---

Evaluate the response against each rubric competency. Return a JSON object with the evaluation.
```

### Output Schema

```json
{
  "task_score": "number (weighted average of competency scores, 1-5 scale)",
  "competency_scores": [
    {
      "competency": "string",
      "score_1_to_5": "number (1-5)",
      "weight": "number (from rubric)",
      "reason": "string (why this score)",
      "evidence_from_response": "string (direct quote or paraphrase from candidate's answer)"
    }
  ],
  "strengths": ["string (specific things done well)"],
  "misses": ["string (specific things missed or done poorly)"],
  "what_stronger_answer_includes": ["string (specific improvements)"],
  "feedback": "string (2-3 sentence overall feedback paragraph)",
  "confidence_level": "high | medium | low",
  "red_flags": ["string (serious concerns, if any)"]
}
```

---

## Stage 6: Report Generator

### Purpose
Synthesize all evaluations, scores, and analysis into a final comprehensive readiness report.

### System Prompt

```
You are a professional assessment report writer. Your task is to synthesize simulation results into a clear, credible, and actionable readiness report.

Rules:
- Base all conclusions on evidence from the evaluations and candidate profile.
- Do NOT promise employment outcomes or make guarantees.
- Use professional, balanced language — not hype or flattery.
- Be specific in recommendations — "learn SQL basics using Mode Analytics tutorials" not "improve technical skills".
- The hiring manager summary should be written as if a third-party assessor is describing the candidate to a hiring manager.
- Risk factors should be practical and evidence-based.
- Learning curve estimate should reference specific skills and realistic timeframes.
- Interview prep focus should target the specific areas this role would likely test.
- The disclaimer is mandatory and must not be removed or softened.
- Readiness band must match the overall score according to the defined ranges.
- Application recommendation should be nuanced — not just "apply" or "don't apply".

Respond with a JSON object matching the exact schema specified.
```

### User Prompt Template

```
Generate a comprehensive readiness report for this completed assessment.

Candidate Profile:
---
{candidate_profile_json}
---

Target Role:
---
{job_analysis_json}
---

Match Analysis:
---
{role_match_json}
---

Completed Tasks and Evaluations:
---
{evaluations_json}
---

Overall Score: {overall_score}/100
Readiness Band: {readiness_band}
Confidence Level: {confidence_level}

Generate the full readiness report. Return a JSON object with the report.
```

### Output Schema

```json
{
  "candidate_summary": "string (2-3 sentences about the candidate)",
  "target_role_summary": "string (2-3 sentences about the role)",
  "overall_score": "number (0-100, integer)",
  "readiness_band": "Excellent Fit | Strong Fit | Viable Fit | Stretch Role | Needs Preparation | Not Recommended Yet",
  "application_recommendation": "string (nuanced recommendation paragraph)",
  "confidence_level": "High | Medium | Low",
  "strengths_demonstrated": [
    {
      "strength": "string",
      "evidence": "string",
      "relevance_to_role": "string"
    }
  ],
  "skill_gaps": [
    {
      "gap": "string",
      "importance_for_role": "critical | important | nice_to_have",
      "current_level": "string",
      "target_level": "string",
      "recommendation": "string"
    }
  ],
  "transferable_skills": [
    {
      "skill": "string",
      "from_experience": "string",
      "application_to_role": "string"
    }
  ],
  "risk_factors": [
    {
      "risk": "string",
      "severity": "high | medium | low",
      "mitigation": "string"
    }
  ],
  "learning_curve_estimate": "string (realistic estimate with specifics)",
  "interview_prep_focus": [
    {
      "topic": "string",
      "why": "string",
      "preparation_tip": "string"
    }
  ],
  "recommended_learning_path": [
    {
      "skill": "string",
      "resource": "string",
      "timeframe": "string",
      "priority": "high | medium | low"
    }
  ],
  "hiring_manager_summary": "string (3-5 sentence professional summary)",
  "disclaimer": "This report is generated from a role-specific simulation and user-provided materials. It is intended for self-assessment and preparation. It does not guarantee job performance, interview selection, or employment outcomes."
}
```

---

## AI Call Configuration

### Model Settings

| Parameter | Value | Rationale |
|---|---|---|
| Model | `gpt-4o` | Best balance of quality, speed, and structured output support |
| Temperature | `0.3` for extraction, `0.5` for generation, `0.2` for evaluation | Lower for accuracy, slightly higher for creative tasks |
| Max tokens | `4000` per call | Sufficient for structured outputs |
| Response format | `{ type: 'json_object' }` | Ensures valid JSON response |

### Cost Estimates

| Stage | Estimated Input Tokens | Estimated Output Tokens | Est. Cost |
|---|---|---|---|
| Job Extraction | ~2,000 | ~1,500 | ~$0.02 |
| Candidate Extraction | ~2,500 | ~1,500 | ~$0.02 |
| Role-Candidate Match | ~3,000 | ~1,500 | ~$0.02 |
| Simulation Generation | ~3,500 | ~3,000 | ~$0.04 |
| Task Evaluation (×4) | ~2,000 × 4 | ~1,000 × 4 | ~$0.06 |
| Report Generation | ~5,000 | ~2,500 | ~$0.04 |
| **Total per assessment** | | | **~$0.20** |

---

## Logging Requirements

Every AI call must log:

```typescript
interface AILog {
  id: string;
  user_id: string | null;
  assessment_id: string | null;
  step_name: 'job_extraction' | 'candidate_extraction' | 'role_match' | 'simulation_generation' | 'task_evaluation' | 'report_generation';
  model: string;
  input_json: object;
  output_json: object | null;
  error: string | null;
  duration_ms: number;
  created_at: string;
}
```

This enables:
- Debugging bad outputs
- Monitoring costs
- Improving prompts over time
- Auditing for bias
- Reproducing results
