import { type NextRequest, NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

// Email-confirmation / magic-link callback. Supabase sends the user here with
// token_hash + type; verifyOtp validates it, sets the session cookie, and we
// redirect into the app. Required before re-enabling email confirmation in
// Supabase Auth — without this handler the confirmation link goes nowhere.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  // Only allow same-origin relative redirects (no open redirect via ?next=).
  const nextParam = searchParams.get("next");
  const next =
    nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//")
      ? nextParam
      : "/assessment";

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) return NextResponse.redirect(new URL(next, origin));
  }
  return NextResponse.redirect(new URL("/login?error=confirmation", origin));
}
