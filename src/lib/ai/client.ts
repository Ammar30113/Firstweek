import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import type { z } from "zod";

export const MODEL = process.env.OPENAI_MODEL || "gpt-4o";

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

// Lightweight structured log per AI call. No raw PII — step, model, timing,
// outcome only. (Swap for the `ai_logs` table when persistence lands.)
function logCall(step: string, durationMs: number, err: unknown, attempt: number) {
  const base = { step, model: MODEL, duration_ms: durationMs, attempt };
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
}

/**
 * Single entry point for every AI stage. Uses OpenAI Structured Outputs so the
 * response is guaranteed to match `schema` at the API layer; retries once on
 * failure, then surfaces a clean error.
 */
export async function callStructured<T>(args: CallArgs<T>): Promise<T> {
  const { step, system, user, schema, schemaName, temperature = 0.3, maxTokens = 4096 } = args;

  let lastErr: unknown;
  for (let attempt = 1; attempt <= 2; attempt++) {
    const start = Date.now();
    try {
      const completion = await client().beta.chat.completions.parse({
        model: MODEL,
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

      logCall(step, Date.now() - start, null, attempt);
      return parsed;
    } catch (err) {
      lastErr = err;
      logCall(step, Date.now() - start, err, attempt);
    }
  }
  throw new Error(`AI step "${step}" failed after retry: ${errMessage(lastErr)}`);
}
