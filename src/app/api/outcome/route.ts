import { NextResponse } from "next/server";
import { badRequest, serverError } from "@/lib/http";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const STAGES = ["applied", "interview", "offer", "hired", "rejected", "no_response"] as const;

// Log a real-world outcome for a role the user prepped for (the "did it work"
// signal). Append-only: each tap is an event, so the funnel is preserved.
export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const body = await req.json();
    const assessmentId = String(body.assessmentId || "");
    const stage = String(body.stage || "");
    const note = body.note ? String(body.note).trim().slice(0, 1000) : null;
    if (!assessmentId) return badRequest("assessmentId is required");
    if (!STAGES.includes(stage as (typeof STAGES)[number])) return badRequest("invalid stage");

    // The RLS policy also enforces ownership of the assessment, but check here
    // for a clean 404 instead of a policy violation.
    const { data: owns } = await supabase
      .from("assessments")
      .select("id")
      .eq("id", assessmentId)
      .maybeSingle();
    if (!owns) return NextResponse.json({ error: "Assessment not found" }, { status: 404 });

    const { error } = await supabase
      .from("outcomes")
      .insert({ user_id: user.id, assessment_id: assessmentId, stage, note });
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err) {
    return serverError(err);
  }
}
