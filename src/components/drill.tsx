"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Drill, DrillEvaluation } from "@/lib/schemas";
import { Card, Chip, H, Button } from "@/components/ui";

export function scoreTone(score: number) {
  if (score >= 80) return "emerald";
  if (score >= 60) return "brand";
  if (score >= 40) return "amber";
  return "rose";
}

/**
 * "Practice this →" — generates a focused drill for one competency, then routes
 * to the drill page. Handles the Pro upsell (402) inline.
 */
export function PracticeButton({
  competency,
  roleContext,
  gapDetail,
  assessmentId,
  source = "skill_gap",
  label = "Practice this →",
  variant = "ghost",
  className = "",
}: {
  competency: string;
  roleContext?: string;
  gapDetail?: string;
  assessmentId?: string;
  source?: "skill_gap" | "weak_competency" | "custom";
  label?: string;
  variant?: "primary" | "ghost";
  className?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [upgrade, setUpgrade] = useState(false);

  async function start() {
    setLoading(true);
    setErr(null);
    setUpgrade(false);
    try {
      const res = await fetch("/api/drill/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ competency, roleContext, gapDetail, assessmentId, source }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data?.upgrade) setUpgrade(true);
        setErr(data?.error || "Couldn't start the drill.");
        return;
      }
      router.push(`/drill/${data.drillId}`);
    } catch {
      setErr("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={className}>
      <Button variant={variant} onClick={start} disabled={loading}>
        {loading ? "Building your drill…" : label}
      </Button>
      {err && (
        <p className="mt-1.5 text-xs text-rose-600">
          {err}{" "}
          {upgrade && (
            <Link href="/pricing" className="font-semibold underline">
              See Pro plans
            </Link>
          )}
        </p>
      )}
    </div>
  );
}

/** Interactive drill: read the scenario, respond, get focused coaching back. */
export function DoDrill({ drillId, drill }: { drillId: string; drill: Drill }) {
  const [response, setResponse] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [result, setResult] = useState<{ evaluation: DrillEvaluation; score: number } | null>(null);

  async function submit() {
    if (response.trim().length < 10) {
      setErr("Write a bit more so we can give you real feedback.");
      return;
    }
    setSubmitting(true);
    setErr(null);
    try {
      const res = await fetch("/api/drill/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ drillId, response }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data?.error || "Couldn't score your drill.");
        return;
      }
      setResult({ evaluation: data.evaluation, score: data.score });
    } catch {
      setErr("Network error — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return <DrillResult drill={drill} evaluation={result.evaluation} score={result.score} fresh />;
  }

  return (
    <div className="space-y-5">
      <DrillPrompt drill={drill} />
      <Card>
        <H>Your response</H>
        <textarea
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          placeholder="Work the scenario here — like you would on the job."
          className="min-h-[200px] w-full resize-y rounded-xl border border-stone-300 bg-white p-3 text-sm text-stone-800 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
        />
        <div className="mt-3 flex items-center justify-between gap-3">
          <span className="text-xs text-stone-400">{response.trim().length} characters</span>
          <Button onClick={submit} disabled={submitting}>
            {submitting ? "Scoring…" : "Submit for feedback"}
          </Button>
        </div>
        {err && <p className="mt-2 text-xs text-rose-600">{err}</p>}
      </Card>
    </div>
  );
}

export function DrillPrompt({ drill }: { drill: Drill }) {
  return (
    <Card className="bg-gradient-to-br from-brand-50 via-cream-50 to-cream-100">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <Chip tone="brand">Drill</Chip>
        <Chip tone="cove">{drill.focus_competency}</Chip>
        <Chip tone="stone">~{drill.time_estimate_minutes} min</Chip>
      </div>
      <p className="text-sm leading-relaxed text-stone-800">{drill.scenario}</p>
      <div className="mt-3 rounded-xl bg-white/70 p-3">
        <p className="text-sm font-semibold text-stone-900">Your task</p>
        <p className="mt-1 text-sm text-stone-700">{drill.instructions}</p>
      </div>
      {drill.what_good_looks_like.length > 0 && (
        <details className="mt-3 text-sm text-stone-600">
          <summary className="cursor-pointer font-medium text-stone-700">What good looks like</summary>
          <ul className="mt-2 space-y-1">
            {drill.what_good_looks_like.map((m, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-brand-500">•</span>
                <span>{m}</span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </Card>
  );
}

/** Focused coaching feedback + score for a completed drill. */
export function DrillResult({
  drill,
  evaluation,
  score,
  competency,
  roleContext,
  assessmentId,
  fresh = false,
}: {
  drill: Drill;
  evaluation: DrillEvaluation;
  score: number;
  competency?: string;
  roleContext?: string;
  assessmentId?: string;
  fresh?: boolean;
}) {
  const focus = competency || drill.focus_competency;
  return (
    <div className="space-y-5">
      <Card className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
        <div
          className={
            "grid h-20 w-20 shrink-0 place-items-center rounded-2xl text-3xl font-bold tabular-nums " +
            "bg-stone-50 " +
            (score >= 80
              ? "text-emerald-600"
              : score >= 60
                ? "text-brand-600"
                : score >= 40
                  ? "text-amber-600"
                  : "text-rose-600")
          }
        >
          {score}
        </div>
        <div className="flex-1">
          <div className="mb-1.5 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <Chip tone="cove">{focus}</Chip>
            <Chip tone={scoreTone(score)}>{score}/100</Chip>
          </div>
          <p className="font-display text-lg font-medium text-stone-900">{evaluation.verdict}</p>
          <p className="mt-1 text-sm text-stone-600">{evaluation.feedback}</p>
        </div>
      </Card>

      <div className="grid gap-5 md:grid-cols-2">
        {evaluation.strengths.length > 0 && (
          <Card>
            <H>What you did well</H>
            <ul className="space-y-2 text-sm text-stone-700">
              {evaluation.strengths.map((s, i) => (
                <li key={i} className="border-l-2 border-emerald-300 pl-3">
                  {s}
                </li>
              ))}
            </ul>
          </Card>
        )}
        {evaluation.misses.length > 0 && (
          <Card>
            <H>What was missing</H>
            <ul className="space-y-2 text-sm text-stone-700">
              {evaluation.misses.map((s, i) => (
                <li key={i} className="border-l-2 border-amber-300 pl-3">
                  {s}
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>

      {evaluation.what_stronger_answer_includes.length > 0 && (
        <Card className="border-brand-200 bg-brand-50/40">
          <H>To level up next time</H>
          <ul className="space-y-2 text-sm text-stone-700">
            {evaluation.what_stronger_answer_includes.map((s, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-brand-500">→</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div className="no-print flex flex-wrap items-center gap-3">
        <PracticeButton
          competency={focus}
          roleContext={roleContext}
          assessmentId={assessmentId}
          source="custom"
          label="↻ Practice this again"
          variant="primary"
        />
        <Button variant="ghost" href="/dashboard">
          See your progress
        </Button>
      </div>
      {fresh && (
        <p className="text-center text-xs text-stone-400">
          Saved to your progress — keep drilling to watch this score climb.
        </p>
      )}
    </div>
  );
}
