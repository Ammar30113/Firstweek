import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isPro } from "@/lib/billing/entitlement";

export const runtime = "nodejs";

// Lets the client confirm the "pro" entitlement has synced (after a purchase,
// the webhook updates the DB asynchronously) before entering the gated app.
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ pro: false }, { status: 401 });
  try {
    return NextResponse.json({ pro: await isPro(user.id) });
  } catch {
    return NextResponse.json({ pro: false });
  }
}
