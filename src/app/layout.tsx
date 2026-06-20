import type { Metadata } from "next";
import Link from "next/link";
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
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="en">
      <body className="min-h-screen">
        <nav className="no-print sticky top-0 z-10 border-b border-stone-200/70 bg-stone-50/80 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3">
            <div className="flex items-center gap-5">
              <Link href="/" className="flex items-center gap-2 font-extrabold tracking-tight">
                <span className="inline-block h-5 w-5 rounded-md bg-brand-600" />
                FirstWeek
              </Link>
              <Link href="/story" className="text-sm text-stone-500 hover:text-stone-900">
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
      </body>
    </html>
  );
}
