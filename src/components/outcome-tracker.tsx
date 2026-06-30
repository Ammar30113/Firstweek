"use client";

import { useState } from "react";
import { Card, H, Chip } from "@/components/ui";

// The positive funnel, in order. rejected/no_response are logged separately as
// honest end-states, not "progress".
const LADDER = [
  { stage: "applied", label: "Applied", icon: "📨" },
  { stage: "interview", label: "Interview", icon: "🗣️" },
  { stage: "offer", label: "Offer", icon: "🎯" },
  { stage: "hired", label: "Hired", icon: "🎉" },
] as const;

const RANK: Record<string, number> = { applied: 1, interview: 2, offer: 3, hired: 4 };

/**
 * Dead-simple outcome tracker: "did prepping actually work?" One tap logs an
 * event. This is the data behind testimonials, B2B proof, and founder metrics.
 */
export function OutcomeTracker({
  assessmentId,
  initialStage,
}: {
  assessmentId: string;
  initialStage?: string | null;
}) {
  const [current, setCurrent] = useState<string | null>(initialStage ?? null);
  const [saving, setSaving] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const currentRank = current ? RANK[current] ?? 0 : 0;

  async function log(stage: string) {
    setSaving(stage);
    setErr(null);
    const prev = current;
    setCurrent(stage); // optimistic
    try {
      const res = await fetch("/api/outcome", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessmentId, stage }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErr(data?.error || "Couldn't save — try again.");
        setCurrent(prev);
      }
    } catch {
      setErr("Network error — try again.");
      setCurrent(prev);
    } finally {
      setSaving(null);
    }
  }

  const negative = current === "rejected" || current === "no_response";

  return (
    <Card className="no-print">
      <div className="flex items-center justify-between">
        <H>How did it go?</H>
        {current && !negative && <Chip tone="emerald">Tracking</Chip>}
      </div>
      <p className="-mt-1 mb-3 text-sm text-stone-500">
        Tell us how this role played out. It keeps your progress honest — and helps us prove this
        actually works.
      </p>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {LADDER.map((s) => {
          const reached = currentRank >= RANK[s.stage];
          return (
            <button
              key={s.stage}
              onClick={() => log(s.stage)}
              disabled={!!saving}
              className={
                "flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-center text-sm font-semibold transition disabled:opacity-60 " +
                (reached
                  ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                  : "border-stone-200 text-stone-600 hover:border-brand-300 hover:bg-brand-50/40")
              }
            >
              <span className="text-xl" aria-hidden>
                {s.icon}
              </span>
              {saving === s.stage ? "Saving…" : s.label}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-stone-400">Didn&apos;t go your way?</span>
        <button
          onClick={() => log("no_response")}
          disabled={!!saving}
          className={
            "rounded-full px-2.5 py-1 font-medium transition " +
            (current === "no_response" ? "bg-stone-200 text-stone-700" : "text-stone-500 hover:bg-stone-100")
          }
        >
          No response
        </button>
        <button
          onClick={() => log("rejected")}
          disabled={!!saving}
          className={
            "rounded-full px-2.5 py-1 font-medium transition " +
            (current === "rejected" ? "bg-stone-200 text-stone-700" : "text-stone-500 hover:bg-stone-100")
          }
        >
          Not this time
        </button>
      </div>
      {err && <p className="mt-2 text-xs text-rose-600">{err}</p>}
      {current === "hired" && (
        <p className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800">
          🎉 Congratulations — you did the work and it paid off. That&apos;s the whole point.
        </p>
      )}
    </Card>
  );
}
