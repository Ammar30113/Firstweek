import { createAdminClient } from "@/lib/supabase/admin";

export interface AiLogEntry {
  step: string;
  model: string;
  durationMs: number;
  promptTokens?: number | null;
  completionTokens?: number | null;
  costUsd?: number | null;
  error?: string | null;
  userId?: string | null;
  assessmentId?: string | null;
}

// Best-effort write to ai_logs (service-role). Never throws — logging must not
// break or slow-fail a request.
export async function logAiCall(e: AiLogEntry): Promise<void> {
  try {
    await createAdminClient()
      .from("ai_logs")
      .insert({
        user_id: e.userId ?? null,
        assessment_id: e.assessmentId ?? null,
        step_name: e.step,
        model: e.model,
        duration_ms: e.durationMs,
        prompt_tokens: e.promptTokens ?? null,
        completion_tokens: e.completionTokens ?? null,
        cost_usd: e.costUsd ?? null,
        error: e.error ?? null,
      });
  } catch {
    // swallow — best-effort
  }
}
