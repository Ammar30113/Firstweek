import Link from "next/link";
import type { Metadata } from "next";
import { LEGAL, LegalShell, Section, P, UL, LI, MailLink } from "@/components/legal";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How FirstWeek collects, uses, and protects your data.",
  alternates: { canonical: `${LEGAL.siteUrl}/privacy` },
};

export default function PrivacyPage() {
  return (
    <LegalShell
      title="Privacy Policy"
      intro={`This policy explains what ${LEGAL.product} collects, why, who we share it with, and the choices you have. By using ${LEGAL.product} you agree to this policy.`}
    >
      <Section heading="Who we are">
        <P>
          {LEGAL.product} (&ldquo;we&rdquo;, &ldquo;us&rdquo;) provides a job-readiness simulation tool that lets you
          practice the work of a role and receive a readiness report. You can reach us any time at <MailLink />.
        </P>
      </Section>

      <Section heading="Information we collect">
        <UL>
          <LI>
            <strong>Account information</strong> — your email address and a password (stored only as a secure hash by
            our authentication provider).
          </LI>
          <LI>
            <strong>Content you provide</strong> — the job postings, resume / profile text, and the responses you write
            for simulation tasks. This content may contain personal and professional information about you.
          </LI>
          <LI>
            <strong>Generated data</strong> — the analyses, scores, and readiness reports we produce from your inputs.
          </LI>
          <LI>
            <strong>Billing information</strong> — if you subscribe, our payment providers process your payment. We do
            not store your full card details.
          </LI>
          <LI>
            <strong>Usage &amp; device data</strong> — privacy-friendly, aggregate analytics (page views, performance)
            collected without third-party advertising cookies.
          </LI>
        </UL>
      </Section>

      <Section heading="Cookies">
        <P>
          We use strictly-necessary cookies to keep you signed in. Our analytics are cookieless and do not track you
          across other sites. We do not use advertising cookies.
        </P>
      </Section>

      <Section heading="How we use your information">
        <UL>
          <LI>To provide the service — analyze a role, profile your experience, generate tasks, and score your work.</LI>
          <LI>To save your assessments so you can return to them.</LI>
          <LI>To operate billing, prevent abuse, and enforce usage limits.</LI>
          <LI>To provide support and respond to your requests.</LI>
          <LI>To maintain security and improve the product.</LI>
        </UL>
        <P>
          We do <strong>not</strong> sell your personal information, and we do not use your resume or responses to train
          third-party AI models for unrelated purposes.
        </P>
      </Section>

      <Section heading="AI processing and the providers we use">
        <P>
          To generate your analysis and assessment, we send the job posting, your resume / profile text, and your task
          responses to our AI provider for processing. We share data with the following sub-processors solely to operate
          the service:
        </P>
        <UL>
          <LI>
            <strong>OpenAI</strong> — generates the role analysis, simulations, evaluation, and report from the content
            you provide.
          </LI>
          <LI>
            <strong>Supabase</strong> — database, authentication, and storage of your account and assessments.
          </LI>
          <LI>
            <strong>Vercel</strong> — application hosting and privacy-friendly analytics.
          </LI>
          <LI>
            <strong>RevenueCat and Stripe</strong> — subscription management and payment processing (only if you
            subscribe).
          </LI>
          <LI>
            <strong>Expo / EAS</strong> — builds and distributes our mobile app.
          </LI>
        </UL>
      </Section>

      <Section heading="Data retention">
        <P>
          We keep your account and assessment data while your account is active. You can ask us to delete your account
          and associated data at any time by emailing <MailLink /> — we will delete it within a reasonable period,
          except where we must retain limited records for legal, security, or billing reasons.
        </P>
      </Section>

      <Section heading="Your rights">
        <P>
          Depending on where you live (including under GDPR and the CCPA/CPRA), you may have the right to access,
          correct, export, or delete your personal information, and to object to or restrict certain processing. To
          exercise any of these, contact <MailLink />. We will not discriminate against you for exercising your rights.
        </P>
      </Section>

      <Section heading="Security">
        <P>
          We protect your data with encryption in transit, row-level access controls so users can only reach their own
          records, and server-side handling of secrets. No system is perfectly secure, but we work to safeguard your
          information.
        </P>
      </Section>

      <Section heading="International transfers">
        <P>
          Our providers may process and store data in the United States and other countries. Where required, we rely on
          appropriate safeguards for these transfers.
        </P>
      </Section>

      <Section heading="Children">
        <P>{LEGAL.product} is not intended for anyone under 16, and we do not knowingly collect their data.</P>
      </Section>

      <Section heading="Changes to this policy">
        <P>
          We may update this policy as the product evolves. We will revise the &ldquo;last updated&rdquo; date above and,
          for material changes, take reasonable steps to notify you.
        </P>
      </Section>

      <Section heading="Contact">
        <P>
          Questions about your privacy? Email <MailLink />. See also our{" "}
          <Link href="/terms" className="font-medium text-brand-600 hover:underline">
            Terms of Service
          </Link>
          .
        </P>
      </Section>
    </LegalShell>
  );
}
