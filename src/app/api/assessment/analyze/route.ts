import { NextResponse } from "next/server";
import { extractJob, extractCandidate, matchRoleCandidate } from "@/lib/ai/stages";
import { badRequest, serverError } from "@/lib/http";

export const runtime = "nodejs";
export const maxDuration = 60;

// Stages 1-3: job extraction + candidate extraction (parallel) -> match.
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const job_description = String(body.job_description || "").trim();
    const resume_text = String(body.resume_text || "").trim();
    if (!job_description) return badRequest("job_description is required");
    if (!resume_text) return badRequest("resume_text is required");

    const [job, candidate] = await Promise.all([
      extractJob({
        job_description,
        title: body.title,
        company: body.company,
        location: body.location,
      }),
      extractCandidate({
        resume_text,
        current_role: body.current_role,
        target_role: body.target_role,
        years_experience: body.years_experience,
        additional_skills: body.additional_skills,
      }),
    ]);

    const match = await matchRoleCandidate(job, candidate);
    return NextResponse.json({ job, candidate, match });
  } catch (err) {
    return serverError(err);
  }
}
