import type { ReactNode } from "react";
import Link from "next/link";

// Warm & human design-system primitives — usable in server and client components.

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={
        "rounded-2xl border border-stone-200/80 bg-white p-5 shadow-[0_1px_3px_rgba(40,30,20,0.04)] " +
        className
      }
    >
      {children}
    </div>
  );
}

const TONES: Record<string, string> = {
  stone: "bg-stone-100 text-stone-700",
  brand: "bg-brand-100 text-brand-700",
  rose: "bg-rose-100 text-rose-700",
  amber: "bg-amber-100 text-amber-800",
  emerald: "bg-emerald-100 text-emerald-700",
};

export function Chip({ children, tone = "stone" }: { children: ReactNode; tone?: string }) {
  return (
    <span
      className={
        "inline-block rounded-full px-2.5 py-0.5 text-xs font-medium " + (TONES[tone] || TONES.stone)
      }
    >
      {children}
    </span>
  );
}

export function H({ children }: { children: ReactNode }) {
  return (
    <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-stone-400">{children}</h3>
  );
}

type BtnProps = {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "ghost";
  type?: "button" | "submit";
  className?: string;
};

export function Button({
  children,
  href,
  onClick,
  disabled,
  variant = "primary",
  type = "button",
  className = "",
}: BtnProps) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed";
  const styles =
    variant === "primary"
      ? "bg-brand-600 text-white shadow-sm hover:bg-brand-700"
      : "border border-stone-300 text-stone-700 hover:bg-stone-100";
  const cls = `${base} ${styles} ${className}`;
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls}>
      {children}
    </button>
  );
}

export function impTone(importance: string) {
  if (importance === "critical") return "rose";
  if (importance === "important") return "amber";
  return "stone";
}

export function bandTone(band: string) {
  if (band === "Excellent Fit" || band === "Strong Fit") return "emerald";
  if (band === "Viable Fit") return "brand";
  if (band === "Stretch Role") return "amber";
  return "rose";
}
