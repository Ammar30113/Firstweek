import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchJobPosting, JobFetchError } from "@/lib/ingest/job-url";

export const runtime = "nodejs";
export const maxDuration = 20;

// Fetches a job posting URL and returns clean-ish text to pre-fill the
// job-description field. Auth-gated: the server makes an outbound request on
// the user's behalf, so we don't expose it anonymously. Extraction lives in
// the lib (with SSRF guards); this route is just auth + shape + error mapping.
export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const url = String(body?.url || "").trim();
    if (!url) return NextResponse.json({ error: "url is required" }, { status: 400 });
    if (url.length > 2048) return NextResponse.json({ error: "That URL is too long." }, { status: 400 });

    const result = await fetchJobPosting(url);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof JobFetchError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    // Log details server-side; return a generic message so internals don't leak.
    console.error("[api/job/fetch]", err instanceof Error ? err.message : err);
    return NextResponse.json(
      { error: "Couldn't import that URL. Paste the description instead." },
      { status: 500 },
    );
  }
}
