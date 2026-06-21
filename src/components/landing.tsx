"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";

/* --------------------------------------------------------- rotating word */

export function RotatingWord({ words }: { words: string[] }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((p) => (p + 1) % words.length), 2300);
    return () => clearInterval(id);
  }, [words.length]);
  return (
    <span className="relative inline-flex items-baseline">
      <span key={i} className="word-in text-gradient font-display italic">
        {words[i]}
      </span>
      <span className="caret ml-0.5 font-light text-ember-400">▌</span>
    </span>
  );
}

/* ----------------------------------------------------- scroll-in reveal */

export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const show = () => el.classList.add("in");
    // Bulletproof: if IO is unavailable, or this is already in/near the viewport
    // on mount, reveal right away — content must never get stuck invisible.
    if (typeof IntersectionObserver === "undefined" || el.getBoundingClientRect().top < window.innerHeight * 0.92) {
      show();
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          show();
          io.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

/* ------------------------------------------------- role marquee (logo-wall) */

export function RoleMarquee({ roles }: { roles: string[] }) {
  const row = [...roles, ...roles];
  return (
    <div className="marquee-mask overflow-hidden">
      <div className="marquee-track gap-3">
        {row.map((r, i) => (
          <span
            key={i}
            className="whitespace-nowrap rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-sm text-stone-300"
          >
            {r}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------- interactive hero demo */

type Scenario = { role: string; score: number; band: string; tasks: [string, number][] };

const SCENARIOS: Scenario[] = [
  {
    role: "CS Ops Analyst",
    score: 78,
    band: "Strong fit",
    tasks: [
      ["Diagnose the onboarding delay", 84],
      ["Prioritize at-risk accounts", 79],
      ["Recommend a workflow fix", 71],
    ],
  },
  {
    role: "Product Manager",
    score: 64,
    band: "Viable fit",
    tasks: [
      ["Write the one-page spec", 70],
      ["Cut scope under pressure", 61],
      ["Align three stakeholders", 60],
    ],
  },
  {
    role: "Marketing Lead",
    score: 83,
    band: "Strong fit",
    tasks: [
      ["Draft the launch plan", 88],
      ["Split the channel budget", 82],
      ["Pick the one metric", 78],
    ],
  },
  {
    role: "Data Analyst",
    score: 69,
    band: "Viable fit",
    tasks: [
      ["Model the churn cohort", 74],
      ["Find where the metric breaks", 67],
      ["Tell it in three charts", 66],
    ],
  },
];

const bandColor = (band: string) =>
  band === "Strong fit" ? "#34d399" : band === "Viable fit" ? "#e6a85a" : "#fb7185";

export function HeroDemo() {
  const [idx, setIdx] = useState(0);
  const [play, setPlay] = useState(false);
  const [score, setScore] = useState(0);
  const [barsOn, setBarsOn] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const s = SCENARIOS[idx];

  // start once the card scrolls into view (or immediately if already visible)
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined" || el.getBoundingClientRect().top < window.innerHeight) {
      setPlay(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setPlay(true);
          io.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // animate the score count-up + bar fill on play / scenario change.
  // Timer-based (not requestAnimationFrame) so it runs reliably everywhere.
  useEffect(() => {
    if (!play) return;
    const target = s.score;
    setScore(0);
    setBarsOn(false);
    const steps = 32;
    let k = 0;
    const id = setInterval(() => {
      k += 1;
      const eased = 1 - Math.pow(1 - k / steps, 3);
      setScore(Math.round(eased * target));
      if (k >= steps) clearInterval(id);
    }, 34);
    const barTimer = setTimeout(() => setBarsOn(true), 90);
    return () => {
      clearInterval(id);
      clearTimeout(barTimer);
    };
  }, [play, idx, s.score]);

  const R = 58;
  const C = 2 * Math.PI * R;
  const offset = C * (1 - score / 100);
  const color = bandColor(s.band);

  return (
    <div ref={wrapRef} className="floaty">
      <div className="glow-ember relative overflow-hidden rounded-3xl border border-white/10 bg-ink-900/70 p-5 backdrop-blur-xl sm:p-6">
        {/* header */}
        <div className="mb-4 flex items-center justify-between">
          <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-ember-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ember-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-ember-400" />
            </span>
            Live readiness
          </span>
          <span className="rounded-full bg-white/[0.06] px-2.5 py-0.5 text-xs text-stone-300">{s.role}</span>
        </div>

        {/* gauge + verdict */}
        <div className="flex items-center gap-5">
          <div className="relative flex-none">
            <svg width="132" height="132" viewBox="0 0 132 132" className="-rotate-90">
              <defs>
                <linearGradient id="heroGauge" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#f3c87a" />
                  <stop offset="55%" stopColor="#e67d57" />
                  <stop offset="100%" stopColor="#c8472a" />
                </linearGradient>
              </defs>
              <circle cx="66" cy="66" r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="9" />
              <circle
                cx="66"
                cy="66"
                r={R}
                fill="none"
                stroke="url(#heroGauge)"
                strokeWidth="9"
                strokeLinecap="round"
                strokeDasharray={C}
                strokeDashoffset={offset}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-3xl font-semibold text-white tabular-nums">{score}</span>
              <span className="text-[10px] text-stone-400">/ 100</span>
            </div>
          </div>
          <div>
            <span
              className="inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold"
              style={{ color, backgroundColor: `${color}22` }}
            >
              {s.band}
            </span>
            <p className="mt-2 text-sm leading-relaxed text-stone-300">
              Three real tasks from this posting, scored on the work — not your keywords.
            </p>
          </div>
        </div>

        {/* task bars */}
        <div className="mt-5 space-y-3">
          {s.tasks.map(([label, val], i) => (
            <div key={label}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-stone-300">{label}</span>
                <span className="font-semibold text-white tabular-nums">{barsOn ? val : 0}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.07]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-ember-400 to-brand-500"
                  style={{
                    width: barsOn ? `${val}%` : "0%",
                    transition: `width 900ms cubic-bezier(0.16,1,0.3,1) ${i * 120}ms`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* footer */}
        <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
          <button
            type="button"
            onClick={() => setIdx((p) => (p + 1) % SCENARIOS.length)}
            className="text-sm font-medium text-ember-400 transition hover:text-ember-300"
          >
            ↻ Try another role
          </button>
          <span className="text-xs text-stone-500">Sample — your real run takes ~2 min</span>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------- live count-up (stats) */

export function CountUp({ to, suffix = "", className = "" }: { to: number; suffix?: string; className?: string }) {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const run = () => {
      let k = 0;
      const steps = 34;
      const id = setInterval(() => {
        k += 1;
        setN(Math.round((1 - Math.pow(1 - k / steps, 3)) * to));
        if (k >= steps) clearInterval(id);
      }, 34);
    };
    if (typeof IntersectionObserver === "undefined" || el.getBoundingClientRect().top < window.innerHeight) {
      run();
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        run();
      },
      { threshold: 0.5 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [to]);
  return (
    <span ref={ref} className={className}>
      {n.toLocaleString()}
      {suffix}
    </span>
  );
}

/* -------------------------------------------------- primary CTA (dark) */

export function GlowCTA({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="group relative inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-base font-semibold text-white shadow-[0_10px_30px_-8px_rgba(221,93,53,0.7)] transition hover:bg-brand-500 hover:shadow-[0_14px_40px_-8px_rgba(221,93,53,0.85)]"
    >
      {children}
      <span className="transition-transform group-hover:translate-x-0.5">→</span>
    </Link>
  );
}
