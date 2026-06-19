import type { ReactNode } from "react";

// Pure presentational primitives — safe in both server and client components.

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={"rounded-xl border border-slate-200 bg-white p-5 shadow-sm " + className}>
      {children}
    </div>
  );
}

const TONES: Record<string, string> = {
  slate: "bg-slate-100 text-slate-700",
  blue: "bg-blue-100 text-blue-700",
  rose: "bg-rose-100 text-rose-700",
  amber: "bg-amber-100 text-amber-700",
  emerald: "bg-emerald-100 text-emerald-700",
};

export function Chip({ children, tone = "slate" }: { children: ReactNode; tone?: string }) {
  return (
    <span
      className={
        "inline-block rounded-full px-2.5 py-0.5 text-xs font-medium " + (TONES[tone] || TONES.slate)
      }
    >
      {children}
    </span>
  );
}

export function H({ children }: { children: ReactNode }) {
  return (
    <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">{children}</h3>
  );
}

export function impTone(importance: string) {
  if (importance === "critical") return "rose";
  if (importance === "important") return "amber";
  return "slate";
}

export function bandTone(band: string) {
  if (band === "Excellent Fit" || band === "Strong Fit") return "emerald";
  if (band === "Viable Fit") return "blue";
  if (band === "Stretch Role") return "amber";
  return "rose";
}
