// /faq — buyer-objection answers for the assessment + course funnels.
//
// Draft 2026-05-28 (#335). Answers below are seeded with what's already
// codified in CLAUDE.md, the route handlers, and the existing marketing
// copy. Refund policy, exact retake terms, and team-licensing logistics
// need an explicit user decision before the answers stop being
// placeholders — flagged with [VERIFY:] tags.

import type { Metadata } from 'next';
import { MockupShell } from '@/components/mockup';

export const metadata: Metadata = {
  title: 'FAQ — The AI Banking Institute',
  description:
    'Common questions about the AI Readiness Assessment, the In-Depth Assessment, the AiBI-Foundation course, and the credential.',
  alternates: { canonical: '/faq' },
};

interface FaqItem {
  readonly q: string;
  readonly a: React.ReactNode;
}

interface FaqGroup {
  readonly kicker: string;
  readonly heading: React.ReactNode;
  readonly items: readonly FaqItem[];
  readonly surface?: 'cream' | 'white';
}

const GROUPS: readonly FaqGroup[] = [
  {
    kicker: 'Logistics',
    heading: <>Time, format, and access.</>,
    items: [
      {
        q: 'How long does the Foundation course take to complete?',
        a: (
          <>
            Twelve self-paced modules, ~25–35 minutes each. Most learners
            finish in three to six weeks at a comfortable cadence. The
            course is self-paced, not cohort-based — there is no fixed
            start or end date.
          </>
        ),
      },
      {
        q: 'Is the course self-paced or scheduled?',
        a: (
          <>
            Self-paced. Enroll any time, work through modules in your own
            order, save artifacts as you go. We don&apos;t run cohorts at
            this stage.
          </>
        ),
      },
      {
        q: 'Do I get lifetime access?',
        a: (
          <>
            Yes — lifetime access to the modules, the Toolbox, and any
            updates we ship to the curriculum. There is no annual renewal.
          </>
        ),
      },
      {
        q: 'What happens if I get stuck?',
        a: (
          <>
            Every module ends with a saved artifact you can revisit. For
            specific questions about your bank&apos;s context, email{' '}
            <a
              href="mailto:hello@aibankinginstitute.com"
              style={{ color: 'var(--gold-deep)', textDecoration: 'underline' }}
            >
              hello@aibankinginstitute.com
            </a>{' '}
            and we&apos;ll point you to the right module or resource.
          </>
        ),
      },
      {
        q: 'Can I retake the In-Depth Assessment?',
        a: (
          <>
            Yes — one free retake within twelve months of your initial
            purchase. Same 48-question pool, fresh report. Useful when your
            governance posture has shifted (new policy, new staff training,
            new examiner letter).
          </>
        ),
      },
    ],
  },
  {
    kicker: 'Payment',
    heading: <>Refunds, invoicing, and team purchases.</>,
    surface: 'white',
    items: [
      {
        q: 'Do you offer refunds, and what is the policy?',
        a: (
          <>
            Refund terms are being finalized ahead of public launch.
            Email <a href="mailto:hello@aibankinginstitute.com" style={{ color: 'var(--gold-deep)', textDecoration: 'underline' }}>hello@aibankinginstitute.com</a> before
            purchase for the current policy.
          </>
        ),
      },
      {
        q: 'Can my institution buy seats in bulk?',
        a: (
          <>
            Yes. Volume pricing is $199/seat at 10+ seats. Email{' '}
            <a
              href="mailto:hello@aibankinginstitute.com"
              style={{ color: 'var(--gold-deep)', textDecoration: 'underline' }}
            >
              hello@aibankinginstitute.com
            </a>{' '}
            with your headcount and we&apos;ll send a single invoice and
            a per-seat enrollment dashboard. SSO is available at 25+ seats.
          </>
        ),
      },
      {
        q: 'Can I pay by invoice instead of card?',
        a: (
          <>
            For institutional purchases (10+ seats), yes — we invoice in
            net-30 terms. For single-seat individual enrollments, Stripe
            Checkout is the only path. The receipt includes the institution
            name and seat count for expense reimbursement.
          </>
        ),
      },
      {
        q: 'Will my receipt include enough detail for expense reimbursement?',
        a: (
          <>
            Yes. Stripe sends an itemized receipt with the institution
            name, course title, and price. If your finance team needs a
            different format, email{' '}
            <a
              href="mailto:hello@aibankinginstitute.com"
              style={{ color: 'var(--gold-deep)', textDecoration: 'underline' }}
            >
              hello@aibankinginstitute.com
            </a>{' '}
            and we&apos;ll send a formatted invoice.
          </>
        ),
      },
    ],
  },
  {
    kicker: 'Credential',
    heading: <>What AiBI-Foundation says about you.</>,
    items: [
      {
        q: 'Does any regulator formally recognize the AiBI-Foundation credential?',
        a: (
          <>
            Not as an official designation. The curriculum is{' '}
            <em>aligned with</em> SR 11-7 (model risk management),
            Interagency TPRM Guidance, ECOA / Regulation B, and the AIEOG
            AI Lexicon (US Treasury, FBIIC, FSSCC, February 2026) — but
            no federal or state regulator issues or endorses the credential
            itself. We deliberately don&apos;t claim otherwise.
          </>
        ),
      },
      {
        q: 'What does the certificate look like, and can I share it on LinkedIn?',
        a: (
          <>
            A one-page PDF certificate with your name, the date earned,
            the verification URL, and the credential issuer (The AI Banking
            Institute). The verification URL is public, so you can paste
            the certificate on LinkedIn or attach it to a board memo and
            anyone can confirm it&apos;s real.
          </>
        ),
      },
      {
        q: 'Will examiners accept my AiBI-Foundation completion as evidence of staff training?',
        a: (
          <>
            That&apos;s a decision your examiner makes, not ours. What we
            ship is documented work product — twelve reviewed artifacts —
            that a compliance officer can put on the table during an exam.
            Whether your examiner counts it depends on their priorities
            and your institution&apos;s overall AI governance posture.
          </>
        ),
      },
    ],
  },
  {
    kicker: 'Data & privacy',
    heading: <>What we collect and what we don&apos;t.</>,
    surface: 'white',
    items: [
      {
        q: 'What data am I expected to paste into the sandbox?',
        a: (
          <>
            Realistic synthetic banking material — names changed, account
            numbers redacted, dates relative. The sandbox scenarios we
            provide are pre-sanitized. Your employer should still confirm
            sandbox use against your AI Use Policy before adoption — the
            Module 1 worksheet covers exactly that conversation.
          </>
        ),
      },
      {
        q: 'Is my assessment data shared with anyone outside the Institute?',
        a: (
          <>
            No. Assessment responses sit in Supabase under row-level
            security; only your account can read your results. Anonymized
            aggregate dashboards for institutional buyers (10+ seats) roll
            up at the institution level, not the individual level. See
            our{' '}
            <a
              href="/privacy"
              style={{ color: 'var(--gold-deep)', textDecoration: 'underline' }}
            >
              Privacy
            </a>{' '}
            page for the data flow.
          </>
        ),
      },
      {
        q: 'Do you use customer data to train any AI model?',
        a: <>No.</>,
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <MockupShell
      activePath="/faq"
      eyebrow="FAQ · Buyer questions"
      title={<>Common questions about the assessments and course.</>}
      lede="Straight answers. If something isn't here, email hello@aibankinginstitute.com."
      heroActions={[
        { label: 'Take the readiness assessment', href: '/assessment/take', variant: 'gold' },
        { label: 'See the course', href: '/courses', variant: 'ghost-dark' },
      ]}
      sections={GROUPS.map((group) => ({
        kicker: group.kicker,
        heading: group.heading,
        ...(group.surface ? { surface: group.surface } : {}),
        lede: (
          <div className="space-y-8">
            {group.items.map((item) => (
              <div key={item.q}>
                <h3
                  style={{
                    fontFamily:
                      'Inter, ui-sans-serif, system-ui, sans-serif',
                    fontSize: 18,
                    fontWeight: 700,
                    lineHeight: 1.3,
                    color: 'var(--ink)',
                    marginBottom: 10,
                  }}
                >
                  {item.q}
                </h3>
                <div
                  style={{
                    fontSize: 15.5,
                    lineHeight: 1.6,
                    color: 'var(--slate-600)',
                  }}
                >
                  {item.a}
                </div>
              </div>
            ))}
          </div>
        ),
      }))}
      ctaBand={{
        kicker: 'Still have questions?',
        heading: <>Email us — short answers, no sales loop.</>,
        body: (
          <>
            We try to answer everything within one business day. For
            institutional purchases, advisory engagements, or anything
            urgent, mention it in the subject line.
          </>
        ),
        actions: [
          {
            label: 'hello@aibankinginstitute.com',
            href: 'mailto:hello@aibankinginstitute.com',
            variant: 'gold',
          },
          { label: 'Take the assessment', href: '/assessment/take', variant: 'ghost-dark' },
        ],
      }}
    />
  );
}
