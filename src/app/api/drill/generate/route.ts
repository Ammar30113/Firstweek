import { NextResponse } from "next/server";
import { generateDrill } from "@/lib/ai/stages";
import { badRequest, serverError } from "@/lib/http";
import { createClient } from "@/lib/supabase/server";
import { aiContext } from "@/lib/ai/context";
import { checkDailyBudget } from "@/lib/db/guards";
import { checkDrillPaywall } from "@/lib/billing/entitlement";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_FIELD = 600; // competency/context are short labels, not documents

// Generate a focused practice drill for one competency (the gap → drill step).
export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    // Cost kill-switch (this spends on OpenAI) + free→Pro drill gate.
    const budget = await checkDailyBudget();
    if (!budget.ok) return NextResponse.json({ error: budget.error }, { status: budget.status });
    const pay = await checkDrillPaywall(user.id);
    if (!pay.ok) return NextResponse.json({ error: pay.error, upgrade: true }, { status: pay.status });

    const body = await req.json();
    const competency = String(body.competency || "").trim().slice(0, MAX_FIELD);
    const roleContext = String(body.roleContext || "").trim().slice(0, MAX_FIELD) || undefined;
    const gapDetail = String(body.gapDetail || "").trim().slice(0, MAX_FIELD) || undefined;
    const assessmentId = body.assessmentId ? String(body.assessmentId) : null;
    const source = ["skill_gap", "weak_competency", "custom"].includes(body.source)
      ? body.source
      : "skill_gap";
    if (!competency) return badRequest("competency is required");

    // If an assessmentId is supplied, confirm it belongs to the user (RLS).
    if (assessmentId) {
      const { data: owns } = await supabase
        .from("assessments")
        .select("id")
        .eq("id", assessmentId)
        .maybeSingle();
      if (!owns) return badRequest("assessment not found");
    }

    aiContext.enterWith({ userId: user.id, assessmentId });
    const drill = await generateDrill({ competency, roleContext, gapDetail });

    const { data: row, error } = await supabase
      .from("drills")
      .insert({
        user_id: user.id,
        assessment_id: assessmentId,
        competency,
        source,
        role_context: roleContext ?? null,
        drill_json: drill,
        status: "generated",
      })
      .select("id")
      .single();
    if (error) throw error;

    return NextResponse.json({ drillId: row!.id, drill });
  } catch (err) {
    return serverError(err);
  }
}
