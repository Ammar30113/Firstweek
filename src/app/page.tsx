"use client";

import { useState } from "react";
import {
  SAMPLE_JOB_TITLE,
  SAMPLE_JOB_DESCRIPTION,
  SAMPLE_RESUME,
  SAMPLE_CONTEXT,
} from "@/data/samples";
import type {
  JobAnalysis,
  CandidateProfile,
  RoleMatch,
  SimulationTask,
  Evaluation,
  Report,
} from "@/lib/schemas";
import type { AssessmentScore } from "@/lib/scoring";

type Phase = "input" | "analysis" | "simulation" | "report";
type Loading = null | "analyzing" | "simulating" | "evaluating";

interface Analysis {
  job: JobAnalysis;
  candidate: CandidateProfile;
  match: RoleMatch;
}
interface EvaluateResp {
  evaluations: Evaluation[];
  score: AssessmentScore;
  report: Report;
}

async function postJSON<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);
  return data as T;
}

const STEPS: { key: Phase; label: string }[] = [
  { key: "input", label: "Input" },
  { key: "analysis", label: "Analysis" },
  { key: "simulation", label: "Simulation" },
  { key: "report", label: "Report" },
];

export default function Home() {
  const [phase, setPhase] = useState<Phase>("input");
  const [loading, setLoading] = useState<Loading>(null);
  const [error, setError] = useState<string | null>(null);

  const [jobText, setJobText] = useState(SAMPLE_JOB_DESCRIPTION);
  const [resumeText, setResumeText] = useState(SAMPLE_RESUME);

  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [tasks, setTasks] = useState<SimulationTask[]>([]);
  const [responses, setResponses] = useState<string[]>([]);
  const [result, setResult] = useState<EvaluateResp | null>(null);

  async function runAnalysis() {
    setError(null);
    setLoading("analyzing");
    try {
      const data = await postJSON<Analysis>("/api/assessment/analyze", {
        job_description: jobText,
        resume_text: resumeText,
        title: SAMPLE_JOB_TITLE,
        ...SAMPLE_CONTEXT,
      });
      setAnalysis(data);
      setPhase("analysis");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setLoading(null);
    }
  }

  async function runSimulation() {
    if (!analysis) return;
    setError(null);
    setLoading("simulating");
    try {
      const data = await postJSON<{ tasks: SimulationTask[] }>("/api/assessment/simulate", {
        job: analysis.job,
        candidate: analysis.candidate,
        match: analysis.match,
        task_count: 3,
      });
      setTasks(data.tasks);
      setResponses(new Array(data.tasks.length).fill(""));
      setPhase("simulation");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Simulation generation failed");
    } finally {
      setLoading(null);
    }
  }

  async function runEvaluation() {
    if (!analysis) return;
    setError(null);
    setLoading("evaluating");
    try {
      const data = await postJSON<EvaluateResp>("/api/assessment/evaluate", {
        job: analysis.job,
        candidate: analysis.candidate,
        match: analysis.match,
        tasks,
        responses,
        job_description: jobText,
        resume_text: resumeText,
      });
      setResult(data);
      setPhase("report");
      window.scrollTo({ top: 0 });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Evaluation failed");
    } finally {
      setLoading(null);
    }
  }

  function reset() {
    setPhase("input");
    setAnalysis(null);
    setTasks([]);
    setResponses([]);
    setResult(null);
    setError(null);
  }

  const answered = responses.filter((r) => r.trim().length > 0).length;

  return (
    <div className="mx-auto max-w-4xl px-5 py-8">
      <header className="no-print mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">FirstWeek</h1>
          <p className="text-sm text-slate-500">Simulate the job before you apply.</p>
        </div>
        <Stepper phase={phase} />
      </header>

      {error && (
        <div className="no-print mb-6 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {phase === "input" && (
        <InputView
          jobText={jobText}
          resumeText={resumeText}
          onJob={setJobText}
          onResume={setResumeText}
          loading={loading === "analyzing"}
          onRun={runAnalysis}
        />
      )}

      {phase === "analysis" && analysis && (
        <AnalysisView
          analysis={analysis}
          loading={loading === "simulating"}
          onBack={() => setPhase("input")}
          onNext={runSimulation}
        />
      )}

      {phase === "simulation" && (
        <SimulationView
          tasks={tasks}
          responses={responses}
          answered={answered}
          loading={loading === "evaluating"}
          onChange={(i, v) =>
            setResponses((prev) => {
              const next = [...prev];
              next[i] = v;
              return next;
            })
          }
          onSubmit={runEvaluation}
        />
      )}

      {phase === "report" && result && (
        <ReportView result={result} onReset={reset} />
      )}

      <footer className="no-print mt-12 border-t border-slate-200 pt-4 text-xs text-slate-400">
        FirstWeek produces a simulation-based readiness estimate for self-assessment. It does not
        guarantee employment outcomes.
      </footer>
    </div>
  );
}

/* ----------------------------------------------------------------- pieces */

function Stepper({ phase }: { phase: Phase }) {
  const activeIdx = STEPS.findIndex((s) => s.key === phase);
  return (
    <ol className="flex items-center gap-2 text-xs">
      {STEPS.map((s, i) => (
        <li key={s.key} className="flex items-center gap-2">
          <span
            className={
              "flex h-6 w-6 items-center justify-center rounded-full font-semibold " +
              (i <= activeIdx ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500")
            }
          >
            {i + 1}
          </span>
          <span className={i === activeIdx ? "font-semibold text-slate-900" : "text-slate-400"}>
            {s.label}
          </span>
          {i < STEPS.length - 1 && <span className="text-slate-300">→</span>}
        </li>
      ))}
    </ol>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={"rounded-xl border border-slate-200 bg-white p-5 shadow-sm " + className}>
      {children}
    </div>
  );
}

function Chip({ children, tone = "slate" }: { children: React.ReactNode; tone?: string }) {
  const tones: Record<string, string> = {
    slate: "bg-slate-100 text-slate-700",
    blue: "bg-blue-100 text-blue-700",
    rose: "bg-rose-100 text-rose-700",
    amber: "bg-amber-100 text-amber-700",
    emerald: "bg-emerald-100 text-emerald-700",
  };
  return (
    <span className={"inline-block rounded-full px-2.5 py-0.5 text-xs font-medium " + tones[tone]}>
      {children}
    </span>
  );
}

function Button({
  children,
  onClick,
  disabled,
  variant = "primary",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "ghost";
}) {
  const base =
    "rounded-lg px-4 py-2 text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed";
  const styles =
    variant === "primary"
      ? "bg-blue-600 text-white hover:bg-blue-700"
      : "border border-slate-300 text-slate-700 hover:bg-slate-100";
  return (
    <button onClick={onClick} disabled={disabled} className={base + " " + styles}>
      {children}
    </button>
  );
}

function H({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">{children}</h3>;
}

function impTone(importance: string) {
  if (importance === "critical") return "rose";
  if (importance === "important") return "amber";
  return "slate";
}

function bandTone(band: string) {
  if (band === "Excellent Fit" || band === "Strong Fit") return "emerald";
  if (band === "Viable Fit") return "blue";
  if (band === "Stretch Role") return "amber";
  return "rose";
}

/* ----------------------------------------------------------------- input */

function InputView({
  jobText,
  resumeText,
  onJob,
  onResume,
  loading,
  onRun,
}: {
  jobText: string;
  resumeText: string;
  onJob: (v: string) => void;
  onResume: (v: string) => void;
  loading: boolean;
  onRun: () => void;
}) {
  return (
    <div className="space-y-5">
      <Card>
        <p className="text-sm text-slate-600">
          Paste a job posting and your resume below (pre-filled with a sample), then run the
          analysis. FirstWeek will extract the role, profile you, and generate realistic work tasks
          you&apos;d face in the job.
        </p>
      </Card>

      <div className="grid gap-5 md:grid-cols-2">
        <Card>
          <H>Job description</H>
          <textarea
            value={jobText}
            onChange={(e) => onJob(e.target.value)}
            rows={16}
            className="w-full resize-y rounded-lg border border-slate-200 p-3 text-sm focus:border-blue-400 focus:outline-none"
          />
        </Card>
        <Card>
          <H>Your resume / profile</H>
          <textarea
            value={resumeText}
            onChange={(e) => onResume(e.target.value)}
            rows={16}
            className="w-full resize-y rounded-lg border border-slate-200 p-3 text-sm focus:border-blue-400 focus:outline-none"
          />
        </Card>
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={onRun} disabled={loading || !jobText.trim() || !resumeText.trim()}>
          {loading ? "Analyzing… (~15s)" : "Run analysis"}
        </Button>
        {loading && <span className="text-sm text-slate-500">Extracting role + profile…</span>}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------- analysis */

function AnalysisView({
  analysis,
  loading,
  onBack,
  onNext,
}: {
  analysis: Analysis;
  loading: boolean;
  onBack: () => void;
  onNext: () => void;
}) {
  const { job, candidate, match } = analysis;
  return (
    <div className="space-y-5">
      <Card>
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-bold">{job.job_title}</h2>
          <Chip tone="blue">{job.seniority_level}</Chip>
          <Chip>{job.role_family}</Chip>
        </div>
        <p className="text-sm text-slate-600">{job.summary}</p>
      </Card>

      <div className="grid gap-5 md:grid-cols-2">
        <Card>
          <H>Core responsibilities</H>
          <ul className="list-disc space-y-1 pl-4 text-sm text-slate-700">
            {job.core_responsibilities.slice(0, 6).map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </Card>
        <Card>
          <H>Required skills</H>
          <div className="flex flex-wrap gap-1.5">
            {job.required_skills.map((s, i) => (
              <Chip key={i} tone={impTone(s.importance)}>
                {s.skill}
              </Chip>
            ))}
          </div>
          {job.hidden_expectations.length > 0 && (
            <>
              <H>Hidden expectations</H>
              <ul className="list-disc space-y-1 pl-4 text-sm text-slate-700">
                {job.hidden_expectations.slice(0, 4).map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </>
          )}
        </Card>
      </div>

      <Card>
        <H>Candidate — {candidate.candidate_name}</H>
        <p className="mb-3 text-sm text-slate-600">{candidate.experience_summary}</p>
        <div className="flex flex-wrap gap-1.5">
          {candidate.core_skills.slice(0, 12).map((s, i) => (
            <Chip key={i} tone="emerald">
              {s.skill}
            </Chip>
          ))}
        </div>
      </Card>

      <Card>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <H>Role-candidate match</H>
          <Chip tone="blue">Fit estimate: {match.initial_fit_estimate}</Chip>
          <Chip>Confidence: {match.confidence_level}</Chip>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="mb-1 text-xs font-semibold text-emerald-700">Strong matches</p>
            <ul className="list-disc space-y-1 pl-4 text-sm text-slate-700">
              {match.strong_matches.slice(0, 4).map((m, i) => (
                <li key={i}>{m.requirement}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-1 text-xs font-semibold text-rose-700">Gaps</p>
            <ul className="list-disc space-y-1 pl-4 text-sm text-slate-700">
              {match.gaps.slice(0, 4).map((m, i) => (
                <li key={i}>
                  {m.requirement} <span className="text-slate-400">({m.gap_type})</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      <div className="flex items-center gap-3">
        <Button variant="ghost" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext} disabled={loading}>
          {loading ? "Generating tasks… (~20s)" : "Generate simulation"}
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ simulation */

function SimulationView({
  tasks,
  responses,
  answered,
  loading,
  onChange,
  onSubmit,
}: {
  tasks: SimulationTask[];
  responses: string[];
  answered: number;
  loading: boolean;
  onChange: (i: number, v: string) => void;
  onSubmit: () => void;
}) {
  const allAnswered = answered === tasks.length && tasks.length > 0;
  return (
    <div className="space-y-5">
      <Card>
        <p className="text-sm text-slate-600">
          Complete each task as you would on the job. Your answers are evaluated against a
          role-specific rubric — there are no trick questions.
        </p>
      </Card>

      {tasks.map((task, i) => (
        <Card key={i}>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-400">TASK {i + 1}</span>
            <h3 className="text-base font-bold">{task.title}</h3>
            <Chip tone="blue">{task.difficulty}</Chip>
            <Chip>~{task.time_estimate_minutes} min</Chip>
          </div>
          <p className="mb-2 text-sm text-slate-700">{task.scenario}</p>
          {task.context && (
            <div className="mb-2 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
              {task.context}
            </div>
          )}
          <p className="mb-1 text-sm font-medium text-slate-800">{task.instructions}</p>
          <p className="mb-3 text-xs text-slate-500">Deliverable: {task.expected_deliverable}</p>
          <div className="mb-2 flex flex-wrap gap-1.5">
            {task.competencies_tested.map((c, j) => (
              <Chip key={j}>{c}</Chip>
            ))}
          </div>
          <textarea
            value={responses[i] || ""}
            onChange={(e) => onChange(i, e.target.value)}
            rows={7}
            placeholder="Write your response…"
            className="w-full resize-y rounded-lg border border-slate-200 p-3 text-sm focus:border-blue-400 focus:outline-none"
          />
          <p className="mt-1 text-right text-xs text-slate-400">
            {(responses[i] || "").trim().length} chars
          </p>
        </Card>
      ))}

      <div className="flex items-center gap-3">
        <Button onClick={onSubmit} disabled={loading || !allAnswered}>
          {loading ? "Evaluating… (~30s)" : "Submit for evaluation"}
        </Button>
        <span className="text-sm text-slate-500">
          {answered} of {tasks.length} answered
        </span>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- report */

function ReportView({ result, onReset }: { result: EvaluateResp; onReset: () => void }) {
  const { report, score } = result;
  const tone = bandTone(report.readiness_band);
  const ringColor: Record<string, string> = {
    emerald: "border-emerald-500 text-emerald-600",
    blue: "border-blue-500 text-blue-600",
    amber: "border-amber-500 text-amber-600",
    rose: "border-rose-500 text-rose-600",
  };

  return (
    <div className="space-y-5">
      <div className="no-print flex items-center justify-between">
        <Button variant="ghost" onClick={onReset}>
          ← Start another simulation
        </Button>
        <Button variant="ghost" onClick={() => window.print()}>
          Print / save PDF
        </Button>
      </div>

      <Card className="print-clean">
        <div className="flex items-center gap-6">
          <div
            className={
              "flex h-28 w-28 flex-none flex-col items-center justify-center rounded-full border-4 " +
              ringColor[tone]
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

      <Card className="print-clean">
        <H>Task scores</H>
        <div className="space-y-3">
          {score.perTask.map((t, i) => (
            <div key={i}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-slate-700">{t.taskTitle}</span>
                <span className="font-semibold">{t.score}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-blue-500"
                  style={{ width: `${t.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

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
              <span className="text-slate-500">— {l.resource} ({l.timeframe})</span>
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
