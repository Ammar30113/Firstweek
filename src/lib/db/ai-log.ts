import { createAdminClient } from "@/lib/supabase/admin";
import { modelForStep } from "@/lib/ai/client";

/**
 * Times an AI stage and writes a best-effort row to ai_logs (service-role).
 * Logging never blocks or fails the request.
 */
export async function runAiStage<T>(
  step: string,
  ctx: { userId?: string | null; assessmentId?: string | null },
  thunk: () => Promise<T>
): Promise<T> {
  const start = Date.now();
  try {
    const result = await thunk();
    void writeLog(step, ctx, Date.now() - start, null);
    return result;
  } catch (err) {
    void writeLog(step, ctx, Date.now() - start, err instanceof Error ? err.message : String(err));
    throw err;
  }
}

async function writeLog(
  step: string,
  ctx: { userId?: string | null; assessmentId?: string | null },
  durationMs: number,
  error: string | null
) {
  try {
    await createAdminClient()
      .from("ai_logs")
      .insert({
        user_id: ctx.userId ?? null,
        assessment_id: ctx.assessmentId ?? null,
        step_name: step,
        model: modelForStep(step),
        duration_ms: durationMs,
        error,
      });
  } catch {
    // best-effort only
  }
}
