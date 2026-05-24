// /foundation/contact-sales — B2B sales-assist intake.
// PRD §6 — Team SKU (10-seat minimum) is inherently sales-assisted.
// Receives traffic from /foundation/for-community-banks and any
// pricing-page "talk to us" CTA. Persists to addie.sales_leads.

import type { Metadata } from 'next';
import Link from 'next/link';
import { KickerLabel } from '@/components/addie/shared/KickerLabel';
import { ContactSalesForm } from './ContactSalesForm';

export const metadata: Metadata = {
  title: 'Talk to us about your team · The AI Banking Institute',
  description:
    'Tell us about your community bank or credit union and we will scope a Foundation Course rollout for your team. Five fields. One business-day reply.',
  alternates: { canonical: '/foundation/contact-sales' },
};

export default function ContactSalesPage() {
  const calendlyUrl = process.env.NEXT_PUBLIC_CALENDLY_URL;
  return (
    <main className="bg-[var(--ledger-bg)] text-[var(--ledger-ink)]">
      <section className="addie-hero-parch">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
          <div className="max-w-3xl">
            <KickerLabel tone="accent">For community banks &amp; credit unions</KickerLabel>
            <h1 className="mt-5 font-serif text-[2.25rem] sm:text-[3rem] lg:text-[3.75rem] leading-[1.02] tracking-[-0.02em] text-[var(--ledger-ink)]">
              Talk to us about your team.
            </h1>
            <p className="mt-6 text-lg sm:text-xl leading-[1.55] text-[var(--ledger-ink-2)]">
              The Team SKU starts at ten seats. That is a sales-assisted
              decision by design — there is a real human at the
              Institute who will scope your rollout, walk the dashboard
              with your champion, and answer the governance questions
              before you commit a budget line.
            </p>
            <p className="mt-3 text-[var(--ledger-muted)]">
              Five fields. Reply within one business day.{' '}
              <Link
                href="/foundation/for-community-banks"
                className="underline underline-offset-4 hover:text-[var(--ledger-ink)]"
              >
                Back to overview
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--ledger-rule-strong)] bg-[var(--ledger-bg)]">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <ContactSalesForm calendlyUrl={calendlyUrl} />

          <aside className="mt-10 rounded-[3px] border border-[var(--ledger-rule)] bg-[var(--ledger-parch)] p-6 sm:p-7">
            <KickerLabel>What happens next</KickerLabel>
            <ol className="mt-4 space-y-3 text-[var(--ledger-ink-2)] leading-[1.6]">
              <li>
                <span className="font-mono uppercase tracking-[0.14em] text-[0.7rem] text-[var(--ledger-muted)] mr-2">01</span>
                We read your note the same day. No auto-responder.
              </li>
              <li>
                <span className="font-mono uppercase tracking-[0.14em] text-[0.7rem] text-[var(--ledger-muted)] mr-2">02</span>
                A short reply within one business day with two or three suggested call times.
              </li>
              <li>
                <span className="font-mono uppercase tracking-[0.14em] text-[0.7rem] text-[var(--ledger-muted)] mr-2">03</span>
                Thirty minutes on a call. We walk the dashboard, scope the seat count, and you decide.
              </li>
            </ol>
          </aside>
        </div>
      </section>
    </main>
  );
}
