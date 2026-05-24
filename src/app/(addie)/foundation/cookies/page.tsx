// /foundation/cookies — Cookies Policy for the ADDIE Foundation Course.
// Short, factual, enumerated.
//
// NOTE FOR OPERATOR: this page is net-new under (addie)/foundation/. Main
// may not currently ship a /cookies page; if it does later, you may
// want to either link both to a shared canonical or keep them separate.
// Wiring of the AddieFooter link is left for the consolidation commit.

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
  title: 'Cookies Policy · Foundation Course',
  description:
    'The complete list of cookies set by the Foundation Course experience, what each does, and how to control them.',
  alternates: { canonical: '/foundation/cookies' },
  robots: { index: true, follow: true },
};

const TOC = [
  { id: 'what-we-use', label: 'What cookies we use' },
  { id: 'control', label: 'How to control cookies' },
  { id: 'not-used', label: 'What we do not use' },
  { id: 'changes', label: 'Changes' },
  { id: 'contact', label: 'Contact' },
];

interface CookieRow {
  readonly name: string;
  readonly category: string;
  readonly duration: string;
  readonly purpose: string;
}

const COOKIES: readonly CookieRow[] = [
  {
    name: 'sb-*',
    category: 'Functional (Supabase Auth)',
    duration: 'Session; httpOnly',
    purpose: 'Required for sign-in and to keep you signed in across pages.',
  },
  {
    name: 'aibi_addie_anon',
    category: 'Functional',
    duration: '30 days; httpOnly; signed',
    purpose:
      'Required for the save-as-lead path on free modules. Identifies an unauthenticated visitor so we can attach a saved Toolbox artifact to the email captured at the gate.',
  },
  {
    name: '__vercel_*',
    category: 'Analytics (aggregated)',
    duration: 'Up to one year',
    purpose:
      'Aggregate, privacy-preserving page-view counts used by our hosting provider. No individual tracking, no advertising identifiers.',
  },
];

export default function FoundationCookiesPage() {
  return (
    <LegalShell
      kicker="Legal"
      title="Cookies Policy"
      lede="The complete list of cookies the Foundation Course experience sets, what each one does, and how to control them. No advertising cookies. No third-party trackers."
      lastUpdated={LAST_UPDATED}
    >
      <LegalToc items={TOC} />

      <LegalSection id="what-we-use" heading="1. What cookies we use">
        <p>
          We use a small set of cookies, all of which are either strictly functional or aggregate
          analytics. There are no advertising cookies, no social-media pixels, and no third-party
          trackers.
        </p>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-[var(--ledger-rule-strong)] text-left">
                <th
                  scope="col"
                  className="py-3 px-3 font-mono uppercase tracking-[0.14em] text-[0.65rem] text-[var(--ledger-muted)]"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="py-3 px-3 font-mono uppercase tracking-[0.14em] text-[0.65rem] text-[var(--ledger-muted)]"
                >
                  Category
                </th>
                <th
                  scope="col"
                  className="py-3 px-3 font-mono uppercase tracking-[0.14em] text-[0.65rem] text-[var(--ledger-muted)]"
                >
                  Duration
                </th>
                <th
                  scope="col"
                  className="py-3 px-3 font-mono uppercase tracking-[0.14em] text-[0.65rem] text-[var(--ledger-muted)]"
                >
                  Purpose
                </th>
              </tr>
            </thead>
            <tbody>
              {COOKIES.map((c) => (
                <tr key={c.name} className="border-b border-[var(--ledger-rule)] align-top">
                  <td className="py-3 px-3 font-mono text-[var(--ledger-ink)]">{c.name}</td>
                  <td className="py-3 px-3 text-[var(--ledger-ink-2)]">{c.category}</td>
                  <td className="py-3 px-3 text-[var(--ledger-ink-2)]">{c.duration}</td>
                  <td className="py-3 px-3 text-[var(--ledger-ink-2)]">{c.purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </LegalSection>

      <LegalSection id="control" heading="2. How to control cookies">
        <p>
          Every modern browser provides cookie controls in its settings. You can block all cookies,
          block third-party cookies only, or delete existing cookies. Blocking the functional
          cookies above will prevent sign-in and the save-as-lead path from working; the rest of
          the public Service remains usable.
        </p>
        <p>
          Helpful links from major browsers:{' '}
          <a
            href="https://support.google.com/chrome/answer/95647"
            target="_blank"
            rel="noreferrer"
            className="text-[var(--ledger-accent)] underline underline-offset-4"
          >
            Chrome
          </a>
          ,{' '}
          <a
            href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer"
            target="_blank"
            rel="noreferrer"
            className="text-[var(--ledger-accent)] underline underline-offset-4"
          >
            Firefox
          </a>
          ,{' '}
          <a
            href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac"
            target="_blank"
            rel="noreferrer"
            className="text-[var(--ledger-accent)] underline underline-offset-4"
          >
            Safari
          </a>
          ,{' '}
          <a
            href="https://support.microsoft.com/en-us/microsoft-edge"
            target="_blank"
            rel="noreferrer"
            className="text-[var(--ledger-accent)] underline underline-offset-4"
          >
            Edge
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection id="not-used" heading="3. What we do not use">
        <p>To be explicit about what is not happening on this site:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>No advertising cookies.</li>
          <li>No retargeting pixels.</li>
          <li>No social-media tracking pixels (no Meta, X, LinkedIn, or TikTok pixels).</li>
          <li>No third-party analytics that profile individual visitors.</li>
          <li>No cross-site identifiers shared with data brokers.</li>
        </ul>
      </LegalSection>

      <LegalSection id="changes" heading="4. Changes">
        <p>
          Material changes to the cookies we set will be posted on this page and the
          &ldquo;last updated&rdquo; date will be revised. Adding a new cookie that is not strictly
          functional will be announced to registered Learners by email before deployment.
        </p>
      </LegalSection>

      <LegalSection id="contact" heading="5. Contact">
        <p>
          Questions about cookies or this policy:{' '}
          <a
            href={`mailto:${PRIVACY_EMAIL}`}
            className="text-[var(--ledger-accent)] underline underline-offset-4"
          >
            {PRIVACY_EMAIL}
          </a>
          .
        </p>
        <p>
          See also the{' '}
          <Link
            href="/foundation/privacy"
            className="text-[var(--ledger-accent)] underline underline-offset-4"
          >
            Privacy Policy
          </Link>{' '}
          and the{' '}
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
