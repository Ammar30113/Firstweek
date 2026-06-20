import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";

const RATE_LIMIT_PER_HOUR = Number(process.env.RATE_LIMIT_PER_HOUR || 20);
const DAILY_BUDGET_USD = Number(process.env.DAILY_BUDGET_USD || 25);

export type LimitResult = { ok: true } | { ok: false; status: number; error: string };

/**
 * Gate the start of an assessment with two controls:
 *  - per-user rate limit (assessments created in the last hour)
 *  - global daily spend kill-switch (sum of ai_logs.cost_usd today vs. budget)
 * Both thresholds are env-configurable.
 */
export async function checkLimits(
  supabase: SupabaseClient,
  userId: string
): Promise<LimitResult> {
  // Per-user rate limit (RLS scopes this count to the user's own rows).
  const sinceHour = new Date(Date.now() - 3_600_000).toISOString();
  const { count } = await supabase
    .from("assessments")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", sinceHour);
  if ((count ?? 0) >= RATE_LIMIT_PER_HOUR) {
    return {
      ok: false,
      status: 429,
      error: "You're starting assessments too quickly. Please try again in a bit.",
    };
  }

  // Global daily budget kill-switch.
  const dayStart = new Date();
  dayStart.setUTCHours(0, 0, 0, 0);
  const admin = createAdminClient();
  const { data } = await admin
    .from("ai_logs")
    .select("cost_usd")
    .gte("created_at", dayStart.toISOString())
    .not("cost_usd", "is", null);
  const spent = (data ?? []).reduce((s: number, r: { cost_usd: number | null }) => s + Number(r.cost_usd || 0), 0);
  if (spent >= DAILY_BUDGET_USD) {
    return {
      ok: false,
      status: 503,
      error: "FirstWeek is at capacity for today. Please try again tomorrow.",
    };
  }

  return { ok: true };
}
