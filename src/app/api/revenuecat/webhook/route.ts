import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

// RevenueCat webhook → sync the "pro" entitlement into Supabase so server routes
// can gate fast. RevenueCat has no HMAC signature; its only auth is a static
// Authorization header value you set in the dashboard (RC_WEBHOOK_AUTH).

// Events that GRANT/keep access vs. the one that ends it. Note: CANCELLATION is
// NOT a revoke — access continues until EXPIRATION (gate on expires_at).
const GRANT = new Set([
  "INITIAL_PURCHASE",
  "RENEWAL",
  "UNCANCELLATION",
  "PRODUCT_CHANGE",
  "SUBSCRIPTION_EXTENDED",
  "NON_RENEWING_PURCHASE",
]);
const REVOKE = new Set(["EXPIRATION"]);

function authOk(header: string | null): boolean {
  const expected = process.env.RC_WEBHOOK_AUTH;
  if (!expected || !header) return false;
  const a = Buffer.from(header);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

interface RcEvent {
  type?: string;
  app_user_id?: string;
  entitlement_ids?: string[];
  expiration_at_ms?: number;
  store?: string;
}

export async function POST(req: Request) {
  if (!authOk(req.headers.get("authorization"))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let event: RcEvent | undefined;
  try {
    ({ event } = await req.json());
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  if (!event?.type || !event.app_user_id) return NextResponse.json({ ok: true });
  // Only react to our "pro" entitlement (when the event scopes entitlements).
  if (Array.isArray(event.entitlement_ids) && !event.entitlement_ids.includes("pro")) {
    return NextResponse.json({ ok: true });
  }

  const userId = event.app_user_id;
  try {
    const admin = createAdminClient();
    if (GRANT.has(event.type)) {
      await admin.from("entitlements").upsert(
        {
          app_user_id: userId,
          entitlement: "pro",
          is_active: true,
          expires_at: event.expiration_at_ms ? new Date(event.expiration_at_ms).toISOString() : null,
          store: event.store ?? null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "app_user_id,entitlement" },
      );
    } else if (REVOKE.has(event.type)) {
      await admin.from("entitlements").upsert(
        { app_user_id: userId, entitlement: "pro", is_active: false, updated_at: new Date().toISOString() },
        { onConflict: "app_user_id,entitlement" },
      );
    }
  } catch (e) {
    // Return 500 so RevenueCat retries (delivery is at-least-once; upsert is idempotent).
    console.error("[revenuecat webhook]", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "sync failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
