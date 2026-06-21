import Link from "next/link";
import type { Metadata } from "next";
import { GUIDES } from "@/data/guides";

export const dynamic = "force-static";
export const revalidate = 86400;

const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: "Guides — Layoffs, AI, and getting hired in 2026",
  description:
    "Honest, useful guides for the 2026 job market: surviving layoffs, whether AI will take your job, landing roles without a degree, and proving you can do the work.",
  alternates: { canonical: `${base}/guides` },
  openGraph: {
    title: "FirstWeek Guides — Layoffs, AI, and getting hired in 2026",
    description:
      "Honest, useful guides for the 2026 job market: layoffs, AI and your job, no-degree hiring, career pivots, and standing out.",
    url: `${base}/guides`,
    type: "website",
  },
};

export default function GuidesIndex() {
  const [lead, ...rest] = GUIDES;

  return (
    <div>
      {/* cinematic header */}
      <section className="grain relative overflow-hidden bg-ink-950">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="aurora drift-slow left-[10%] top-[-40%] h-[26rem] w-[26rem] bg-brand-600/30" />
          <div className="aurora drift-slower right-[5%] top-[-20%] h-[22rem] w-[22rem] bg-ember-500/20" />
        </div>
        <div className="relative z-10 mx-auto max-w-5xl px-5 py-16">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-ember-300">Field guides</span>
          <h1 className="mt-2 max-w-2xl font-display text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
            Getting hired in the <span className="text-gradient">age of AI</span>.
          </h1>
          <p className="mt-4 max-w-xl text-stone-400">
            Straight, useful answers for the 2026 market — layoffs, AI and your job, hiring without a degree, and
            how to actually prove you can do the work.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-5 py-12">
        {/* featured */}
        <Link
          href={`/guides/${lead.slug}`}
          className="group block rounded-3xl border border-stone-200/70 bg-white p-8 shadow-[0_1px_2px_rgba(40,30,20,0.05),0_18px_44px_-24px_rgba(140,90,55,0.3)] transition hover:-translate-y-0.5 hover:border-brand-200"
        >
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">{lead.category}</span>
          <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">
            {lead.title}
          </h2>
          <p className="mt-2 max-w-2xl text-stone-600">{lead.description}</p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600">
            Read the guide <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </span>
        </Link>

        {/* grid */}
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((g) => (
            <Link
              key={g.slug}
              href={`/guides/${g.slug}`}
              className="group flex h-full flex-col rounded-2xl border border-stone-200/70 bg-white p-6 shadow-[0_1px_2px_rgba(40,30,20,0.04)] transition hover:-translate-y-1 hover:border-brand-200 hover:shadow-[0_18px_40px_-24px_rgba(200,71,42,0.4)]"
            >
              <span className="text-[11px] font-semibold uppercase tracking-wide text-brand-600">{g.category}</span>
              <h3 className="mt-1.5 font-display text-lg font-semibold leading-snug tracking-tight text-stone-900">
                {g.title}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-stone-600">{g.description}</p>
              <span className="mt-3 text-sm font-semibold text-brand-600">
                {g.readingMins} min read →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
