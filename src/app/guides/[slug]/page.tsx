import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GUIDES, getGuide, AUTHOR } from "@/data/guides";

export const dynamic = "force-static";
export const revalidate = 86400;

const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const g = getGuide(slug);
  if (!g) return {};
  const url = `${base}/guides/${g.slug}`;
  return {
    title: g.title,
    description: g.description,
    keywords: g.keywords,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: g.title,
      description: g.description,
      url,
      publishedTime: g.datePublished,
      authors: [AUTHOR.name],
    },
    twitter: { card: "summary_large_image", title: g.title, description: g.description },
  };
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const g = getGuide(slug);
  if (!g) notFound();

  const url = `${base}/guides/${g.slug}`;
  const related = GUIDES.filter((x) => x.slug !== g.slug).slice(0, 3);
  const date = new Date(g.datePublished).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  // Structured data — Article + FAQPage + breadcrumbs for rich results.
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: g.title,
        description: g.description,
        datePublished: g.datePublished,
        dateModified: g.datePublished,
        author: { "@type": "Person", name: AUTHOR.name },
        publisher: { "@type": "Organization", name: "FirstWeek" },
        mainEntityOfPage: url,
        keywords: g.keywords.join(", "),
      },
      {
        "@type": "FAQPage",
        mainEntity: g.faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Guides", item: `${base}/guides` },
          { "@type": "ListItem", position: 2, name: g.title, item: url },
        ],
      },
    ],
  };

  return (
    <article className="mx-auto max-w-2xl px-5 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className="mb-6 text-sm text-stone-400">
        <Link href="/guides" className="hover:text-stone-700">
          Guides
        </Link>{" "}
        <span className="px-1">/</span> <span className="text-stone-500">{g.category}</span>
      </nav>

      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">{g.category}</span>
      <h1 className="mt-2 font-display text-3xl font-semibold leading-tight tracking-tight text-stone-900 sm:text-[2.6rem]">
        {g.title}
      </h1>
      <p className="mt-3 text-xs text-stone-400">
        By {AUTHOR.name} · {date} · {g.readingMins} min read
      </p>

      {/* snippet-optimized direct answer */}
      <p className="mt-6 border-l-2 border-brand-300 pl-4 text-lg leading-relaxed text-stone-700">{g.dek}</p>

      <div className="mt-8 space-y-8">
        {g.sections.map((s) => (
          <section key={s.heading}>
            <h2 className="font-display text-xl font-semibold tracking-tight text-stone-900">{s.heading}</h2>
            {s.body.map((p, i) => (
              <p key={i} className="mt-3 leading-relaxed text-stone-700">
                {p}
              </p>
            ))}
            {s.list && (
              <ul className="mt-3 space-y-2 text-stone-700">
                {s.list.items.map((it, i) => (
                  <li key={i} className="flex gap-2.5">
                    <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-brand-400" />
                    <span className="leading-relaxed">{it}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      {/* inline CTA */}
      <div className="my-10 rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-50 to-cream-100 p-6">
        <h2 className="font-display text-xl font-semibold text-stone-900">Prove you can do the work</h2>
        <p className="mt-2 text-sm text-stone-600">
          FirstWeek drops you into the real tasks of a specific job posting and hands back an honest readiness
          report — strengths, gaps, and fit. Stop guessing; show it.
        </p>
        <Link
          href="/"
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_-10px_rgba(200,71,42,0.7)] transition hover:bg-brand-500"
        >
          Try a free simulation →
        </Link>
      </div>

      {/* FAQ */}
      <section className="mt-10">
        <h2 className="font-display text-2xl font-semibold tracking-tight text-stone-900">Frequently asked questions</h2>
        <div className="mt-4 divide-y divide-stone-200/70">
          {g.faqs.map((f) => (
            <div key={f.q} className="py-4">
              <h3 className="font-semibold text-stone-900">{f.q}</h3>
              <p className="mt-1.5 leading-relaxed text-stone-700">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* sources + author */}
      {g.sources.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xs font-bold uppercase tracking-wide text-stone-400">Sources</h2>
          <ul className="mt-2 space-y-1 text-sm">
            {g.sources.map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noopener noreferrer nofollow" className="text-brand-600 hover:underline">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-8 rounded-2xl border border-stone-200/70 bg-white p-5">
        <p className="text-sm font-semibold text-stone-900">{AUTHOR.name}</p>
        <p className="mt-1 text-sm text-stone-600">{AUTHOR.bio}</p>
      </section>

      {/* related */}
      <section className="mt-12">
        <h2 className="font-display text-lg font-semibold tracking-tight text-stone-900">Keep reading</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {related.map((r) => (
            <Link
              key={r.slug}
              href={`/guides/${r.slug}`}
              className="rounded-xl border border-stone-200/70 bg-white p-4 transition hover:-translate-y-0.5 hover:border-brand-200"
            >
              <span className="text-[11px] font-semibold uppercase tracking-wide text-brand-600">{r.category}</span>
              <p className="mt-1 text-sm font-semibold leading-snug text-stone-900">{r.title}</p>
            </Link>
          ))}
        </div>
      </section>

      <p className="mt-10 text-xs italic text-stone-400">
        FirstWeek produces a simulation-based readiness estimate for self-assessment. It does not guarantee
        employment outcomes.
      </p>
    </article>
  );
}
