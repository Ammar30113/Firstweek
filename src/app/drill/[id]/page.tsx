import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DoDrill, DrillResult } from "@/components/drill";
import type { Drill, DrillEvaluation } from "@/lib/schemas";

export const dynamic = "force-dynamic";

export default async function DrillPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // RLS returns the row only if it belongs to the signed-in user.
  const { data: row } = await supabase
    .from("drills")
    .select("id, status, drill_json, evaluation_json, score, competency, role_context, assessment_id")
    .eq("id", id)
    .maybeSingle();
  if (!row) notFound();

  const drill = row.drill_json as Drill;
  const backHref = row.assessment_id ? `/assessment/${row.assessment_id}` : "/dashboard";

  return (
    <div className="mx-auto max-w-4xl px-5 py-8">
      <div className="no-print mb-4">
        <Link href={backHref} className="text-sm font-medium text-brand-600 hover:underline">
          ← Back to report
        </Link>
      </div>

      {row.status === "completed" && row.evaluation_json ? (
        <DrillResult
          drill={drill}
          evaluation={row.evaluation_json as DrillEvaluation}
          score={row.score ?? 0}
          competency={row.competency}
          roleContext={row.role_context ?? undefined}
          assessmentId={row.assessment_id ?? undefined}
        />
      ) : (
        <DoDrill drillId={row.id} drill={drill} />
      )}
    </div>
  );
}
