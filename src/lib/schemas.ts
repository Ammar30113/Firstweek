import { z } from "zod";

/**
 * All AI-facing schemas are written to be compatible with OpenAI Structured
 * Outputs (strict json_schema):
 *   - optional fields use `.nullable()` (NOT `.optional()`)
 *   - no numeric refinements (`.min`/`.max`/`.int`) on model-facing fields
 *     (ranges are validated/clamped in code instead)
 *   - `.describe()` is used to steer the model
 * See https://platform.openai.com/docs/guides/structured-outputs
 */

const Source = z.enum(["explicit", "inferred"]);
const Importance = z.enum(["critical", "important", "nice_to_have"]);
const Confidence = z.enum(["high", "medium", "low"]);

/* ---------------------------------------------------------------- Stage 1 */

export const jobAnalysisSchema = z.object({
  job_title: z.string(),
  company: z.string().nullable(),
  location: z.string().nullable(),
  role_family: z.string().describe("e.g. 'Customer Success Operations', 'Data Analyst'"),
  seniority_level: z.string().describe("e.g. 'Junior', 'Mid', 'Senior', 'Lead', 'Manager'"),
  summary: z.string().describe("2-3 sentence role summary"),
  day_to_day_work: z.array(z.string()),
  core_responsibilities: z.array(z.string()),
  required_skills: z.array(
    z.object({ skill: z.string(), importance: Importance, source: Source })
  ),
  preferred_skills: z.array(z.object({ skill: z.string(), source: Source })),
  tools: z.array(z.object({ tool: z.string(), source: Source })),
  success_metrics: z.array(z.string()),
  hidden_expectations: z.array(z.string()).describe("unstated but implied requirements"),
  domain_knowledge: z.array(z.string()),
  likely_challenges: z.array(z.string()),
  red_flags: z.array(z.string()),
  interview_focus_areas: z.array(z.string()),
  first_30_day_tasks: z.array(z.string()),
  simulation_recommendations: z.array(z.string()),
});
export type JobAnalysis = z.infer<typeof jobAnalysisSchema>;

/* ---------------------------------------------------------------- Stage 2 */

export const candidateProfileSchema = z.object({
  candidate_name: z.string(),
  current_title: z.string(),
  experience_summary: z.string(),
  years_experience_estimate: z.number(),
  core_skills: z.array(
    z.object({
      skill: z.string(),
      proficiency: z.enum(["beginner", "intermediate", "advanced", "expert"]),
      evidence: z.string(),
    })
  ),
  tools: z.array(
    z.object({
      tool: z.string(),
      experience_level: z.enum(["familiar", "proficient", "expert"]),
    })
  ),
  domains: z.array(z.string()),
  projects: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      skills_demonstrated: z.array(z.string()),
      relevance: z.string(),
    })
  ),
  transferable_skills: z.array(
    z.object({ skill: z.string(), from_context: z.string(), applicability: z.string() })
  ),
  evidence_points: z.array(z.object({ claim: z.string(), evidence: z.string() })),
  possible_gaps: z.array(z.string()),
});
export type CandidateProfile = z.infer<typeof candidateProfileSchema>;

/* ---------------------------------------------------------------- Stage 3 */

export const roleMatchSchema = z.object({
  strong_matches: z.array(
    z.object({ requirement: z.string(), candidate_evidence: z.string(), strength: z.string() })
  ),
  partial_matches: z.array(
    z.object({ requirement: z.string(), candidate_evidence: z.string(), gap: z.string() })
  ),
  gaps: z.array(
    z.object({
      requirement: z.string(),
      importance: Importance,
      gap_type: z.enum(["missing", "unproven", "weak"]),
      recommendation: z.string(),
    })
  ),
  transferable_experience: z.array(
    z.object({
      candidate_skill: z.string(),
      role_application: z.string(),
      confidence: Confidence,
    })
  ),
  risk_areas: z.array(
    z.object({ area: z.string(), reason: z.string(), severity: Confidence })
  ),
  recommended_simulation_focus: z.array(z.string()),
  initial_fit_estimate: z.string().describe("a rough range like '65-75', not a precise number"),
  confidence_level: Confidence,
});
export type RoleMatch = z.infer<typeof roleMatchSchema>;

/* ---------------------------------------------------------------- Stage 4 */

export const rubricCriterionSchema = z.object({
  competency: z.string(),
  weight: z.number().describe("0.0-1.0; all weights in a task should sum to 1.0"),
  excellent: z.string().describe("what a 5/5 answer looks like"),
  good: z.string(),
  acceptable: z.string(),
  weak: z.string(),
  poor: z.string(),
});

export const simulationTaskSchema = z.object({
  title: z.string(),
  scenario: z.string().describe("detailed business context, 3-5 sentences"),
  context: z.string().describe("any data, metrics, or details the candidate needs"),
  instructions: z.string(),
  expected_deliverable: z.string(),
  competencies_tested: z.array(z.string()),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  time_estimate_minutes: z.number().describe("realistic, 5-20 for MVP"),
  role_relevance: z.string(),
  rubric: z.array(rubricCriterionSchema),
});
export type SimulationTask = z.infer<typeof simulationTaskSchema>;

export const simulationSchema = z.object({ tasks: z.array(simulationTaskSchema) });

/* ---------------------------------------------------------------- Stage 5 */

// Note: the LLM does NOT compute the task score. It only scores each
// competency 1-5; the deterministic scoring engine derives the task score
// from the rubric weights. (Resolves the dual-source-of-truth issue.)
export const evaluationSchema = z.object({
  competency_scores: z.array(
    z.object({
      competency: z.string(),
      score_1_to_5: z.number().describe("integer 1-5"),
      reason: z.string(),
      evidence_from_response: z
        .string()
        .describe("direct quote or close paraphrase from the candidate's answer"),
    })
  ),
  strengths: z.array(z.string()),
  misses: z.array(z.string()),
  what_stronger_answer_includes: z.array(z.string()),
  feedback: z.string().describe("2-3 sentence overall feedback paragraph"),
  confidence_level: Confidence,
  red_flags: z.array(z.string()).describe("serious concerns only; usually empty"),
});
export type Evaluation = z.infer<typeof evaluationSchema>;

/* ---------------------------------------------------------------- Stage 6 */

export const READINESS_BANDS = [
  "Excellent Fit",
  "Strong Fit",
  "Viable Fit",
  "Stretch Role",
  "Needs Preparation",
  "Not Recommended Yet",
] as const;

export const reportSchema = z.object({
  candidate_summary: z.string(),
  target_role_summary: z.string(),
  application_recommendation: z.string().describe("nuanced paragraph, not just apply/don't"),
  strengths_demonstrated: z.array(
    z.object({ strength: z.string(), evidence: z.string(), relevance_to_role: z.string() })
  ),
  skill_gaps: z.array(
    z.object({
      gap: z.string(),
      importance_for_role: Importance,
      current_level: z.string(),
      target_level: z.string(),
      recommendation: z.string(),
    })
  ),
  transferable_skills: z.array(
    z.object({ skill: z.string(), from_experience: z.string(), application_to_role: z.string() })
  ),
  risk_factors: z.array(
    z.object({ risk: z.string(), severity: Confidence, mitigation: z.string() })
  ),
  learning_curve_estimate: z.string(),
  interview_prep_focus: z.array(
    z.object({ topic: z.string(), why: z.string(), preparation_tip: z.string() })
  ),
  recommended_learning_path: z.array(
    z.object({
      skill: z.string(),
      resource: z.string(),
      timeframe: z.string(),
      priority: Confidence,
    })
  ),
  hiring_manager_summary: z.string().describe("3-5 sentence professional summary"),
});
export type ReportBody = z.infer<typeof reportSchema>;

// The score, band, confidence and disclaimer are NOT trusted to the model —
// they are computed/fixed in code and merged in. This is the full report shape.
export const MANDATORY_DISCLAIMER =
  "This report is generated from a role-specific simulation and user-provided materials. " +
  "It is intended for self-assessment and preparation. It does not guarantee job performance, " +
  "interview selection, or employment outcomes.";

export type Report = ReportBody & {
  overall_score: number;
  readiness_band: (typeof READINESS_BANDS)[number];
  confidence_level: "High" | "Medium" | "Low";
  disclaimer: string;
};
