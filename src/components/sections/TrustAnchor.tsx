import { REGULATIONS } from '@content/regulations';
import { REFERENCE_SOURCES } from '@content/references';
import { BRAND } from '@content/copy';
import Link from 'next/link';

const TRUST_POINTS = [
  'Every curriculum claim maps to a named public reference — never implied regulator approval.',
  'Practice data is synthetic or sanitized; customer PII is never required for the labs.',
  'Named advisors appear only after explicit, written public-attribution approval.',
] as const;

// The reference map: the public sources the curriculum is built on, each
// deep-linking to its full citation on /references. Frameworks first
// (supervisory guidance), then standards & government reports.
const REFERENCE_MAP: ReadonlyArray<{ slug: string; short: string; issuer: string }> = [
  ...REGULATIONS.map((r) => ({ slug: r.slug, short: r.short, issuer: r.issuer })),
  ...REFERENCE_SOURCES.map((s) => ({ slug: s.slug, short: s.short, issuer: s.issuer })),
];

export function TrustAnchor(): JSX.Element {
  return (
    <section className="mk-trust-anchor" aria-labelledby="trust-anchor-title">
      <div>
        <p className="mk-trust-anchor-k">Who builds this</p>
        <h2 id="trust-anchor-title">Built to pass a bank review, not just a demo.</h2>
        <p>
          {BRAND.name} is founder-led by {BRAND.founder.name}, built for the way
          community banks and credit unions actually adopt technology: under
          examination, with a paper trail. We teach staff to produce AI work that
          holds up to scrutiny — clear data boundaries, a named human owner,
          checked sources, and artifacts a manager, compliance partner, risk
          officer, or IT reviewer can sign.
        </p>
        <p>
          Nothing here implies regulator endorsement. Every claim is mapped to a
          public source you can open yourself, and every figure on the site is
          listed with its citation.
        </p>
        <p className="mk-trust-anchor-cta">
          <Link href="/about">Read the operating standards</Link>
          <Link href="/references">See every source we cite</Link>
        </p>
      </div>
      <div className="mk-trust-anchor-panel">
        <div>
          <p className="mk-trust-anchor-panel-k">Reference map</p>
          <p className="mk-trust-anchor-panel-sub">
            The public frameworks, standards, and reports the curriculum is built on.
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
        <div className="mk-trust-anchor-rules">
          {TRUST_POINTS.map((point) => (
            <p key={point}>{point}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
