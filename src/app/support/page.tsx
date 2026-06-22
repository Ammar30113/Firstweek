import Link from "next/link";
import type { Metadata } from "next";
import { LEGAL, LegalShell, Section, P, MailLink } from "@/components/legal";

export const metadata: Metadata = {
  title: "Support",
  description: "Get help with FirstWeek — contact us and find answers to common questions.",
  alternates: { canonical: `${LEGAL.siteUrl}/support` },
};

const FAQ = [
  {
    q: "What is FirstWeek?",
    a: "Paste a job posting and your resume, do a few realistic tasks from the role, and get an honest readiness report with your strengths, gaps, and fit. It helps you find out whether you can actually do a job before you apply.",
  },
  {
    q: "Is it free?",
    a: "You can run your first assessment free. Pro unlocks unlimited simulations — see the pricing page for details.",
  },
  {
    q: "How accurate are the scores?",
    a: "The reports are AI-generated estimates meant for self-assessment. They're a useful signal, not a guarantee of any job outcome — treat them as guidance, not a verdict.",
  },
  {
    q: "How do I cancel Pro?",
    a: "You can cancel any time from your account or the store you subscribed through; your access continues until the end of the paid period.",
  },
  {
    q: "How do I delete my account and data?",
    a: "Email us and we'll delete your account and associated data within a reasonable period.",
  },
  {
    q: "Is my resume kept private?",
    a: "We use your content only to generate your assessment and never sell it. See the Privacy Policy for the full details, including the providers we use.",
  },
];

export default function SupportPage() {
  return (
    <LegalShell
      title="Support"
      intro={
        <>
          Need a hand? Email <MailLink /> and we&apos;ll get back to you. We aim to respond within a few business days.
        </>
      }
    >
      <Section heading="Frequently asked questions">
        <div className="divide-y divide-stone-200/70">
          {FAQ.map((f) => (
            <div key={f.q} className="py-4">
              <h3 className="font-semibold text-stone-900">{f.q}</h3>
              <p className="mt-1.5 text-[15px] leading-relaxed text-stone-700">{f.a}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section heading="More">
        <P>
          Read our{" "}
          <Link href="/privacy" className="font-medium text-brand-600 hover:underline">
            Privacy Policy
          </Link>{" "}
          and{" "}
          <Link href="/terms" className="font-medium text-brand-600 hover:underline">
            Terms of Service
          </Link>
          , or start a simulation from the{" "}
          <Link href="/" className="font-medium text-brand-600 hover:underline">
            home page
          </Link>
          .
        </P>
      </Section>
    </LegalShell>
  );
}
