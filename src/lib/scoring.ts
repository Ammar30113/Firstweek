import { READINESS_BANDS, type SimulationTask, type Evaluation } from "@/lib/schemas";

export type ReadinessBand = (typeof READINESS_BANDS)[number];
export type ConfidenceLevel = "High" | "Medium" | "Low";

const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");
const clampScore = (n: number) => Math.max(1, Math.min(5, Math.round(n)));
const round2 = (n: number) => Math.round(n * 100) / 100;

function stddev(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((s, v) => s + v, 0) / values.length;
  const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

export interface ScoredCompetency {
  competency: string;
  score_1_to_5: number;
  weight: number; // normalized, sums to 1.0 across the task
  normalized_0_100: number;
}

/**
 * Deterministic task score. Trusts the RUBRIC's weights (not the model's echoed
 * weights), normalizes them to sum to 1.0 (LLMs routinely emit 0.95 / 1.05),
 * and matches competency scores by name with an index fallback.
 *
 *   normalized = score * 20   (1->20 ... 5->100)
 *   task score = Σ(normalized * normalizedWeight)
 */
export function scoreTask(
  task: SimulationTask,
  evaluation: Evaluation
): { score: number; competencies: ScoredCompetency[] } {
  const byName = new Map<string, number>();
  evaluation.competency_scores.forEach((c) =>
    byName.set(norm(c.competency), clampScore(c.score_1_to_5))
  );

  const pairs: { competency: string; weight: number; score: number }[] = [];
  task.rubric.forEach((crit, i) => {
    let score = byName.get(norm(crit.competency));
    if (score === undefined && evaluation.competency_scores[i]) {
      score = clampScore(evaluation.competency_scores[i].score_1_to_5);
    }
    if (score !== undefined) {
      pairs.push({ competency: crit.competency, weight: crit.weight > 0 ? crit.weight : 0, score });
    }
  });

  // Fallback: no rubric / no matches -> equal-weight the evaluator's scores.
  let usable = pairs;
  if (usable.length === 0) {
    usable = evaluation.competency_scores.map((c) => ({
      competency: c.competency,
      weight: 1,
      score: clampScore(c.score_1_to_5),
    }));
  }

  const totalWeight = usable.reduce((s, p) => s + p.weight, 0);
  const weights =
    totalWeight > 0 ? usable.map((p) => p.weight / totalWeight) : usable.map(() => 1 / usable.length);

  const score = Math.round(usable.reduce((s, p, i) => s + p.score * 20 * weights[i], 0));

  const competencies: ScoredCompetency[] = usable.map((p, i) => ({
    competency: p.competency,
    score_1_to_5: p.score,
    weight: round2(weights[i]),
    normalized_0_100: p.score * 20,
  }));

  return { score, competencies };
}

export function bandForScore(score: number): ReadinessBand {
  if (score >= 90) return "Excellent Fit";
  if (score >= 80) return "Strong Fit";
  if (score >= 70) return "Viable Fit";
  if (score >= 60) return "Stretch Role";
  if (score >= 40) return "Needs Preparation";
  return "Not Recommended Yet";
}

export function computeConfidence(input: {
  jobDescriptionLength: number;
  resumeTextLength: number;
  allTasksCompleted: boolean;
  avgResponseLength: number;
  scores: number[];
}): ConfidenceLevel {
  let factors = 0;
  if (input.jobDescriptionLength > 200) factors++;
  if (input.resumeTextLength > 300) factors++;
  if (input.allTasksCompleted) factors++;
  if (input.avgResponseLength > 150) factors++;
  if (stddev(input.scores) < 20) factors++;

  if (factors >= 4) return "High";
  if (factors >= 2) return "Medium";
  return "Low";
}

export interface TaskScore {
  taskTitle: string;
  score: number;
  competencies: ScoredCompetency[];
}

export interface AssessmentScore {
  perTask: TaskScore[];
  overall: number;
  band: ReadinessBand;
  confidence: ConfidenceLevel;
}

export function scoreAssessment(input: {
  tasks: SimulationTask[];
  responses: string[];
  evaluations: Evaluation[];
  jobDescription: string;
  resumeText: string;
}): AssessmentScore {
  const perTask: TaskScore[] = input.tasks.map((task, i) => {
    const { score, competencies } = scoreTask(task, input.evaluations[i]);
    return { taskTitle: task.title, score, competencies };
  });

  const overall = perTask.length
    ? Math.round(perTask.reduce((s, t) => s + t.score, 0) / perTask.length)
    : 0;

  const responses = input.responses;
  const allDone =
    responses.length === input.tasks.length && responses.every((r) => r.trim().length > 0);
  const avgResponseLength = responses.length
    ? responses.reduce((s, r) => s + r.trim().length, 0) / responses.length
    : 0;

  const confidence = computeConfidence({
    jobDescriptionLength: input.jobDescription.length,
    resumeTextLength: input.resumeText.length,
    allTasksCompleted: allDone,
    avgResponseLength,
    scores: perTask.map((t) => t.score),
  });

  return { perTask, overall, band: bandForScore(overall), confidence };
}
