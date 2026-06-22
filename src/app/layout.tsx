import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { createClient } from "@/lib/supabase/server";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const description =
  "Paste a job posting and your resume, complete realistic work simulations, and get a readiness report showing whether you can actually perform the role.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "FirstWeek — Simulate the job before you apply",
    template: "%s · FirstWeek",
  },
  description,
  openGraph: {
    title: "FirstWeek — Simulate the job before you apply",
    description,
    url: siteUrl,
    siteName: "FirstWeek",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "FirstWeek", description },
  applicationName: "FirstWeek",
  appleWebApp: { capable: true, title: "FirstWeek", statusBarStyle: "default" },
  // Set GOOGLE_SITE_VERIFICATION in Vercel once you add the property in Search Console.
  verification: { google: process.env.GOOGLE_SITE_VERIFICATION },
};

export const viewport: Viewport = {
  themeColor: "#c8472a",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="en">
      <body className="min-h-screen">
        <nav className="no-print sticky top-0 z-30 border-b border-stone-200/60 bg-cream-50/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2.5">
                <span className="grid h-6 w-6 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-[11px] font-bold text-white shadow-[0_2px_8px_-2px_rgba(200,71,42,0.6)]">
                  F
                </span>
                <span className="font-display text-lg font-semibold tracking-tight text-stone-900">FirstWeek</span>
              </Link>
              <Link href="/guides" className="hidden text-sm text-stone-500 transition hover:text-stone-900 sm:inline">
                Guides
              </Link>
              <Link href="/pricing" className="text-sm text-stone-500 transition hover:text-stone-900">
                Pricing
              </Link>
              <Link href="/story" className="hidden text-sm text-stone-500 transition hover:text-stone-900 sm:inline">
                Story
              </Link>
            </div>
            {user ? (
              <div className="flex items-center gap-4 text-sm">
                <Link href="/dashboard" className="text-stone-600 hover:text-stone-900">
                  Dashboard
                </Link>
                <Link href="/assessment" className="text-stone-600 hover:text-stone-900">
                  New
                </Link>
                <span className="hidden text-stone-400 sm:inline">{user.email}</span>
                <form action="/auth/signout" method="post">
                  <button className="rounded-lg border border-stone-300 px-3 py-1 font-medium text-stone-700 hover:bg-stone-100">
                    Sign out
                  </button>
                </form>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-sm">
                <Link href="/login" className="font-medium text-stone-600 hover:text-stone-900">
                  Sign in
                </Link>
                <Link
                  href="/login"
                  className="rounded-xl bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-700"
                >
                  Start free
                </Link>
              </div>
            )}
          </div>
        </nav>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
