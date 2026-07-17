import Link from 'next/link';
import { REGULATIONS } from '@content/regulations';
import { REFERENCE_SOURCES } from '@content/references';

// A short, editorial replacement for the homepage TrustAnchor: a one-line
// origin teaser plus a four-cue trust strip. TrustAnchor itself is untouched
// and still carries the full "why this exists" + standards map on
// /for-institutions.

// The named-source cue is derived from the same content modules TrustAnchor
// uses, so the homepage never drifts from the canonical citation names.
const NAMED_SOURCE_SLUGS = ['sr-11-7', 'tprm', 'ecoa-reg-b', 'nist-ai-rmf'] as const;

const ALL_REFERENCES: ReadonlyArray<{ slug: string; short: string }> = [
  ...REGULATIONS.map((r) => ({ slug: r.slug, short: r.short })),
  ...REFERENCE_SOURCES.map((s) => ({ slug: s.slug, short: s.short })),
];

const NAMED_SOURCES = NAMED_SOURCE_SLUGS.map(
  (slug) => ALL_REFERENCES.find((ref) => ref.slug === slug)?.short,
)
  .filter((short): short is string => Boolean(short))
  .join(' · ');

export function HomeOrigin(): JSX.Element {
  return (
    <section className="mk-origin" aria-labelledby="origin-title">
      <div className="mk-origin-top">
        <div className="mk-origin-copy">
          <p className="mk-origin-k">Why this exists</p>
          <h2 id="origin-title">AI was everywhere. The operating plan wasn&apos;t.</h2>
          <p>
            Built to give community banks and credit unions a practical starting
            point — not a demo pretending to be a strategy.
          </p>
          <Link className="mk-origin-link" href="/about">
            Read why we built it
          </Link>
        </div>

        <figure className="mk-origin-notes">
          <figcaption>Banking conference notes</figcaption>
          <ul className="mk-origin-notes-have">
            <li>AI keynotes</li>
            <li>Vendor demos</li>
            <li>Big promises</li>
          </ul>
          <ul className="mk-origin-notes-open">
            <li>Which workflows do we start with?</li>
            <li>What data can staff use?</li>
            <li>Who owns the result?</li>
          </ul>
          <p className="mk-origin-notes-foot">That gap became the Institute.</p>
        </figure>
      </div>

      <div className="mk-origin-strip">
        <div className="mk-origin-cue">
          <p className="mk-origin-cue-k">Public sources named</p>
          <p>{NAMED_SOURCES}</p>
        </div>
        <div className="mk-origin-cue">
          <p className="mk-origin-cue-k">Synthetic practice data</p>
          <p>No customer PII required.</p>
        </div>
        <div className="mk-origin-cue">
          <p className="mk-origin-cue-k">Human review retained</p>
          <p>Every output has a named owner.</p>
        </div>
        <div className="mk-origin-cue">
          <p className="mk-origin-cue-k">Method open for review</p>
          <p>
            <Link href="/references">Inspect the source map</Link>
          </p>
        </div>
      </div>

      <p className="mk-origin-boundary">
        Public references shape the curriculum; they do not imply regulator approval.
      </p>
    </section>
  );
}
