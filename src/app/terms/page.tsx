import Link from "next/link";
import type { Metadata } from "next";
import { LEGAL, LegalShell, Section, P, UL, LI, MailLink } from "@/components/legal";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that govern your use of FirstWeek.",
  alternates: { canonical: `${LEGAL.siteUrl}/terms` },
};

export default function TermsPage() {
  return (
    <LegalShell
      title="Terms of Service"
      intro={`These terms are an agreement between you and ${LEGAL.product}. By creating an account or using the service, you agree to them. If you don't agree, please don't use ${LEGAL.product}.`}
    >
      <Section heading="What FirstWeek is — and isn't">
        <P>
          {LEGAL.product} generates <strong>simulation-based readiness estimates</strong> to help you self-assess
          whether you can perform a role. It is an informational, self-assessment tool only.
        </P>
        <UL>
          <LI>
            It does <strong>not guarantee</strong> any interview, job offer, hire, or employment outcome.
          </LI>
          <LI>It is not professional career, legal, financial, or psychological advice.</LI>
          <LI>
            It is not designed or authorized to be used by employers to screen, rank, or make hiring decisions about
            other people.
          </LI>
        </UL>
        <P>
          Scores and reports are AI-generated estimates that can be incomplete or wrong. You are responsible for your own
          decisions.
        </P>
      </Section>

      <Section heading="Your account">
        <P>
          You must be at least 16 and provide accurate information. You are responsible for activity under your account
          and for keeping your credentials secure. Tell us promptly at <MailLink /> if you suspect unauthorized use.
        </P>
      </Section>

      <Section heading="Acceptable use">
        <UL>
          <LI>Don&apos;t use the service for anything unlawful, harmful, or abusive.</LI>
          <LI>Don&apos;t upload other people&apos;s personal or confidential information without the right to do so.</LI>
          <LI>Don&apos;t scrape, reverse-engineer, overload, or attempt to bypass usage limits or security.</LI>
          <LI>Don&apos;t resell or misrepresent the service or its outputs.</LI>
        </UL>
      </Section>

      <Section heading="Your content">
        <P>
          You keep ownership of the content you provide (job postings, resume text, and responses). You grant us a
          limited license to process and store that content solely to operate the service for you, as described in our{" "}
          <Link href="/privacy" className="font-medium text-brand-600 hover:underline">
            Privacy Policy
          </Link>
          . You are responsible for ensuring you have the right to submit it.
        </P>
      </Section>

      <Section heading="Subscriptions and billing">
        <UL>
          <LI>
            {LEGAL.product} offers a free tier and a paid <strong>Pro</strong> subscription. Pricing is shown on our{" "}
            <Link href="/pricing" className="font-medium text-brand-600 hover:underline">
              pricing page
            </Link>
            .
          </LI>
          <LI>
            Subscriptions renew automatically each period until cancelled. You can cancel any time; access continues
            until the end of the paid period.
          </LI>
          <LI>
            Payments are handled by our payment providers (and, for in-app purchases, the relevant app store). Refunds
            follow the applicable provider&apos;s policy and any rights you have under local law.
          </LI>
          <LI>We may change prices or plans prospectively, with notice for active subscribers.</LI>
        </UL>
      </Section>

      <Section heading="Intellectual property">
        <P>
          The service, including its software, design, and content (excluding your content), belongs to {LEGAL.product}
          and is protected by law. We grant you a limited, non-exclusive, non-transferable right to use it under these
          terms.
        </P>
      </Section>

      <Section heading="Disclaimers">
        <P>
          The service is provided &ldquo;as is&rdquo; and &ldquo;as available,&rdquo; without warranties of any kind,
          express or implied, including merchantability, fitness for a particular purpose, accuracy, and
          non-infringement. We do not warrant that outputs are accurate or that the service will be uninterrupted or
          error-free.
        </P>
      </Section>

      <Section heading="Limitation of liability">
        <P>
          To the maximum extent permitted by law, {LEGAL.product} will not be liable for any indirect, incidental,
          special, consequential, or punitive damages, or for lost opportunities, profits, or data, arising from your use
          of the service. Our total liability for any claim will not exceed the greater of the amount you paid us in the
          12 months before the claim or US&nbsp;$50.
        </P>
      </Section>

      <Section heading="Indemnification">
        <P>
          You agree to indemnify {LEGAL.product} from claims arising out of your content, your use of the service, or
          your breach of these terms.
        </P>
      </Section>

      <Section heading="Termination">
        <P>
          You may stop using {LEGAL.product} at any time. We may suspend or terminate access if you violate these terms
          or to protect the service. You can request deletion of your account by emailing <MailLink />.
        </P>
      </Section>

      <Section heading="Governing law">
        <P>
          These terms are governed by the laws of {LEGAL.jurisdiction}, without regard to conflict-of-laws rules. Any
          disputes will be resolved in the courts located there, unless local law gives you a non-waivable right to
          proceed elsewhere.
        </P>
      </Section>

      <Section heading="Changes">
        <P>
          We may update these terms as the product evolves. We&apos;ll update the date above and, for material changes,
          take reasonable steps to notify you. Continued use means you accept the updated terms.
        </P>
      </Section>

      <Section heading="Contact">
        <P>
          Questions about these terms? Email <MailLink />.
        </P>
      </Section>
    </LegalShell>
  );
}
