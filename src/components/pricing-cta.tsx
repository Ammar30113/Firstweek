"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const RC_KEY = process.env.NEXT_PUBLIC_RC_WEB_BILLING_KEY;

// Drives the RevenueCat Web Billing checkout. The Supabase user UUID is passed
// as appUserId so the webhook's app_user_id lines up with our entitlements row.
export function PricingCTA({ userId, loggedIn }: { userId?: string; loggedIn: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef(false);

  // Billing not configured yet → honest placeholder, no broken checkout.
  if (!RC_KEY) {
    return (
      <div className="rounded-xl bg-white/10 px-5 py-3 text-center text-sm font-medium text-white/80">
        Pro is launching soon.
      </div>
    );
  }

  if (!loggedIn) {
    return (
      <Link
        href="/login"
        className="block rounded-xl bg-white px-5 py-3 text-center text-sm font-semibold text-brand-700 transition hover:bg-cream-100"
      >
        Sign in to upgrade
      </Link>
    );
  }

  async function upgrade() {
    if (inFlight.current) return; // guard against double-submit / double-charge
    inFlight.current = true;
    setLoading(true);
    setError(null);
    try {
      const { Purchases } = await import("@revenuecat/purchases-js");
      const purchases = Purchases.configure({ apiKey: RC_KEY!, appUserId: userId! });
      const offerings = await purchases.getOfferings();
      const pkg = offerings.current?.availablePackages?.[0];
      if (!pkg) throw new Error("No plan is available yet. Please try again shortly.");
      await purchases.purchase({ rcPackage: pkg });

      // The purchase is done in RevenueCat, but our DB updates via the async
      // webhook. Wait (briefly) for the "pro" entitlement to reflect before
      // entering the gated app, so a just-paid user isn't bounced by the paywall.
      setFinalizing(true);
      for (let i = 0; i < 12; i++) {
        const r = await fetch("/api/billing/status", { cache: "no-store" })
          .then((x) => x.json())
          .catch(() => null);
        if (r?.pro) break;
        await new Promise((res) => setTimeout(res, 1200));
      }
      router.push("/assessment");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout couldn't start. Please try again.");
    } finally {
      setLoading(false);
      setFinalizing(false);
      inFlight.current = false;
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={upgrade}
        disabled={loading}
        className="w-full rounded-xl bg-white px-5 py-3 text-sm font-semibold text-brand-700 shadow-sm transition hover:bg-cream-100 disabled:opacity-60"
      >
        {finalizing ? "Finalizing your subscription…" : loading ? "Opening checkout…" : "Upgrade to Pro"}
      </button>
      {error && <p className="mt-2 text-center text-sm text-white/90">{error}</p>}
    </div>
  );
}
