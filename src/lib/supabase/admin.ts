import { createClient } from "@supabase/supabase-js";

// Service-role client — bypasses RLS. SERVER-ONLY. Used for privileged writes
// such as ai_logs (which has no client-facing RLS policy). Never import this
// into a client component.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
