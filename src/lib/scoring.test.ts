import { describe, it, expect } from "vitest";
import { scoreTask, bandForScore, computeConfidence, scoreAssessment } from "./scoring";
import type { SimulationTask, Evaluation } from "@/lib/schemas";

// Minimal fixtures — scoreTask only reads task.rubric/title and
// evaluation.competency_scores, so we cast small objects to the full types.
const task = (rubric: { competency: string; weight: number }[], title = "T"): SimulationTask =>
  ({ title, rubric }) as unknown as SimulationTask;
const evaluation = (scores: { competency: string; score_1_to_5: number }[]): Evaluation =>
  ({ competency_scores: scores }) as unknown as Evaluation;

describe("bandForScore", () => {
  it("maps each threshold boundary", () => {
    expect(bandForScore(100)).toBe("Excellent Fit");
    expect(bandForScore(90)).toBe("Excellent Fit");
    expect(bandForScore(89)).toBe("Strong Fit");
    expect(bandForScore(80)).toBe("Strong Fit");
    expect(bandForScore(79)).toBe("Viable Fit");
    expect(bandForScore(70)).toBe("Viable Fit");
    expect(bandForScore(69)).toBe("Stretch Role");
    expect(bandForScore(60)).toBe("Stretch Role");
    expect(bandForScore(59)).toBe("Needs Preparation");
    expect(bandForScore(40)).toBe("Needs Preparation");
    expect(bandForScore(39)).toBe("Not Recommended Yet");
    expect(bandForScore(0)).toBe("Not Recommended Yet");
  });
});

describe("scoreTask", () => {
  it("normalizes rubric weights that don't sum to 1.0", () => {
    // weights 0.6 + 0.6 = 1.2 → normalized 0.5 / 0.5; scores 5,5 → 100
    const { score, competencies } = scoreTask(
      task([
        { competency: "A", weight: 0.6 },
        { competency: "B", weight: 0.6 },
      ]),
      evaluation([
        { competency: "A", score_1_to_5: 5 },
        { competency: "B", score_1_to_5: 5 },
      ]),
    );
    expect(score).toBe(100);
    expect(competencies.map((c) => c.weight)).toEqual([0.5, 0.5]);
  });

  it("weights criteria per the rubric, not equally", () => {
    // A weight 3 (score 5 → 100), B weight 1 (score 1 → 20)
    // norm weights 0.75 / 0.25 → 100*0.75 + 20*0.25 = 80
    const { score } = scoreTask(
      task([
        { competency: "A", weight: 3 },
        { competency: "B", weight: 1 },
      ]),
      evaluation([
        { competency: "A", score_1_to_5: 5 },
        { competency: "B", score_1_to_5: 1 },
      ]),
    );
    expect(score).toBe(80);
  });

  it("matches competency by name, case- and whitespace-insensitively", () => {
    const { score } = scoreTask(
      task([{ competency: "Data Modeling", weight: 1 }]),
      evaluation([{ competency: "  data   MODELING ", score_1_to_5: 4 }]), // 4*20 = 80
    );
    expect(score).toBe(80);
  });

  it("falls back to positional index when names don't match", () => {
    const { score } = scoreTask(
      task([{ competency: "X", weight: 1 }]),
      evaluation([{ competency: "totally-different", score_1_to_5: 3 }]), // index 0 → 60
    );
    expect(score).toBe(60);
  });

  it("clamps scores into the 1..5 range", () => {
    const { score } = scoreTask(
      task([{ competency: "A", weight: 1 }]),
      evaluation([{ competency: "A", score_1_to_5: 9 }]), // clamp → 5 → 100
    );
    expect(score).toBe(100);
  });

  it("equal-weights the evaluator's scores when the rubric is empty", () => {
    const { score, competencies } = scoreTask(
      task([]),
      evaluation([
        { competency: "A", score_1_to_5: 5 },
        { competency: "B", score_1_to_5: 1 },
      ]), // (100 + 20) / 2 = 60
    );
    expect(score).toBe(60);
    expect(competencies).toHaveLength(2);
  });

  it("routes all weight to the positive-weight criterion when another is zero", () => {
    const { score } = scoreTask(
      task([
        { competency: "A", weight: 0 },
        { competency: "B", weight: 1 },
      ]),
      evaluation([
        { competency: "A", score_1_to_5: 1 },
        { competency: "B", score_1_to_5: 5 },
      ]), // B dominates → 100
    );
    expect(score).toBe(100);
  });
});

describe("computeConfidence", () => {
  it("is High when at least 4 quality factors hold", () => {
    expect(
      computeConfidence({
        jobDescriptionLength: 500,
        resumeTextLength: 500,
        allTasksCompleted: true,
        avgResponseLength: 200,
        scores: [70, 72, 74],
      }),
    ).toBe("High");
  });

  it("is Medium for a middling signal", () => {
    expect(
      computeConfidence({
        jobDescriptionLength: 500,
        resumeTextLength: 500,
        allTasksCompleted: false,
        avgResponseLength: 10,
        scores: [10, 90], // high variance
      }),
    ).toBe("Medium");
  });

  it("is Low when little signal is present", () => {
    expect(
      computeConfidence({
        jobDescriptionLength: 10,
        resumeTextLength: 10,
        allTasksCompleted: false,
        avgResponseLength: 10,
        scores: [10, 90],
      }),
    ).toBe("Low");
  });
});

describe("scoreAssessment", () => {
  it("averages task scores and derives the band + per-task breakdown", () => {
    const tasks = [task([{ competency: "A", weight: 1 }], "T1"), task([{ competency: "A", weight: 1 }], "T2")];
    const evals = [evaluation([{ competency: "A", score_1_to_5: 5 }]), evaluation([{ competency: "A", score_1_to_5: 3 }])];
    const res = scoreAssessment({
      tasks,
      responses: ["x".repeat(200), "y".repeat(200)],
      evaluations: evals,
      jobDescription: "j".repeat(300),
      resumeText: "r".repeat(400),
    });
    expect(res.perTask.map((t) => t.score)).toEqual([100, 60]); // avg → 80
    expect(res.overall).toBe(80);
    expect(res.band).toBe("Strong Fit");
    expect(res.perTask.map((t) => t.taskTitle)).toEqual(["T1", "T2"]);
  });

  it("handles zero tasks without dividing by zero", () => {
    const res = scoreAssessment({ tasks: [], responses: [], evaluations: [], jobDescription: "", resumeText: "" });
    expect(res.overall).toBe(0);
    expect(res.band).toBe("Not Recommended Yet");
  });
});
