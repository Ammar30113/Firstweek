import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { PricingCTA } from "@/components/pricing-cta";
import { FREE_ASSESSMENTS } from "@/lib/billing/entitlement";

export const dynamic = "force-dynamic";

const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: "Pricing — Free to try, Pro for unlimited",
  description:
    "Run your first FirstWeek simulation free. Go Pro for unlimited job simulations and readiness reports.",
  alternates: { canonical: `${base}/pricing` },
};

const FREE_POINTS = [
  `${FREE_ASSESSMENTS} full simulation${FREE_ASSESSMENTS === 1 ? "" : "s"}`,
  "Realistic work tasks from any posting",
  "Honest readiness report with strengths + gaps",
];
const PRO_POINTS = [
  "Unlimited simulations & reports",
  "Every role, every application",
  "Import postings by URL",
  "Priority AI evaluation",
  "Your full assessment history",
];

export default async function PricingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div>
      {/* header */}
      <section className="grain relative overflow-hidden bg-ink-950">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="aurora drift-slow left-[15%] top-[-40%] h-[26rem] w-[26rem] bg-brand-600/30" />
          <div className="aurora drift-slower right-[8%] top-[-20%] h-[20rem] w-[20rem] bg-ember-500/20" />
        </div>
        <div className="relative z-10 mx-auto max-w-3xl px-5 py-16 text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-ember-300">Pricing</span>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Try it free. Go <span className="text-gradient">Pro</span> when it&apos;s working.
          </h1>
          <p className="mx-auto mt-4 max-w-md text-stone-400">
            Prove you can do the job before you apply — start free, upgrade when you want unlimited runs.
          </p>
        </div>
      </section>

      {/* plans */}
      <div className="mx-auto -mt-8 grid max-w-3xl gap-5 px-5 pb-16 sm:grid-cols-2">
        {/* Free */}
        <div className="rounded-3xl border border-stone-200/70 bg-white p-7 shadow-[0_1px_2px_rgba(40,30,20,0.05),0_18px_44px_-24px_rgba(140,90,55,0.3)]">
          <h2 className="font-display text-xl font-semibold text-stone-900">Free</h2>
          <p className="mt-1 text-sm text-stone-500">See if it&apos;s for you.</p>
          <p className="mt-4 font-display text-4xl font-semibold tracking-tight text-stone-900">$0</p>
          <ul className="mt-5 space-y-2.5 text-sm text-stone-700">
            {FREE_POINTS.map((p) => (
              <li key={p} className="flex gap-2.5">
                <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-stone-300" />
                {p}
              </li>
            ))}
          </ul>
          <Link
            href={user ? "/assessment" : "/login"}
            className="mt-6 block rounded-xl border border-stone-300 px-5 py-3 text-center text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
          >
            Start free
          </Link>
        </div>

        {/* Pro */}
        <div className="grain relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 to-brand-800 p-7 text-white shadow-[0_24px_60px_-24px_rgba(200,71,42,0.6)]">
          <div className="relative">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold">Pro</h2>
              <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-semibold">Unlimited</span>
            </div>
            <p className="mt-1 text-sm text-brand-50/80">For an active search.</p>
            <p className="mt-4 font-display text-4xl font-semibold tracking-tight">
              $19<span className="text-base font-medium text-brand-50/70"> / mo</span>
            </p>
            <ul className="mt-5 space-y-2.5 text-sm">
              {PRO_POINTS.map((p) => (
                <li key={p} className="flex items-center gap-2.5">
                  <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-white/20 text-xs">
                    ✓
                  </span>
                  {p}
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <PricingCTA userId={user?.id} loggedIn={!!user} />
            </div>
            <p className="mt-3 text-center text-xs text-brand-50/70">Cancel anytime.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
