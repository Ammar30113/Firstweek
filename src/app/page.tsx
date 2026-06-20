import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, Chip, Button } from "@/components/ui";

export const dynamic = "force-dynamic";

const STEPS = [
  { n: "1", t: "Paste the job + your resume", d: "Any posting, any background. No account friction — paste and go." },
  { n: "2", t: "AI maps the role and you", d: "It extracts what the job really involves and where your experience fits." },
  { n: "3", t: "Do realistic work tasks", d: "3 tasks you'd actually face in the role — not trivia, real work." },
  { n: "4", t: "Get a readiness report", d: "An honest, evidence-based score with strengths, gaps, and a prep plan." },
];

export default async function Landing() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const startHref = user ? "/assessment" : "/login";

  return (
    <div>
      {/* Hero */}
      <section className="mx-auto grid max-w-5xl items-center gap-10 px-5 pt-14 pb-10 md:grid-cols-2 md:pt-20">
        <div>
          <Chip tone="brand">Simulate the job before you apply</Chip>
          <h1 className="mt-4 text-4xl font-extrabold leading-[1.1] tracking-tight text-stone-900 sm:text-5xl">
            Stop guessing if you&apos;re qualified.
          </h1>
          <p className="mt-4 text-lg text-stone-600">
            Paste a job posting, do the real work the role involves, and get an honest readiness
            report — so you walk into the interview knowing you can do it.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Button href={startHref} className="px-6 py-3 text-base">
              Start free
            </Button>
            <Button href="/story" variant="ghost" className="px-6 py-3 text-base">
              See the story
            </Button>
          </div>
          <p className="mt-3 text-xs text-stone-400">
            No degree required. Free to try. Built for people with ability, not just credentials.
          </p>
        </div>

        {/* Live sample report */}
        <Card className="relative">
          <div className="absolute -top-3 left-5">
            <Chip tone="brand">Sample report</Chip>
          </div>
          <div className="mt-2 flex items-center gap-5">
            <div className="flex h-24 w-24 flex-none flex-col items-center justify-center rounded-full border-4 border-emerald-500 text-emerald-600">
              <span className="text-3xl font-extrabold">78</span>
              <span className="text-[10px] text-stone-400">/ 100</span>
            </div>
            <div>
              <Chip tone="emerald">Strong Fit</Chip>
              <p className="mt-2 text-sm text-stone-600">
                You appear ready for this role. Lead with operational reasoning; prepare around SQL
                and SaaS metrics.
              </p>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {[
              ["Diagnose onboarding delay", 84],
              ["Prioritize at-risk accounts", 79],
              ["Recommend a workflow fix", 71],
            ].map(([label, score]) => (
              <div key={label as string}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-stone-700">{label}</span>
                  <span className="font-semibold">{score}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-stone-100">
                  <div className="h-full rounded-full bg-brand-500" style={{ width: `${score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-5xl px-5 py-12">
        <h2 className="text-center text-2xl font-bold tracking-tight">How it works</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <Card key={s.n}>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 font-bold text-brand-700">
                {s.n}
              </div>
              <h3 className="mt-3 font-bold text-stone-900">{s.t}</h3>
              <p className="mt-1 text-sm text-stone-600">{s.d}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Differentiator */}
      <section className="mx-auto max-w-5xl px-5 py-8">
        <Card className="bg-gradient-to-br from-brand-50 to-stone-50">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h2 className="text-xl font-bold">This isn&apos;t a resume tool.</h2>
              <p className="mt-2 text-sm text-stone-600">
                Resume optimizers ask &quot;how can I describe myself better?&quot; FirstWeek answers
                the deeper question: <span className="font-semibold text-stone-900">can I actually do the work?</span>
              </p>
            </div>
            <ul className="space-y-2 text-sm">
              <li className="flex gap-2"><span className="text-brand-600">✓</span> Evaluate work, not keywords</li>
              <li className="flex gap-2"><span className="text-brand-600">✓</span> Practical simulation, not a personality test</li>
              <li className="flex gap-2"><span className="text-brand-600">✓</span> Demonstrated capability, not self-reported skills</li>
            </ul>
          </div>
        </Card>
      </section>

      {/* Story strip */}
      <section className="mx-auto max-w-5xl px-5 py-12">
        <div className="rounded-2xl border border-stone-200/80 bg-white p-8 text-center shadow-sm">
          <p className="mx-auto max-w-2xl text-lg font-medium text-stone-800">
            &quot;If you&apos;ve ever second-guessed yourself in front of a job you know you can do —
            this was built for you.&quot;
          </p>
          <Link href="/story" className="mt-3 inline-block text-sm font-semibold text-brand-600 hover:underline">
            Read why I built FirstWeek →
          </Link>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-5xl px-5 pb-16">
        <div className="rounded-2xl bg-stone-900 px-8 py-12 text-center">
          <h2 className="text-2xl font-bold text-white">You can do the job. Let&apos;s prove it.</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-stone-300">
            Run your first simulation free and find out where you really stand.
          </p>
          <Button href={startHref} className="mt-6 px-6 py-3 text-base">
            Start free
          </Button>
        </div>
      </section>

      <footer className="mx-auto max-w-5xl px-5 pb-10 text-center text-xs text-stone-400">
        FirstWeek produces a simulation-based readiness estimate for self-assessment. It does not
        guarantee employment outcomes.
      </footer>
    </div>
  );
}
