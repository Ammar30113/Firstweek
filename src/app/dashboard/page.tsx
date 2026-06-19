import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, Chip, bandTone } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: assessments } = await supabase
    .from("assessments")
    .select("id, job_title, status, overall_score, readiness_band, created_at")
    .order("created_at", { ascending: false });

  const rows = assessments ?? [];

  return (
    <div className="mx-auto max-w-4xl px-5 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold">Your assessments</h1>
        <Link
          href="/"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          New assessment
        </Link>
      </div>

      {rows.length === 0 ? (
        <Card>
          <p className="text-sm text-slate-600">
            No assessments yet.{" "}
            <Link href="/" className="text-blue-600 hover:underline">
              Run your first one →
            </Link>
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {rows.map((a) => {
            const done = a.status === "completed";
            const card = (
              <Card className={done ? "transition hover:border-blue-300" : ""}>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold">{a.job_title || "Untitled role"}</p>
                    <p className="text-xs text-slate-400">
                      {new Date(a.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {done ? (
                      <>
                        <span className="text-2xl font-extrabold">{a.overall_score}</span>
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
