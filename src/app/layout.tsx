import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FirstWeek — Simulate the job before you apply",
  description:
    "Paste a job posting and your resume, complete realistic work simulations, and get a readiness report showing whether you can actually perform the role.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
