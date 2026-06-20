import { AsyncLocalStorage } from "node:async_hooks";

// Per-request context so AI-call logging can attribute cost to a user/assessment
// without threading params through every stage function.
export interface AiCtx {
  userId?: string | null;
  assessmentId?: string | null;
}

export const aiContext = new AsyncLocalStorage<AiCtx>();
