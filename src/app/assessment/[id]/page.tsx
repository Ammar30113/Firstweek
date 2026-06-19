import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ReportView } from "@/components/report-view";
import type { Report } from "@/lib/schemas";

export const dynamic = "force-dynamic";

export default async function AssessmentReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // RLS ensures the row is only returned if it belongs to the signed-in user.
  const { data: reportRow } = await supabase
    .from("reports")
    .select("report_json")
    .eq("assessment_id", id)
    .single();
  if (!reportRow) notFound();
  const report = reportRow.report_json as Report;

  const { data: evalRows } = await supabase
    .from("task_evaluations")
    .select("score, simulation_tasks(title, order_index)")
    .eq("assessment_id", id);

  const perTask = (evalRows ?? [])
    .map((e: { score: number | null; simulation_tasks: unknown }) => {
      const st = Array.isArray(e.simulation_tasks) ? e.simulation_tasks[0] : e.simulation_tasks;
      const task = (st ?? {}) as { title?: string; order_index?: number };
      return {
        taskTitle: task.title || "Task",
        score: e.score ?? 0,
        order: task.order_index ?? 0,
      };
    })
    .sort((a, b) => a.order - b.order)
    .map(({ taskTitle, score }) => ({ taskTitle, score }));

  return (
    <div className="mx-auto max-w-4xl px-5 py-8">
      <div className="no-print mb-4">
        <Link href="/dashboard" className="text-sm font-medium text-blue-600 hover:underline">
          ← Back to dashboard
        </Link>
      </div>
      <ReportView report={report} perTask={perTask} />
    </div>
  );
}
