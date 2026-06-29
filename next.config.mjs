import { fileURLToPath } from "node:url";
import path from "node:path";

// Content-Security-Policy. 'unsafe-inline'/'unsafe-eval' are required by Next's
// inline bootstrap and some payment SDKs, so script-src isn't airtight — the real
// value is the locked-down connect/frame/object allowlist (data exfil + clickjack
// defense). Origins: Supabase, RevenueCat + Stripe (checkout), Vercel insights,
// Google Fonts. Tighten script-src to nonces later if desired.
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "img-src 'self' data: https:",
  "font-src 'self' https://fonts.gstatic.com data:",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.stripe.com https://*.stripe.network https://*.revenuecat.com",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.revenuecat.com https://*.revenuecat.com https://*.stripe.com https://*.stripe.network https://vitals.vercel-insights.com",
  "frame-src 'self' https://*.stripe.com https://*.stripe.network https://*.revenuecat.com",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pin file-tracing to this project (a stray lockfile in the home dir would
  // otherwise be inferred as the workspace root).
  outputFileTracingRoot: path.dirname(fileURLToPath(import.meta.url)),
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
