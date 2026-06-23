"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const LINKS = [
  { href: "/guides", label: "Guides" },
  { href: "/pricing", label: "Pricing" },
  { href: "/story", label: "Story" },
  { href: "/support", label: "Support" },
];

// Mobile-only slide-out menu (a clean sidebar instead of cramming links into the
// top bar). Desktop keeps the inline nav in the layout.
export function MobileNav({ loggedIn, email }: { loggedIn: boolean; email: string | null }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  // Lock background scroll while the drawer is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const navLinks = loggedIn
    ? [{ href: "/dashboard", label: "Dashboard" }, { href: "/assessment", label: "New assessment" }, ...LINKS]
    : LINKS;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="grid h-9 w-9 place-items-center rounded-lg text-stone-700 transition hover:bg-stone-100"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <path d="M3 6h14M3 10h14M3 14h14" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          <button aria-label="Close menu" onClick={close} className="absolute inset-0 bg-ink-950/40 backdrop-blur-sm" />
          <div className="absolute right-0 top-0 flex h-full w-[80%] max-w-xs flex-col bg-cream-50 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-200/70 px-5 py-3.5">
              <span className="font-display text-lg font-semibold tracking-tight text-stone-900">FirstWeek</span>
              <button
                onClick={close}
                aria-label="Close menu"
                className="grid h-9 w-9 place-items-center rounded-lg text-stone-500 transition hover:bg-stone-100"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M4 4l10 10M14 4L4 14" />
                </svg>
              </button>
            </div>

            <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
              {navLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={close}
                  className="rounded-lg px-3 py-2.5 text-[15px] font-medium text-stone-700 transition hover:bg-stone-100"
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            <div className="border-t border-stone-200/70 p-4">
              {loggedIn ? (
                <>
                  {email && <p className="mb-3 truncate px-1 text-xs text-stone-400">{email}</p>}
                  <form action="/auth/signout" method="post">
                    <button className="w-full rounded-xl border border-stone-300 py-2.5 text-sm font-semibold text-stone-700 transition hover:bg-stone-100">
                      Sign out
                    </button>
                  </form>
                </>
              ) : (
                <div className="space-y-2">
                  <Link
                    href="/login"
                    onClick={close}
                    className="block rounded-xl bg-brand-600 py-2.5 text-center text-sm font-semibold text-white shadow-[0_6px_16px_-6px_rgba(200,71,42,0.6)] transition hover:bg-brand-500"
                  >
                    Start free
                  </Link>
                  <Link
                    href="/login"
                    onClick={close}
                    className="block rounded-xl border border-stone-300 py-2.5 text-center text-sm font-medium text-stone-700 transition hover:bg-stone-50"
                  >
                    Sign in
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
