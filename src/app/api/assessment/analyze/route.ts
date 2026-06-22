import { NextResponse } from "next/server";
import { extractJob, extractCandidate, matchRoleCandidate } from "@/lib/ai/stages";
import { badRequest, serverError } from "@/lib/http";
import { createClient } from "@/lib/supabase/server";
import { aiContext } from "@/lib/ai/context";
import { checkLimits } from "@/lib/db/guards";
import { checkPaywall } from "@/lib/billing/entitlement";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_INPUT = 16000; // ~4k tokens; caps cost and blocks prompt-stuffing

// Stages 1-3 + persist: creates job_post, candidate_profile, assessment.
export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const limit = await checkLimits(supabase, user.id);
    if (!limit.ok) return NextResponse.json({ error: limit.error }, { status: limit.status });

    // Free→paid gate (no-op until billing is configured).
    const pay = await checkPaywall(user.id);
    if (!pay.ok) return NextResponse.json({ error: pay.error, upgrade: true }, { status: pay.status });

    const body = await req.json();
    const job_description = String(body.job_description || "").trim().slice(0, MAX_INPUT);
    const resume_text = String(body.resume_text || "").trim().slice(0, MAX_INPUT);
    if (!job_description) return badRequest("job_description is required");
    if (!resume_text) return badRequest("resume_text is required");

    aiContext.enterWith({ userId: user.id });

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

    const { data: jobRow, error: jobErr } = await supabase
      .from("job_posts")
      .insert({
        user_id: user.id,
        raw_description: job_description,
        title: job.job_title,
        company: job.company,
        location: job.location,
        role_family: job.role_family,
        seniority: job.seniority_level,
        analysis_json: job,
      })
      .select("id")
      .single();
    if (jobErr) throw jobErr;

    const { data: candRow, error: candErr } = await supabase
      .from("candidate_profiles")
      .insert({
        user_id: user.id,
        full_name: candidate.candidate_name,
        current_title: candidate.current_title,
        years_experience: Math.round(Number(candidate.years_experience_estimate) || 0),
        resume_text,
        profile_json: candidate,
        skills_json: candidate.core_skills,
        projects_json: candidate.projects,
        tools_json: candidate.tools,
      })
      .select("id")
      .single();
    if (candErr) throw candErr;

    const { data: assessRow, error: assessErr } = await supabase
      .from("assessments")
      .insert({
        user_id: user.id,
        candidate_profile_id: candRow!.id,
        job_post_id: jobRow!.id,
        job_title: job.job_title,
        status: "in_progress",
        role_match_json: match,
      })
      .select("id")
      .single();
    if (assessErr) throw assessErr;

    return NextResponse.json({ assessmentId: assessRow!.id, job, candidate, match });
  } catch (err) {
    return serverError(err);
  }
}
