import { NextResponse } from "next/server";
import { generateSimulation } from "@/lib/ai/stages";
import { badRequest, serverError } from "@/lib/http";
import { createClient } from "@/lib/supabase/server";
import { runAiStage } from "@/lib/db/ai-log";

export const runtime = "nodejs";
export const maxDuration = 60;

// Stage 4 + persist: loads context by assessmentId, generates + stores tasks.
export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { assessmentId } = await req.json();
    if (!assessmentId) return badRequest("assessmentId is required");

    const { data: assess, error: aErr } = await supabase
      .from("assessments")
      .select("id, role_match_json, job_post_id, candidate_profile_id")
      .eq("id", assessmentId)
      .single();
    if (aErr || !assess) return NextResponse.json({ error: "Assessment not found" }, { status: 404 });

    const { data: jobRow } = await supabase
      .from("job_posts")
      .select("analysis_json")
      .eq("id", assess.job_post_id)
      .single();
    const { data: candRow } = await supabase
      .from("candidate_profiles")
      .select("profile_json")
      .eq("id", assess.candidate_profile_id)
      .single();

    const job = jobRow?.analysis_json;
    const candidate = candRow?.profile_json;
    const match = assess.role_match_json;
    if (!job || !candidate || !match) return badRequest("assessment is missing analysis data");

    const tasks = await runAiStage("simulation_generation", { userId: user.id, assessmentId }, () =>
      generateSimulation(job, candidate, match, 3)
    );

    // Idempotent: clear any prior tasks before inserting this set.
    await supabase.from("simulation_tasks").delete().eq("assessment_id", assessmentId);

    const rows = tasks.map((t, i) => ({
      assessment_id: assessmentId,
      title: t.title,
      scenario: t.scenario,
      instructions: t.instructions,
      expected_deliverable: t.expected_deliverable,
      role_relevance: t.role_relevance,
      difficulty: t.difficulty,
      time_estimate_minutes: Math.round(Number(t.time_estimate_minutes) || 0),
      competencies_json: t.competencies_tested,
      rubric_json: t.rubric,
      task_json: t,
      order_index: i,
    }));
    const { error: insErr } = await supabase.from("simulation_tasks").insert(rows);
    if (insErr) throw insErr;

    return NextResponse.json({ tasks });
  } catch (err) {
    return serverError(err);
  }
}
