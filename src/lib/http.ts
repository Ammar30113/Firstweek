import { NextResponse } from "next/server";

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function serverError(err: unknown) {
  // Log the real error server-side; return a generic message so internal
  // details (DB/OpenAI/table names, missing-key strings) never reach the client.
  const message = err instanceof Error ? err.message : String(err);
  console.error("[api]", message);
  return NextResponse.json(
    { error: "Something went wrong. Please try again." },
    { status: 500 },
  );
}
