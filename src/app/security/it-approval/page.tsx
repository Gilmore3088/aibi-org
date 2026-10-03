import type { Metadata } from 'next';
import Link from 'next/link';
import { MockupShell } from '@/components/mockup';
import { BRAND } from '@content/copy';

export const metadata: Metadata = {
  title: 'IT Review Packet — The AI Banking Institute',
  description:
    'A forwardable IT, risk, and procurement review summary for The AI Banking Institute products, data posture, support path, and trust boundaries.',
  alternates: { canonical: '/security/it-approval' },
};

const REVIEW_DATE = 'June 23, 2026';

const PRODUCT_SCOPE = [
  {
    title: 'Free and In-Depth Assessments',
    body:
      'Learners answer readiness questions. The paid assessment adds a written report, per-dimension root causes, and a 90-day action register.',
  },
  {
    title: 'Foundation Course',
    body:
      'The course teaches AI use through banking scenarios, prompts, templates, saved artifacts, and a final Foundation Packet.',
  },
  {
    title: 'AiBI Lab and Toolbox',
    body:
      'Authenticated learners can run model-backed exercises and save artifacts. Static reading pages and previews do not call AI models.',
  },
  {
    title: 'Support and refunds',
    body:
      'Purchase help routes to hello@aibankinginstitute.com. Refund eligibility is reviewed by a human, and Stripe refunds are issued manually.',
  },
] as const;

const DATA_POSTURE = [
  { title: 'Practice data', body: 'Synthetic or redacted examples. No customer records needed.' },
  { title: 'Prompt boundary', body: 'No PII, account numbers, credentials, secrets or exam material.' },
  { title: 'Provider calls', body: 'Lab and Toolbox prompts go to a paid API provider, after server checks for PII and prompt injection.' },
  { title: 'Human review', body: 'AI output is a draft until a banker checks it.' },
] as const;

const TRUST_BOUNDARIES = [
  'The Institute does not claim SOC 2, ISO 27001, FedRAMP, GLBA, or other third-party security certification status.',
  'No regulator, examiner, agency, bank, credit union, or trade association is presented as approving or endorsing AiBI credentials.',
  'Certificate verification confirms authenticity of an AiBI-issued certificate; it is not an external endorsement.',
  'ROI examples are illustrative and based on stated assumptions; they are not guaranteed savings or projected efficiency-ratio changes.',
  'Provider terms can change. The public data-handling page is the current control surface for provider-path summaries.',
  'Institution rollouts should confirm approved tools, data classes, support owner, reporting thresholds, and seat handoff before purchase.',
] as const;

const REVIEW_LINKS = [
  { label: 'LLM data handling', href: '/security/data-handling' },
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
  { label: 'AI use disclaimer', href: '/ai-use-disclaimer' },
  { label: 'Security & governance', href: '/security' },
  { label: 'Institution inquiry', href: '/for-institutions' },
] as const;

function PacketGrid({
  items,
}: {
  items: readonly { title: string; body: string }[];
}) {
  return (
    <div className="mk-reg-ref-grid">
      {items.map((item) => (
        <div key={item.title}>
          <strong>{item.title}</strong>
          <p>{item.body}</p>
        </div>
      ))}
    </div>
  );
}

function BoundaryList() {
  return (
    <div className="mk-reg-ref-grid">
      {TRUST_BOUNDARIES.map((boundary) => (
        <div key={boundary}>{boundary}</div>
      ))}
    </div>
  );
}

function ReviewLinks() {
  return (
    <div className="mk-reg-ref-grid">
      {REVIEW_LINKS.map((link) => (
        <div key={link.href}>
          <Link href={link.href} style={{ color: 'var(--gold-deep)', fontWeight: 800 }}>
            {link.label}
          </Link>
        </div>
      ))}
    </div>
  );
}

function PacketAside() {
  return (
    <aside
      style={{
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.18)',
        borderRadius: 24,
        padding: 28,
        color: '#fff',
      }}
      aria-label="Review packet facts"
    >
      <p
        style={{
          fontSize: '0.75rem',
          fontWeight: 700,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'var(--gold-soft)',
          margin: '0 0 12px',
        }}
      >
        Forwardable packet
      </p>
      <h2
        style={{
          fontSize: '1.75rem',
          fontWeight: 600,
          lineHeight: 1.15,
          margin: '0 0 12px',
          color: '#fff',
        }}
      >
        Last reviewed {REVIEW_DATE}.
      </h2>
      <p
        style={{
          fontSize: '0.875rem',
          lineHeight: 1.6,
          color: 'rgba(255,255,255,0.82)',
          margin: '0 0 20px',
        }}
      >
        Built for IT, risk, compliance, procurement, and executive sponsors who
        need product scope, data flow, support path, and trust boundaries in one place.
      </p>
      <Link
        href={`mailto:${BRAND.emails.contact}`}
        style={{
          color: 'var(--gold-soft)',
          fontSize: '0.875rem',
          fontWeight: 700,
          textDecoration: 'none',
        }}
      >
        {BRAND.emails.contact}
      </Link>
    </aside>
  );
}

export default function ITApprovalPage() {
  return (
    <MockupShell
      activePath="/security"
      eyebrow="Security · IT review packet"
      title={<>Forward this packet before an internal review.</>}
      lede={
        <>
          One page for IT, risk, compliance and procurement: what {BRAND.name} is,
          what data it touches, and what it does not claim.
        </>
      }
      heroActions={[
        { label: 'LLM data handling', href: '/security/data-handling', variant: 'gold' },
        { label: 'For institutions', href: '/for-institutions', variant: 'ghost-dark' },
      ]}
      heroAside={<PacketAside />}
      sections={[
        {
          kicker: 'Product scope',
          heading: <>What the Institute provides.</>,
          lede: (
            <>
              Individual products are self-serve. Institution rollouts are scoped before purchase.
            </>
          ),
          body: <PacketGrid items={PRODUCT_SCOPE} />,
        },
        {
          kicker: 'Data posture',
          heading: <>Sample data in, drafts out.</>,
          lede: (
            <>
              Full detail, retention and provider terms are on the{' '}
              <Link href="/security/data-handling">LLM data handling</Link> page.
            </>
          ),
          body: <PacketGrid items={DATA_POSTURE} />,
          surface: 'white',
        },
        {
          kicker: 'Trust boundaries',
          heading: <>What this packet does not ask reviewers to assume.</>,
          lede: (
            <>
              Public references are teaching sources, not approvals.
            </>
          ),
          body: <BoundaryList />,
        },
        {
          kicker: 'Review links',
          heading: <>Source pages for internal review.</>,
          lede: (
            <>
              Attach these when you route the review.
            </>
          ),
          body: <ReviewLinks />,
          surface: 'white',
        },
      ]}
      ctaBand={{
        kicker: 'Internal review',
        heading: <>Need an institution-specific answer?</>,
        body: (
          <>
            Email {BRAND.emails.contact}. We scope the tool path and data boundary before seats go live.
          </>
        ),
        actions: [
          { label: 'Email the Institute', href: `mailto:${BRAND.emails.contact}`, variant: 'gold' },
          { label: 'Institution inquiry', href: '/for-institutions', variant: 'ghost-dark' },
        ],
      }}
    />
  );
}

