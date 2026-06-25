import { REGULATIONS } from '@content/regulations';
import { REFERENCE_SOURCES } from '@content/references';
import { BRAND } from '@content/copy';
import Link from 'next/link';

const TRUST_POINTS = [
  'Public references guide the curriculum; they do not imply regulator approval.',
  'Practice work uses synthetic or sanitized data. Customer PII is never required.',
  'The goal is reviewable AI work a manager, compliance partner, risk officer, or IT reviewer can sign.',
] as const;

const CORE_REFERENCE_SLUGS = new Set<string>([
  'sr-11-7',
  'tprm',
  'ecoa-reg-b',
  'aieog',
  'nist-ai-rmf',
  'glba-safeguards',
] as const);

// The homepage map stays intentionally short. The full /references page owns
// every citation; this section only anchors the trust story.
const REFERENCE_MAP: ReadonlyArray<{ slug: string; short: string; issuer: string }> = [
  ...REGULATIONS.map((r) => ({ slug: r.slug, short: r.short, issuer: r.issuer })),
  ...REFERENCE_SOURCES.map((s) => ({ slug: s.slug, short: s.short, issuer: s.issuer })),
].filter((reference) => CORE_REFERENCE_SLUGS.has(reference.slug));

export function TrustAnchor(): JSX.Element {
  return (
    <section className="mk-trust-anchor" aria-labelledby="trust-anchor-title">
      <div>
        <p className="mk-trust-anchor-k">Why this exists</p>
        <h2 id="trust-anchor-title">Built for bankers who need a real AI plan.</h2>
        <p>
          AI is moving into banking faster than many small institutions can
          staff, budget, or govern. This started after an industry conference
          where AI was everywhere, but many community bank and credit union
          teams still had no practical plan for use cases, controls, or
          ownership.
        </p>
        <p>
          {BRAND.name} exists to close that gap. We teach bankers to turn ideas
          into small, reviewable internal solutions: define the workflow, set
          data boundaries, check sources, name the human owner, and leave behind
          an artifact someone else can run, review, and improve.
        </p>
        <p>
          It is founder-led, but not founder-centered. The work is about giving
          smaller institutions a way to build capability without pretending a
          demo is a strategy.
        </p>
        <p className="mk-trust-anchor-cta">
          <Link href="/about">Read how we work</Link>
        </p>
      </div>
      <div className="mk-trust-anchor-panel">
        <div>
          <p className="mk-trust-anchor-panel-k">Standards map</p>
          <p className="mk-trust-anchor-panel-sub">
            A short map of the public guidance used to shape the curriculum.
            The full source library stays open for review.
          </p>
        </div>
        <ul>
          {REFERENCE_MAP.map((reference) => (
            <li key={reference.slug}>
              <Link href={`/references#${reference.slug}`} className="mk-trust-anchor-ref">
                <strong>{reference.short}</strong>
                <span>{reference.issuer}</span>
              </Link>
            </li>
          ))}
        </ul>
        <Link href="/references" className="mk-trust-anchor-panel-action">
          Open the full reference library
        </Link>
        <div className="mk-trust-anchor-rules">
          {TRUST_POINTS.map((point) => (
            <p key={point}>{point}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
