import { callStructured } from "./client";
import {
  jobAnalysisSchema,
  candidateProfileSchema,
  roleMatchSchema,
  simulationSchema,
  evaluationSchema,
  reportSchema,
  drillSchema,
  drillEvaluationSchema,
  type JobAnalysis,
  type CandidateProfile,
  type RoleMatch,
  type SimulationTask,
  type Evaluation,
  type ReportBody,
  type Drill,
  type DrillEvaluation,
} from "@/lib/schemas";

const json = (v: unknown) => JSON.stringify(v, null, 2);

/* ============================================================ Stage 1: Job */

export function extractJob(input: {
  job_description: string;
  title?: string;
  company?: string;
  location?: string;
}): Promise<JobAnalysis> {
  const system = `You are a senior HR analyst and job market expert. Your task is to extract structured information from a job posting.

Rules:
- Extract only what is explicitly stated or clearly implied by the job description.
- For inferred fields, mark the source as "inferred" rather than "explicit".
- Do not invent requirements that are not mentioned or strongly implied.
- If information is missing, use null or empty arrays rather than guessing.
- Be specific about tools, technologies, and domain knowledge.
- Identify hidden expectations that aren't listed as requirements but are implied by the responsibilities.
- Estimate what the first 30 days would look like based on the role description.`;

  const user = `Analyze the following job posting and extract a structured role profile.

Job Title (if provided): ${input.title || "(not provided)"}
Company (if provided): ${input.company || "(not provided)"}
Location (if provided): ${input.location || "(not provided)"}

Job Description:
---
${input.job_description}
---`;

  return callStructured({
    step: "job_extraction",
    system,
    user,
    schema: jobAnalysisSchema,
    schemaName: "job_analysis",
    temperature: 0.3,
  });
}

/* ====================================================== Stage 2: Candidate */

export function extractCandidate(input: {
  resume_text: string;
  current_role?: string;
  target_role?: string;
  years_experience?: string | number;
  additional_skills?: string;
}): Promise<CandidateProfile> {
  const system = `You are a talent analyst who evaluates candidate backgrounds. Your task is to extract a structured profile from a resume or profile text.

Rules:
- Extract skills, experience, and capabilities that are demonstrated (not just listed).
- Identify transferable skills that apply across industries and roles.
- Note tools and technologies the candidate has actual experience with.
- Be honest about gaps — do not fill in skills that aren't evidenced.
- Estimate years of experience based on work history.
- Identify concrete evidence points (projects, achievements, metrics).
- Note possible gaps relative to common role requirements.`;

  const user = `Analyze the following resume/profile and extract a structured candidate profile.

Additional context provided by the candidate:
- Current role: ${input.current_role || "(not provided)"}
- Target role: ${input.target_role || "(not provided)"}
- Years of experience: ${input.years_experience ?? "(not provided)"}
- Skills to consider: ${input.additional_skills || "(not provided)"}

Resume/Profile:
---
${input.resume_text}
---`;

  return callStructured({
    step: "candidate_extraction",
    system,
    user,
    schema: candidateProfileSchema,
    schemaName: "candidate_profile",
    temperature: 0.3,
  });
}

/* ========================================================== Stage 3: Match */

export function matchRoleCandidate(
  job: JobAnalysis,
  candidate: CandidateProfile
): Promise<RoleMatch> {
  const system = `You are a hiring analyst comparing a candidate's capabilities against a specific role's requirements. Your task is to produce an honest, evidence-based match analysis.

Rules:
- Match skills and experience explicitly — do not assume capabilities not evidenced.
- Identify transferable skills that the candidate may not realize are relevant.
- Be specific about gaps — name the exact skill or knowledge area.
- Distinguish between "missing skill" and "unproven skill" (candidate might have it but didn't demonstrate it).
- Risk areas should be practical, not generic.
- Recommended simulation focus should target the areas most important for proving readiness.
- The initial fit estimate should be a rough range (e.g., "65-75"), not a precise number.
- Confidence level should reflect how much evidence is available.`;

  const user = `Compare this candidate profile against this job profile and produce a match analysis.

Job Profile:
---
${json(job)}
---

Candidate Profile:
---
${json(candidate)}
---`;

  return callStructured({
    step: "role_match",
    system,
    user,
    schema: roleMatchSchema,
    schemaName: "role_match",
    temperature: 0.3,
  });
}

/* ===================================================== Stage 4: Simulation */

export async function generateSimulation(
  job: JobAnalysis,
  candidate: CandidateProfile,
  match: RoleMatch,
  taskCount = 3
): Promise<SimulationTask[]> {
  const count = Math.min(5, Math.max(3, taskCount));
  const system = `You are a senior hiring manager and assessment designer. Your task is to create realistic work simulation tasks that a person would actually encounter in the given role.

Rules:
- Generate exactly ${count} tasks.
- Tasks MUST be realistic scenarios the person would encounter in the actual role.
- Tasks must map directly to the job's core responsibilities.
- Tasks must NOT require access to private company data or systems.
- Tasks must be answerable based on general professional knowledge and the context provided.
- Include at least one communication-focused task and one analytical/problem-solving task.
- Each task must have a clear rubric with weighted competencies.
- Rubric weights for each task must sum to 1.0.
- Difficulty should be appropriate for the role's seniority level.
- Time estimates should be realistic (5-20 minutes per task).
- Scenarios should include enough context for the candidate to produce a meaningful response.
- Focus simulations on the areas identified as most important for proving readiness.`;

  const user = `Generate realistic work simulation tasks for this role and candidate.

Job Profile:
---
${json(job)}
---

Candidate Profile:
---
${json(candidate)}
---

Match Analysis:
---
${json(match)}
---

Simulation Focus Areas:
${match.recommended_simulation_focus.map((s) => `- ${s}`).join("\n")}

Generate exactly ${count} tasks.`;

  const out = await callStructured({
    step: "simulation_generation",
    system,
    user,
    schema: simulationSchema,
    schemaName: "simulation_tasks",
    temperature: 0.5,
    maxTokens: 6000,
  });

  // Defensive clamp: honor the 3-5 contract even if the model over/under-produces.
  return out.tasks.slice(0, 5);
}

/* ====================================================== Stage 5: Evaluator */

export function evaluateTask(task: SimulationTask, userResponse: string): Promise<Evaluation> {
  const system = `You are a fair, rigorous assessment evaluator. Your task is to evaluate a candidate's response to a work simulation task.

Rules:
- Score each competency from 1 to 5 based on the rubric provided.
- Every score MUST be justified with specific evidence from the candidate's response.
- Do NOT invent or assume things the candidate did not write.
- Do NOT penalize for missing information that was not provided in the task context.
- If the response is partially correct, give partial credit — do not round to extremes.
- Be specific about what was done well and what was missed.
- "What a stronger answer would include" should be practical and specific.
- Red flags are serious concerns only (e.g., fundamentally wrong understanding, dangerous recommendations).
- Confidence level reflects how clearly the response demonstrates competency.
- Be balanced — acknowledge strengths even in weak responses, and note improvements even in strong ones.
- Score every competency in the rubric, using the exact competency names from the rubric.`;

  const user = `Evaluate this candidate's response to the following simulation task.

Task:
---
Title: ${task.title}
Scenario: ${task.scenario}
Context: ${task.context}
Instructions: ${task.instructions}
Expected Deliverable: ${task.expected_deliverable}
---

Rubric:
---
${json(task.rubric)}
---

Candidate's Response:
---
${userResponse}
---`;

  return callStructured({
    step: "task_evaluation",
    system,
    user,
    schema: evaluationSchema,
    schemaName: "task_evaluation",
    temperature: 0.2,
  });
}

/* ========================================================= Stage 6: Report */

export function generateReport(input: {
  candidate: CandidateProfile;
  job: JobAnalysis;
  match: RoleMatch;
  evaluations: { task: SimulationTask; evaluation: Evaluation; score: number }[];
  overallScore: number;
  readinessBand: string;
  confidenceLevel: string;
}): Promise<ReportBody> {
  const system = `You are a professional assessment report writer. Your task is to synthesize simulation results into a clear, credible, and actionable readiness report.

Rules:
- Base all conclusions on evidence from the evaluations and candidate profile.
- Do NOT promise employment outcomes or make guarantees.
- Use professional, balanced language — not hype or flattery.
- Be specific in recommendations — "learn SQL basics using Mode Analytics tutorials" not "improve technical skills".
- The hiring manager summary should read as if a third-party assessor is describing the candidate to a hiring manager.
- Risk factors should be practical and evidence-based.
- Learning curve estimate should reference specific skills and realistic timeframes.
- Interview prep focus should target the specific areas this role would likely test.
- Application recommendation should be nuanced — not just "apply" or "don't apply".`;

  const user = `Generate a comprehensive readiness report for this completed assessment.

Candidate Profile:
---
${json(input.candidate)}
---

Target Role:
---
${json(input.job)}
---

Match Analysis:
---
${json(input.match)}
---

Completed Tasks and Evaluations:
---
${json(
  input.evaluations.map((e) => ({
    task_title: e.task.title,
    task_score_0_100: e.score,
    evaluation: e.evaluation,
  }))
)}
---

Overall Score: ${input.overallScore}/100
Readiness Band: ${input.readinessBand}
Confidence Level: ${input.confidenceLevel}`;

  return callStructured({
    step: "report_generation",
    system,
    user,
    schema: reportSchema,
    schemaName: "readiness_report",
    temperature: 0.3,
    maxTokens: 8000,
  });
}

/* ============================================ The Improvement Loop: Drills */

// Generate a focused micro-drill that targets ONE competency the candidate is
// weak on. Cheap (BASE_MODEL): a tight scenario, not a full simulation.
export function generateDrill(input: {
  competency: string;
  roleContext?: string;
  gapDetail?: string;
}): Promise<Drill> {
  const system = `You are an expert skills coach. Your task is to design ONE short, focused practice drill that targets a single competency the person needs to strengthen.

Rules:
- The drill must isolate and exercise the ONE competency named — not a broad assessment.
- Use a realistic, specific micro-scenario the person would actually encounter on the job.
- It must be completable in 5-10 minutes from general professional knowledge — no private data or tools required.
- "What good looks like" should give concrete markers of a strong answer WITHOUT handing over the answer.
- Keep it tight and motivating: this is reps, not an exam.`;

  const user = `Design a focused practice drill for this competency.

Competency to strengthen: ${input.competency}
${input.roleContext ? `Target role context: ${input.roleContext}` : ""}
${input.gapDetail ? `Why it's a gap / what to improve: ${input.gapDetail}` : ""}

Generate exactly one drill that exercises this competency.`;

  return callStructured({
    step: "drill_generation",
    system,
    user,
    schema: drillSchema,
    schemaName: "practice_drill",
    temperature: 0.6,
    maxTokens: 1500,
  });
}

// Evaluate a drill response for the single targeted competency. QUALITY_MODEL —
// credible, specific coaching feedback is the value the user comes back for.
export function evaluateDrill(input: {
  drill: Drill;
  response: string;
}): Promise<DrillEvaluation> {
  const system = `You are a fair, rigorous skills coach evaluating a single focused drill response.

Rules:
- Score the ONE targeted competency from 1 to 5, grounded in specific evidence from the response.
- Do NOT invent or assume anything the person did not write.
- Give partial credit — never round to extremes for a partial answer.
- "What a stronger answer includes" must be concrete and immediately actionable so the next attempt is better.
- Tone: a coach who wants them to improve — honest about misses, but never demoralizing.`;

  const user = `Evaluate this drill response.

Targeted competency: ${input.drill.focus_competency}

Drill scenario:
---
${input.drill.scenario}
---
Instructions given: ${input.drill.instructions}
What good looks like:
${input.drill.what_good_looks_like.map((s) => `- ${s}`).join("\n")}

Person's response:
---
${input.response}
---`;

  return callStructured({
    step: "drill_evaluation",
    system,
    user,
    schema: drillEvaluationSchema,
    schemaName: "drill_evaluation",
    temperature: 0.2,
    maxTokens: 1200,
  });
}
