import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import type { z } from "zod";
import { logAiCall } from "@/lib/db/ai-log";
import { aiContext } from "@/lib/ai/context";

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

// USD per 1M tokens: [input, output]. Used to estimate per-call cost.
const PRICES: Record<string, [number, number]> = {
  "gpt-4o": [2.5, 10],
  "gpt-4o-mini": [0.15, 0.6],
  "gpt-4.1": [2, 8],
  "gpt-4.1-mini": [0.4, 1.6],
  "gpt-4.1-nano": [0.1, 0.4],
};

export function costUsd(model: string, promptTokens: number, completionTokens: number): number | null {
  const p = PRICES[model];
  if (!p) return null;
  return +((promptTokens / 1e6) * p[0] + (completionTokens / 1e6) * p[1]).toFixed(6);
}

let _client: OpenAI | null = null;
function client(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set. Copy .env.example to .env.local and add your key.");
  }
  if (!_client) _client = new OpenAI({ apiKey });
  return _client;
}

function errMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

interface CallArgs<T> {
  step: string;
  system: string;
  user: string;
  schema: z.ZodType<T>;
  schemaName: string;
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

/**
 * Single entry point for every AI stage. Structured Outputs guarantees the
 * response matches `schema`; retries once on failure. Logs each call to
 * ai_logs with token usage + estimated cost, attributed to the request's
 * user/assessment via AsyncLocalStorage.
 */
export async function callStructured<T>(args: CallArgs<T>): Promise<T> {
  const { step, system, user, schema, schemaName, temperature = 0.3, maxTokens = 4096 } = args;
  const model = args.model || modelForStep(step);
  const ctx = aiContext.getStore();

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
      if (choice?.message.refusal) throw new Error(`Model refused the request: ${choice.message.refusal}`);
      const parsed = choice?.message.parsed;
      if (!parsed) throw new Error("Model returned no parsed output.");

      const pt = completion.usage?.prompt_tokens ?? 0;
      const ct = completion.usage?.completion_tokens ?? 0;
      const durationMs = Date.now() - start;
      console.info("[ai]", { step, model, durationMs, prompt_tokens: pt, completion_tokens: ct });
      await logAiCall({
        step,
        model,
        durationMs,
        promptTokens: pt,
        completionTokens: ct,
        costUsd: costUsd(model, pt, ct),
        error: null,
        userId: ctx?.userId,
        assessmentId: ctx?.assessmentId,
      });
      return parsed;
    } catch (err) {
      lastErr = err;
      const durationMs = Date.now() - start;
      console.error("[ai]", { step, model, durationMs, attempt, error: errMessage(err) });
      if (attempt === 2) {
        await logAiCall({
          step,
          model,
          durationMs,
          error: errMessage(err),
          userId: ctx?.userId,
          assessmentId: ctx?.assessmentId,
        });
      }
    }
  }
  throw new Error(`AI step "${step}" failed after retry: ${errMessage(lastErr)}`);
}
