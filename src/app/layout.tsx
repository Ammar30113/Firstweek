import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "FirstWeek — Simulate the job before you apply",
  description:
    "Paste a job posting and your resume, complete realistic work simulations, and get a readiness report showing whether you can actually perform the role.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="en">
      <body className="min-h-screen">
        <nav className="no-print border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-3">
            <div className="flex items-center gap-4">
              <Link href="/" className="font-bold tracking-tight">
                FirstWeek
              </Link>
              <Link href="/story" className="text-sm text-slate-500 hover:text-slate-900">
                Story
              </Link>
            </div>
            {user ? (
              <div className="flex items-center gap-4 text-sm">
                <Link href="/dashboard" className="text-slate-600 hover:text-slate-900">
                  Dashboard
                </Link>
                <Link href="/" className="text-slate-600 hover:text-slate-900">
                  New
                </Link>
                <span className="hidden text-slate-400 sm:inline">{user.email}</span>
                <form action="/auth/signout" method="post">
                  <button className="rounded-md border border-slate-300 px-3 py-1 font-medium text-slate-700 hover:bg-slate-100">
                    Sign out
                  </button>
                </form>
              </div>
            ) : (
              <Link href="/login" className="text-sm font-medium text-blue-600 hover:underline">
                Sign in
              </Link>
            )}
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
