"use client";

import { useEffect, useState } from "react";

const TONE_COLOR: Record<string, string> = {
  emerald: "#059669",
  brand: "#c8472a",
  amber: "#d97706",
  rose: "#e11d48",
};

/** Animated circular score gauge. */
export function ScoreGauge({ score, tone, size = 150 }: { score: number; tone: string; size?: number }) {
  const clamped = Math.max(0, Math.min(100, score));
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setShown(clamped), 80);
    return () => clearTimeout(t);
  }, [clamped]);

  const stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - shown / 100);
  const color = TONE_COLOR[tone] || TONE_COLOR.brand;

  return (
    <div className="relative flex-none" style={{ width: size, height: size }}>
      <svg className="-rotate-90" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e7e5e4" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(0.22,1,0.36,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-extrabold leading-none" style={{ color }}>
          {score}
        </span>
        <span className="mt-1 text-xs text-stone-400">/ 100</span>
      </div>
    </div>
  );
}

/** Multi-step progress shown during the AI waits — turns dead time into anticipation. */
export function LoadingProgress({ steps, note }: { steps: string[]; note?: string }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (i >= steps.length - 1) return;
    const t = setTimeout(() => setI((p) => Math.min(p + 1, steps.length - 1)), 2600);
    return () => clearTimeout(t);
  }, [i, steps.length]);

  return (
    <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm">
      <ul className="space-y-3">
        {steps.map((s, idx) => {
          const done = idx < i;
          const active = idx === i;
          return (
            <li key={idx} className="flex items-center gap-3 text-sm">
              {done ? (
                <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-brand-600 text-[11px] font-bold text-white">
                  ✓
                </span>
              ) : active ? (
                <span className="h-5 w-5 flex-none animate-spin rounded-full border-2 border-stone-200 border-t-brand-600" />
              ) : (
                <span className="h-5 w-5 flex-none rounded-full border-2 border-stone-200" />
              )}
              <span className={done || active ? "font-medium text-stone-800" : "text-stone-400"}>{s}</span>
            </li>
          );
        })}
      </ul>
      {note && <p className="mt-4 text-xs text-stone-400">{note}</p>}
    </div>
  );
}
