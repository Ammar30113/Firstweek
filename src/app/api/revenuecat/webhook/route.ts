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
]);
const REVOKE = new Set(["EXPIRATION"]);

// app_user_id must be a Supabase auth UUID — reject anything else so a webhook
// can't grant Pro to an arbitrary/garbage subject.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
// Bound a grant's expiry so a forged/replayed event can't mint near-permanent Pro.
const MAX_GRANT_MS = 60 * 24 * 60 * 60 * 1000; // 60 days

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

// RevenueCat doesn't always include expiration_at_ms on grant-type events
// (UNCANCELLATION, PRODUCT_CHANGE, some RENEWAL shapes). Reconcile the entitlement
// expiry from the v1 subscriber API so a renewing subscriber isn't wrongly lapsed.
// Requires RC_SECRET_API_KEY; returns null if unset or on any error (caller logs).
async function fetchEntitlementExpiry(appUserId: string): Promise<number | null> {
  const key = process.env.RC_SECRET_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch(
      `https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(appUserId)}`,
      { headers: { Authorization: `Bearer ${key}` } },
    );
    if (!res.ok) return null;
    const json = await res.json();
    const iso = json?.subscriber?.entitlements?.pro?.expires_date;
    if (!iso) return null;
    const ms = new Date(iso).getTime();
    return Number.isFinite(ms) ? ms : null;
  } catch {
    return null;
  }
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
  if (!UUID_RE.test(userId)) return NextResponse.json({ ok: true }); // ignore non-UUID subjects

  try {
    const admin = createAdminClient();
    // Grants require an expiry (our product is a subscription); clamp it so a
    // forged/replayed event can't grant near-permanent access. isPro also
    // requires a future expiry, so a missing one simply grants nothing.
    if (GRANT.has(event.type)) {
      // Prefer the event's expiry; fall back to the subscriber API when absent
      // so renewals/uncancellations without expiration_at_ms still extend Pro.
      const expMs = event.expiration_at_ms ?? (await fetchEntitlementExpiry(userId));
      if (!expMs) {
        // Don't silently drop a real grant — surface it for investigation.
        console.warn("[revenuecat webhook] grant without resolvable expiry:", event.type, userId);
      } else {
        const expiresMs = Math.min(expMs, Date.now() + MAX_GRANT_MS);
        await admin.from("entitlements").upsert(
          {
            app_user_id: userId,
            entitlement: "pro",
            is_active: true,
            expires_at: new Date(expiresMs).toISOString(),
            store: event.store ?? null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "app_user_id,entitlement" },
        );
      }
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
