import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import type { z } from "zod";

// Base model for extraction/structuring stages (cheap, fast). Quality model for
// the stages where scoring credibility + polish matter most (evaluation, report).
// Both overridable via env — set them equal to go all-cheap or all-premium.
// NOTE: this OpenAI project currently has no access to the gpt-4.1 family (403),
// so we default to the gpt-4o tier. Switch these to gpt-4.1-mini / gpt-4.1 once
// the project is granted access (cheaper for equal/better quality).
export const BASE_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
export const QUALITY_MODEL = process.env.OPENAI_MODEL_QUALITY || "gpt-4o";

// Per-stage model routing, keyed by the `step` each stage passes.
const STAGE_MODEL: Record<string, string> = {
  job_extraction: BASE_MODEL,
  candidate_extraction: BASE_MODEL,
  role_match: BASE_MODEL,
  simulation_generation: BASE_MODEL,
  task_evaluation: QUALITY_MODEL,
  report_generation: QUALITY_MODEL,
};

export function modelForStep(step: string): string {
  return STAGE_MODEL[step] || BASE_MODEL;
}

let _client: OpenAI | null = null;
function client(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY is not set. Copy .env.example to .env.local and add your key."
    );
  }
  if (!_client) _client = new OpenAI({ apiKey });
  return _client;
}

function errMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

function logCall(step: string, model: string, durationMs: number, err: unknown, attempt: number) {
  const base = { step, model, duration_ms: durationMs, attempt };
  if (err) console.error("[ai]", { ...base, error: errMessage(err) });
  else console.info("[ai]", { ...base, ok: true });
}

interface CallArgs<T> {
  step: string;
  system: string;
  user: string;
  schema: z.ZodType<T>;
  schemaName: string;
  temperature?: number;
  maxTokens?: number;
  model?: string; // override; defaults to the per-stage routed model
}

/**
 * Single entry point for every AI stage. Uses OpenAI Structured Outputs so the
 * response is guaranteed to match `schema`; retries once on failure. The model
 * is routed per stage (see STAGE_MODEL) unless explicitly overridden.
 */
export async function callStructured<T>(args: CallArgs<T>): Promise<T> {
  const { step, system, user, schema, schemaName, temperature = 0.3, maxTokens = 4096 } = args;
  const model = args.model || modelForStep(step);

  let lastErr: unknown;
  for (let attempt = 1; attempt <= 2; attempt++) {
    const start = Date.now();
    try {
      const completion = await client().beta.chat.completions.parse({
        model,
        temperature,
        max_tokens: maxTokens,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        response_format: zodResponseFormat(schema, schemaName),
      });

      const choice = completion.choices[0];
      if (choice?.message.refusal) {
        throw new Error(`Model refused the request: ${choice.message.refusal}`);
      }
      const parsed = choice?.message.parsed;
      if (!parsed) throw new Error("Model returned no parsed output.");

      logCall(step, model, Date.now() - start, null, attempt);
      return parsed;
    } catch (err) {
      lastErr = err;
      logCall(step, model, Date.now() - start, err, attempt);
    }
  }
  throw new Error(`AI step "${step}" failed after retry: ${errMessage(lastErr)}`);
}
