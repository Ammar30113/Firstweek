import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, Chip, PageHeader, bandTone } from "@/components/ui";
import { scoreTone } from "@/components/drill";

export const dynamic = "force-dynamic";

// Outcome display metadata + ranking (most advanced positive stage wins).
const STAGE_META: Record<string, { label: string; tone: string; rank: number }> = {
  applied: { label: "Applied", tone: "cove", rank: 1 },
  interview: { label: "Interview", tone: "amber", rank: 2 },
  offer: { label: "Offer", tone: "emerald", rank: 3 },
  hired: { label: "Hired 🎉", tone: "emerald", rank: 4 },
  rejected: { label: "Closed", tone: "stone", rank: 0 },
  no_response: { label: "No response", tone: "stone", rank: 0 },
};

type DrillRow = { competency: string; score: number | null; created_at: string };

// Collapse a competency's drills into a climb: first attempt → latest, best.
function buildClimb(drills: DrillRow[]) {
  const byComp = new Map<string, DrillRow[]>();
  for (const d of drills) {
    if (d.score == null) continue;
    const arr = byComp.get(d.competency) ?? [];
    arr.push(d);
    byComp.set(d.competency, arr);
  }
  return [...byComp.entries()]
    .map(([competency, rows]) => {
      const sorted = rows.sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at));
      const first = sorted[0].score!;
      const latest = sorted[sorted.length - 1].score!;
      const best = Math.max(...sorted.map((r) => r.score!));
      const lastAt = +new Date(sorted[sorted.length - 1].created_at);
      return { competency, attempts: sorted.length, first, latest, best, delta: latest - first, lastAt };
    })
    .sort((a, b) => b.lastAt - a.lastAt); // most recently practiced first
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const [{ data: assessments, error }, { data: drills }, { data: outcomes }] = await Promise.all([
    supabase
      .from("assessments")
      .select("id, job_title, status, overall_score, readiness_band, created_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("drills")
      .select("competency, score, created_at")
      .eq("status", "completed")
      .order("created_at", { ascending: false }),
    supabase
      .from("outcomes")
      .select("assessment_id, stage, created_at")
      .order("created_at", { ascending: false }),
  ]);

  const rows = assessments ?? [];
  const climb = buildClimb(drills ?? []);

  // Most advanced outcome stage per assessment.
  const outcomeByAssessment = new Map<string, string>();
  for (const o of outcomes ?? []) {
    const cur = outcomeByAssessment.get(o.assessment_id);
    if (!cur || (STAGE_META[o.stage]?.rank ?? 0) > (STAGE_META[cur]?.rank ?? 0)) {
      outcomeByAssessment.set(o.assessment_id, o.stage);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-10">
      <PageHeader
        eyebrow="Your work"
        title="Your assessments"
        subtitle={rows.length ? `${rows.length} run${rows.length === 1 ? "" : "s"} so far` : undefined}
        action={
          <Link
            href="/assessment"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_-10px_rgba(200,71,42,0.7)] transition hover:bg-brand-500"
          >
            New assessment <span aria-hidden>→</span>
          </Link>
        }
      />

      {/* The climb — proof the practice is working. */}
      {climb.length > 0 && (
        <Card className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-stone-900">Your climb</h2>
            <Chip tone="brand">{climb.reduce((s, c) => s + c.attempts, 0)} drills</Chip>
          </div>
          <div className="space-y-3">
            {climb.map((c) => (
              <div key={c.competency}>
                <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                  <span className="truncate font-medium text-stone-800">{c.competency}</span>
                  <span className="flex shrink-0 items-center gap-2 text-stone-500">
                    {c.attempts > 1 && (
                      <span className="tabular-nums">
                        {c.first} <span className="text-stone-300">→</span>{" "}
                        <span className="font-semibold text-stone-900">{c.latest}</span>
                      </span>
                    )}
                    {c.attempts === 1 && <span className="tabular-nums font-semibold text-stone-900">{c.latest}</span>}
                    {c.delta > 0 && <Chip tone="emerald">+{c.delta}</Chip>}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-stone-100">
                  <div
                    className={
                      "h-full rounded-full transition-[width] duration-1000 " +
                      (c.best >= 80 ? "bg-emerald-500" : c.best >= 60 ? "bg-brand-500" : c.best >= 40 ? "bg-amber-500" : "bg-rose-400")
                    }
                    style={{ width: `${Math.max(c.latest, 6)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-stone-400">
            Practice a gap from any report to add reps. Every drill is one step closer to ready.
          </p>
        </Card>
      )}

      {error ? (
        <Card className="flex flex-col items-center gap-3 py-14 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-100 text-2xl">⚠️</span>
          <p className="font-display text-lg font-semibold text-stone-900">Couldn’t load your assessments</p>
          <p className="max-w-xs text-sm text-stone-500">
            Something went wrong on our end — your work is safe. Refresh the page to try again.
          </p>
        </Card>
      ) : rows.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 py-14 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-cove-100 text-2xl text-cove-600">◎</span>
          <p className="font-display text-lg font-semibold text-stone-900">No assessments yet</p>
          <p className="max-w-xs text-sm text-stone-500">
            Run your first simulation to see where you really stand on a role.
          </p>
          <Link
            href="/assessment"
            className="mt-1 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-500"
          >
            Start your first one →
          </Link>
        </Card>
      ) : (
        <div className="space-y-3">
          {rows.map((a) => {
            const done = a.status === "completed";
            const outcome = outcomeByAssessment.get(a.id);
            const om = outcome ? STAGE_META[outcome] : null;
            const card = (
              <Card className={done ? "transition hover:-translate-y-0.5 hover:border-brand-200" : ""}>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-stone-900">{a.job_title || "Untitled role"}</p>
                    <p className="text-xs text-stone-400">
                      {new Date(a.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {om && <Chip tone={om.tone}>{om.label}</Chip>}
                    {done ? (
                      <>
                        <span className="font-display text-3xl font-semibold tabular-nums text-stone-900">
                          {a.overall_score}
                        </span>
                        <Chip tone={bandTone(a.readiness_band || "")}>{a.readiness_band}</Chip>
                      </>
                    ) : (
                      <Chip tone="amber">{a.status}</Chip>
                    )}
                  </div>
                </div>
              </Card>
            );
            return done ? (
              <Link key={a.id} href={`/assessment/${a.id}`} className="block">
                {card}
              </Link>
            ) : (
              <div key={a.id}>{card}</div>
            );
          })}
        </div>
      )}
    </div>
  );
}
