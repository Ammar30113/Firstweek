import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, Chip, PageHeader, bandTone } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: assessments } = await supabase
    .from("assessments")
    .select("id, job_title, status, overall_score, readiness_band, created_at")
    .order("created_at", { ascending: false });

  const rows = assessments ?? [];

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

      {rows.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 py-14 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-2xl">◎</span>
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
