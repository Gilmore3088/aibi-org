// /foundation/terms — Terms of Service for the ADDIE Foundation Course.
// Numbered clauses, scannable, contract-grade.
//
// NOTE FOR OPERATOR: main also ships a top-level /terms page. This page
// is net-new under (addie)/foundation/ and is purpose-built for the
// course product (Toolbox, sandbox, team seats, refund policy). You may
// want to either keep both and link the course footer here, or collapse
// the two into one canonical /terms. Do not silently delete either — that
// decision is yours. Wiring of the AddieFooter link is left for the
// consolidation commit.

import type { Metadata } from 'next';
import Link from 'next/link';
import {
  LegalShell,
  LegalClause,
  LegalToc,
} from '@/components/addie/legal/LegalShell';

const LAST_UPDATED = '2026-05-23';

const SUPPORT_EMAIL =
  process.env.SUPPORT_CONTACT_EMAIL ?? 'support@aibankinginstitute.com';
const LEGAL_EMAIL =
  process.env.LEGAL_CONTACT_EMAIL ?? 'legal@aibankinginstitute.com';

export const metadata: Metadata = {
  title: 'Terms of Service · Foundation Course',
  description:
    'The contract that governs your use of the Foundation Course, Toolbox, sandbox, and Readiness Assessment from The AI Banking Institute.',
  alternates: { canonical: '/foundation/terms' },
  robots: { index: true, follow: true },
};

const TOC = [
  { id: 'clause-1', label: 'Agreement' },
  { id: 'clause-2', label: 'Definitions' },
  { id: 'clause-3', label: 'Eligibility' },
  { id: 'clause-4', label: 'Accounts' },
  { id: 'clause-5', label: 'License to access the Service' },
  { id: 'clause-6', label: 'Acceptable use (sandbox)' },
  { id: 'clause-7', label: 'Your content' },
  { id: 'clause-8', label: 'Payment' },
  { id: 'clause-9', label: 'Refunds' },
  { id: 'clause-10', label: 'Team seats' },
  { id: 'clause-11', label: 'Account termination' },
  { id: 'clause-12', label: 'Intellectual property' },
  { id: 'clause-13', label: 'Disclaimers' },
  { id: 'clause-14', label: 'Limitation of liability' },
  { id: 'clause-15', label: 'Indemnification' },
  { id: 'clause-16', label: 'Governing law' },
  { id: 'clause-17', label: 'Changes' },
  { id: 'clause-18', label: 'Contact' },
];

export default function FoundationTermsPage() {
  return (
    <LegalShell
      kicker="Legal"
      title="Terms of Service"
      lede="The contract between you and The AI Banking Institute when you use the Foundation Course, Toolbox, sandbox, or Readiness Assessment. Read it. It is shorter than most."
      lastUpdated={LAST_UPDATED}
    >
      <LegalToc items={TOC} />

      <LegalClause number={1} heading="Agreement">
        <p>
          By creating an account, purchasing a product, or otherwise using the Service, you agree
          to these Terms. If you do not agree, do not use the Service.
        </p>
      </LegalClause>

      <LegalClause number={2} heading="Definitions">
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Service</strong> &mdash; the Foundation Course, Toolbox, sandbox, Readiness
            Assessment, and any related pages or APIs operated by The AI Banking Institute.
          </li>
          <li>
            <strong>Learner</strong> &mdash; the individual using the Service under an account.
          </li>
          <li>
            <strong>Team Admin</strong> &mdash; the individual designated by an institutional
            purchaser to administer seats.
          </li>
          <li>
            <strong>Content</strong> &mdash; lessons, videos, prompts, illustrations, and other
            materials we provide through the Service.
          </li>
          <li>
            <strong>Toolbox Artifact</strong> &mdash; a document or prompt a Learner saves to their
            Toolbox.
          </li>
          <li>
            <strong>Sandbox</strong> &mdash; the bounded practice environment for prompting AI
            models, with hidden system prompt and output gating.
          </li>
        </ul>
      </LegalClause>

      <LegalClause number={3} heading="Eligibility">
        <p>
          You must be at least 16 years of age. If you sign up on behalf of an organization, you
          confirm that you have authority to bind that organization to these Terms.
        </p>
      </LegalClause>

      <LegalClause number={4} heading="Accounts">
        <p>
          One account per person. Do not share credentials. You are responsible for activity under
          your account. Notify us at{' '}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="text-[var(--ledger-accent)] underline underline-offset-4"
          >
            {SUPPORT_EMAIL}
          </a>{' '}
          immediately if you suspect unauthorized access.
        </p>
      </LegalClause>

      <LegalClause number={5} heading="License to access the Service">
        <p>
          We grant you a personal, limited, non-transferable, revocable license to access the
          Service. For individual purchases, the license is for one Learner. For team purchases, the
          license is per seat and may be reassigned by the Team Admin. We do not transfer ownership
          of any Content to you.
        </p>
      </LegalClause>

      <LegalClause number={6} heading="Acceptable use (sandbox)">
        <p>The sandbox is a controlled practice environment. You agree not to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>submit real customer or member data;</li>
          <li>submit personally identifiable information of any individual;</li>
          <li>submit content you do not have the legal right to use;</li>
          <li>attempt to circumvent the bounded sandbox, its rate limits, or its output gate;</li>
          <li>attempt to extract or reverse-engineer system prompts;</li>
          <li>resell, redistribute, or proxy sandbox access to third parties.</li>
        </ul>
        <p>
          We may rate-limit, suspend, or terminate accounts that violate this clause. The sandbox is
          for practice, not for production banking work.
        </p>
      </LegalClause>

      <LegalClause number={7} heading="Your content (Toolbox artifacts)">
        <p>
          You retain ownership of Toolbox Artifacts you create. You grant us a limited license to
          store and display those artifacts to you within the Service. We do not train AI models on
          your artifacts. We do not access your artifacts except when you initiate a support
          request that requires it.
        </p>
      </LegalClause>

      <LegalClause number={8} heading="Payment">
        <p>
          Pricing is in United States dollars. Purchases are one-time payments; there is no
          auto-renewal. Stripe processes all payments; we do not store full card details. Receipts
          are available in your account under <em>Billing</em>.
        </p>
      </LegalClause>

      <LegalClause number={9} heading="Refunds">
        <p>
          <strong>Individual purchases.</strong> Fourteen-day money-back guarantee, provided you
          have completed fewer than 25% of paid lessons. Email{' '}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="text-[var(--ledger-accent)] underline underline-offset-4"
          >
            {SUPPORT_EMAIL}
          </a>
          .
        </p>
        <p>
          <strong>Team purchases.</strong> Refundable per-seat, prorated, if cancelled within 14
          days of purchase. Seats that have been activated and used beyond the 25% threshold are
          non-refundable.
        </p>
      </LegalClause>

      <LegalClause number={10} heading="Team seats">
        <p>
          Team purchases require a minimum of ten seats. The Team Admin can reassign seats among
          eligible members of the purchasing organization. Revoking a seat does not delete that
          Learner&rsquo;s Toolbox Artifacts; the Learner retains read access for a 30-day grace
          period in which to export them. Price changes affecting renewals are reviewed annually and
          communicated at least 60 days in advance.
        </p>
      </LegalClause>

      <LegalClause number={11} heading="Account termination">
        <p>
          You may delete your account at any time via{' '}
          <Link
            href="/account/delete"
            className="text-[var(--ledger-accent)] underline underline-offset-4"
          >
            /account/delete
          </Link>
          . We may terminate or suspend accounts for violations of these Terms, with notice where
          practicable.
        </p>
      </LegalClause>

      <LegalClause number={12} heading="Intellectual property">
        <p>
          All Content, brand marks, illustrations, and course materials are owned by The AI Banking
          Institute or its licensors. You may not redistribute, repost, or resell Content. You may
          not record lessons for redistribution. Internal use within your purchasing organization,
          consistent with your license, is permitted.
        </p>
      </LegalClause>

      <LegalClause number={13} heading="Disclaimers">
        <p>
          The Service is an educational product. It is not a system of record. It does not provide
          legal, financial, tax, or compliance advice. The Service teaches frameworks and prompting
          discipline; you remain responsible for how you apply them to your institution&rsquo;s
          specific facts, policies, and regulatory environment. The Service is provided
          &ldquo;as is&rdquo; without warranties of any kind, to the maximum extent permitted by
          law.
        </p>
      </LegalClause>

      <LegalClause number={14} heading="Limitation of liability">
        <p>
          To the maximum extent permitted by law, our aggregate liability arising out of or related
          to these Terms or the Service is capped at the fees you paid to us in the 12 months
          preceding the event giving rise to the claim. We are not liable for indirect, incidental,
          consequential, special, exemplary, or punitive damages.
        </p>
      </LegalClause>

      <LegalClause number={15} heading="Indemnification">
        <p>
          Each party will indemnify the other against third-party claims arising from its breach of
          these Terms, subject to prompt written notice, sole control of the defense, and
          reasonable cooperation.
        </p>
      </LegalClause>

      <LegalClause number={16} heading="Governing law and dispute resolution">
        <p>
          These Terms are governed by the laws of the State of Delaware, United States, without
          regard to its conflict-of-laws principles. Before initiating any formal proceeding, the
          parties agree to attempt informal resolution by writing to{' '}
          <a
            href={`mailto:${LEGAL_EMAIL}`}
            className="text-[var(--ledger-accent)] underline underline-offset-4"
          >
            {LEGAL_EMAIL}
          </a>{' '}
          and allowing 30 days for response.
        </p>
      </LegalClause>

      <LegalClause number={17} heading="Changes">
        <p>
          We may update these Terms. Material changes will be notified by email to registered
          Learners. Continued use of the Service after notice constitutes acceptance.
        </p>
      </LegalClause>

      <LegalClause number={18} heading="Contact">
        <p>
          Legal notices and questions about these Terms:{' '}
          <a
            href={`mailto:${LEGAL_EMAIL}`}
            className="text-[var(--ledger-accent)] underline underline-offset-4"
          >
            {LEGAL_EMAIL}
          </a>
          . Support and account questions:{' '}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="text-[var(--ledger-accent)] underline underline-offset-4"
          >
            {SUPPORT_EMAIL}
          </a>
          .
        </p>
      </LegalClause>
    </LegalShell>
  );
}
