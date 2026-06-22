import type { ReactNode } from "react";

// Centralized legal details. TODO(founder): confirm these before launch —
// contactEmail must be a monitored inbox (firstweekapp.vercel.app can't receive
// mail), and jurisdiction/entity should match your real legal setup.
export const LEGAL = {
  product: "FirstWeek",
  effectiveDate: "June 22, 2026",
  contactEmail: "support@firstweek.app",
  jurisdiction: "the United States",
  siteUrl: "https://firstweekapp.vercel.app",
};

export function LegalShell({
  title,
  intro,
  updated = LEGAL.effectiveDate,
  children,
}: {
  title: string;
  intro?: ReactNode;
  updated?: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-5 py-14">
      <h1 className="font-display text-4xl font-semibold tracking-tight text-stone-900">{title}</h1>
      <p className="mt-2 text-sm text-stone-400">Last updated {updated}</p>
      {intro && <p className="mt-5 text-lg leading-relaxed text-stone-700">{intro}</p>}
      <div className="mt-8 space-y-8">{children}</div>
    </div>
  );
}

export function Section({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="font-display text-xl font-semibold tracking-tight text-stone-900">{heading}</h2>
      {children}
    </section>
  );
}

export function P({ children }: { children: ReactNode }) {
  return <p className="text-[15px] leading-relaxed text-stone-700">{children}</p>;
}

export function UL({ children }: { children: ReactNode }) {
  return <ul className="space-y-2 text-[15px] leading-relaxed text-stone-700">{children}</ul>;
}

export function LI({ children }: { children: ReactNode }) {
  return (
    <li className="flex gap-2.5">
      <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-cove-400" />
      <span>{children}</span>
    </li>
  );
}

export function MailLink() {
  return (
    <a href={`mailto:${LEGAL.contactEmail}`} className="font-medium text-brand-600 hover:underline">
      {LEGAL.contactEmail}
    </a>
  );
}
