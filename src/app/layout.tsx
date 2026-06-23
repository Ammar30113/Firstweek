import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { createClient } from "@/lib/supabase/server";
import { MobileNav } from "@/components/nav";

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
                <span className="inline-flex h-7 w-7 flex-col overflow-hidden rounded-lg shadow-[0_2px_8px_-2px_rgba(200,71,42,0.6)]">
                  <span className="block h-[8px] w-full bg-gradient-to-r from-ember-300 via-brand-400 to-brand-700" />
                  <span className="flex flex-1 items-center justify-center bg-ink-900 font-display text-[13px] font-semibold text-cream-50">1</span>
                </span>
                <span className="font-display text-lg font-semibold tracking-tight text-stone-900">FirstWeek</span>
              </Link>
              <div className="hidden items-center gap-6 sm:flex">
                <Link href="/guides" className="text-sm text-stone-500 transition hover:text-stone-900">
                  Guides
                </Link>
                <Link href="/pricing" className="text-sm text-stone-500 transition hover:text-stone-900">
                  Pricing
                </Link>
                <Link href="/story" className="text-sm text-stone-500 transition hover:text-stone-900">
                  Story
                </Link>
              </div>
            </div>

            {/* desktop: auth actions */}
            <div className="hidden sm:block">
              {user ? (
                <div className="flex items-center gap-4 text-sm">
                  <Link href="/dashboard" className="text-stone-600 hover:text-stone-900">
                    Dashboard
                  </Link>
                  <Link href="/assessment" className="text-stone-600 hover:text-stone-900">
                    New
                  </Link>
                  <span className="hidden text-stone-400 lg:inline">{user.email}</span>
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

            {/* mobile: hamburger → slide-out menu */}
            <div className="sm:hidden">
              <MobileNav loggedIn={!!user} email={user?.email ?? null} />
            </div>
          </div>
        </nav>
        {children}

        <footer className="no-print border-t border-stone-200/60 bg-cream-50">
          <div className="mx-auto max-w-6xl px-5 py-12">
            <div className="grid gap-8 sm:grid-cols-[1.6fr_1fr_1fr]">
              <div>
                <Link href="/" className="flex items-center gap-2.5">
                  <span className="inline-flex h-6 w-6 flex-col overflow-hidden rounded-md">
                    <span className="block h-[7px] w-full bg-gradient-to-r from-ember-300 via-brand-400 to-brand-700" />
                    <span className="flex flex-1 items-center justify-center bg-ink-900 font-display text-[11px] font-semibold text-cream-50">1</span>
                  </span>
                  <span className="font-display text-base font-semibold tracking-tight text-stone-900">FirstWeek</span>
                </Link>
                <p className="mt-3 max-w-xs text-sm leading-relaxed text-stone-500">
                  Simulate the job before you apply — and get an honest readiness report.
                </p>
              </div>
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-stone-400">Product</h4>
                <ul className="mt-3 space-y-2 text-sm text-stone-600">
                  <li><Link href="/guides" className="transition hover:text-stone-900">Guides</Link></li>
                  <li><Link href="/pricing" className="transition hover:text-stone-900">Pricing</Link></li>
                  <li><Link href="/story" className="transition hover:text-stone-900">Story</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-stone-400">Company</h4>
                <ul className="mt-3 space-y-2 text-sm text-stone-600">
                  <li><Link href="/support" className="transition hover:text-stone-900">Support</Link></li>
                  <li><Link href="/privacy" className="transition hover:text-stone-900">Privacy</Link></li>
                  <li><Link href="/terms" className="transition hover:text-stone-900">Terms</Link></li>
                </ul>
              </div>
            </div>
            <div className="mt-10 border-t border-stone-200/60 pt-6 text-xs leading-relaxed text-stone-400">
              FirstWeek produces a simulation-based readiness estimate for self-assessment. It does not guarantee
              employment, interviews, or job outcomes. © 2026 FirstWeek.
            </div>
          </div>
        </footer>

        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
