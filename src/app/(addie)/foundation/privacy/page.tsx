// /foundation/privacy — Privacy Policy for the ADDIE Foundation Course
// experience. Plain, scannable, contract-grade — never marketing.
//
// NOTE FOR OPERATOR: main also ships a top-level /privacy page. This page
// is net-new under (addie)/foundation/ and is purpose-built for the ADDIE
// course product (sandbox, Toolbox, sub-processors specific to the course
// surface). You may want to either (a) keep both and link the course
// footer to this one, or (b) collapse the two into a single canonical
// /privacy and redirect. Do not silently delete either — that decision is
// the operator's. Wiring of the AddieFooter link is left for the
// consolidation commit.
//
// Sub-processor + retention content tracks
// docs/Foundation-Course-ADDIE/AiBI_Security_Privacy_Spec.md.

import type { Metadata } from 'next';
import Link from 'next/link';
import {
  LegalShell,
  LegalSection,
  LegalToc,
} from '@/components/addie/legal/LegalShell';

const LAST_UPDATED = '2026-05-23';

const PRIVACY_EMAIL =
  process.env.PRIVACY_CONTACT_EMAIL ?? 'privacy@aibankinginstitute.com';

export const metadata: Metadata = {
  title: 'Privacy Policy · Foundation Course',
  description:
    'How The AI Banking Institute collects, uses, retains, and protects the data you provide when using the Foundation Course, Toolbox, sandbox, and Readiness Assessment.',
  alternates: { canonical: '/foundation/privacy' },
  robots: { index: true, follow: true },
};

const TOC = [
  { id: 'who-we-are', label: 'Who we are' },
  { id: 'what-we-collect', label: 'What we collect' },
  { id: 'why', label: 'Why we collect it' },
  { id: 'sub-processors', label: 'Who we share with' },
  { id: 'retention', label: 'How long we keep it' },
  { id: 'transfers', label: 'International transfers' },
  { id: 'rights', label: 'Your rights' },
  { id: 'cookies', label: 'Cookies' },
  { id: 'children', label: 'Children' },
  { id: 'changes', label: 'Changes to this policy' },
  { id: 'governing-law', label: 'Governing law' },
];

interface SubProcessorRow {
  readonly name: string;
  readonly purpose: string;
  readonly region: string;
  readonly dpa: string;
}

const SUB_PROCESSORS: readonly SubProcessorRow[] = [
  {
    name: 'Supabase',
    purpose: 'Authentication, database, file storage',
    region: 'United States (AWS us-east-1)',
    dpa: 'https://supabase.com/legal/dpa',
  },
  {
    name: 'Vercel',
    purpose: 'Application hosting and content delivery',
    region: 'Global edge; primary processing United States',
    dpa: 'https://vercel.com/legal/dpa',
  },
  {
    name: 'Anthropic',
    purpose: 'AI model inference (default sandbox provider)',
    region: 'United States',
    dpa: 'https://www.anthropic.com/legal/dpa',
  },
  {
    name: 'OpenAI',
    purpose: 'AI model inference (learner-selectable)',
    region: 'United States',
    dpa: 'https://openai.com/policies/data-processing-addendum',
  },
  {
    name: 'Google (Gemini)',
    purpose: 'AI model inference (learner-selectable)',
    region: 'United States',
    dpa: 'https://cloud.google.com/terms/data-processing-addendum',
  },
  {
    name: 'Stripe',
    purpose: 'Payment processing (PCI Level 1)',
    region: 'United States; international payment networks',
    dpa: 'https://stripe.com/legal/dpa',
  },
  {
    name: 'MailerLite',
    purpose: 'Email sequences, group routing, newsletter',
    region: 'European Union',
    dpa: 'https://www.mailerlite.com/legal/data-processing-agreement',
  },
  {
    name: 'Resend',
    purpose: 'Transactional email (receipts, course notifications)',
    region: 'United States',
    dpa: 'https://resend.com/legal/dpa',
  },
];

interface RetentionRow {
  readonly category: string;
  readonly period: string;
}

const RETENTION: readonly RetentionRow[] = [
  { category: 'Account record', period: 'While active; 12 months after deletion request' },
  { category: 'Course progress', period: '36 months from last activity' },
  { category: 'Toolbox artifacts', period: 'While account is active' },
  { category: 'Sandbox prompts and responses', period: '30 days, then aggregated' },
  { category: 'Payment records', period: '7 years (legal requirement)' },
  { category: 'Marketing subscription', period: 'Until opt-out' },
];

export default function FoundationPrivacyPage() {
  return (
    <LegalShell
      kicker="Legal"
      title="Privacy Policy"
      lede="How The AI Banking Institute collects, uses, retains, and protects the data you provide while using the Foundation Course, Toolbox, sandbox, and Readiness Assessment."
      lastUpdated={LAST_UPDATED}
    >
      <LegalToc items={TOC} />

      <LegalSection id="who-we-are" heading="1. Who we are">
        <p>
          The AI Banking Institute (&ldquo;the Institute,&rdquo; &ldquo;we,&rdquo; &ldquo;our&rdquo;) provides AI proficiency education
          built for community banks and credit unions. This policy describes how we handle
          information you provide when using the Foundation Course, Toolbox, sandbox, or
          Readiness Assessment.
        </p>
        <p>
          Questions or requests about this policy can be sent to{' '}
          <a
            href={`mailto:${PRIVACY_EMAIL}`}
            className="text-[var(--ledger-accent)] underline underline-offset-4"
          >
            {PRIVACY_EMAIL}
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection id="what-we-collect" heading="2. What we collect">
        <p>We collect only what the Service needs to function and to support your account.</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Account data.</strong> Email address, name, hashed password, your selected role
            track, and your marketing email opt-in choice.
          </li>
          <li>
            <strong>Course activity.</strong> Lesson views, knowledge-check answers, progress
            markers, and completion events.
          </li>
          <li>
            <strong>Toolbox artifacts.</strong> Documents and prompts you explicitly save. We do not
            inspect or analyze artifact content.
          </li>
          <li>
            <strong>Sandbox runs.</strong> The prompt text, the model response, and run metadata
            (token count, latency, provider). Retained 30 days, then aggregated. See &sect;5.
          </li>
          <li>
            <strong>Payment.</strong> Card details are held only by Stripe (PCI Level 1). We receive
            a Stripe customer identifier, the last four digits of the card, and the payment status.
            We never see or store full card numbers.
          </li>
          <li>
            <strong>Analytics.</strong> Aggregated event counts (page views, lesson completions,
            sandbox runs) without individual tracking or third-party advertising identifiers.
          </li>
          <li>
            <strong>Cookies.</strong> See the{' '}
            <Link
              href="/foundation/cookies"
              className="text-[var(--ledger-accent)] underline underline-offset-4"
            >
              Cookies Policy
            </Link>{' '}
            for the complete list and purposes.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="why" heading="3. Why we collect it (lawful basis)">
        <p>
          Under the EU and UK General Data Protection Regulation, we rely on the following legal
          bases:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Performance of a contract.</strong> Creating your account, recording your
            progress, processing payment, and delivering the Service you purchased.
          </li>
          <li>
            <strong>Legitimate interest.</strong> Aggregate analytics, abuse prevention, rate
            limiting, security logging, and operational support.
          </li>
          <li>
            <strong>Consent.</strong> Marketing email. You can withdraw consent at any time using
            the unsubscribe link in every marketing message or by writing to{' '}
            <a
              href={`mailto:${PRIVACY_EMAIL}`}
              className="text-[var(--ledger-accent)] underline underline-offset-4"
            >
              {PRIVACY_EMAIL}
            </a>
            .
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="sub-processors" heading="4. Who we share with">
        <p>
          We share information only with the sub-processors listed below, only for the purposes
          stated, and only under written data processing agreements. We do not sell personal
          information. We do not share data with advertising networks.
        </p>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-[var(--ledger-rule-strong)] text-left">
                <th scope="col" className="py-3 px-3 font-mono uppercase tracking-[0.14em] text-[0.65rem] text-[var(--ledger-muted)]">
                  Sub-processor
                </th>
                <th scope="col" className="py-3 px-3 font-mono uppercase tracking-[0.14em] text-[0.65rem] text-[var(--ledger-muted)]">
                  Purpose
                </th>
                <th scope="col" className="py-3 px-3 font-mono uppercase tracking-[0.14em] text-[0.65rem] text-[var(--ledger-muted)]">
                  Region
                </th>
                <th scope="col" className="py-3 px-3 font-mono uppercase tracking-[0.14em] text-[0.65rem] text-[var(--ledger-muted)]">
                  DPA
                </th>
              </tr>
            </thead>
            <tbody>
              {SUB_PROCESSORS.map((sp) => (
                <tr key={sp.name} className="border-b border-[var(--ledger-rule)] align-top">
                  <td className="py-3 px-3 font-semibold text-[var(--ledger-ink)]">{sp.name}</td>
                  <td className="py-3 px-3 text-[var(--ledger-ink-2)]">{sp.purpose}</td>
                  <td className="py-3 px-3 text-[var(--ledger-ink-2)]">{sp.region}</td>
                  <td className="py-3 px-3">
                    <a
                      href={sp.dpa}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[var(--ledger-accent)] underline underline-offset-4 break-all"
                    >
                      Link
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </LegalSection>

      <LegalSection id="retention" heading="5. How long we keep it">
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-[var(--ledger-rule-strong)] text-left">
                <th scope="col" className="py-3 px-3 font-mono uppercase tracking-[0.14em] text-[0.65rem] text-[var(--ledger-muted)]">
                  Category
                </th>
                <th scope="col" className="py-3 px-3 font-mono uppercase tracking-[0.14em] text-[0.65rem] text-[var(--ledger-muted)]">
                  Retention period
                </th>
              </tr>
            </thead>
            <tbody>
              {RETENTION.map((row) => (
                <tr key={row.category} className="border-b border-[var(--ledger-rule)] align-top">
                  <td className="py-3 px-3 font-semibold text-[var(--ledger-ink)]">{row.category}</td>
                  <td className="py-3 px-3 text-[var(--ledger-ink-2)]">{row.period}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Aggregated sandbox data after 30 days contains no prompt or response text and no
          identifier that links back to a learner. We retain it only for capacity planning.
        </p>
      </LegalSection>

      <LegalSection id="transfers" heading="6. International transfers">
        <p>
          Primary infrastructure is hosted in the United States. Where personal data is transferred
          out of the European Economic Area or the United Kingdom, the transfer is governed by the
          Standard Contractual Clauses adopted by the European Commission (and the UK International
          Data Transfer Addendum where applicable).
        </p>
      </LegalSection>

      <LegalSection id="rights" heading="7. Your rights">
        <p>
          Depending on where you live, you have the right to access, correct, delete, restrict, or
          object to our processing of your personal data, and to ask for your data in a portable
          format. California residents have parallel rights under the CCPA, including the right to
          know and the right to delete. We do not sell personal information for CCPA purposes.
        </p>
        <p>To exercise any of these rights:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            Email{' '}
            <a
              href={`mailto:${PRIVACY_EMAIL}`}
              className="text-[var(--ledger-accent)] underline underline-offset-4"
            >
              {PRIVACY_EMAIL}
            </a>
            , or
          </li>
          <li>
            Use the self-service tools at{' '}
            <Link
              href="/account/export"
              className="text-[var(--ledger-accent)] underline underline-offset-4"
            >
              /account/export
            </Link>{' '}
            and{' '}
            <Link
              href="/account/delete"
              className="text-[var(--ledger-accent)] underline underline-offset-4"
            >
              /account/delete
            </Link>
            .
          </li>
        </ul>
        <p>
          We respond to verified requests within 30 days. There is no charge for exercising your
          rights unless a request is manifestly unfounded or excessive.
        </p>
      </LegalSection>

      <LegalSection id="cookies" heading="8. Cookies">
        <p>
          We use a small set of strictly functional cookies plus aggregate analytics; we do not use
          advertising cookies, third-party trackers, or social-media pixels. See the{' '}
          <Link
            href="/foundation/cookies"
            className="text-[var(--ledger-accent)] underline underline-offset-4"
          >
            Cookies Policy
          </Link>{' '}
          for the complete list and your controls.
        </p>
      </LegalSection>

      <LegalSection id="children" heading="9. Children">
        <p>
          The Service is not directed to children under 16, and we do not knowingly collect personal
          data from children. If you believe a child has provided us with personal data, contact us
          and we will delete it.
        </p>
      </LegalSection>

      <LegalSection id="changes" heading="10. Changes to this policy">
        <p>
          We may update this policy from time to time. If we make material changes, we will notify
          registered learners by email and update the &ldquo;last updated&rdquo; date at the top of
          this page. Continued use of the Service after notice constitutes acceptance.
        </p>
      </LegalSection>

      <LegalSection id="governing-law" heading="11. Governing law">
        <p>
          This policy is governed by the laws of the State of Delaware, United States, without
          regard to its conflict-of-laws principles. Disputes are subject to the venue and
          dispute-resolution terms set out in the{' '}
          <Link
            href="/foundation/terms"
            className="text-[var(--ledger-accent)] underline underline-offset-4"
          >
            Terms of Service
          </Link>
          .
        </p>
      </LegalSection>
    </LegalShell>
  );
}
