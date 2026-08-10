// /faq — buyer-objection answers for the assessment + course funnels.
//
// Draft 2026-05-28 (#335). Answers below are seeded with what's already
// codified in CLAUDE.md, the route handlers, and the existing marketing
// copy. Refund policy, exact retake terms, and team-licensing logistics
// need an explicit user decision before the answers stop being
// placeholders — flagged with [VERIFY:] tags.

import type { Metadata } from 'next';
import { FAQAccordion, MockupShell } from '@/components/mockup';
import { faqPageJsonLd, jsonLdString } from '@/lib/seo/jsonld';

export const metadata: Metadata = {
  title: 'FAQ — The AI Banking Institute',
  description:
    'Common questions about the AI Readiness Assessment, the In-Depth Assessment, the AiBI-Foundation course, and the credential.',
  alternates: { canonical: '/faq' },
};

interface FaqItem {
  readonly q: string;
  readonly a: React.ReactNode;
  readonly schemaAnswer: string;
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
        schemaAnswer:
          'Eighteen bite-sized self-paced modules, about 10 to 12 minutes each. Most learners finish in two to four weeks at a comfortable cadence. The course is self-paced, not cohort-based.',
        a: (
          <>
            Eighteen bite-sized self-paced modules, ~10–12 minutes each. Most learners
            finish in two to four weeks at a comfortable cadence. The
            course is self-paced, not cohort-based — there is no fixed
            start or end date.
          </>
        ),
      },
      {
        q: 'Is the course self-paced or scheduled?',
        schemaAnswer:
          'The course is self-paced. Learners can enroll any time, work through modules in their own order, and save artifacts as they go.',
        a: (
          <>
            Self-paced. Enroll any time, work through modules in your own
            order, save artifacts as you go. We don&apos;t run cohorts at
            this stage.
          </>
        ),
      },
      {
        q: 'How long do I keep access?',
        schemaAnswer:
          'Current individual enrollment includes ongoing access to purchased course materials and published curriculum updates. There is no annual renewal on the current offer.',
        a: (
          <>
            Current individual enrollment includes ongoing access to the
            purchased modules, Toolbox materials, and published curriculum
            updates. There is no annual renewal on the current offer.
          </>
        ),
      },
      {
        q: 'What happens if I get stuck?',
        schemaAnswer:
          'Every module ends with a saved artifact learners can revisit. Specific questions can be sent to hello@aibankinginstitute.com.',
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
        schemaAnswer:
          'Retakes are available by request within twelve months of purchase when the original report has not already been used for an institutional review package.',
        a: (
          <>
            Retakes are available by request within twelve months of purchase
            when the original report has not already been used for an
            institutional review package. Email us with the purchase address
            and the reason for the retake.
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
        schemaAnswer:
          'Yes. Digital purchases are refundable within 7 days if the assessment has not been submitted, fewer than two course modules have been completed, and no certificate has been issued. Duplicate purchases and unresolved access failures are also refundable.',
        a: (
          <>
            Yes. Email <a href="mailto:hello@aibankinginstitute.com" style={{ color: 'var(--gold-deep)', textDecoration: 'underline' }}>hello@aibankinginstitute.com</a> within
            7 days. We refund duplicate purchases, failed-access purchases we
            cannot resolve, and unused digital seats where the assessment has
            not been submitted, fewer than two course modules have been
            completed, and no certificate has been issued.
          </>
        ),
      },
      {
        q: 'Can my institution buy seats in bulk?',
        schemaAnswer:
          'Yes. Volume seats are available by request. Pricing, invoicing, enrollment handoff, SSO, and reporting are scoped before rollout.',
        a: (
          <>
            Yes. Volume seats are available by request. Email{' '}
            <a
              href="mailto:hello@aibankinginstitute.com"
              style={{ color: 'var(--gold-deep)', textDecoration: 'underline' }}
            >
              hello@aibankinginstitute.com
            </a>{' '}
            with your headcount, sponsor, and desired timing. Pricing,
            invoicing, enrollment handoff, SSO, and reporting are scoped
            before rollout.
          </>
        ),
      },
      {
        q: 'Can I pay by invoice instead of card?',
        schemaAnswer:
          'Invoice payment is available by request for institutional purchases. Terms are confirmed before rollout. Single-seat individual enrollments use Stripe Checkout.',
        a: (
          <>
            Invoice payment is available by request for institutional
            purchases. Terms are confirmed before rollout. For single-seat
            individual enrollments, Stripe Checkout is the only path. The
            receipt includes the course title and price for expense
            reimbursement.
          </>
        ),
      },
      {
        q: 'Will my receipt include enough detail for expense reimbursement?',
        schemaAnswer:
          'Yes. Stripe sends an itemized receipt with institution name, course title, and price. A formatted invoice is available by email if needed.',
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
        schemaAnswer:
          'No federal or state regulator formally issues or endorses the credential. The curriculum is aligned with SR 26-2, Interagency TPRM Guidance, ECOA / Regulation B, and the AIEOG AI Lexicon.',
        a: (
          <>
            Not as an official designation. The curriculum is{' '}
            <em>aligned with</em> SR 26-2 (model risk management),
            Interagency TPRM Guidance, ECOA / Regulation B, and the AIEOG
            AI Lexicon (US Treasury, FBIIC, FSSCC, February 2026) — but
            no federal or state regulator issues or endorses the credential
            itself. We deliberately don&apos;t claim otherwise.
          </>
        ),
      },
      {
        q: 'What does the certificate look like, and can I share it on LinkedIn?',
        schemaAnswer:
          'The certificate is a one-page PDF with learner name, date earned, verification URL, and issuer. The verification URL is public and can be shared.',
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
        schemaAnswer:
          'That decision belongs to the examiner. The Institute provides documented work product and reviewed artifacts that a compliance officer can present during an exam.',
        a: (
          <>
            That&apos;s a decision your examiner makes, not ours. What we
            ship is documented work product — eighteen reviewed artifacts —
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
        schemaAnswer:
          'Use realistic synthetic banking material, names changed, account numbers redacted, and dates relative. Do not paste customer or confidential data.',
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
        schemaAnswer:
          'No. Assessment responses are protected under row-level security. Institutional aggregate dashboards roll up at the institution level, not the individual level.',
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
        schemaAnswer: 'No.',
        a: <>No.</>,
      },
    ],
  },
];

export default function FAQPage() {
  const faqSchema = faqPageJsonLd({
    questions: GROUPS.flatMap((group) =>
      group.items.map((item) => ({
        question: item.q,
        answer: item.schemaAnswer,
      })),
    ),
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(faqSchema) }}
      />
      <MockupShell
        activePath="/faq"
        eyebrow="FAQ · Buyer questions"
        title={<>Common questions about the assessments and course.</>}
        lede="Straight answers. Open the category you need."
        heroActions={[
          { label: 'Take the readiness assessment', href: '/assessment/take', variant: 'gold' },
          { label: 'See the course', href: '/courses', variant: 'ghost-dark' },
        ]}
        sections={[
          {
            kicker: 'Answers',
            heading: <>Pick the question. Keep the page short.</>,
            body: <FAQAccordion groups={GROUPS} />,
          },
        ]}
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
    </>
  );
}
