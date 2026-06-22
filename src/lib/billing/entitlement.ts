import { createAdminClient } from "@/lib/supabase/admin";
import type { LimitResult } from "@/lib/db/guards";

// Billing is OFF unless BOTH the public checkout key AND the webhook secret are
// configured — otherwise the gate could turn on while no purchase can ever sync
// an entitlement (paying users charged but never upgraded). Off → everyone
// unlimited, so shipping this can't lock out existing users.
export const BILLING_ENABLED =
  !!process.env.NEXT_PUBLIC_RC_WEB_BILLING_KEY && !!process.env.RC_WEBHOOK_AUTH;
export const FREE_ASSESSMENTS = Number(process.env.FREE_ASSESSMENTS || 1);

// Pure entitlement check against the webhook-synced table. Throws on a DB error
// (the caller fails open) so an infra problem never silently looks like "not Pro".
// Requires a FUTURE expiry: a grant with a null/past expiry is NOT Pro, so a
// one-off purchase or a malformed event can't mint permanent access.
export async function isPro(userId: string): Promise<boolean> {
  const { data, error } = await createAdminClient()
    .from("entitlements")
    .select("is_active, expires_at")
    .eq("app_user_id", userId)
    .eq("entitlement", "pro")
    .maybeSingle();
  if (error) throw error;
  if (!data?.is_active || !data.expires_at) return false;
  return new Date(data.expires_at).getTime() > Date.now();
}

// Free→paid gate for starting an assessment. No-op while billing is disabled.
// Counts COMPLETED assessments (matches the "1 free full simulation" promise and
// avoids burning the credit on a re-run) via the admin client, so the count
// isn't subject to the user's RLS. Fails OPEN on any error — a DB outage or an
// unrun migration must never lock out users (or paying customers).
export async function checkPaywall(userId: string): Promise<LimitResult> {
  if (!BILLING_ENABLED) return { ok: true };
  try {
    if (await isPro(userId)) return { ok: true };

    const { count, error } = await createAdminClient()
      .from("assessments")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "completed");
    if (error) throw error;

    if ((count ?? 0) >= FREE_ASSESSMENTS) {
      return {
        ok: false,
        status: 402,
        error: `You've used your ${FREE_ASSESSMENTS} free assessment${FREE_ASSESSMENTS === 1 ? "" : "s"}. Upgrade to Pro for unlimited simulations.`,
      };
    }
    return { ok: true };
  } catch (e) {
    console.error("[checkPaywall]", e instanceof Error ? e.message : e);
    return { ok: true }; // fail open
  }
}
