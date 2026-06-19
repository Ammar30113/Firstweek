import { NextResponse } from "next/server";
import { z } from "zod";
import { evaluateTask, generateReport } from "@/lib/ai/stages";
import {
  jobAnalysisSchema,
  candidateProfileSchema,
  roleMatchSchema,
  simulationTaskSchema,
  MANDATORY_DISCLAIMER,
  type Report,
} from "@/lib/schemas";
import { scoreAssessment } from "@/lib/scoring";
import { badRequest, serverError } from "@/lib/http";

export const runtime = "nodejs";
export const maxDuration = 60;

// Stage 5 (per task) -> deterministic scoring -> Stage 6 (report).
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const job = jobAnalysisSchema.parse(body.job);
    const candidate = candidateProfileSchema.parse(body.candidate);
    const match = roleMatchSchema.parse(body.match);
    const tasks = z.array(simulationTaskSchema).parse(body.tasks);
    const responses = z.array(z.string()).parse(body.responses);
    const job_description = String(body.job_description || "");
    const resume_text = String(body.resume_text || "");

    if (tasks.length === 0) return badRequest("no tasks to evaluate");
    if (responses.length !== tasks.length) return badRequest("responses must align with tasks");

    const evaluations = await Promise.all(
      tasks.map((task, i) => evaluateTask(task, responses[i] || ""))
    );

    const score = scoreAssessment({
      tasks,
      responses,
      evaluations,
      jobDescription: job_description,
      resumeText: resume_text,
    });

    const reportBody = await generateReport({
      candidate,
      job,
      match,
      evaluations: tasks.map((task, i) => ({
        task,
        evaluation: evaluations[i],
        score: score.perTask[i].score,
      })),
      overallScore: score.overall,
      readinessBand: score.band,
      confidenceLevel: score.confidence,
    });

    // Score / band / confidence / disclaimer are authoritative from code,
    // never trusted to the model.
    const report: Report = {
      ...reportBody,
      overall_score: score.overall,
      readiness_band: score.band,
      confidence_level: score.confidence,
      disclaimer: MANDATORY_DISCLAIMER,
    };

    return NextResponse.json({ evaluations, score, report });
  } catch (err) {
    return serverError(err);
  }
}
