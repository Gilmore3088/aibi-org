import { REGULATIONS } from '@content/regulations';
import { BRAND } from '@content/copy';
import Link from 'next/link';

const TRUST_POINTS = [
  'Curriculum claims are mapped to named public references, not implied regulator approval.',
  'Practice data is synthetic or sanitized; customer PII is not required for the labs.',
  'Named advisors appear only after explicit public-attribution approval.',
] as const;

export function TrustAnchor(): JSX.Element {
  return (
    <section className="mk-trust-anchor" aria-labelledby="trust-anchor-title">
      <div>
        <p className="mk-trust-anchor-k">Who builds this</p>
        <h2 id="trust-anchor-title">Built around bank-review discipline.</h2>
        <p>
          {BRAND.name} is founder-led by {BRAND.founder.name}. It teaches
          staff to produce reviewable AI work: clear data boundaries, human
          ownership, source checks, and artifacts a manager, compliance
          partner, risk officer, or IT reviewer can inspect.
        </p>
        <p>
          <Link href="/about">Read the operating standards</Link>
        </p>
      </div>
      <div className="mk-trust-anchor-panel">
        <p className="mk-trust-anchor-panel-k">Reference map</p>
        <ul>
          {REGULATIONS.map((reference) => (
            <li key={reference.slug}>
              <strong>{reference.short}</strong>
              <span>{reference.issuer}</span>
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
