"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const RC_KEY = process.env.NEXT_PUBLIC_RC_WEB_BILLING_KEY;

// Drives the RevenueCat Web Billing checkout. The Supabase user UUID is passed
// as appUserId so the webhook's app_user_id lines up with our entitlements row.
export function PricingCTA({ userId, loggedIn }: { userId?: string; loggedIn: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    setLoading(true);
    setError(null);
    try {
      const { Purchases } = await import("@revenuecat/purchases-js");
      const purchases = Purchases.configure({ apiKey: RC_KEY!, appUserId: userId! });
      const offerings = await purchases.getOfferings();
      const pkg = offerings.current?.availablePackages?.[0];
      if (!pkg) throw new Error("No plan is available yet. Please try again shortly.");
      await purchases.purchase({ rcPackage: pkg });
      // The webhook flips the entitlement; send them into the app.
      router.push("/assessment");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout couldn't start. Please try again.");
    } finally {
      setLoading(false);
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
        {loading ? "Opening checkout…" : "Upgrade to Pro"}
      </button>
      {error && <p className="mt-2 text-center text-sm text-white/90">{error}</p>}
    </div>
  );
}
