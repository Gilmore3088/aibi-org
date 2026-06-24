import type { Metadata } from 'next';
import Link from 'next/link';
import { MockupShell } from '@/components/mockup';
import { BRAND, PRINCIPLES } from '@content/copy';
import { REGULATIONS } from '@content/regulations';

export const metadata: Metadata = {
  title: 'About — The AI Banking Institute',
  description:
    'Who operates The AI Banking Institute, how the curriculum is built, and the trust boundaries behind its AI readiness work.',
  alternates: { canonical: '/about' },
};

const TRUST_BOUNDARIES = [
  'No regulator issues, approves, recognizes, or endorses AiBI credentials.',
  'No named advisor, customer, or testimonial appears without explicit public-attribution approval.',
  'No ROI estimate is presented as guaranteed savings or a projected efficiency-ratio change.',
  'No learner needs to paste customer PII or confidential records into course practice prompts.',
] as const;

const EVIDENCE_STANDARDS = [
  {
    title: 'Source-linked curriculum',
    body:
      'Lessons and artifacts map to named public references, including model risk, third-party risk, fair-lending, and cross-industry AI vocabulary.',
  },
  {
    title: 'Reviewed work products',
    body:
      'The course asks learners to produce artifacts a manager, compliance partner, risk officer, or IT reviewer can inspect.',
  },
  {
    title: 'Plain-price purchase paths',
    body:
      'Individual pricing, refund rules, and support contact paths are published before a buyer reaches checkout.',
  },
] as const;

const PROOF_STANDARDS = [
  {
    title: 'Artifact proof',
    body:
      'Synthetic and anonymized examples show the shape of learner work before purchase. Real learner artifacts require redaction and permission before public use.',
    href: '/courses/foundation/gallery',
    hrefLabel: 'Browse artifact examples',
  },
  {
    title: 'People proof',
    body:
      'Founder, advisor, customer, and learner attribution appears only after the exact name, role, institution, quote, and usage context are approved.',
    href: '/about',
    hrefLabel: 'Current public posture',
  },
  {
    title: 'Outcome proof',
    body:
      'Launch proof will come from live purchase evidence, saved artifacts, support outcomes, refunds, and approved first-user quotes, not placeholder logos.',
    href: '/support/purchase-help',
    hrefLabel: 'Support path',
  },
] as const;

const PRESS_MAILTO =
  `mailto:${BRAND.emails.contact}?subject=Press%20%2F%20media%20inquiry%20%E2%80%94%20The%20AI%20Banking%20Institute`;

function FounderAside() {
  return (
    <aside
      style={{
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.18)',
        borderRadius: 24,
        padding: 28,
        color: '#fff',
      }}
      aria-label="Founder and contact"
    >
      <p
        style={{
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'var(--gold-soft)',
          margin: '0 0 12px',
        }}
      >
        Operator
      </p>
      <h2
        style={{
          fontSize: 28,
          fontWeight: 600,
          lineHeight: 1.15,
          margin: '0 0 12px',
          color: '#fff',
        }}
      >
        {BRAND.founder.name}
      </h2>
      <p
        style={{
          fontSize: 14,
          lineHeight: 1.6,
          color: 'rgba(255,255,255,0.82)',
          margin: '0 0 20px',
        }}
      >
        {BRAND.founder.role}. The named operator behind the launch, support inbox,
        curriculum direction, and public standards on this site.
      </p>
      <Link
        href={`mailto:${BRAND.emails.contact}`}
        style={{
          color: 'var(--gold-soft)',
          fontSize: 14,
          fontWeight: 700,
          textDecoration: 'none',
        }}
      >
        {BRAND.emails.contact}
      </Link>
    </aside>
  );
}

export default function AboutPage() {
  return (
    <MockupShell
      activePath="/about"
      eyebrow="Institute · Operating standards"
      title={<>Built for practical AI readiness in banking.</>}
      lede={
        <>
          {BRAND.name} is a founder-led education company for community banks
          and credit unions. It teaches disciplined AI use through assessments,
          curriculum, practice scenarios, and reviewable work products.
        </>
      }
      heroActions={[
        { label: 'Start the assessment', href: '/assessment/take', variant: 'gold' },
        { label: 'View security standards', href: '/security', variant: 'ghost-dark' },
      ]}
      heroAside={<FounderAside />}
      sections={[
        {
          kicker: 'How we work',
          heading: <>The operating principles are intentionally public.</>,
          body: (
            <div className="mk-reg-ref-grid">
              {PRINCIPLES.map((principle) => (
                <div key={principle.number}>
                  <strong>{principle.number} · {principle.title}</strong>
                  <p>{principle.body}</p>
                </div>
              ))}
            </div>
          ),
        },
        {
          kicker: 'Evidence standards',
          heading: <>Credibility is built through artifacts, sources, and restraint.</>,
          body: (
            <div className="mk-reg-ref-grid">
              {EVIDENCE_STANDARDS.map((standard) => (
                <div key={standard.title}>
                  <strong>{standard.title}</strong>
                  <p>{standard.body}</p>
                </div>
              ))}
            </div>
          ),
          surface: 'white',
        },
        {
          kicker: 'Press and research',
          heading: <>Need a source, quote, or background?</>,
          lede: (
            <>
              Journalists, analysts, podcasters, and researchers can send press
              questions to {BRAND.emails.contact}. Include your deadline, outlet,
              topic, and whether you need founder comment, source background, or
              artifact context.
            </>
          ),
          body: (
            <div className="mk-reg-ref-grid">
              <div>
                <strong>Media contact</strong>
                <p>
                  The same operator-owned inbox handles press questions so public
                  claims, attribution, and endorsement boundaries stay consistent.
                </p>
                <p>
                  <Link href={PRESS_MAILTO} style={{ color: 'var(--gold-deep)', fontWeight: 800 }}>
                    Email press inquiry
                  </Link>
                </p>
              </div>
              <div>
                <strong>Attribution boundary</strong>
                <p>
                  The Institute will not imply regulator, customer, advisor, or
                  learner endorsement without explicit public-attribution approval.
                </p>
              </div>
            </div>
          ),
        },
        {
          kicker: 'Proof standards',
          heading: <>The proof layer will use real artifacts and approved attribution.</>,
          lede: (
            <>
              Until named people, quotes, or customer outcomes are approved for
              public use, the site uses founder/operator context, source-linked
              references, and synthetic artifact examples. No fake logos, no
              anonymous endorsements, and no stock trust signals.
            </>
          ),
          body: (
            <div className="mk-reg-ref-grid">
              {PROOF_STANDARDS.map((standard) => (
                <div key={standard.title}>
                  <strong>{standard.title}</strong>
                  <p>{standard.body}</p>
                  <p>
                    <Link href={standard.href} style={{ color: 'var(--gold-deep)', fontWeight: 800 }}>
                      {standard.hrefLabel}
                    </Link>
                  </p>
                </div>
              ))}
            </div>
          ),
        },
        {
          kicker: 'Public references',
          heading: <>The curriculum maps to public references. It does not imply endorsement.</>,
          lede: (
            <>
              These references are used as public source material for bank review
              discipline. They are not presented as approvals of the Institute,
              the curriculum, or the credential.
            </>
          ),
          body: (
            <div className="mk-reg-ref-grid">
              {REGULATIONS.map((reference) => (
                <div key={reference.slug}>
                  <strong>{reference.short}</strong>
                  <p>{reference.long}</p>
                  <p>{reference.issuer}</p>
                </div>
              ))}
            </div>
          ),
        },
        {
          kicker: 'What we will not overclaim',
          heading: <>Trust boundaries matter more than polish.</>,
          body: (
            <div className="mk-reg-ref-grid">
              {TRUST_BOUNDARIES.map((boundary) => (
                <div key={boundary}>{boundary}</div>
              ))}
            </div>
          ),
          surface: 'white',
        },
      ]}
      ctaBand={{
        heading: <>Start with a readiness score. Then inspect the work.</>,
        body: <>The fastest way to understand the Institute is to see the artifacts it asks a learner to produce.</>,
        actions: [
          { label: 'Take the free assessment', href: '/assessment/take', variant: 'gold' },
          { label: 'View the course', href: '/courses', variant: 'ghost-dark' },
        ],
      }}
    />
  );
}
