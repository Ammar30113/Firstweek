import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { HeroDemo, RotatingWord, Reveal, RoleMarquee, CountUp, GlowCTA } from "@/components/landing";

export const dynamic = "force-dynamic";

const STEPS = [
  { n: "01", t: "Paste the job + your resume", d: "Any posting, any background. Or import the posting straight from its URL." },
  { n: "02", t: "AI maps the role and you", d: "It pulls out what the job actually involves and where your experience really fits." },
  { n: "03", t: "Do three real tasks", d: "Not trivia — the actual work you'd face in week one of the role." },
  { n: "04", t: "Get your readiness report", d: "An honest, evidence-based score with your strengths, gaps, and a prep plan." },
];

const ROLES = [
  "Customer Success", "Product Manager", "Data Analyst", "Marketing Lead", "Sales Rep",
  "Operations", "Recruiter", "Project Manager", "Account Executive", "Support Lead",
];

export default async function Landing() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const startHref = user ? "/assessment" : "/login";

  return (
    <div className="bg-cream-50">
      {/* ============================================ CINEMATIC HERO */}
      <section className="grain relative overflow-hidden bg-ink-950">
        {/* atmosphere */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="aurora drift-slow left-[-8%] top-[-12%] h-[42rem] w-[42rem] bg-brand-600/30" />
          <div className="aurora drift-slower right-[-10%] top-[10%] h-[34rem] w-[34rem] bg-ember-500/20" />
          <div className="aurora drift-slow bottom-[-20%] left-[30%] h-[30rem] w-[30rem] bg-brand-800/30" />
          <div className="aurora drift-slower right-[16%] bottom-[-22%] h-[26rem] w-[26rem] bg-cove-600/20" />
          <div className="absolute inset-0 grid-warm" />
        </div>

        <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 px-5 pb-16 pt-16 md:grid-cols-[1.05fr_1fr] md:pb-24 md:pt-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-ember-300">
              <span className="h-1.5 w-1.5 rounded-full bg-ember-400" />
              Simulate the job before you apply
            </span>

            <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.05] tracking-[-0.02em] text-white sm:text-5xl md:text-6xl">
              Do the <span className="text-gradient">real work</span> before you get the job.
            </h1>

            <p className="mt-4 text-xl text-stone-300 sm:text-2xl">
              Try it for <RotatingWord words={["a PM role", "a sales job", "an ops role", "a data role", "your first job"]} />
            </p>

            <p className="mt-5 max-w-md text-base leading-relaxed text-stone-400">
              Paste any posting, do three realistic tasks from the role, and get an honest readiness
              report — strengths, gaps, and whether you can actually do it.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <GlowCTA href={startHref}>Start free</GlowCTA>
              <Link
                href="/story"
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-6 py-3 text-base font-medium text-stone-200 transition hover:bg-white/5"
              >
                See the story
              </Link>
            </div>
            <p className="mt-4 text-xs text-stone-500">
              No account to look around · Free to run · Built for ability, not credentials.
            </p>
          </div>

          <HeroDemo />
        </div>

        {/* role marquee + framing line */}
        <div className="relative z-10 mx-auto max-w-6xl px-5 pb-14">
          <p className="mb-4 text-center text-xs uppercase tracking-[0.2em] text-stone-500">
            Works for any role you can paste
          </p>
          <RoleMarquee roles={ROLES} />
        </div>
      </section>

      {/* ============================================ WEDGE */}
      <section className="relative mx-auto max-w-5xl px-5 py-20 text-center sm:py-28">
        <Reveal>
          <p className="font-display text-2xl leading-snug tracking-tight text-stone-900 sm:text-4xl">
            Everyone else preps you to <span className="text-stone-400">talk about</span> the job.
            <br className="hidden sm:block" /> FirstWeek lets you <span className="text-gradient">do it.</span>
          </p>
        </Reveal>
      </section>

      {/* ============================================ HOW IT WORKS */}
      <section className="mx-auto max-w-6xl px-5 pb-8">
        <Reveal className="mb-12 text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">How it works</span>
          <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
            Four steps from posting to verdict
          </h2>
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 90}>
              <div className="group h-full rounded-2xl border border-stone-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(40,30,20,0.04)] transition hover:-translate-y-1 hover:border-brand-200 hover:shadow-[0_18px_40px_-22px_rgba(200,71,42,0.45)]">
                <span className="font-display text-3xl font-semibold text-brand-200 transition group-hover:text-brand-400">
                  {s.n}
                </span>
                <h3 className="mt-3 font-bold text-stone-900">{s.t}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-stone-600">{s.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============================================ BENTO */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="grid gap-4 md:grid-cols-3 md:auto-rows-[minmax(0,1fr)]">
          {/* anchor cell */}
          <Reveal className="md:col-span-2 md:row-span-2">
            <div className="grain relative h-full overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 to-brand-800 p-8 text-white">
              <div className="relative">
                <h3 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">This isn&apos;t a resume tool.</h3>
                <p className="mt-3 max-w-md text-brand-50/90">
                  Resume optimizers ask <span className="italic">&quot;how do I describe myself better?&quot;</span> FirstWeek
                  answers the question that actually gets you hired:
                  <span className="font-semibold text-white"> can I do the work?</span>
                </p>
                <ul className="mt-6 space-y-2.5 text-sm">
                  {[
                    "Scored on the work, not keywords",
                    "Real tasks from the actual posting",
                    "Demonstrated capability, not self-reported skills",
                  ].map((t) => (
                    <li key={t} className="flex items-center gap-2.5">
                      <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-white/20 text-xs">✓</span>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="flex h-full flex-col justify-between rounded-3xl border border-stone-200/80 bg-white p-6">
              <span className="text-sm font-medium text-stone-500">Every run scores you on</span>
              <div className="font-display text-5xl font-semibold tracking-tight text-stone-900">
                <CountUp to={100} />
                <span className="text-brand-500">pt</span>
              </div>
              <span className="text-sm text-stone-500">readiness scale — with the why behind it.</span>
            </div>
          </Reveal>

          <Reveal delay={160}>
            <div className="flex h-full flex-col justify-center gap-2 rounded-3xl border border-cove-700 bg-cove-700 p-6 text-white">
              <span className="font-display text-xl font-semibold">Strengths + gaps</span>
              <p className="text-sm text-white/75">
                See exactly where you&apos;re strong, where you&apos;ll struggle, and how to prep — with evidence
                from your own work.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============================================ STORY */}
      <section className="mx-auto max-w-4xl px-5 py-16">
        <Reveal>
          <figure className="rounded-3xl border border-stone-200/80 bg-white p-10 text-center shadow-[0_2px_10px_rgba(40,30,20,0.05)]">
            <blockquote className="mx-auto max-w-2xl font-display text-xl font-medium leading-relaxed text-stone-800 sm:text-2xl">
              &ldquo;If you&apos;ve ever second-guessed yourself in front of a job you know you can do —
              this was built for you.&rdquo;
            </blockquote>
            <Link
              href="/story"
              className="mt-5 inline-block text-sm font-semibold text-brand-600 hover:underline"
            >
              Read why I built FirstWeek →
            </Link>
          </figure>
        </Reveal>
      </section>

      {/* ============================================ FINAL CTA (dark bookend) */}
      <section className="grain relative overflow-hidden bg-ink-950">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="aurora drift-slow left-[20%] top-[-30%] h-[28rem] w-[28rem] bg-brand-600/30" />
          <div className="aurora drift-slower right-[10%] bottom-[-40%] h-[26rem] w-[26rem] bg-ember-500/20" />
          <div className="aurora drift-slow left-[58%] top-[6%] h-[20rem] w-[20rem] bg-cove-600/15" />
        </div>
        <div className="relative z-10 mx-auto max-w-3xl px-5 py-20 text-center sm:py-24">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            You can do the job.
            <br /> <span className="text-gradient">Let&apos;s prove it.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-md text-stone-400">
            Run your first simulation free and find out exactly where you stand.
          </p>
          <div className="mt-8 flex justify-center">
            <GlowCTA href={startHref}>Start free</GlowCTA>
          </div>
        </div>
      </section>

    </div>
  );
}
