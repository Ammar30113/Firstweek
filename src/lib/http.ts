import { NextResponse } from "next/server";

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function serverError(err: unknown) {
  const message = err instanceof Error ? err.message : "Unexpected error";
  console.error("[api]", message);
  return NextResponse.json({ error: message }, { status: 500 });
}
