import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import type { LimitResult } from "@/lib/db/guards";

// Billing is OFF until a RevenueCat key is configured, so shipping this code
// can never lock out existing users before there's a way to pay.
export const BILLING_ENABLED = !!process.env.NEXT_PUBLIC_RC_WEB_BILLING_KEY;
export const FREE_ASSESSMENTS = Number(process.env.FREE_ASSESSMENTS || 1);

// Pure entitlement check against the webhook-synced table.
export async function isPro(userId: string): Promise<boolean> {
  try {
    const { data } = await createAdminClient()
      .from("entitlements")
      .select("is_active, expires_at")
      .eq("app_user_id", userId)
      .eq("entitlement", "pro")
      .maybeSingle();
    if (!data?.is_active) return false;
    // Gate on expiry, not cancellation: a cancelled sub keeps Pro until it lapses.
    if (data.expires_at && new Date(data.expires_at).getTime() <= Date.now()) return false;
    return true;
  } catch {
    return false;
  }
}

// Free→paid gate for starting an assessment. No-op while billing is disabled.
export async function checkPaywall(supabase: SupabaseClient, userId: string): Promise<LimitResult> {
  if (!BILLING_ENABLED) return { ok: true };
  if (await isPro(userId)) return { ok: true };

  const { count } = await supabase
    .from("assessments")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  if ((count ?? 0) >= FREE_ASSESSMENTS) {
    return {
      ok: false,
      status: 402,
      error: `You've used your ${FREE_ASSESSMENTS} free assessment${FREE_ASSESSMENTS === 1 ? "" : "s"}. Upgrade to Pro for unlimited simulations.`,
    };
  }
  return { ok: true };
}
