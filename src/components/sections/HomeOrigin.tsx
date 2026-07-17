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
          <h2 id="origin-title">For everyone who didn&apos;t raise their hand.</h2>
          <p>
            At a banking conference, a keynote speaker asked who had a plan for
            AI. Half the room didn&apos;t raise a hand. In the hallways it was the
            same — leaders unsure what to use it for, what the policy should be,
            or where to start. The Institute exists to fill that gap.
          </p>
          <Link className="mk-origin-link" href="/about">
            Read why we built it
          </Link>
        </div>

        <div className="mk-origin-principles">
          <p className="mk-origin-principles-k">How we approach AI in banking</p>
          <ol>
            <li>Safe use starts with people.</li>
            <li>Training should fit the job.</li>
            <li>Policy should enable &mdash; not only block.</li>
            <li>Keep a human owner.</li>
          </ol>
        </div>
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
