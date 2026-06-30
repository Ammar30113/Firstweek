import { NextResponse } from "next/server";
import { evaluateDrill } from "@/lib/ai/stages";
import { badRequest, serverError } from "@/lib/http";
import { createClient } from "@/lib/supabase/server";
import { aiContext } from "@/lib/ai/context";
import { checkDailyBudget } from "@/lib/db/guards";
import type { Drill } from "@/lib/schemas";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_RESPONSE = 8000; // caps cost + prompt-stuffing on a short drill answer

const clamp5 = (n: number) => Math.max(1, Math.min(5, Math.round(Number(n) || 0)));

// Evaluate a drill response and score the one competency (the re-prove step).
export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const budget = await checkDailyBudget();
    if (!budget.ok) return NextResponse.json({ error: budget.error }, { status: budget.status });

    const body = await req.json();
    const drillId = String(body.drillId || "");
    const response = String(body.response || "").trim().slice(0, MAX_RESPONSE);
    if (!drillId) return badRequest("drillId is required");
    if (!response) return badRequest("response is required");

    // RLS scopes this to the user's own drill.
    const { data: row, error: loadErr } = await supabase
      .from("drills")
      .select("id, status, drill_json, assessment_id")
      .eq("id", drillId)
      .maybeSingle();
    if (loadErr) throw loadErr;
    if (!row) return NextResponse.json({ error: "Drill not found" }, { status: 404 });
    if (row.status === "completed")
      return NextResponse.json({ error: "This drill is already complete." }, { status: 409 });

    aiContext.enterWith({ userId: user.id, assessmentId: row.assessment_id });
    const evaluation = await evaluateDrill({ drill: row.drill_json as Drill, response });
    const score = clamp5(evaluation.score_1_to_5) * 20; // 1->20 ... 5->100

    const { error: upErr } = await supabase
      .from("drills")
      .update({
        user_response: response,
        evaluation_json: evaluation,
        score,
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", drillId);
    if (upErr) throw upErr;

    return NextResponse.json({ evaluation, score });
  } catch (err) {
    return serverError(err);
  }
}
