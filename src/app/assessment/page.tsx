"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
import { Card, Chip, H, Button, impTone } from "@/components/ui";
import { LoadingProgress } from "@/components/visuals";
import { ReportView } from "@/components/report-view";

type Phase = "input" | "analysis" | "simulation" | "report";
type Loading = null | "analyzing" | "simulating" | "evaluating";

interface Analysis {
  assessmentId: string;
  job: JobAnalysis;
  candidate: CandidateProfile;
  match: RoleMatch;
}
interface EvaluateResp {
  evaluations: Evaluation[];
  score: AssessmentScore;
  report: Report;
}

const ANALYZE_STEPS = ["Reading the job posting", "Profiling your experience", "Mapping your fit to the role"];
const SIMULATE_STEPS = ["Designing realistic tasks for this role", "Writing scoring rubrics", "Finalizing your simulation"];
const EVAL_STEPS = [
  "Reading your responses",
  "Scoring against each rubric",
  "Weighing strengths and gaps",
  "Writing your readiness report",
];

async function postJSON<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data?.error || `Request failed (${res.status})`) as Error & { upgrade?: boolean };
    err.upgrade = Boolean(data?.upgrade) || res.status === 402;
    throw err;
  }
  return data as T;
}

const STEPS: { key: Phase; label: string }[] = [
  { key: "input", label: "Input" },
  { key: "analysis", label: "Analysis" },
  { key: "simulation", label: "Simulation" },
  { key: "report", label: "Report" },
];

const textareaCls =
  "w-full resize-y rounded-xl border border-stone-200 p-3 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100";

export default function AssessmentPage() {
  const [phase, setPhase] = useState<Phase>("input");
  const [loading, setLoading] = useState<Loading>(null);
  const [error, setError] = useState<string | null>(null);
  const [upgrade, setUpgrade] = useState(false);

  const [jobText, setJobText] = useState(SAMPLE_JOB_DESCRIPTION);
  const [resumeText, setResumeText] = useState(SAMPLE_RESUME);

  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [tasks, setTasks] = useState<SimulationTask[]>([]);
  const [responses, setResponses] = useState<string[]>([]);
  const [result, setResult] = useState<EvaluateResp | null>(null);

  async function runAnalysis() {
    setError(null);
    setUpgrade(false);
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
      setUpgrade(Boolean((e as { upgrade?: boolean } | null)?.upgrade));
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
        assessmentId: analysis.assessmentId,
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
        assessmentId: analysis.assessmentId,
        responses,
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
      <div className="no-print mb-8 flex items-center justify-between">
        <p className="text-sm text-stone-500">Simulate the job before you apply.</p>
        <Stepper phase={phase} />
      </div>

      {error && (
        <div className="no-print mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
          {upgrade && (
            <Link href="/pricing" className="ml-2 font-semibold text-brand-700 underline">
              View Pro plans →
            </Link>
          )}
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
        <div className="space-y-5">
          <div className="no-print flex items-center justify-between">
            <Button variant="ghost" onClick={reset}>
              ← Start another
            </Button>
            <Link href="/dashboard" className="text-sm font-medium text-brand-600 hover:underline">
              View all assessments →
            </Link>
          </div>
          <ReportView report={result.report} perTask={result.score.perTask} />
        </div>
      )}
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
              (i <= activeIdx ? "bg-brand-600 text-white" : "bg-stone-200 text-stone-500")
            }
          >
            {i + 1}
          </span>
          <span className={"hidden sm:inline " + (i === activeIdx ? "font-semibold text-stone-900" : "text-stone-400")}>
            {s.label}
          </span>
          {i < STEPS.length - 1 && <span className="text-stone-300">→</span>}
        </li>
      ))}
    </ol>
  );
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
        <p className="text-sm text-stone-600">
          Paste a job posting and your resume below (pre-filled with a sample), then run the
          analysis. FirstWeek will extract the role, profile you, and generate realistic work tasks
          you&apos;d face in the job.
        </p>
      </Card>

      <div className="grid gap-5 md:grid-cols-2">
        <JobSourceCard jobText={jobText} onJob={onJob} />
        <Card>
          <H>Your resume / profile</H>
          <textarea value={resumeText} onChange={(e) => onResume(e.target.value)} rows={15} className={textareaCls} />
        </Card>
      </div>

      {loading ? (
        <LoadingProgress steps={ANALYZE_STEPS} note="Usually about 15 seconds." />
      ) : (
        <Button onClick={onRun} disabled={!jobText.trim() || !resumeText.trim()}>
          Run analysis
        </Button>
      )}
    </div>
  );
}

/* ----------------------------------------------------------- job source */

// Job-description input with a Paste | From URL toggle. Fetching a URL pulls the
// posting text server-side (SSRF-guarded) and drops it into the textarea, which
// stays editable and is the single source of truth submitted to the pipeline.
// Paste is the default and the fallback whenever a fetch can't extract text.
function JobSourceCard({ jobText, onJob }: { jobText: string; onJob: (v: string) => void }) {
  const [mode, setMode] = useState<"paste" | "url">("paste");
  const [url, setUrl] = useState("");
  const [fetching, setFetching] = useState(false);
  const [fetchErr, setFetchErr] = useState<string | null>(null);
  const [imported, setImported] = useState<string | null>(null);

  async function importUrl() {
    const trimmed = url.trim();
    if (!trimmed || fetching) return; // idempotent: ignore re-entry while a fetch is in flight
    setFetching(true);
    setFetchErr(null);
    try {
      const data = await postJSON<{ text: string; source: string }>("/api/job/fetch", { url: trimmed });
      onJob(data.text);
      setImported(data.source);
      setUrl("");
      setMode("paste");
    } catch (e) {
      setFetchErr(e instanceof Error ? e.message : "Couldn't fetch that URL.");
    } finally {
      setFetching(false);
    }
  }

  const tab = (key: "paste" | "url", label: string) => (
    <button
      type="button"
      onClick={() => {
        setMode(key);
        setFetchErr(null);
        setImported(null); // the note refers to the last import; drop it on any tab switch
      }}
      className={
        "rounded-lg px-2.5 py-1 text-xs font-medium transition " +
        (mode === key ? "bg-brand-600 text-white" : "text-stone-500 hover:bg-stone-100")
      }
    >
      {label}
    </button>
  );

  return (
    <Card>
      <div className="mb-2 flex items-center justify-between">
        <H>Job description</H>
        <div className="flex gap-1 rounded-xl bg-stone-100 p-0.5">
          {tab("paste", "Paste")}
          {tab("url", "From URL")}
        </div>
      </div>

      {mode === "url" ? (
        <div className="space-y-2">
          <p className="text-xs text-stone-500">
            Paste a link to the job posting. Works best on company career pages and ATS boards (Greenhouse,
            Lever, Ashby). Some sites (LinkedIn, Indeed) block automated reads — paste the text if it can&apos;t
            pull it.
          </p>
          <div className="flex gap-2">
            <input
              type="url"
              value={url}
              disabled={fetching}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !fetching && url.trim()) importUrl();
              }}
              placeholder="https://company.com/careers/role"
              className="min-w-0 flex-1 rounded-xl border border-stone-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 disabled:opacity-60"
            />
            <Button onClick={importUrl} disabled={fetching || !url.trim()}>
              {fetching ? "Fetching…" : "Fetch"}
            </Button>
          </div>
          {fetchErr && <p className="text-xs text-rose-600">{fetchErr}</p>}
        </div>
      ) : (
        <>
          {imported && (
            <p className="mb-2 text-xs text-emerald-700">
              Imported from {imported} — review and edit before running.
            </p>
          )}
          <textarea
            value={jobText}
            onChange={(e) => {
              onJob(e.target.value);
              if (imported) setImported(null); // once they edit, the "imported" provenance no longer holds
            }}
            rows={15}
            className={textareaCls}
          />
        </>
      )}
    </Card>
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
          <h2 className="font-display text-xl font-semibold tracking-tight">{job.job_title}</h2>
          <Chip tone="brand">{job.seniority_level}</Chip>
          <Chip>{job.role_family}</Chip>
        </div>
        <p className="text-sm text-stone-600">{job.summary}</p>
      </Card>

      <div className="grid gap-5 md:grid-cols-2">
        <Card>
          <H>Core responsibilities</H>
          <ul className="list-disc space-y-1 pl-4 text-sm text-stone-700">
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
              <div className="mt-3" />
              <H>Hidden expectations</H>
              <ul className="list-disc space-y-1 pl-4 text-sm text-stone-700">
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
        <p className="mb-3 text-sm text-stone-600">{candidate.experience_summary}</p>
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
          <Chip tone="brand">Fit estimate: {match.initial_fit_estimate}</Chip>
          <Chip>Confidence: {match.confidence_level}</Chip>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="mb-1 text-xs font-semibold text-emerald-700">Strong matches</p>
            <ul className="list-disc space-y-1 pl-4 text-sm text-stone-700">
              {match.strong_matches.slice(0, 4).map((m, i) => (
                <li key={i}>{m.requirement}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-1 text-xs font-semibold text-rose-700">Gaps</p>
            <ul className="list-disc space-y-1 pl-4 text-sm text-stone-700">
              {match.gaps.slice(0, 4).map((m, i) => (
                <li key={i}>
                  {m.requirement} <span className="text-stone-400">({m.gap_type})</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      {loading ? (
        <LoadingProgress steps={SIMULATE_STEPS} note="Usually about 20 seconds." />
      ) : (
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={onBack}>
            Back
          </Button>
          <Button onClick={onNext}>Generate simulation</Button>
        </div>
      )}
    </div>
  );
}

/* ----------------------------------------------------- simulation workspace */

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
  const [current, setCurrent] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  if (loading) {
    return <LoadingProgress steps={EVAL_STEPS} note="Scoring every response against its rubric — about 30 seconds." />;
  }

  const allAnswered = answered === tasks.length && tasks.length > 0;
  const task = tasks[current];
  const resp = responses[current] || "";
  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-stone-800">
          Task {current + 1} <span className="text-stone-400">of {tasks.length}</span>
        </span>
        <span className="flex items-center gap-3 text-stone-500">
          <span className="tabular-nums">⏱ {mm}:{ss}</span>
          <span>
            {answered}/{tasks.length} answered
          </span>
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-stone-100">
        <div
          className="h-full rounded-full bg-brand-500 transition-[width] duration-500"
          style={{ width: `${(answered / tasks.length) * 100}%` }}
        />
      </div>

      <div className="grid gap-5 md:grid-cols-[200px_1fr]">
        {/* Task rail */}
        <aside className="no-print hidden md:block">
          <div className="sticky top-20 space-y-1">
            {tasks.map((t, i) => {
              const ans = (responses[i] || "").trim().length > 0;
              const active = i === current;
              return (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={
                    "flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm transition " +
                    (active ? "bg-brand-50" : "hover:bg-stone-100")
                  }
                >
                  <span
                    className={
                      "flex h-5 w-5 flex-none items-center justify-center rounded-full text-[11px] font-bold " +
                      (ans
                        ? "bg-brand-600 text-white"
                        : active
                          ? "border-2 border-brand-500 text-brand-600"
                          : "border border-stone-300 text-stone-400")
                    }
                  >
                    {ans ? "✓" : i + 1}
                  </span>
                  <span className={"truncate " + (active ? "font-semibold text-stone-900" : "text-stone-600")}>
                    {t.title}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Current task */}
        <Card>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <h3 className="text-base font-bold">{task.title}</h3>
            <Chip tone="brand">{task.difficulty}</Chip>
            <Chip>~{task.time_estimate_minutes} min</Chip>
          </div>
          <p className="mb-3 text-sm text-stone-700">{task.scenario}</p>
          {task.context && (
            <div className="mb-3 rounded-xl border border-stone-200 bg-stone-50 p-3 text-sm text-stone-600">
              <p className="mb-1 text-xs font-bold uppercase tracking-wide text-stone-400">Brief / data</p>
              {task.context}
            </div>
          )}
          <p className="mb-1 text-sm font-semibold text-stone-900">{task.instructions}</p>
          <p className="mb-3 text-xs text-stone-500">Deliverable: {task.expected_deliverable}</p>
          <div className="mb-3 flex flex-wrap gap-1.5">
            {task.competencies_tested.map((c, j) => (
              <Chip key={j}>{c}</Chip>
            ))}
          </div>
          <textarea
            value={resp}
            onChange={(e) => onChange(current, e.target.value)}
            rows={9}
            placeholder="Do the work here — write your response as you would on the job…"
            className={textareaCls}
          />
          <div className="mt-1 flex items-center justify-between text-xs text-stone-400">
            <span>{resp.trim().length > 0 ? "Saved ✓" : "Not started"}</span>
            <span>{resp.trim().length} chars</span>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <Button variant="ghost" onClick={() => setCurrent((c) => Math.max(0, c - 1))} disabled={current === 0}>
              ← Prev
            </Button>
            {current < tasks.length - 1 ? (
              <Button variant="ghost" onClick={() => setCurrent((c) => Math.min(tasks.length - 1, c + 1))}>
                Next →
              </Button>
            ) : (
              <span className="text-xs text-stone-400">Last task</span>
            )}
          </div>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-stone-200 pt-4">
        <Button onClick={onSubmit} disabled={!allAnswered}>
          Submit for evaluation
        </Button>
        {!allAnswered && (
          <span className="text-sm text-stone-500">Answer all {tasks.length} tasks to submit.</span>
        )}
      </div>
    </div>
  );
}
