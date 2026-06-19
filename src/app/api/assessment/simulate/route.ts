import { NextResponse } from "next/server";
import { generateSimulation } from "@/lib/ai/stages";
import { jobAnalysisSchema, candidateProfileSchema, roleMatchSchema } from "@/lib/schemas";
import { serverError } from "@/lib/http";

export const runtime = "nodejs";
export const maxDuration = 60;

// Stage 4: generate role-specific simulation tasks.
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const job = jobAnalysisSchema.parse(body.job);
    const candidate = candidateProfileSchema.parse(body.candidate);
    const match = roleMatchSchema.parse(body.match);
    const taskCount = Number(body.task_count) || 3;

    const tasks = await generateSimulation(job, candidate, match, taskCount);
    return NextResponse.json({ tasks });
  } catch (err) {
    return serverError(err);
  }
}
