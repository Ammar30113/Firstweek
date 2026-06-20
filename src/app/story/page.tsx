import Link from "next/link";

export const metadata = {
  title: "Why FirstWeek exists",
  description: "The story behind FirstWeek — a confidence tool for capable people without the 'right' paper.",
};

const PANELS = [
  {
    n: "01",
    title: "The layoff",
    body: "FirstWeek started the week I got laid off. One day I had a role and a routine; the next I was staring at job boards trying to work out what I was even “allowed” to apply for.",
  },
  {
    n: "02",
    title: "What I didn't have",
    body: "I never had the strongest formal education. What I had was curiosity and real experience — years of actually doing the work, untangling the messy problems, keeping things running.",
  },
  {
    n: "03",
    title: "The second-guess",
    body: "And still, every time I found a job I knew I could do, I’d stop. “No degree for this. Not qualified on paper.” I talked myself out of roles I was genuinely capable of — especially the mid-level and senior ones.",
  },
  {
    n: "04",
    title: "The realization",
    body: "Then it clicked: I’m not the only one. So many capable people are frozen in the same place — able to do the job, held back by a credential and a quiet voice asking, “who are you to apply?”",
  },
  {
    n: "05",
    title: "The fix",
    body: "A resume can’t prove you can do the work. Doing the work can. So FirstWeek turns any job posting into the real tasks you’d face in that role — you try them, get honest feedback, and find out, before you apply, that you can actually do this.",
  },
  {
    n: "06",
    title: "The mission",
    body: "I’ve walked into interviews I wasn’t “qualified” for on paper and done well — because I could do the work. FirstWeek is the tool I wish I’d had the day I got laid off. If you’ve ever second-guessed yourself in front of a job you know you can do, this is for you.",
  },
];

export default function StoryPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <header className="mb-12">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-600">
          Why FirstWeek exists
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          You can do the job. The hard part is believing it.
        </h1>
        <p className="mt-3 text-lg text-slate-600">
          FirstWeek was built by someone who second-guessed himself out of roles he could do.
          Here&apos;s the story.
        </p>
      </header>

      <ol className="relative space-y-8 border-l-2 border-slate-200 pl-8">
        {PANELS.map((p) => (
          <li key={p.n} className="relative">
            <span className="absolute -left-[2.6rem] flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
              {p.n}
            </span>
            <h2 className="text-lg font-bold text-slate-900">{p.title}</h2>
            <p className="mt-1 text-slate-700">{p.body}</p>
          </li>
        ))}
      </ol>

      <p className="mt-10 text-right text-sm font-medium text-slate-500">— Ammar</p>

      <div className="mt-12 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h3 className="text-xl font-bold text-slate-900">You can do the job. Let&apos;s prove it.</h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
          Paste a job posting, do the real work it would involve, and walk into the interview
          knowing you&apos;ve already done it.
        </p>
        <Link
          href="/"
          className="mt-5 inline-block rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Start your simulation
        </Link>
      </div>

      <footer className="mt-10 border-t border-slate-200 pt-4 text-xs text-slate-400">
        FirstWeek produces a simulation-based readiness estimate for self-assessment. It does not
        guarantee employment outcomes.
      </footer>
    </div>
  );
}
