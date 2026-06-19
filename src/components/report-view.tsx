"use client";

import type { Report } from "@/lib/schemas";
import { Card, Chip, H, impTone, bandTone } from "@/components/ui";

const RING: Record<string, string> = {
  emerald: "border-emerald-500 text-emerald-600",
  blue: "border-blue-500 text-blue-600",
  amber: "border-amber-500 text-amber-600",
  rose: "border-rose-500 text-rose-600",
};

export function ReportView({
  report,
  perTask,
}: {
  report: Report;
  perTask: { taskTitle: string; score: number }[];
}) {
  const tone = bandTone(report.readiness_band);

  return (
    <div className="space-y-5">
      <div className="no-print flex justify-end">
        <button
          onClick={() => window.print()}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
        >
          Print / save PDF
        </button>
      </div>

      <Card className="print-clean">
        <div className="flex items-center gap-6">
          <div
            className={
              "flex h-28 w-28 flex-none flex-col items-center justify-center rounded-full border-4 " +
              RING[tone]
            }
          >
            <span className="text-3xl font-extrabold">{report.overall_score}</span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
          <div>
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <Chip tone={tone}>{report.readiness_band}</Chip>
              <Chip>Confidence: {report.confidence_level}</Chip>
            </div>
            <p className="text-sm text-slate-700">{report.application_recommendation}</p>
          </div>
        </div>
      </Card>

      {perTask.length > 0 && (
        <Card className="print-clean">
          <H>Task scores</H>
          <div className="space-y-3">
            {perTask.map((t, i) => (
              <div key={i}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-slate-700">{t.taskTitle}</span>
                  <span className="font-semibold">{t.score}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-blue-500" style={{ width: `${t.score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        <Card className="print-clean">
          <H>Strengths demonstrated</H>
          <ul className="space-y-2 text-sm text-slate-700">
            {report.strengths_demonstrated.map((s, i) => (
              <li key={i}>
                <span className="font-medium">{s.strength}</span> — {s.relevance_to_role}
              </li>
            ))}
          </ul>
        </Card>
        <Card className="print-clean">
          <H>Skill gaps</H>
          <ul className="space-y-2 text-sm text-slate-700">
            {report.skill_gaps.map((g, i) => (
              <li key={i}>
                <span className="font-medium">{g.gap}</span>{" "}
                <Chip tone={impTone(g.importance_for_role)}>{g.importance_for_role}</Chip>
                <div className="text-slate-500">{g.recommendation}</div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="print-clean">
        <H>Recommended learning path</H>
        <ul className="space-y-2 text-sm text-slate-700">
          {report.recommended_learning_path.map((l, i) => (
            <li key={i} className="flex flex-wrap items-center gap-2">
              <Chip tone={l.priority === "high" ? "rose" : l.priority === "medium" ? "amber" : "slate"}>
                {l.priority}
              </Chip>
              <span className="font-medium">{l.skill}</span>
              <span className="text-slate-500">
                — {l.resource} ({l.timeframe})
              </span>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="print-clean">
        <H>Interview prep focus</H>
        <ul className="space-y-2 text-sm text-slate-700">
          {report.interview_prep_focus.map((p, i) => (
            <li key={i}>
              <span className="font-medium">{p.topic}</span> — {p.why}
              <div className="text-slate-500">Tip: {p.preparation_tip}</div>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="print-clean">
        <H>Hiring manager summary</H>
        <p className="text-sm text-slate-700">{report.hiring_manager_summary}</p>
        <p className="mt-2 text-sm text-slate-600">
          <span className="font-medium">Learning curve:</span> {report.learning_curve_estimate}
        </p>
      </Card>

      <p className="px-1 text-xs italic text-slate-400">{report.disclaimer}</p>
    </div>
  );
}
