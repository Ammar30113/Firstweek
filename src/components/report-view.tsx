"use client";

import { useState } from "react";
import type { Report } from "@/lib/schemas";
import { Card, Chip, H, impTone, bandTone } from "@/components/ui";
import { ScoreGauge } from "@/components/visuals";
import { PracticeButton } from "@/components/drill";
import { OutcomeTracker } from "@/components/outcome-tracker";

function sevTone(s: string) {
  if (s === "high") return "rose";
  if (s === "medium") return "amber";
  return "stone";
}

export function ReportView({
  report,
  perTask,
  assessmentId,
  outcomeStage,
}: {
  report: Report;
  perTask: { taskTitle: string; score: number }[];
  // When present, the report becomes a launchpad: practice the gaps + track outcome.
  assessmentId?: string;
  outcomeStage?: string | null;
}) {
  const tone = bandTone(report.readiness_band);
  const roleContext = report.target_role_summary;
  const [copied, setCopied] = useState(false);

  function copySummary() {
    const lines = [
      `FirstWeek readiness: ${report.overall_score}/100 — ${report.readiness_band} (confidence: ${report.confidence_level})`,
      "",
      report.application_recommendation,
      "",
      "Strengths:",
      ...report.strengths_demonstrated.map((s) => `• ${s.strength}`),
      "",
      "Gaps to prepare:",
      ...report.skill_gaps.map((g) => `• ${g.gap} (${g.importance_for_role})`),
    ];
    navigator.clipboard?.writeText(lines.join("\n")).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  return (
    <div className="space-y-5">
      <div className="no-print flex justify-end gap-2">
        <button
          onClick={copySummary}
          className="rounded-xl border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-100"
        >
          {copied ? "Copied ✓" : "Copy summary"}
        </button>
        <button
          onClick={() => window.print()}
          className="rounded-xl border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-100"
        >
          Print / save PDF
        </button>
      </div>

      {/* Hero */}
      <Card className="print-clean bg-gradient-to-br from-brand-50 via-cream-50 to-cream-100">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
          <ScoreGauge score={report.overall_score} tone={tone} />
          <div className="flex-1 text-center sm:text-left">
            <div className="mb-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <Chip tone={tone}>{report.readiness_band}</Chip>
              <Chip tone="cove">Confidence: {report.confidence_level}</Chip>
            </div>
            <p className="font-display text-lg font-medium leading-relaxed text-stone-800">
              {report.application_recommendation}
            </p>
          </div>
        </div>
      </Card>

      {/* Improvement band — the score is a starting line, not a verdict. */}
      {assessmentId && report.skill_gaps.length > 0 && (
        <Card className="no-print border-brand-200 bg-gradient-to-br from-brand-50 to-cream-50">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-display text-lg font-semibold text-stone-900">
                This score is your starting line — not your ceiling.
              </p>
              <p className="mt-0.5 text-sm text-stone-600">
                Practice the gaps below in focused 5-minute drills and watch your readiness climb.
              </p>
            </div>
            <PracticeButton
              competency={report.skill_gaps[0].gap}
              gapDetail={report.skill_gaps[0].recommendation}
              roleContext={roleContext}
              assessmentId={assessmentId}
              source="skill_gap"
              label="Start practicing →"
              variant="primary"
              className="shrink-0"
            />
          </div>
        </Card>
      )}

      {/* Context */}
      <div className="grid gap-5 md:grid-cols-2">
        <Card className="print-clean">
          <H>Candidate</H>
          <p className="text-sm text-stone-700">{report.candidate_summary}</p>
        </Card>
        <Card className="print-clean">
          <H>Target role</H>
          <p className="text-sm text-stone-700">{report.target_role_summary}</p>
        </Card>
      </div>

      {perTask.length > 0 && (
        <Card className="print-clean">
          <H>Task scores</H>
          <div className="space-y-3">
            {perTask.map((t, i) => (
              <div key={i}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-stone-700">{t.taskTitle}</span>
                  <span className="font-semibold">{t.score}</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-stone-100">
                  <div
                    className="h-full rounded-full bg-brand-500 transition-[width] duration-1000"
                    style={{ width: `${t.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        <Card className="print-clean">
          <H>Strengths demonstrated</H>
          <ul className="space-y-3 text-sm text-stone-700">
            {report.strengths_demonstrated.map((s, i) => (
              <li key={i} className="border-l-2 border-emerald-300 pl-3">
                <span className="font-semibold text-stone-900">{s.strength}</span>
                <div className="text-stone-500">{s.relevance_to_role}</div>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="print-clean">
          <H>Skill gaps</H>
          <ul className="space-y-3 text-sm text-stone-700">
            {report.skill_gaps.map((g, i) => (
              <li key={i} className="border-l-2 border-stone-200 pl-3">
                <span className="font-semibold text-stone-900">{g.gap}</span>{" "}
                <Chip tone={impTone(g.importance_for_role)}>{g.importance_for_role}</Chip>
                <div className="text-stone-500">{g.recommendation}</div>
                {assessmentId && (
                  <PracticeButton
                    competency={g.gap}
                    gapDetail={g.recommendation}
                    roleContext={roleContext}
                    assessmentId={assessmentId}
                    source="skill_gap"
                    className="no-print mt-1.5"
                  />
                )}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Did it actually work? — the outcome loop. */}
      {assessmentId && <OutcomeTracker assessmentId={assessmentId} initialStage={outcomeStage} />}

      {(report.transferable_skills.length > 0 || report.risk_factors.length > 0) && (
        <div className="grid gap-5 md:grid-cols-2">
          <Card className="print-clean">
            <H>Transferable skills</H>
            <ul className="space-y-3 text-sm text-stone-700">
              {report.transferable_skills.map((t, i) => (
                <li key={i} className="border-l-2 border-cove-300 pl-3">
                  <span className="font-semibold text-stone-900">{t.skill}</span>
                  <div className="text-stone-500">{t.application_to_role}</div>
                </li>
              ))}
            </ul>
          </Card>
          <Card className="print-clean">
            <H>Risk factors</H>
            <ul className="space-y-3 text-sm text-stone-700">
              {report.risk_factors.map((r, i) => (
                <li key={i}>
                  <span className="font-semibold text-stone-900">{r.risk}</span>{" "}
                  <Chip tone={sevTone(r.severity)}>{r.severity}</Chip>
                  <div className="text-stone-500">{r.mitigation}</div>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      <Card className="print-clean">
        <H>Recommended learning path</H>
        <ul className="space-y-2 text-sm text-stone-700">
          {report.recommended_learning_path.map((l, i) => (
            <li key={i} className="flex flex-wrap items-center gap-2">
              <Chip tone={l.priority === "high" ? "rose" : l.priority === "medium" ? "amber" : "stone"}>
                {l.priority}
              </Chip>
              <span className="font-medium">{l.skill}</span>
              <span className="text-stone-500">
                — {l.resource} ({l.timeframe})
              </span>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="print-clean">
        <H>Interview prep focus</H>
        <ul className="space-y-3 text-sm text-stone-700">
          {report.interview_prep_focus.map((p, i) => (
            <li key={i}>
              <span className="font-semibold text-stone-900">{p.topic}</span> — {p.why}
              <div className="text-stone-500">Tip: {p.preparation_tip}</div>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="print-clean border-brand-200 bg-brand-50/40">
        <H>Hiring manager summary</H>
        <p className="text-sm leading-relaxed text-stone-800">{report.hiring_manager_summary}</p>
        <p className="mt-3 text-sm text-stone-600">
          <span className="font-semibold">Learning curve:</span> {report.learning_curve_estimate}
        </p>
      </Card>

      <p className="px-1 text-xs italic text-stone-400">{report.disclaimer}</p>
    </div>
  );
}
