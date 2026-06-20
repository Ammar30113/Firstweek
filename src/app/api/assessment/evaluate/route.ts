import { NextResponse } from "next/server";
import { evaluateTask, generateReport } from "@/lib/ai/stages";
import {
  MANDATORY_DISCLAIMER,
  type Report,
  type SimulationTask,
  type Evaluation,
} from "@/lib/schemas";
import { scoreAssessment } from "@/lib/scoring";
import { badRequest, serverError } from "@/lib/http";
import { createClient } from "@/lib/supabase/server";
import { aiContext } from "@/lib/ai/context";

export const runtime = "nodejs";
export const maxDuration = 60;

// Stage 5 (per task) -> scoring -> Stage 6 (report) + persist everything.
export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const body = await req.json();
    const assessmentId = String(body.assessmentId || "");
    const responses: string[] = Array.isArray(body.responses)
      ? body.responses.map((r: unknown) => String(r ?? ""))
      : [];
    if (!assessmentId) return badRequest("assessmentId is required");

    const { data: assess, error: aErr } = await supabase
      .from("assessments")
      .select("id, job_post_id, candidate_profile_id, role_match_json")
      .eq("id", assessmentId)
      .single();
    if (aErr || !assess) return NextResponse.json({ error: "Assessment not found" }, { status: 404 });

    const { data: jobRow } = await supabase
      .from("job_posts")
      .select("raw_description, analysis_json")
      .eq("id", assess.job_post_id)
      .single();
    const { data: candRow } = await supabase
      .from("candidate_profiles")
      .select("resume_text, profile_json")
      .eq("id", assess.candidate_profile_id)
      .single();
    const { data: taskRows, error: tErr } = await supabase
      .from("simulation_tasks")
      .select("id, task_json, order_index")
      .eq("assessment_id", assessmentId)
      .order("order_index");
    if (tErr) throw tErr;
    if (!taskRows || taskRows.length === 0) return badRequest("no tasks to evaluate");
    if (responses.length !== taskRows.length) return badRequest("responses must align with tasks");

    const tasks: SimulationTask[] = taskRows.map((r) => r.task_json as SimulationTask);

    aiContext.enterWith({ userId: user.id, assessmentId });

    const evaluations: Evaluation[] = await Promise.all(
      tasks.map((task, i) => evaluateTask(task, responses[i] || ""))
    );

    const job = jobRow?.analysis_json;
    const candidate = candRow?.profile_json;
    const score = scoreAssessment({
      tasks,
      responses,
      evaluations,
      jobDescription: jobRow?.raw_description || "",
      resumeText: candRow?.resume_text || "",
    });

    // Idempotent: clear prior responses (cascades to evaluations) before saving.
    await supabase.from("task_responses").delete().eq("assessment_id", assessmentId);
    for (let i = 0; i < taskRows.length; i++) {
      const { data: respRow, error: rErr } = await supabase
        .from("task_responses")
        .insert({
          simulation_task_id: taskRows[i].id,
          assessment_id: assessmentId,
          user_response: responses[i] || "",
        })
        .select("id")
        .single();
      if (rErr) throw rErr;
      const { error: eErr } = await supabase.from("task_evaluations").insert({
        task_response_id: respRow!.id,
        simulation_task_id: taskRows[i].id,
        assessment_id: assessmentId,
        score: score.perTask[i].score,
        evaluation_json: evaluations[i],
        competency_scores_json: score.perTask[i].competencies,
        confidence_level: evaluations[i].confidence_level,
      });
      if (eErr) throw eErr;
    }

    const reportBody = await generateReport({
      candidate,
      job,
      match: assess.role_match_json,
      evaluations: tasks.map((task, i) => ({
        task,
        evaluation: evaluations[i],
        score: score.perTask[i].score,
      })),
      overallScore: score.overall,
      readinessBand: score.band,
      confidenceLevel: score.confidence,
    });

    const report: Report = {
      ...reportBody,
      overall_score: score.overall,
      readiness_band: score.band,
      confidence_level: score.confidence,
      disclaimer: MANDATORY_DISCLAIMER,
    };

    await supabase
      .from("reports")
      .upsert({ assessment_id: assessmentId, report_json: report }, { onConflict: "assessment_id" });
    await supabase
      .from("assessments")
      .update({
        status: "completed",
        overall_score: score.overall,
        readiness_band: score.band,
        confidence_level: score.confidence,
        application_recommendation: report.application_recommendation,
        completed_at: new Date().toISOString(),
      })
      .eq("id", assessmentId);

    return NextResponse.json({ evaluations, score, report });
  } catch (err) {
    return serverError(err);
  }
}
